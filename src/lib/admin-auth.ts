import { createServerFn } from "@tanstack/react-start";
import type { AdminLoginResult, AdminSessionStatus } from "./admin-auth.shared";

export type { AdminLoginResult, AdminSessionStatus } from "./admin-auth.shared";
export { sanitizeAdminRedirect } from "./admin-auth.shared";

export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminSessionStatus> => {
    const [{ getCookie }, auth] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./admin-auth.server"),
    ]);
    const config = auth.getAdminAuthConfig();
    const token = getCookie(auth.ADMIN_SESSION_COOKIE);
    return auth.verifySessionToken(token, config);
  },
);

export const loginAdminFn = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => {
    if (!input || typeof input.email !== "string" || typeof input.password !== "string") {
      throw new Error("Email and password are required.");
    }
    return {
      email: input.email.trim(),
      password: input.password,
    };
  })
  .handler(async ({ data }): Promise<AdminLoginResult> => {
    const [server, auth] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./admin-auth.server"),
    ]);

    const ip = server.getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const { result, token } = auth.attemptAdminLogin({
      email: data.email,
      password: data.password,
      ip,
    });

    if (result.ok && token) {
      const isHttps = server.getRequestProtocol({ xForwardedProto: true }) === "https";
      server.setCookie(auth.ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: auth.ADMIN_SESSION_TTL_SECONDS,
        secure: isHttps,
      });
    }

    return result;
  });

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    const [server, auth] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./admin-auth.server"),
    ]);
    const isHttps = server.getRequestProtocol({ xForwardedProto: true }) === "https";
    server.deleteCookie(auth.ADMIN_SESSION_COOKIE, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isHttps,
    });
    return { ok: true };
  },
);
