export interface AdminSessionStatus {
  authenticated: boolean;
  email: string | null;
  configured: boolean;
}

export type AdminLoginResult =
  { ok: true; email: string } | { ok: false; error: string; configured: boolean };

/**
 * Allow only relative `/admin...` redirect targets to prevent open redirects.
 */
export function sanitizeAdminRedirect(target: unknown): string {
  if (typeof target !== "string") return "/admin";
  const trimmed = target.trim();
  if (!trimmed.startsWith("/admin")) return "/admin";
  if (trimmed.startsWith("//") || trimmed.includes("\\")) return "/admin";
  if (trimmed === "/admin/login" || trimmed.startsWith("/admin/login?")) return "/admin";
  return trimmed;
}
