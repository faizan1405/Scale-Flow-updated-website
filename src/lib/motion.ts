import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type GsapBundle = {
  gsap: typeof import("gsap").default;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let cached: GsapBundle | null = null;
let pending: Promise<GsapBundle> | null = null;
let readyPromise: Promise<void> | null = null;

function waitForInteractionOrIdle(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (cached) return Promise.resolve();
  if (!readyPromise) {
    readyPromise = new Promise<void>((resolve) => {
      const events = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
      const done = () => {
        for (const ev of events) {
          window.removeEventListener(ev, done);
        }
        clearTimeout(timer);
        document.documentElement.classList.add("is-interactive");
        resolve();
      };
      for (const ev of events) {
        window.addEventListener(ev, done, { once: true, passive: true });
      }
      const timer = setTimeout(done, 4500);
    });
  }
  return readyPromise;
}

export function loadGsap(): Promise<GsapBundle> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
      const gsap = g.default;
      const ScrollTrigger = st.ScrollTrigger;
      if (typeof window !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });
      }
      cached = { gsap, ScrollTrigger };
      return cached;
    });
  }
  return pending;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useGsapEffect(
  cb: (bundle: GsapBundle) => (() => void) | void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | void;

    const run = () => {
      void loadGsap().then((bundle) => {
        if (cancelled) return;
        cleanup = cb(bundle);
      });
    };

    if (cached) {
      run();
    } else {
      void waitForInteractionOrIdle().then(() => {
        if (!cancelled) run();
      });
    }

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Scroll-triggered reveal for every [data-reveal] descendant.
 * Content is fully visible in SSR HTML; animation only starts on the client.
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []): RefObject<T | null> {
  const ref = useRef<T>(null);
  useGsapEffect(({ gsap }) => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        const rect = node.getBoundingClientRect();
        // Skip hiding elements that are already in the initial viewport
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;
        const kind = node.dataset["reveal"];
        const from: gsap.TweenVars =
          kind === "mask"
            ? { clipPath: "inset(100% 0% 0% 0%)" }
            : kind === "scale"
              ? { scale: 1.15, clipPath: "inset(12% 10% 12% 10%)" }
              : kind === "tilt"
                ? { rotateY: -18, rotateX: 6, y: 60, opacity: 0 }
                : kind === "words"
                  ? {}
                  : { y: 40, opacity: 0 };
        const to: gsap.TweenVars =
          kind === "mask"
            ? { clipPath: "inset(0% 0% 0% 0%)" }
            : kind === "scale"
              ? { scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
              : kind === "tilt"
                ? { rotateY: 0, rotateX: 0, y: 0, opacity: 1 }
                : { y: 0, opacity: 1 };
        const trigger = { trigger: node, start: "top 85%", once: true };
        if (kind === "words") {
          gsap.fromTo(node.querySelectorAll("[data-word]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: trigger });
        } else {
          gsap.fromTo(node, from, { ...to, duration: kind === "fade" || !kind ? 1 : 1.4, ease: "expo.out", delay: Number(node.dataset["delay"] ?? 0), scrollTrigger: trigger });
        }
      });
    }, el);
    return () => ctx.revert();
  }, deps);
  return ref;
}
