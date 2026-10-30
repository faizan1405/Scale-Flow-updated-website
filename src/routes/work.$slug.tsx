import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, Monitor, Smartphone, X } from "lucide-react";
import { byOrder, useDB } from "@/data/store";
import { kindLabel } from "@/data/portfolio-utils";
import { seed } from "@/data/seed";
import type { Project } from "@/data/types";
import { SiteMock } from "@/components/site/SiteMock";
import { Words } from "@/components/site/Words";
import { btnGhost, btnPrimary, SlideLabel } from "@/components/site/Magnetic";
import { WhatsAppIcon, WhatsAppLink } from "@/components/site/WhatsApp";
import { prefersReducedMotion, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const p = seed.projects.find((x) => x.slug === params.slug);
    return { title: p?.title ?? "Project", summary: p?.summary ?? "A Scale Flow project." };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Project"} — Scale Flow` },
      { name: "description", content: loaderData?.summary ?? "A Scale Flow project." },
      { property: "og:title", content: `${loaderData?.title ?? "Project"} — Scale Flow` },
      { property: "og:description", content: loaderData?.summary ?? "A Scale Flow project." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const db = useDB();
  const published = useMemo(() => db.projects.filter((p) => p.published).sort(byOrder), [db.projects]);
  const project = db.projects.find((p) => p.slug === slug);
  if (!project) return <Missing />;
  const idx = published.findIndex((p) => p.id === project.id);
  const next = published[(idx + 1) % published.length] ?? published[0];
  return <Detail key={project.id} project={project} next={next && next.id !== project.id ? next : undefined} category={db.categories.find((c) => c.id === project.categoryId)?.name} />;
}

function Missing() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="label-mono text-gold">404 — Project</p>
      <h1 className="font-display mt-4 text-6xl">This project isn't on display.</h1>
      <Link to="/work" className={cn(btnPrimary, "mt-10")}>Back to all work</Link>
    </main>
  );
}

function Detail({ project: p, next, category }: { project: Project; next?: Project | undefined; category?: string | undefined }) {
  const ref = useReveal<HTMLElement>([p.id]);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gallery: { src?: string; variant: "desktop" | "mobile"; label: string }[] = [
    ...p.screenshots.map((src, i) => ({ src, variant: "desktop" as const, label: `Desktop layout ${i + 1}` })),
    ...p.mobileScreenshots.map((src, i) => ({ src, variant: "mobile" as const, label: `Mobile layout ${i + 1}` })),
  ];
  const sampleGallery = gallery.length === 0;
  const shown = sampleGallery
    ? [
        { variant: "desktop" as const, label: "Desktop layout" },
        { variant: "mobile" as const, label: "Mobile layout" },
        { variant: "mobile" as const, label: "Mobile detail" },
      ]
    : gallery;

  return (
    <main id="main" ref={ref}>
      {/* 01 opening */}
      <section className="relative overflow-hidden px-6 pb-20 pt-36 md:px-12 md:pt-44">
        <div aria-hidden className="absolute -top-40 left-1/2 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full opacity-25 blur-[120px]" style={{ background: p.palette.accent }} />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/work" className="label-mono inline-flex items-center gap-2 text-grey hover:text-ivory transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> All work
            </Link>
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btnPrimary, "btn-sheen shadow-deep group inline-flex items-center gap-2 text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5")}
                aria-label={`View ${p.title} live website in a new tab`}
              >
                <SlideLabel>View Website</SlideLabel>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
          <p data-reveal className="label-mono mt-8 text-gold">{category}{kindLabel(p) && ` · ${kindLabel(p)}`}</p>
          <Words as="h1" text={p.title} italicLast className="font-display mt-4 block text-[clamp(3.5rem,11vw,10rem)] leading-[0.88]" />
          <p data-reveal className="mt-6 max-w-xl text-lg text-ivory/70">{p.summary}</p>
          <div data-reveal="scale" className="mt-16 overflow-hidden rounded-lg shadow-deep">
            <SiteMock project={p} />
          </div>
        </div>
      </section>

      {/* 02 device presentation */}
      <section className="px-6 py-24 md:px-12" aria-labelledby="devices">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
            <h2 id="devices" className="font-display text-4xl md:text-6xl">On every screen</h2>
            <div role="tablist" aria-label="Device view" className="flex rounded-full border border-ivory/15 p-1">
              {(["desktop", "mobile"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm capitalize transition-colors", view === v ? "bg-ivory text-midnight" : "text-ivory/65")}>
                  {v === "desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />} {v} view
                </button>
              ))}
            </div>
          </div>
          <DeviceStage project={p} view={view} />
        </div>
      </section>

      {/* 03 overview */}
      <section className="border-y border-ivory/10 bg-navy/40 px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label-mono text-grey">Overview</p>
            <p data-reveal className="font-display mt-6 text-3xl leading-tight md:text-4xl">{p.overview}</p>
          </div>
          <dl className="grid gap-10 sm:grid-cols-2 md:col-span-6 md:col-start-7">
            {[["Context", p.context], ["Goals", p.goals], ["Design approach", p.approach]].map(([k, v]) => (
              <div key={k} data-reveal className="border-t border-ivory/15 pt-4">
                <dt className="label-mono text-gold">{k}</dt>
                <dd className="mt-3 text-ivory/70">{v}</dd>
              </div>
            ))}
            <div data-reveal className="border-t border-ivory/15 pt-4">
              <dt className="label-mono text-gold">Capabilities</dt>
              <dd className="mt-3 flex flex-wrap gap-2">{p.capabilities.map((c) => <span key={c} className="rounded-full border border-ivory/15 px-3 py-1 text-xs">{c}</span>)}</dd>
            </div>
            <div data-reveal className="border-t border-ivory/15 pt-4 sm:col-span-2">
              <dt className="label-mono text-gold">Delivered</dt>
              <dd className="mt-3 grid gap-2 text-ivory/70 sm:grid-cols-2">{p.deliverables.map((d) => <span key={d}>— {d}</span>)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 04 visual exploration */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl md:text-6xl">Visual exploration</h2>
            {sampleGallery && <p className="label-mono text-grey">Coded sample visuals — real screenshots can be uploaded in admin</p>}
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            {shown.map((g, i) => (
              <button key={i} data-reveal={i === 0 ? "mask" : "fade"} onClick={() => setLightbox(i)} className={cn("group relative overflow-hidden rounded-lg text-left", g.variant === "desktop" ? "md:col-span-8" : "md:col-span-4", i === 0 && "md:col-span-12")} aria-label={`Open ${g.label} fullscreen`}>
                <SiteMock project={p} variant={g.variant} image={g.src} className={g.variant === "mobile" ? "mx-auto max-h-[80vh]" : undefined} />
                <span className="absolute right-3 top-10 flex h-10 w-10 items-center justify-center rounded-full bg-midnight/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 05 video — hidden when none */}
      {p.videoUrl && (
        <section className="px-6 py-24 md:px-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display mb-10 text-4xl md:text-6xl">Video walkthrough</h2>
            <video src={p.videoUrl} controls preload="none" playsInline className="aspect-video w-full rounded-lg bg-navy" />
          </div>
        </section>
      )}

      {/* 06 live */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 rounded-xl border border-ivory/10 p-8 md:flex-row md:items-center md:justify-between md:p-14">
          <h2 className="font-display max-w-xl text-4xl md:text-5xl">Like what you see?</h2>
          <div className="flex flex-wrap gap-3">
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>Visit Live Website <ArrowUpRight className="h-4 w-4" /></a>}
            <Link to="/build-your-website" search={{ ref: p.slug }} className={btnPrimary + " btn-sheen"}><SlideLabel>I Want a Website Like This</SlideLabel> <ArrowRight className="h-4 w-4" /></Link>
            <WhatsAppLink message={`Hi Scale Flow, I like ${p.title} and want something similar.`} className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-semibold text-midnight">
              <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </section>

      {/* 07 next */}
      {next && (
        <Link to="/work/$slug" params={{ slug: next.slug }} className="group relative block overflow-hidden border-t border-ivory/10 px-6 py-24 md:px-12 md:py-32">
          <div aria-hidden className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100" style={{ background: next.palette.surface }} />
          <div className="relative mx-auto flex max-w-7xl items-end justify-between gap-6">
            <div>
              <p className="label-mono text-grey">Next project</p>
              <p className="font-display mt-3 text-[clamp(3rem,9vw,8rem)] leading-none transition-transform duration-700 group-hover:translate-x-4">{next.title}</p>
            </div>
            <ArrowRight className="mb-6 h-10 w-10 transition-transform duration-700 group-hover:translate-x-2" />
          </div>
        </Link>
      )}

      {lightbox !== null && <Lightbox project={p} items={shown} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />}
    </main>
  );
}

function DeviceStage({ project, view }: { project: Project; view: "desktop" | "mobile" }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 8}deg)`;
  };
  return (
    <div onPointerMove={move} onPointerLeave={() => ref.current && (ref.current.style.transform = "")} className="relative flex min-h-[420px] items-center justify-center rounded-xl bg-gradient-to-b from-navy to-midnight py-16 md:min-h-[620px]" style={{ perspective: "1600px" }}>
      <div ref={ref} className="transition-transform duration-700 ease-out [transform-style:preserve-3d]">
        <div className={cn("transition-all duration-700", view === "desktop" ? "opacity-100" : "pointer-events-none absolute inset-0 scale-90 opacity-0")}>
          <div className="w-[82vw] max-w-4xl rounded-[14px] border border-ivory/10 bg-charcoal p-2.5 shadow-deep md:p-3.5">
            <SiteMock project={project} image={project.screenshots[0]} chrome={false} className="rounded-md" />
          </div>
          <div className="mx-auto h-10 w-24 bg-gradient-to-b from-charcoal to-navy md:h-16" />
          <div className="mx-auto h-2 w-56 rounded-full bg-charcoal" />
        </div>
        <div className={cn("transition-all duration-700", view === "mobile" ? "opacity-100" : "pointer-events-none absolute inset-0 scale-90 opacity-0")}>
          <div className="mx-auto w-56 rounded-[2.2rem] border border-ivory/10 bg-charcoal p-2 shadow-deep md:w-64">
            <SiteMock project={project} variant="mobile" className="rounded-[1.8rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ project, items, index, onClose, onIndex }: { project: Project; items: { src?: string; variant: "desktop" | "mobile"; label: string }[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const item = items[index] ?? items[0]!;
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onIndex]);
  return (
    <div role="dialog" aria-modal="true" aria-label={item.label} className="fixed inset-0 z-[60] flex flex-col bg-midnight/95 p-4 backdrop-blur md:p-10" onClick={onClose}>
      <div className="flex items-center justify-between">
        <p className="label-mono text-grey">{index + 1} / {items.length} — {item.label}</p>
        <button autoFocus onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20" aria-label="Close"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto py-6" onClick={(e) => e.stopPropagation()}>
        <SiteMock project={project} variant={item.variant} image={item.src} className={item.variant === "mobile" ? "h-[75vh] w-auto" : "w-full max-w-6xl"} />
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onIndex((index - 1 + items.length) % items.length)} className={btnGhost} aria-label="Previous image"><ArrowLeft className="h-4 w-4" /></button>
          <button onClick={() => onIndex((index + 1) % items.length)} className={btnGhost} aria-label="Next image"><ArrowRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
