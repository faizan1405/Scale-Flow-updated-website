import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Search } from "lucide-react";
import { byOrder, useDB } from "@/data/store";
import type { Video } from "@/data/types";
import { SiteMock } from "@/components/site/SiteMock";
import { Words } from "@/components/site/Words";
import { VideoModal } from "@/components/site/VideoModal";
import { WhatsAppLink } from "@/components/site/WhatsApp";
import { btnGhost, btnPrimary, btnWhatsApp } from "@/components/site/Magnetic";
import { useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "The Motion Vault — Scale Flow" },
      { name: "description", content: "Explore Scale Flow's work through real website walkthroughs and interactive demonstrations." },
      { property: "og:title", content: "The Motion Vault — Scale Flow" },
      { property: "og:description", content: "Website walkthroughs and interactive demonstrations by Scale Flow." },
    ],
  }),
  component: Videos,
});

function Videos() {
  const db = useDB();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Video | null>(null);
  const ref = useReveal<HTMLElement>([cat, q]);
  const cats = db.categories.filter((c) => c.enabled).sort(byOrder);
  // Only published videos with a real file are shown as playable.
  const playable = db.videos.filter((v) => v.published && !!v.src);
  const hasAnyVideo = playable.length > 0;
  const related = useMemo(() => {
    const linked = db.videos.map((v) => db.projects.find((p) => p.id === v.projectId)).filter((p): p is NonNullable<typeof p> => !!p && p.published);
    const pool = linked.length ? linked : db.projects.filter((p) => p.published && p.featured);
    return Array.from(new Map(pool.map((p) => [p.id, p])).values()).slice(0, 4);
  }, [db.videos, db.projects]);
  const list = useMemo(
    () =>
      db.videos
        .filter((v) => v.published && !!v.src)
        .filter((v) => cat === "all" || v.categoryId === cat)
        .filter((v) => {
          if (!q) return true;
          const proj = db.projects.find((p) => p.id === v.projectId);
          return (v.title + " " + (proj?.title ?? "")).toLowerCase().includes(q.toLowerCase());
        })
        .sort(byOrder),
    [db.videos, db.projects, cat, q],
  );
  const openProject = open ? db.projects.find((p) => p.id === open.projectId) : undefined;

  return (
    <main id="main" ref={ref} className="surface-light px-5 pb-32 pt-32 sm:px-8 md:px-12 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <p data-reveal className="label-mono mb-6 text-grey">Video gallery</p>
        <Words as="h1" text="The Motion Vault." italicLast className="font-display block text-[clamp(3.5rem,11vw,10rem)] leading-[0.88]" />
        <p data-reveal className="mt-6 max-w-lg text-lg text-ivory/65">Explore our work through real website walkthroughs and interactive demonstrations.</p>

        {hasAnyVideo && <div className="mt-14 flex flex-col gap-3 border-y border-ivory/10 py-4 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="tablist" aria-label="Filter videos">
            {[{ id: "all", name: "All" }, ...cats].map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors", cat === c.id ? "bg-ivory text-midnight" : "text-ivory/65 hover:text-ivory")}>
                {c.name}
              </button>
            ))}
          </div>
          <label className="relative flex items-center">
            <span className="sr-only">Search videos</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-grey" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by project" className="w-full rounded-full border border-ivory/15 bg-transparent py-2 pl-9 pr-4 text-sm placeholder:text-grey focus:border-gold focus:outline-none md:w-56" />
          </label>
        </div>}

        {!hasAnyVideo ? (
          <section data-reveal="mask" className="surface-dark mt-16 rounded-3xl border border-ivory/10 px-6 py-16 md:px-14 md:py-20">
            <p className="label-mono text-gold">Now in production</p>
            <h2 className="font-display mt-4 max-w-2xl text-4xl md:text-6xl">Walkthroughs are being filmed.</h2>
            <p className="mt-5 max-w-lg text-ivory/65">Until they premiere here, step inside the live projects themselves.</p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <Link key={p.id} to="/work/$slug" params={{ slug: p.slug }} className="group block">
                  <div className="overflow-hidden rounded-lg border border-ivory/10">
                    <div className="transition-transform duration-1000 ease-out group-hover:scale-105">
                      <SiteMock project={p} />
                    </div>
                  </div>
                  <p className="font-display mt-4 text-2xl">{p.title}</p>
                  <p className="label-mono mt-1 text-grey transition-colors group-hover:text-gold">Explore project →</p>
                </Link>
              ))}
            </div>
            <Link to="/work" className={cn(btnPrimary, "mt-12")}>View all work</Link>
          </section>
        ) : list.length === 0 ? (
          <div className="mt-20 rounded-xl border border-dashed border-ivory/15 py-24 text-center">
            <p className="font-display text-4xl">No videos here yet.</p>
            <button onClick={() => { setCat("all"); setQ(""); }} className={cn(btnPrimary, "mt-8")}>Show all videos</button>
          </div>
        ) : (
          <div className="mt-14 columns-1 gap-8 md:columns-2">
            {list.map((v, i) => {
              const proj = db.projects.find((p) => p.id === v.projectId);
              return (
                <article key={v.id} data-reveal className="mb-12 break-inside-avoid">
                  <button onClick={() => setOpen(v)} className="group relative block w-full overflow-hidden rounded-lg text-left" aria-label={`Play ${v.title}`}>
                    <div className={cn("transition-transform duration-1000 ease-out group-hover:scale-105", i % 3 === 1 && "[&>div]:aspect-[4/3]")}>
                      {v.thumbnail ? (
                        <img src={v.thumbnail} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                      ) : proj ? (
                        <SiteMock project={proj} />
                      ) : (
                        <div className="aspect-video bg-navy" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-midnight/35 transition-colors group-hover:bg-midnight/10" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-midnight transition-transform duration-500 group-hover:scale-110">
                      <Play className="ml-0.5 h-6 w-6 fill-current" />
                    </span>
                  </button>
                  <h2 className="font-display mt-4 text-2xl md:text-3xl">{v.title}</h2>
                  <p className="mt-1 text-sm text-ivory/55">{v.description}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <VideoModal
        open={!!open}
        onClose={() => setOpen(null)}
        src={open?.src}
        poster={open?.thumbnail}
        title={open?.title ?? ""}
        footer={
          openProject && (
            <>
              <Link to="/work/$slug" params={{ slug: openProject.slug }} className={btnGhost}>View Project</Link>
              <WhatsAppLink message={`Hi Scale Flow, I saw your video for ${openProject.title}. I'd like a similar website.`} className={btnWhatsApp}>Get a Similar Website</WhatsAppLink>
            </>
          )
        }
      />
    </main>
  );
}
