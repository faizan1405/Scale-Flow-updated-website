import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, MapPin, Play, Sparkles, Zap } from "lucide-react";
import { byOrder, useDB } from "@/data/store";
import { kindLabel } from "@/data/portfolio-utils";
import type { Project } from "@/data/types";
import { HeroStack } from "@/components/site/HeroStack";
import { SiteMock } from "@/components/site/SiteMock";
import { Words } from "@/components/site/Words";
import { SlideLabel, btnGhost, btnLarge, btnLargeGhost, btnPrimary } from "@/components/site/Magnetic";
import { VideoModal } from "@/components/site/VideoModal";
import { WhatsAppIcon, WhatsAppLink } from "@/components/site/WhatsApp";
import { useGsapEffect, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HOMEPAGE_FAQS, HOMEPAGE_FAQ_SCHEMA } from "@/lib/seo-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Best Website Maker in Delhi | Web Developer Delhi — Scale Flow" },
      {
        name: "description",
        content:
          "Scale Flow is the premier website maker and web developer in Delhi. We craft high-performance bespoke websites, 3D interactive experiences, and e-commerce stores for ambitious startups and businesses. Transparent pricing in INR. Based in Connaught Place, New Delhi.",
      },
      {
        name: "keywords",
        content:
          "website maker, website developer in delhi, best website maker in delhi, website maker in delhi, web designers in delhi, custom react website development delhi, web development company connaught place, website makers india",
      },
      { property: "og:title", content: "Best Website Maker in Delhi | Web Developer Delhi — Scale Flow" },
      {
        property: "og:description",
        content:
          "Scale Flow is the premier website maker and web developer in Delhi. High-performance bespoke websites, 3D interactive experiences & online stores for startups & businesses. Instant pricing in INR.",
      },
      { property: "og:url", content: "https://www.joinscaleflow.in/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.joinscaleflow.in/brand/scaleflow-social-card.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Best Website Maker in Delhi | Web Developer Delhi — Scale Flow" },
      {
        name: "twitter:description",
        content:
          "Bespoke websites & 3D digital experiences for ambitious startups & businesses. Based in Connaught Place, New Delhi. Instant estimates on WhatsApp.",
      },
      { name: "twitter:image", content: "https://www.joinscaleflow.in/brand/scaleflow-social-card.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.joinscaleflow.in/" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_FAQ_SCHEMA) }}
      />
      <Hero projects={featured.length ? featured : projects} />
      <Intro />
      <SelectedWork projects={featured.length ? featured : projects.slice(0, 3)} />
      <Capabilities projects={projects} />
      <DelhiAuthority />
      <Showroom projects={projects} showreel={db.settings.showreelUrl} />
      <FaqSection />
      <FinalCta />
    </main>
  );
}

/* 01 — HERO */
function Hero({ projects }: { projects: Project[] }) {
  const { settings } = useDB();
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} className="surface-light relative overflow-hidden px-6 pb-16 pt-28 md:px-12 md:pb-24 md:pt-36" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p data-hero-label className="label-mono mb-8 flex items-center gap-3 text-gold">
            <img src="/brand/scaleflow-mark-light.png" alt="" aria-hidden loading="lazy" decoding="async" className="h-5 w-auto object-contain aspect-[5/3]" width="30" height="18" />
            <span className="h-px w-6 bg-gold/50" /> Scale Flow — Digital Showroom
          </p>
          <Words id="hero-title" as="h1" text={settings.heroHeadline} italicLast className="font-display block text-[clamp(2.8rem,6.2vw,6rem)] leading-[0.98]" />
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
  useGsapEffect(({ gsap }) => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-scrub-word]", { opacity: 0.65 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  const text = "Not Just Websites. Digital Experiences.";
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
      <p data-reveal className="label-mono mb-6 text-grey">(01) — Intent</p>
      <h2 className="font-display text-[clamp(2.6rem,7vw,7rem)] leading-[0.92]">
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {text.split(" ").map((w, i) => (
            <span key={i} data-scrub-word className={cn("inline-block pr-[0.25em]", i >= 3 && "text-gold")}>
              {w}
            </span>
          ))}
        </span>
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
  useEffect(() => {
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
    <section ref={ref} className="cv-auto relative px-6 pb-32 md:px-12" aria-labelledby="selected-title">
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
            <Words id="selected-title" as="h2" text="Selected Work" className="font-display block text-6xl md:text-8xl" />
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
                  <p data-reveal className="font-mono text-6xl text-ivory/60 md:text-8xl">{String(i + 1).padStart(2, "0")}</p>
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
  { name: "3D Interactive", cat: "3d-interactive", ids: ["pf-bmw", "pf-velora", "pf-noctra", "pf-ironforge"] },
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
  const first = useRef(true);
  const items = CAPS.map((c) => ({ ...c, list: c.ids.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p) })).filter((c) => c.list.length);
  const cur = items[Math.min(active, items.length - 1)];
  const p = cur?.list[0];

  useGsapEffect(({ gsap }) => {
    if (first.current) return void (first.current = false);
    const el = stage.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-cap-shot]", { clipPath: "inset(0% 0% 100% 0%)", scale: 1.08 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.out" });
      gsap.fromTo("[data-cap-text] > *", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.15 });
    }, el);
    return () => ctx.revert();
  }, [active]);

  if (!cur || !p) return null;
  return (
    <section ref={ref} className="cv-auto surface-light section-pad" aria-labelledby="cap-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
          <div>
            <p data-reveal className="label-mono mb-4 text-grey">(03) — Capabilities</p>
            <Words id="cap-title" as="h2" text="What We Create" className="font-display block text-5xl md:text-7xl" />
          </div>
          <p data-reveal className="max-w-sm text-ivory/60">Hover or tap a capability to see a live website from our portfolio built for it.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col lg:col-span-5" role="tablist" aria-label="Capabilities">
            {items.map((c, i) => {
              const on = c === cur;
              return (
                <div key={c.name} className="border-b border-ivory/10">
                  <button
                    id={`tab-cap-${i}`}
                    role="tab"
                    aria-selected={on}
                    aria-controls="cap-stage-panel"
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className="group relative flex w-full items-baseline gap-5 py-5 text-left md:py-6"
                  >
                    <span className={cn("label-mono w-8 transition-colors", on ? "text-gold" : "text-grey")}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-display flex-1 text-3xl transition-all duration-500 md:text-[2.6rem]", on ? "translate-x-2 text-ivory" : "text-ivory/65 group-hover:text-ivory")}>{c.name}</span>
                    <ArrowRight className={cn("h-5 w-5 transition-all duration-500", on ? "text-gold opacity-100" : "-translate-x-2 opacity-0")} />
                    <span aria-hidden className={cn("absolute -bottom-px left-0 h-px bg-gold transition-[width] duration-700 ease-out", on ? "w-full" : "w-0")} />
                  </button>
                </div>
              );
            })}
          </div>
          <div ref={stage} id="cap-stage-panel" className="min-w-0 lg:col-span-7 lg:sticky lg:top-28 lg:self-start" role="tabpanel" aria-labelledby={`tab-cap-${active}`} aria-live="polite">
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
                {cur.list.slice(1).map((item) => (
                  <Link key={item.id} to="/work/$slug" params={{ slug: item.slug }} className="link-underline text-sm text-ivory/60">Also: {item.title}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 04.5 — DELHI LOCAL AUTHORITY & SEO */
function DelhiAuthority() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="cv-auto relative px-6 py-24 md:px-12 md:py-32" aria-labelledby="delhi-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p data-reveal className="label-mono mb-4 flex items-center gap-2 text-gold">
              <MapPin className="h-4 w-4" /> Connaught Place, New Delhi · Serving Startups Across India
            </p>
            <Words
              id="delhi-title"
              as="h2"
              text="Delhi's Premier Website Maker & Web Developer."
              italicLast
              className="font-display block text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.02]"
            />
            <p data-reveal className="mt-6 text-base leading-relaxed text-ivory/70 md:text-lg">
              Ambitious brands don't settle for bloated WordPress templates or sluggish generic site builders.
              Scale Flow is an independent digital studio in New Delhi engineering bespoke, high-performance web
              applications with custom React code, buttery 60fps GSAP motion, and responsive Core Web Vitals optimization.
            </p>
            <div data-reveal className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ivory/10 bg-card/60 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-gold">
                  <Zap className="h-5 w-5" />
                  <span className="font-display text-xl text-ivory">Performance-First Code</span>
                </div>
                <p className="mt-2 text-sm text-ivory/60">
                  Engineered with semantic HTML, optimized WebP assets, and clean Core Web Vitals for fast mobile and desktop loading.
                </p>
              </div>
              <div className="rounded-xl border border-ivory/10 bg-card/60 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-gold">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-display text-xl text-ivory">3D & Interactive</span>
                </div>
                <p className="mt-2 text-sm text-ivory/60">
                  WebGL 3D product showrooms and fluid kinetic typography that elevate brand perception instantly.
                </p>
              </div>
            </div>
            <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/build-your-website" className={btnPrimary}>
                <SlideLabel>Calculate Website Cost</SlideLabel> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className={btnGhost}>
                <SlideLabel>Visit Delhi Studio</SlideLabel> <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div data-reveal className="rounded-2xl border border-ivory/10 bg-card p-6 md:p-8 shadow-deep">
              <span className="label-mono text-gold">Why Founders & Businesses Choose Us</span>
              <ul className="mt-6 space-y-5 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="text-ivory">Transparent Pricing in INR:</strong> Basic, Business Pro, or Portfolio website from ₹15,000; E-commerce from ₹30,000; and 3D websites from ₹40,000. Custom code & custom websites available via WhatsApp.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="text-ivory">Direct WhatsApp Access:</strong> Message lead engineers directly. Real-time feedback, same-day adjustments, zero bureaucracy.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="text-ivory">Local Delhi Presence & Global Reach:</strong> Based at Regal Building, Connaught Place, New Delhi. Available for in-person meetings in Delhi NCR.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="text-ivory">SEO & Conversion Engineered:</strong> Schema.org structured data, semantic HTML5, and automated GEO compliance for ChatGPT and Google Gemini discovery.
                  </div>
                </li>
              </ul>
              <div className="mt-8 border-t border-ivory/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-grey">
                <span>Serving Connaught Place · South Delhi · Gurugram · Noida · Pan-India</span>
                <span className="font-mono text-gold">Pin: 110001</span>
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
  const shots = projects.filter((p) => p.coverImage).slice(0, 8);
  if (shots.length < 4) return null;
  const half = Math.ceil(shots.length / 2);
  const rows = [shots.slice(0, half), shots.slice(half)];
  return (
    <section ref={ref} className="cv-auto relative overflow-hidden py-28 md:py-40" aria-labelledby="motion-title">
      <div className="mx-auto mb-14 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6 md:px-12">
        <div>
          <p data-reveal className="label-mono mb-4 text-grey">(04) — The showroom in motion</p>
          <Words id="motion-title" as="h2" text="Every Frame Is Live Work." italicLast className="font-display block max-w-3xl text-5xl md:text-7xl" />
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

/* 05.5 — FREQUENTLY ASKED QUESTIONS (GEO & SEO) */
function FaqSection() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="cv-auto surface-light px-6 py-24 md:px-12 md:py-32" aria-labelledby="faq-title">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p data-reveal className="label-mono mb-4 text-gold">(05) — Clarity & Answers</p>
          <Words
            id="faq-title"
            as="h2"
            text="Frequently Asked Questions."
            italicLast
            className="font-display block text-4xl sm:text-5xl md:text-6xl"
          />
          <p data-reveal className="mt-4 text-base text-ivory/65 md:text-lg">
            Everything you need to know about working with Delhi's top custom website maker and web developer.
          </p>
        </div>

        <div data-reveal className="mt-14 space-y-4">
          {HOMEPAGE_FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-ivory/10 bg-card p-6 transition-colors duration-300 hover:border-gold/30 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-display text-xl text-ivory transition-colors group-open:text-gold md:text-2xl">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-grey transition-transform duration-300 group-open:rotate-180 group-open:text-gold" />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-ivory/70 md:text-base border-t border-ivory/10 pt-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div data-reveal className="mt-12 rounded-2xl border border-gold/20 bg-card/60 p-6 text-center">
          <p className="text-sm text-ivory/70 md:text-base">
            Have a unique requirement or want a personalized proposal for your project?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <WhatsAppLink message="Hi Scale Flow, I have a question about website development." className={btnPrimary}>
              <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
            </WhatsAppLink>
            <Link to="/build-your-website" className={btnGhost}>
              Calculate Instant Price <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* 06 — MOVING BAND + FINAL CTA */
function FinalCta() {
  const ref = useReveal<HTMLElement>();
  return (
    <>
      <section aria-hidden="true" role="presentation" className="cv-auto overflow-hidden border-y border-ivory/10 py-6 md:py-8 select-none">
        <div className="space-y-1 whitespace-nowrap" aria-hidden="true">
          <div aria-hidden="true" className="font-display block w-max text-[clamp(3rem,8.5vw,8.5rem)] leading-[1.05] text-ivory/50 [animation:marquee_70s_linear_infinite]">Scale Flow · Experience it · Scale Flow · Experience it · </div>
          <div aria-hidden="true" className="font-display block w-max text-[clamp(3rem,8.5vw,8.5rem)] leading-[1.05] text-ivory/50 [animation:marquee-rev_90s_linear_infinite]">Scale Flow · Experience it · Scale Flow · Experience it · </div>
        </div>
      </section>
      <section ref={ref} className="cv-auto surface-light relative overflow-hidden px-6 py-24 md:px-12 md:py-32" aria-labelledby="cta-title">
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p data-reveal className="label-mono mb-6 flex items-center gap-3 text-gold"><span className="h-px w-10 bg-gold" /> Start a project</p>
            <Words id="cta-title" as="h2" text="Let's Build Something Exceptional." italicLast className="font-display block text-[clamp(2.75rem,6.4vw,6.25rem)] leading-[0.95]" />
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
