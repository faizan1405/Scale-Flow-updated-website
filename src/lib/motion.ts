import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-triggered reveal for every [data-reveal] descendant.
 * Content is fully visible in SSR HTML; animation only starts on the client.
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []): RefObject<T | null> {
  const ref = useRef<T>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
