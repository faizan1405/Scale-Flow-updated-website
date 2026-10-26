import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { byOrder, useDB } from "@/data/store";
import { kindLabel } from "@/data/portfolio-utils";
import type { Project } from "@/data/types";
import { HeroStack } from "@/components/site/HeroStack";
import { SiteMock } from "@/components/site/SiteMock";
import { Words } from "@/components/site/Words";
import { SlideLabel, btnGhost, btnLarge, btnLargeGhost, btnPrimary } from "@/components/site/Magnetic";
import { VideoModal } from "@/components/site/VideoModal";
import { WhatsAppIcon, WhatsAppLink } from "@/components/site/WhatsApp";
import { ensureGsap, prefersReducedMotion, useIsoLayoutEffect, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scale Flow — The Digital Showroom" },
      { name: "description", content: "Don't just view our work. Experience it. Explore immersive websites by Scale Flow and build your website estimate in minutes." },
      { property: "og:title", content: "Scale Flow — The Digital Showroom" },
      { property: "og:description", content: "Explore immersive websites by Scale Flow and build your website estimate in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const db = useDB();
  const projects = useMemo(() => db.projects.filter((p) => p.published).sort(byOrder), [db.projects]);
  const featured = projects.filter((p) => p.featured);
  return (
    <main id="main">
      <Hero projects={featured.length ? featured : projects} />
      <Intro />
      <SelectedWork projects={featured.length ? featured : projects.slice(0, 3)} />
      <Capabilities projects={projects} />
      <Showroom projects={projects} showreel={db.settings.showreelUrl} />
      <FinalCta />
    </main>
  );
}

/* 01 — HERO */
function Hero({ projects }: { projects: Project[] }) {
  const { settings } = useDB();
  const ref = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo("[data-hero-label]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9 }, 0.15)
        .fromTo("h1 [data-word]", { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0.3)
        .fromTo("[data-hero-sub]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.9)
        .fromTo("[data-hero-cta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 1.05)
        .fromTo("[data-hero-meta]", { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.1 }, 1.4);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="surface-light relative overflow-hidden px-6 pb-16 pt-28 md:px-12 md:pb-24 md:pt-36" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p data-hero-label className="label-mono mb-8 flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gold" /> Scale Flow — Digital Showroom
          </p>
          <Words as="h1" text={settings.heroHeadline} italicLast className="font-display block text-[clamp(2.8rem,6.2vw,6rem)] leading-[0.98]" />
          <p data-hero-sub className="mt-8 max-w-md text-base leading-relaxed text-ivory/70 md:text-lg">{settings.heroSub}</p>
          <div className="mt-10 flex flex-wrap gap-3">
              <Link data-hero-cta to="/work" className={btnPrimary}>
                <SlideLabel>Explore Our Work</SlideLabel> <ArrowRight className="h-4 w-4" />
              </Link>
                          <Link data-hero-cta to="/build-your-website" className={btnGhost}><SlideLabel>Build Your Website</SlideLabel> <ArrowRight className="h-4 w-4" /></Link>
                      </div>
          <dl className="mt-14 hidden max-w-md grid-cols-2 sm:grid gap-6 border-t border-ivory/10 pt-6">
            <div data-hero-meta><dt className="label-mono text-grey">Showroom</dt><dd className="font-display mt-2 text-3xl">{projects.length ? "Live work" : "Opening"}</dd></div>
            <div data-hero-meta><dt className="label-mono text-grey">Estimate</dt><dd className="font-display mt-2 text-3xl">In minutes</dd></div>
          </dl>
        </div>
        <div className="lg:col-span-6">
          <HeroStack projects={projects} />
        </div>
      </div>
    </section>
  );
}

/* 02 — INTRO */
function Intro() {
  const ref = useReveal<HTMLElement>();
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-scrub-word]", { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  const text = "Not Just Websites. Digital Experiences.";
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
      <p data-reveal className="label-mono mb-6 text-grey">(01) — Intent</p>
      <h2 className="font-display text-[clamp(2.6rem,7vw,7rem)] leading-[0.92]">
        {text.split(" ").map((w, i) => (
          <span key={i} data-scrub-word className={cn("inline-block pr-[0.25em]", i >= 3 && "text-gold")}>
            {w}
          </span>
        ))}
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <p data-reveal className="text-lg text-ivory/70 md:col-span-5 md:col-start-8 md:text-xl">
          Every project is an opportunity to combine thoughtful design, powerful technology and meaningful business outcomes.
        </p>
      </div>
    </section>
  );
}

/* 03 — SELECTED WORK */
function SelectedWork({ projects }: { projects: Project[] }) {
  const ref = useReveal<HTMLElement>([projects.length]);
  const { categories } = useDB();
  const kinds = ["tilt", "scale", "mask"] as const;
  const [lit, setLit] = useState(0);
  // Track which project is centred in view so the ambient light can follow it.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setLit(Number((e.target as HTMLElement).dataset["idx"]))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll("[data-idx]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [projects.length]);
  const glow = (p?: Project) => (p ? p.ambient ?? p.palette.accent : "transparent");
  const current = projects[lit];
  return (
    <section ref={ref} className="relative px-6 pb-32 md:px-12" aria-labelledby="selected-title">
      {/* section-wide ambient light, eases to the active project's colour */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sticky top-0 h-screen">
          <div
            className="absolute left-1/2 top-1/2 h-[70vh] w-[90vw] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[140px] transition-[background-color] duration-[1400ms] ease-out"
            style={{ backgroundColor: glow(current) }}
          />
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-20 flex flex-wrap items-end justify-between gap-6 border-b border-ivory/10 pb-8">
          <div>
            <p data-reveal className="label-mono mb-4 text-grey">(02) — Exhibition</p>
            <Words as="h2" text="Selected Work" className="font-display block text-6xl md:text-8xl" />
          </div>
          <Link to="/work" className="link-underline label-mono text-gold">View all projects →</Link>
        </div>
        <div className="space-y-32 md:space-y-48">
          {projects.map((p, i) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            const flip = i % 2 === 1;
            return (
              <article key={p.id} data-idx={i} className="grid items-center gap-10 md:grid-cols-12 md:gap-8" style={{ perspective: "1600px" }}>
                <Link
                  to="/work/$slug"
                  params={{ slug: p.slug }}
                  data-reveal={kinds[i % 3]}
                  className={cn("group relative block md:col-span-8", flip && "md:order-2 md:col-start-5")}
                  aria-label={`View ${p.title}`}
                >
                  <div aria-hidden className={cn("absolute -inset-6 -z-10 rounded-[28px] blur-[60px] transition-opacity duration-1000 group-hover:opacity-60", lit === i ? "opacity-45" : "opacity-20")} style={{ background: `radial-gradient(60% 60% at 50% 55%, ${glow(p)}, transparent 75%)` }} />
                  <div aria-hidden className="absolute inset-x-[8%] -bottom-6 -z-10 h-10 rounded-full blur-2xl transition-opacity duration-1000" style={{ background: glow(p), opacity: lit === i ? 0.35 : 0.12 }} />
                  <div className="overflow-hidden rounded-lg shadow-deep transition-transform duration-700 ease-out group-hover:scale-[1.015]">
                    <SiteMock project={p} />
                  </div>
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-midnight/80 px-4 py-2 text-xs opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100">
                    View Experience <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                <div className={cn("md:col-span-4", flip && "md:order-1 md:col-start-1 md:row-start-1")}>
                  <p data-reveal className="font-mono text-6xl text-ivory/15 md:text-8xl">{String(i + 1).padStart(2, "0")}</p>
                  <p data-reveal className="label-mono mt-4 text-gold">{cat?.name}</p>
                  <h3 data-reveal className="font-display mt-2 text-4xl md:text-5xl">{p.title}</h3>
                  <p data-reveal className="mt-4 text-ivory/65">{p.summary}</p>
                  <ul data-reveal className="mt-6 flex flex-wrap gap-2">
                    {p.capabilities.slice(0, 3).map((c) => (
                      <li key={c} className="rounded-full border border-ivory/15 px-3 py-1 text-xs text-ivory/70">{c}</li>
                    ))}
                  </ul>
                  <div data-reveal className="mt-8 flex flex-wrap gap-3">
                    <Link to="/work/$slug" params={{ slug: p.slug }} className={btnPrimary}>View Project</Link>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>Live Website <ArrowUpRight className="h-4 w-4" /></a>
                    )}
                  </div>
                  {kindLabel(p) && <p className="label-mono mt-6 text-grey/70">{kindLabel(p)}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 04 — CAPABILITIES: hover/tap a capability to reveal a real project from the portfolio */
const CAPS: { name: string; cat: string; ids: string[] }[] = [
  { name: "3D Interactive", cat: "3d-interactive", ids: ["pf-bmw", "pf-velora"] },
  { name: "E-commerce", cat: "e-commerce", ids: ["pf-noctra"] },
  { name: "Fashion", cat: "fashion", ids: ["pf-lehenga", "pf-mainika"] },
  { name: "Business", cat: "business", ids: ["pf-scaleflow", "pf-afforda"] },
  { name: "Travel", cat: "travel", ids: ["pf-tripzip", "pf-ezymiles"] },
  { name: "Real Estate", cat: "real-estate-interiors", ids: ["pf-ai-realty"] },
  { name: "Creative Portfolio", cat: "creative", ids: ["pf-photography"] },
];
function Capabilities({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const ref = useReveal<HTMLElement>();
  const stage = useRef<HTMLDivElement>(null);
  const items = CAPS.map((c) => ({ ...c, list: c.ids.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p) })).filter((c) => c.list.length);
  const cur = items[Math.min(active, items.length - 1)];
  const p = cur?.list[0];

  useIsoLayoutEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-cap-shot]", { clipPath: "inset(0% 0% 100% 0%)", scale: 1.08 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.out" });
      gsap.fromTo("[data-cap-text] > *", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.15 });
    }, el);
    return () => ctx.revert();
  }, [active]);

  if (!cur || !p) return null;
  return (
    <section ref={ref} className="surface-light section-pad" aria-labelledby="cap-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
          <div>
            <p data-reveal className="label-mono mb-4 text-grey">(03) — Capabilities</p>
            <Words as="h2" text="What We Create" className="font-display block text-5xl md:text-7xl" />
          </div>
          <p data-reveal className="max-w-sm text-ivory/60">Hover or tap a capability to see a live website from our portfolio built for it.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <ul className="lg:col-span-5" role="tablist" aria-label="Capabilities">
            {items.map((c, i) => {
              const on = c === cur;
              return (
                <li key={c.name} className="border-b border-ivory/10">
                  <button
                    role="tab"
                    aria-selected={on}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group relative flex w-full items-baseline gap-5 py-5 text-left md:py-6"
                  >
                    <span className={cn("label-mono w-8 transition-colors", on ? "text-gold" : "text-grey")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-display flex-1 text-3xl transition-all duration-500 md:text-[2.6rem]", on ? "translate-x-2 text-ivory" : "text-ivory/35 group-hover:text-ivory/60")}>{c.name}</span>
                    <ArrowRight className={cn("h-5 w-5 transition-all duration-500", on ? "text-gold opacity-100" : "-translate-x-2 opacity-0")} />
                    <span aria-hidden className={cn("absolute -bottom-px left-0 h-px bg-gold transition-[width] duration-700 ease-out", on ? "w-full" : "w-0")} />
                  </button>
                </li>
              );
            })}
          </ul>
          <div ref={stage} className="min-w-0 lg:col-span-7 lg:sticky lg:top-28 lg:self-start" role="tabpanel" aria-live="polite">
            <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-card p-2 shadow-deep md:p-3">
              <div data-cap-shot className="overflow-hidden rounded-xl">
                <SiteMock project={p} />
              </div>
            </div>
            <div data-cap-text className="mt-7 flex flex-wrap items-end justify-between gap-6 overflow-hidden">
              <div className="max-w-md">
                <p className="label-mono text-gold">{cur.name}</p>
                <h3 className="font-display mt-2 text-3xl md:text-4xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/60">{p.summary}</p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <Link to="/work/$slug" params={{ slug: p.slug }} className={btnPrimary}>View Project <ArrowUpRight className="h-4 w-4" /></Link>
                {cur.list[1] && (
                  <Link to="/work/$slug" params={{ slug: cur.list[1].slug }} className="link-underline text-sm text-ivory/60">Also: {cur.list[1].title}</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 05 — SHOWROOM IN MOTION: real screenshots drifting past; a reel button only appears once a real showreel exists */
function Showroom({ projects, showreel }: { projects: Project[]; showreel: string }) {
  const [open, setOpen] = useState(false);
  const ref = useReveal<HTMLElement>();
  const shots = projects.filter((p) => p.coverImage);
  if (shots.length < 4) return null;
  const half = Math.ceil(shots.length / 2);
  const rows = [shots.slice(0, half), shots.slice(half)];
  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-40" aria-labelledby="motion-title">
      <div className="mx-auto mb-14 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 md:px-12">
        <div>
          <p data-reveal className="label-mono mb-4 text-grey">(04) — The showroom in motion</p>
          <Words as="h2" text="Every Frame Is Live Work." italicLast className="font-display block max-w-3xl text-5xl md:text-7xl" />
        </div>
        <div data-reveal className="flex flex-wrap gap-3">
          {showreel && (
            <button onClick={() => setOpen(true)} className={btnGhost}><Play className="h-4 w-4 fill-current" /> Watch the reel</button>
          )}
          <Link to="/work" className={btnPrimary}>Browse all {projects.length} projects <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div data-reveal="mask" className="space-y-5 md:space-y-7">
        {rows.map((row, r) => (
          <div key={r} className="flex w-max gap-5 hover:[animation-play-state:paused] md:gap-7" style={{ animation: `${r ? "marquee-rev" : "marquee"} ${row.length * 7}s linear infinite` }}>
            {[...row, ...row].map((p, i) => (
              <Link key={p.id + i} to="/work/$slug" params={{ slug: p.slug }} tabIndex={i >= row.length ? -1 : undefined} aria-hidden={i >= row.length || undefined} className="group relative block w-[68vw] shrink-0 sm:w-[44vw] lg:w-[30vw]">
                <div className="overflow-hidden rounded-xl shadow-deep transition-transform duration-700 group-hover:-translate-y-1.5">
                  <SiteMock project={p} chrome={false} />
                </div>
                <p className="mt-3 flex items-center justify-between text-sm text-ivory/60 transition-colors group-hover:text-ivory">
                  {p.title} <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </Link>
            ))}
          </div>
        ))}
      </div>
      {showreel && <VideoModal open={open} onClose={() => setOpen(false)} src={showreel} title="Scale Flow Showreel" />}
    </section>
  );
}

/* 06 — MOVING BAND + FINAL CTA */
function FinalCta() {
  const ref = useReveal<HTMLElement>();
  return (
    <>
      <section aria-hidden className="overflow-hidden border-y border-ivory/10 py-6 md:py-8">
        <div className="space-y-1 whitespace-nowrap">
          <div className="font-display block w-max text-[clamp(3rem,8.5vw,8.5rem)] leading-[1.05] text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--ivory)_40%,transparent)] [animation:marquee_70s_linear_infinite]">Scale Flow · Experience it · Scale Flow · Experience it · </div>
          <div className="font-display block w-max text-[clamp(3rem,8.5vw,8.5rem)] leading-[1.05] text-ivory/[0.09] [animation:marquee-rev_90s_linear_infinite]">Scale Flow · Experience it · Scale Flow · Experience it · </div>
        </div>
      </section>
      <section ref={ref} className="surface-light relative overflow-hidden px-6 py-24 md:px-12 md:py-32" aria-labelledby="cta-title">
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p data-reveal className="label-mono mb-6 flex items-center gap-3 text-gold"><span className="h-px w-10 bg-gold" /> Start a project</p>
            <Words as="h2" text="Let's Build Something Exceptional." italicLast className="font-display block text-[clamp(2.75rem,6.4vw,6.25rem)] leading-[0.95]" />
          </div>
          <div className="lg:col-span-5 lg:pb-3">
            <p data-reveal className="max-w-md text-lg leading-relaxed text-ivory/65 md:text-xl">Tell us what your business needs. We'll shape the right digital experience around your goals.</p>
            <div data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/build-your-website" className={btnLarge + " w-full sm:w-auto"}><SlideLabel>Build Your Website</SlideLabel> <ArrowRight className="h-5 w-5" /></Link>
                              <WhatsAppLink message="Hi Scale Flow, I'd like to discuss a website for my business." className={btnLargeGhost + " w-full sm:w-auto"}>
                  <WhatsAppIcon className="h-5 w-5" /> <SlideLabel>Discuss on WhatsApp</SlideLabel>
                </WhatsAppLink>
                          </div>
          </div>
        </div>
        <div data-reveal="mask" aria-hidden className="mx-auto mt-16 h-px max-w-7xl bg-ivory/15" />
      </section>
    </>
  );
}
