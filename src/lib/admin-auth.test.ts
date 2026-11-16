import { randomBytes, scryptSync } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  attemptAdminLogin,
  createSessionToken,
  getAdminAuthConfig,
  parseDotEnv,
  resetRateLimiterForTests,
  verifyAdminCredentials,
  verifySessionToken,
} from "./admin-auth.server";
import { sanitizeAdminRedirect } from "./admin-auth.shared";

describe("admin-auth", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it("fails closed when admin environment variables are missing", () => {
    const config = getAdminAuthConfig({});
    expect(config.configured).toBe(false);
    expect(verifyAdminCredentials("admin@joinscaleflow.in", "anything", config)).toBe(false);
    expect(verifySessionToken("a.b", config)).toEqual({
      authenticated: false,
      email: null,
      configured: false,
    });

    const login = attemptAdminLogin({
      email: "admin@joinscaleflow.in",
      password: "secret",
      ip: "127.0.0.1",
      config,
    });
    expect(login.token).toBeNull();
    expect(login.result).toMatchObject({ ok: false, configured: false });
  });

  it("parses .env lines preserving = inside passwords and ignoring comments", () => {
    const parsed = parseDotEnv(`
      # comment
      ADMIN_EMAIL = "admin@joinscaleflow.in"
      export ADMIN_PASSWORD=abc=def=123
      ADMIN_SESSION_SECRET='my-secret'
    `);
    expect(parsed).toEqual({
      ADMIN_EMAIL: "admin@joinscaleflow.in",
      ADMIN_PASSWORD: "abc=def=123",
      ADMIN_SESSION_SECRET: "my-secret",
    });
  });

  it("verifies plaintext env credentials case-insensitively on email and issues verifiable tokens", () => {
    const config = getAdminAuthConfig({
      ADMIN_EMAIL: "Admin@JoinScaleFlow.in",
      ADMIN_PASSWORD: "test-password=123",
      ADMIN_SESSION_SECRET: "super-secret-signing-key",
    });

    expect(config.configured).toBe(true);
    expect(verifyAdminCredentials("  admin@joinscaleflow.in ", "test-password=123", config)).toBe(
      true,
    );
    expect(verifyAdminCredentials("admin@joinscaleflow.in", "wrong-password", config)).toBe(false);
    expect(verifyAdminCredentials("other@joinscaleflow.in", "test-password=123", config)).toBe(
      false,
    );

    const { result, token } = attemptAdminLogin({
      email: "admin@joinscaleflow.in",
      password: "test-password=123",
      ip: "127.0.0.1",
      config,
      nowMs: 1_700_000_000_000,
    });
    expect(result).toEqual({ ok: true, email: "admin@joinscaleflow.in" });
    expect(token).toBeTruthy();

    expect(verifySessionToken(token!, config, 1_700_000_010_000)).toEqual({
      authenticated: true,
      email: "admin@joinscaleflow.in",
      configured: true,
    });
  });

  it("supports scrypt password hashes", () => {
    const salt = randomBytes(16);
    const hash = scryptSync("my-strong-password", salt, 32);
    const stored = `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;

    const config = getAdminAuthConfig({
      ADMIN_EMAIL: "owner@joinscaleflow.in",
      ADMIN_PASSWORD_HASH: stored,
      ADMIN_SESSION_SECRET: "another-secret",
    });

    expect(verifyAdminCredentials("owner@joinscaleflow.in", "my-strong-password", config)).toBe(
      true,
    );
    expect(verifyAdminCredentials("owner@joinscaleflow.in", "wrong", config)).toBe(false);
  });

  it("rejects tampered, expired, or mismatched-email session tokens", () => {
    const config = getAdminAuthConfig({
      ADMIN_EMAIL: "admin@joinscaleflow.in",
      ADMIN_PASSWORD: "pw",
      ADMIN_SESSION_SECRET: "secret-1",
    });
    const nowMs = 1_700_000_000_000;
    const token = createSessionToken("admin@joinscaleflow.in", config.sessionSecret!, nowMs);

    // Tampered payload/signature
    expect(verifySessionToken(token + "x", config, nowMs).authenticated).toBe(false);
    expect(verifySessionToken("invalid", config, nowMs).authenticated).toBe(false);

    // Expired (8 days later, TTL is 7 days)
    expect(verifySessionToken(token, config, nowMs + 8 * 24 * 60 * 60 * 1000).authenticated).toBe(
      false,
    );

    // Different email configured later invalidates previous session
    const rotatedEmailConfig = getAdminAuthConfig({
      ADMIN_EMAIL: "new@joinscaleflow.in",
      ADMIN_PASSWORD: "pw",
      ADMIN_SESSION_SECRET: "secret-1",
    });
    expect(verifySessionToken(token, rotatedEmailConfig, nowMs).authenticated).toBe(false);
  });

  it("rate-limits repeated failed login attempts per IP and clears on success", () => {
    const config = getAdminAuthConfig({
      ADMIN_EMAIL: "admin@joinscaleflow.in",
      ADMIN_PASSWORD: "correct",
      ADMIN_SESSION_SECRET: "secret",
    });
    const nowMs = 1_700_000_000_000;

    for (let i = 0; i < 10; i++) {
      const attempt = attemptAdminLogin({
        email: "admin@joinscaleflow.in",
        password: "wrong",
        ip: "203.0.113.5",
        config,
        nowMs,
      });
      expect(attempt.result).toEqual({
        ok: false,
        configured: true,
        error: "Invalid email or password.",
      });
    }

    // 11th attempt even with right password is rate-limited
    const blocked = attemptAdminLogin({
      email: "admin@joinscaleflow.in",
      password: "correct",
      ip: "203.0.113.5",
      config,
      nowMs: nowMs + 1000,
    });
    expect(blocked.token).toBeNull();
    expect(blocked.result.ok).toBe(false);
    if (!blocked.result.ok) {
      expect(blocked.result.error).toContain("Too many failed login attempts");
    }

    // Different IP is unaffected
    const otherIp = attemptAdminLogin({
      email: "admin@joinscaleflow.in",
      password: "correct",
      ip: "203.0.113.6",
      config,
      nowMs,
    });
    expect(otherIp.result.ok).toBe(true);
  });

  it("sanitizes redirect targets to /admin paths only", () => {
    expect(sanitizeAdminRedirect("/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("/admin/projects")).toBe("/admin/projects");
    expect(sanitizeAdminRedirect("/admin/login")).toBe("/admin");
    expect(sanitizeAdminRedirect("/admin/login?redirect=/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("https://evil.example/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("//evil.example/admin")).toBe("/admin");
    expect(sanitizeAdminRedirect("/contact")).toBe("/admin");
    expect(sanitizeAdminRedirect(undefined)).toBe("/admin");
  });
});
