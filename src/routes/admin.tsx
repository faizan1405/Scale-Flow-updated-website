import { useState } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Tags,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/site/Nav";
import { Toaster } from "@/components/ui/sonner";
import { getAdminSessionFn, logoutAdminFn, sanitizeAdminRedirect } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const session = await getAdminSessionFn();
    if (!session.authenticated) {
      const target = sanitizeAdminRedirect(location.pathname);
      throw redirect({
        to: "/admin/login",
        search: target !== "/admin" ? { redirect: target } : {},
      });
    }
    return { adminEmail: session.email };
  },
  head: () => ({
    meta: [
      { title: "Admin — Scale Flow" },
      { name: "description", content: "Scale Flow content administration." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Scale Flow" },
      { property: "og:description", content: "Scale Flow content administration." },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/media", label: "Media & Videos", icon: Image },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/quotations", label: "Quotations", icon: Receipt },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { adminEmail } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logoutAdminFn();
      await router.invalidate();
      await navigate({ to: "/admin/login" });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-start justify-between gap-3 border-b border-gold/25 bg-gold/10 px-4 py-2.5 text-xs text-ivory md:px-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p>
            Signed in as <strong>{adminEmail ?? "Admin"}</strong>. Content changes are saved in this
            browser only until the Hostinger database is connected; uploaded videos last until the
            tab closes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-ivory/15 px-2.5 py-1 text-xs text-ivory hover:border-gold hover:text-gold disabled:opacity-40"
        >
          <LogOut className="h-3.5 w-3.5" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
      <div className="md:flex">
        <aside className="border-b border-ivory/10 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between p-4 md:block md:p-6">
            <Logo />
            <p className="label-mono mt-1 hidden text-grey md:block">Admin</p>
          </div>
          <nav
            aria-label="Admin"
            className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3"
          >
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: "exact" in n }}
                className="flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm text-ivory/65 hover:bg-charcoal hover:text-ivory"
                activeProps={{ className: "!bg-charcoal !text-gold" }}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
            <Link
              to="/"
              className="mt-auto flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm text-grey hover:text-ivory md:mt-6"
            >
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-grey hover:bg-charcoal hover:text-coral disabled:opacity-40"
            >
              <LogOut className="h-4 w-4" /> {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-10">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
