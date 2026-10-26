import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { z } from "zod";
import { byOrder, useDB } from "@/data/store";
import { inCategory, kindLabel, matchesQuery } from "@/data/portfolio-utils";
import { SiteMock } from "@/components/site/SiteMock";
import { Words } from "@/components/site/Words";
import { ensureGsap, prefersReducedMotion, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/work/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Selected Work — Scale Flow" },
      { name: "description", content: "A collection of digital experiences crafted with creativity, precision and purpose by Scale Flow." },
      { property: "og:title", content: "Selected Work — Scale Flow" },
      { property: "og:description", content: "Browse websites, stores, 3D experiences and web apps by Scale Flow." },
    ],
  }),
  component: Work,
});

// Grid rhythm: an editorial, asymmetric sequence instead of a uniform grid.
const SPANS = ["md:col-span-7", "md:col-span-5 md:mt-32", "md:col-span-5", "md:col-span-7 md:-mt-16", "md:col-span-8 md:col-start-3", "md:col-span-6", "md:col-span-6 md:mt-24"];

function Work() {
  const { category, q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const db = useDB();
  const cats = useMemo(() => db.categories.filter((c) => c.enabled).sort(byOrder), [db.categories]);
  const active = cats.find((c) => c.slug === category);
  const list = useMemo(
    () =>
      db.projects
        .filter((p) => p.published)
        .filter((p) => !active || inCategory(p, active.id))
        .filter((p) => matchesQuery(p, q))
        .sort(byOrder),
    [db.projects, active, q],
  );
  const PAGE = 12;
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [category, q]);
  const visible = list.slice(0, limit);
  const head = useReveal<HTMLDivElement>();
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!grid.current || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const items = grid.current.querySelectorAll("[data-item]");
    gsap.fromTo(items, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.07 });
  }, [category, q, list.length, limit]);

  const setSearch = (next: { category?: string | undefined; q?: string | undefined }) => navigate({ search: (s) => ({ ...s, ...next }), replace: true, resetScroll: false });

  return (
    <main id="main" className="stage-graphite px-6 pb-32 pt-36 md:px-12 md:pt-44">
      <div ref={head} className="mx-auto max-w-7xl">
        <p data-reveal className="label-mono mb-6 text-grey">Portfolio — {list.length} {list.length === 1 ? "project" : "projects"}</p>
        <Words as="h1" text="Selected Work." italicLast className="font-display block text-[clamp(3.5rem,12vw,11rem)] leading-[0.88]" />
        <p data-reveal className="mt-6 max-w-lg text-lg text-ivory/75">A collection of digital experiences crafted with creativity, precision and purpose.</p>

        <div className="sticky top-20 z-30 -mx-6 mt-14 border-y border-ivory/10 bg-navy/90 px-6 py-4 shadow-deep backdrop-blur-md md:top-24 md:mx-0 md:rounded-full md:border md:px-3 md:py-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div role="tablist" aria-label="Filter by category" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
              {[{ id: "all", name: "All Projects", slug: undefined as string | undefined }, ...cats].map((c) => {
                const on = (c.slug ?? undefined) === (active?.slug ?? undefined);
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setSearch({ category: c.slug })}
                    className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors duration-300", on ? "bg-ivory text-midnight" : "text-ivory/65 hover:text-ivory")}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <label className="relative flex items-center">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-grey" />
              <input
                value={q}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search projects"
                className="w-full rounded-full border border-ivory/15 bg-transparent py-2 pl-9 pr-9 text-sm placeholder:text-grey focus:border-gold focus:outline-none md:w-56"
              />
              {q && (
                <button onClick={() => setSearch({ q: undefined })} className="absolute right-3 text-grey hover:text-ivory" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-24 flex flex-col items-center rounded-xl border border-dashed border-ivory/15 px-6 py-24 text-center">
            <p className="font-display text-5xl">Nothing here — yet.</p>
            <p className="mt-4 max-w-sm text-ivory/60">No projects match {active ? `“${active.name}”` : "this view"}{q ? ` and “${q}”` : ""}. Try another filter.</p>
            <button onClick={() => navigate({ search: {}, replace: true })} className="mt-8 rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-midnight hover:bg-gold">
              Reset filters
            </button>
          </div>
        ) : (
          <div ref={grid} className="mt-16 grid gap-x-8 gap-y-20 md:grid-cols-12">
            {visible.map((p, i) => {
              const cat = db.categories.find((c) => c.id === p.categoryId);
              const kind = kindLabel(p);
              return (
                <Link key={p.id} data-item to="/work/$slug" params={{ slug: p.slug }} className={cn("group block", SPANS[i % SPANS.length])}>
                  <div className="relative">
                    <div aria-hidden className="absolute -inset-4 -z-0 rounded-[24px] opacity-0 blur-[50px] transition-opacity duration-700 group-hover:opacity-40" style={{ background: p.ambient ?? p.palette.accent }} />
                    <div className="relative rounded-xl ring-1 ring-ivory/10 shadow-deep">
                      <TiltFrame>
                        <SiteMock project={p} />
                      </TiltFrame>
                    </div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="label-mono text-gold">{String(i + 1).padStart(2, "0")} — {cat?.name}{kind && <span className="text-grey"> · {kind}</span>}</p>
                      <h2 className="font-display mt-2 text-3xl md:text-4xl">{p.title}</h2>
                      <p className="mt-1 text-sm text-ivory/70">{p.summary}</p>
                    </div>
                    <span className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-midnight">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {list.length > limit && (
          <div className="mt-24 flex flex-col items-center gap-3">
            <p className="label-mono text-grey">Showing {visible.length} of {list.length}</p>
            <button onClick={() => setLimit((n) => n + PAGE)} className="rounded-full border border-ivory/20 px-8 py-3 text-sm transition-colors hover:border-gold hover:text-gold">
              Show more projects
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function TiltFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current || prefersReducedMotion()) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };
  return (
    <div style={{ perspective: "1200px" }} onPointerMove={move} onPointerLeave={() => ref.current && (ref.current.style.transform = "")}>
      <div ref={ref} className="overflow-hidden rounded-lg shadow-deep transition-transform duration-500 ease-out">
        {children}
      </div>
    </div>
  );
}
