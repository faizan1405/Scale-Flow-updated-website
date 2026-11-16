import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, ArrowLeft, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/site/Nav";
import { aBtn, AField, aInput } from "@/components/admin/kit";
import { getAdminSessionFn, loginAdminFn, sanitizeAdminRedirect } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin_/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const next = sanitizeAdminRedirect(search["redirect"]);
    return next !== "/admin" ? { redirect: next } : {};
  },
  beforeLoad: async () => {
    const session = await getAdminSessionFn();
    if (session.authenticated) {
      throw redirect({ to: "/admin" });
    }
    return { configured: session.configured };
  },
  head: () => ({
    meta: [
      { title: "Admin Login — Scale Flow" },
      { name: "description", content: "Sign in to Scale Flow administration." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { configured } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await loginAdminFn({ data: { email, password } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await router.invalidate();
      const target = sanitizeAdminRedirect(search.redirect);
      await navigate({ to: target as "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ivory/10 bg-navy/70 p-6 shadow-2xl md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="label-mono inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] text-gold">
            <Lock className="h-3 w-3" /> Admin
          </span>
        </div>

        <h1 className="font-display text-3xl text-ivory">Sign in</h1>
        <p className="mt-2 text-sm text-ivory/65">
          Enter your administrator email and password to access the Scale Flow panel.
        </p>

        {!configured && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-coral/40 bg-coral/10 p-3.5 text-xs text-ivory">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p>
              Admin credentials are not configured yet on this server. Add{" "}
              <code className="font-mono text-gold">ADMIN_EMAIL</code>,{" "}
              <code className="font-mono text-gold">ADMIN_PASSWORD</code>, and{" "}
              <code className="font-mono text-gold">ADMIN_SESSION_SECRET</code> to your hosting
              environment.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-sm text-coral"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <AField label="Email ID">
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@joinscaleflow.in"
              className={aInput}
              disabled={submitting || !configured}
            />
          </AField>

          <AField label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className={aInput + " pr-10"}
                disabled={submitting || !configured}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-grey hover:text-ivory"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </AField>

          <button
            type="submit"
            disabled={submitting || !configured}
            className={aBtn + " w-full justify-center py-2.5"}
          >
            {submitting ? "Signing in…" : "Sign in to Admin"}
          </button>
        </form>

        <div className="mt-6 border-t border-ivory/10 pt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-grey hover:text-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
