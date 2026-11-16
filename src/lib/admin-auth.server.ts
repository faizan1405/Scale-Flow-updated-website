import { createHmac, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AdminLoginResult, AdminSessionStatus } from "./admin-auth.shared";

export const ADMIN_SESSION_COOKIE = "sf_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const MAX_TRACKED_IPS = 2000;

interface RateEntry {
  count: number;
  resetAt: number;
}

const failedAttemptsByIp = new Map<string, RateEntry>();

export interface AdminAuthConfig {
  configured: boolean;
  email: string | null;
  password: string | null;
  passwordHash: string | null;
  sessionSecret: string | null;
}

export function parseDotEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const cleaned = line.startsWith("export ") ? line.slice(7).trim() : line;
    const eqIdx = cleaned.indexOf("=");
    if (eqIdx <= 0) continue;
    const key = cleaned.slice(0, eqIdx).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = cleaned.slice(eqIdx + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readEnvFilesFallback(): Record<string, string> {
  const merged: Record<string, string> = {};
  try {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, ".env.local"),
      path.resolve(cwd, ".env"),
      path.resolve(cwd, "..", ".env.local"),
      path.resolve(cwd, "..", ".env"),
    ];
    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue;
      const parsed = parseDotEnv(fs.readFileSync(filePath, "utf8"));
      for (const [k, v] of Object.entries(parsed)) {
        if (merged[k] === undefined && v !== "") {
          merged[k] = v;
        }
      }
    }
  } catch {
    // Ignore filesystem errors in restricted runtimes where only process.env exists.
  }
  return merged;
}

export function getAdminAuthConfig(
  envOverride?: Record<string, string | undefined>,
): AdminAuthConfig {
  const fileFallback = envOverride ? {} : readEnvFilesFallback();
  const readVar = (name: string): string | null => {
    const raw = envOverride ? envOverride[name] : (process.env[name] ?? fileFallback[name]);
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const email = readVar("ADMIN_EMAIL")?.toLowerCase() ?? null;
  const password = readVar("ADMIN_PASSWORD");
  const passwordHash = readVar("ADMIN_PASSWORD_HASH");
  const explicitSecret = readVar("ADMIN_SESSION_SECRET");

  const configured = Boolean(email && (password || passwordHash));
  if (!configured || !email) {
    return {
      configured: false,
      email: null,
      password: null,
      passwordHash: null,
      sessionSecret: null,
    };
  }

  const sessionSecret =
    explicitSecret ??
    createHmac("sha256", "scaleflow-admin-session-key-v1")
      .update(`${email}\0${passwordHash ?? password ?? ""}`)
      .digest("hex");

  return {
    configured: true,
    email,
    password,
    passwordHash,
    sessionSecret,
  };
}

function sha256Digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function safeEqualString(a: string, b: string): boolean {
  return timingSafeEqual(sha256Digest(a), sha256Digest(b));
}

export function verifyScryptHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    if (salt.length === 0 || expected.length === 0) return false;
    const derived = scryptSync(password, salt, expected.length);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(
  inputEmail: string,
  inputPassword: string,
  config: AdminAuthConfig,
): boolean {
  if (!config.configured || !config.email) return false;
  const normalizedInputEmail = inputEmail.trim().toLowerCase();
  const emailMatches = safeEqualString(normalizedInputEmail, config.email);

  let passwordMatches = false;
  if (config.passwordHash) {
    passwordMatches = verifyScryptHash(inputPassword, config.passwordHash);
  } else if (config.password) {
    passwordMatches = safeEqualString(inputPassword, config.password);
  }

  return emailMatches && passwordMatches;
}

export function createSessionToken(
  email: string,
  sessionSecret: string,
  nowMs = Date.now(),
): string {
  const nowSec = Math.floor(nowMs / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: email,
      iat: nowSec,
      exp: nowSec + ADMIN_SESSION_TTL_SECONDS,
    }),
    "utf8",
  ).toString("base64url");

  const sig = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined,
  config: AdminAuthConfig,
  nowMs = Date.now(),
): AdminSessionStatus {
  if (!config.configured || !config.email || !config.sessionSecret) {
    return { authenticated: false, email: null, configured: false };
  }
  if (!token) {
    return { authenticated: false, email: null, configured: true };
  }

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx === token.length - 1) {
    return { authenticated: false, email: null, configured: true };
  }
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (sig.includes(".")) {
    return { authenticated: false, email: null, configured: true };
  }

  const expectedSig = createHmac("sha256", config.sessionSecret)
    .update(payload)
    .digest("base64url");
  if (!safeEqualString(sig, expectedSig)) {
    return { authenticated: false, email: null, configured: true };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
    };
    const nowSec = Math.floor(nowMs / 1000);
    if (
      typeof parsed.sub !== "string" ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp) ||
      parsed.exp <= nowSec ||
      !safeEqualString(parsed.sub.toLowerCase(), config.email)
    ) {
      return { authenticated: false, email: null, configured: true };
    }
    return { authenticated: true, email: config.email, configured: true };
  } catch {
    return { authenticated: false, email: null, configured: true };
  }
}

export function checkLoginRateLimit(ip: string, nowMs = Date.now()): boolean {
  const entry = failedAttemptsByIp.get(ip);
  if (!entry) return true;
  if (nowMs >= entry.resetAt) {
    failedAttemptsByIp.delete(ip);
    return true;
  }
  return entry.count < RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string, nowMs = Date.now()): void {
  if (failedAttemptsByIp.size >= MAX_TRACKED_IPS) {
    for (const [key, entry] of failedAttemptsByIp.entries()) {
      if (nowMs >= entry.resetAt) failedAttemptsByIp.delete(key);
    }
    if (failedAttemptsByIp.size >= MAX_TRACKED_IPS) {
      const oldestKey = failedAttemptsByIp.keys().next().value;
      if (oldestKey !== undefined) failedAttemptsByIp.delete(oldestKey);
    }
  }

  const existing = failedAttemptsByIp.get(ip);
  if (!existing || nowMs >= existing.resetAt) {
    failedAttemptsByIp.set(ip, { count: 1, resetAt: nowMs + RATE_LIMIT_WINDOW_MS });
  } else {
    existing.count += 1;
  }
}

export function clearFailedLogins(ip: string): void {
  failedAttemptsByIp.delete(ip);
}

export function resetRateLimiterForTests(): void {
  failedAttemptsByIp.clear();
}

export function attemptAdminLogin(params: {
  email: string;
  password: string;
  ip: string;
  config?: AdminAuthConfig;
  nowMs?: number;
}): { result: AdminLoginResult; token: string | null } {
  const nowMs = params.nowMs ?? Date.now();
  const config = params.config ?? getAdminAuthConfig();

  if (!config.configured || !config.email || !config.sessionSecret) {
    return {
      result: {
        ok: false,
        configured: false,
        error:
          "Admin credentials are not configured on the server. Add ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET to your hosting environment.",
      },
      token: null,
    };
  }

  if (!checkLoginRateLimit(params.ip, nowMs)) {
    return {
      result: {
        ok: false,
        configured: true,
        error: "Too many failed login attempts. Please wait 15 minutes and try again.",
      },
      token: null,
    };
  }

  if (!verifyAdminCredentials(params.email, params.password, config)) {
    recordFailedLogin(params.ip, nowMs);
    return {
      result: {
        ok: false,
        configured: true,
        error: "Invalid email or password.",
      },
      token: null,
    };
  }

  clearFailedLogins(params.ip);
  const token = createSessionToken(config.email, config.sessionSecret, nowMs);
  return {
    result: { ok: true, email: config.email },
    token,
  };
}
