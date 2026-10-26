import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/types";
import { SiteMock } from "./SiteMock";
import { ensureGsap, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Editorial hero composition: layered panels of real portfolio screenshots.
 * Intro: main panel unmasks, back panel and phone emerge in a stagger, then cursor depth becomes active.
 * Picking a project from the index swaps the panels with a masked transition.
 */
export function HeroStack({ projects }: { projects: Project[] }) {
  const list = projects.filter((p) => p.coverImage).slice(0, 4);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const n = list.length;
  const main = list[active % Math.max(n, 1)];
  const back = list[(active + 1) % Math.max(n, 1)];
  const phone = list.find((p, i) => i !== active % n && p.mobileScreenshots[0]) ?? main;

  // Intro sequence + cursor depth + gentle scroll hand-off.
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.35 });
      tl.fromTo("[data-panel=main]", { clipPath: "inset(100% 0% 0% 0% round 18px)", y: 40 }, { clipPath: "inset(0% 0% 0% 0% round 18px)", y: 0, duration: 1.6 })
        .fromTo("[data-panel=main] img", { scale: 1.18 }, { scale: 1, duration: 2 }, "<")
        .fromTo("[data-panel=back]", { opacity: 0, x: 60, y: -20 }, { opacity: 1, x: 0, y: 0, duration: 1.4 }, "-=1.1")
        .fromTo("[data-panel=phone]", { opacity: 0, y: 80, rotate: 6 }, { opacity: 1, y: 0, rotate: 0, duration: 1.4 }, "-=1.15");

      // scroll: layers drift apart slightly and the composition settles toward the next section
      layers.forEach((l) => {
        const d = Number(l.dataset["depth"]);
        gsap.to(l, { yPercent: -d * 14, ease: "none", scrollTrigger: { trigger: el, start: "top 20%", end: "bottom top", scrub: true } });
      });
    }, el);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const movers = layers.map((l) => ({ d: Number(l.dataset["depth"]), x: gsap.quickTo(l, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(l, "y", { duration: 1.2, ease: "power3.out" }) }));
    const tilt = { rx: gsap.quickTo(el, "rotateX", { duration: 1.4, ease: "power3.out" }), ry: gsap.quickTo(el, "rotateY", { duration: 1.4, ease: "power3.out" }) };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      movers.forEach((m) => (m.x(px * m.d * 22), m.y(py * m.d * 16)));
      tilt.ry(px * 5);
      tilt.rx(-py * 4);
    };
    const onLeave = () => {
      movers.forEach((m) => (m.x(0), m.y(0)));
      tilt.rx(0);
      tilt.ry(0);
    };
    const host = el.closest("section") ?? el;
    if (fine) {
      host.addEventListener("pointermove", onMove as EventListener);
      host.addEventListener("pointerleave", onLeave);
    }
    return () => {
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, [n]);

  // Project swap transition (skips the first render, which the intro handles).
  useIsoLayoutEffect(() => {
    if (first.current) return void (first.current = false);
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-panel=main]", { clipPath: "inset(0% 0% 0% 100% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.1, ease: "expo.inOut" });
      gsap.fromTo("[data-panel=main] img", { scale: 1.1 }, { scale: 1, duration: 1.4, ease: "expo.out" });
      gsap.fromTo("[data-panel=back]", { opacity: 0.2, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "expo.out", delay: 0.15 });
      gsap.fromTo("[data-panel=phone]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.25 });
    }, el);
    return () => ctx.revert();
  }, [active]);

  if (!main || !back) return null;
  const glow = main.ambient ?? main.palette.accent;

  return (
    <div className="relative" style={{ perspective: "1400px" }}>
      <div ref={root} className="relative mx-auto aspect-[1/1] w-full max-w-[640px] sm:aspect-[6/5] [transform-style:preserve-3d]">
        {/* ambient light picks up the active project's colour */}
        <div aria-hidden className="pointer-events-none absolute inset-[8%] rounded-full opacity-40 blur-[90px] transition-[background-color] duration-1000" style={{ backgroundColor: glow }} />

        {/* back panel */}
        <div data-depth="0.5" className="absolute right-0 top-[2%] w-[60%]">
          <button data-panel="back" type="button" onClick={() => setActive((a) => (a + 1) % n)} aria-label={`Show ${back.title}`} className="block w-full overflow-hidden rounded-[14px] opacity-90 shadow-deep ring-1 ring-ivory/10 transition-[filter] duration-500 [filter:saturate(0.85)] hover:[filter:saturate(1)]">
            <SiteMock project={back} chrome={false} />
          </button>
        </div>

        {/* main panel */}
        <div data-depth="1" className="absolute left-0 top-[20%] w-[84%] sm:top-[22%]">
          <Link to="/work/$slug" params={{ slug: main.slug }} data-panel="main" className="group block overflow-hidden rounded-[18px] shadow-deep ring-1 ring-ivory/10" aria-label={`View ${main.title}`}>
            <SiteMock project={main} />
          </Link>
          <p className="mt-4 flex items-center gap-4 pr-[22%] text-sm">
            <span className="label-mono text-gold">{String((active % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
            <Link to="/work/$slug" params={{ slug: main.slug }} className="link-underline inline-flex min-w-0 items-center gap-1.5 truncate font-medium">
              {main.title} <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </p>
        </div>

        {/* phone panel */}
        {phone?.mobileScreenshots[0] && (
          <div data-depth="1.8" className="absolute bottom-[4%] right-[2%] w-[24%] sm:bottom-[6%]">
            <div data-panel="phone" className="overflow-hidden rounded-[18px] border-[3px] border-midnight bg-midnight shadow-deep ring-1 ring-ivory/10 surface-dark">
              <SiteMock project={phone} variant="mobile" />
            </div>
          </div>
        )}
      </div>

      {/* project index */}
      {n > 1 && (
        <div className="relative mt-6 flex flex-wrap justify-center gap-2 sm:justify-start" role="tablist" aria-label="Featured projects">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active % n}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-300",
                i === active % n ? "border-ivory bg-ivory text-midnight" : "border-ivory/15 text-ivory/60 hover:border-ivory/40 hover:text-ivory",
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
