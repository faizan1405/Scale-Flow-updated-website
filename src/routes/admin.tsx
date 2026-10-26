import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { FolderKanban, Image, LayoutDashboard, Receipt, Settings, Tags, ExternalLink, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/site/Nav";

export const Route = createFileRoute("/admin")({
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
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-start gap-3 border-b border-coral/30 bg-coral/10 px-4 py-2.5 text-xs text-ivory md:px-6">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
        <p>
          <strong>Demo mode.</strong> There is no login yet and changes are saved only in this browser. Uploaded videos last until the tab closes. Connect the Hostinger backend for real accounts and storage.
        </p>
      </div>
      <div className="md:flex">
        <aside className="border-b border-ivory/10 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between p-4 md:block md:p-6">
            <Logo />
            <p className="label-mono mt-1 hidden text-grey md:block">Admin</p>
          </div>
          <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3">
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
            <Link to="/" className="mt-auto flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm text-grey hover:text-ivory md:mt-6">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
