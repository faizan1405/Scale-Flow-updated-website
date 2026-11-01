import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsAppIcon, WhatsAppLink } from "./WhatsApp";

const links = [
  { to: "/work", label: "Work", n: "01" },
  { to: "/videos", label: "Videos", n: "02" },
  { to: "/build-your-website", label: "Build Your Website", n: "03" },
  { to: "/about", label: "About", n: "04" },
] as const;

export interface LogoProps {
  className?: string;
  variant?: "mark" | "horizontal" | "full";
  theme?: "dark" | "light";
  showTagline?: boolean;
}

export function Logo({ className, variant = "mark", theme = "dark", showTagline = false }: LogoProps) {
  const markSrc = theme === "light" ? "/brand/scaleflow-mark-light.png" : "/brand/scaleflow-mark-dark.png";
  const fullSrc = theme === "light" ? "/brand/scaleflow-logo-light.png" : "/brand/scaleflow-logo-dark.png";
  const horizontalSrc = theme === "light" ? "/brand/scaleflow-horizontal-full-light.png" : "/brand/scaleflow-horizontal-full-dark.png";

  if (variant === "full") {
    return (
      <Link to="/" className={cn("group inline-flex flex-col items-start gap-2", className)} aria-label="Scale Flow home">
        <img
          src={fullSrc}
          alt="Scale Flow — Strategic Growth Partner"
          className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:h-16"
          width="210"
          height="160"
        />
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link to="/" className={cn("group inline-flex items-center", className)} aria-label="Scale Flow home">
        <img
          src={horizontalSrc}
          alt="Scale Flow — Strategic Growth Partner"
          className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:h-11"
          width="240"
          height="55"
        />
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5 text-ivory transition-opacity hover:opacity-90", className)}
      aria-label="Scale Flow home"
    >
      <img
        src={markSrc}
        alt=""
        aria-hidden
        className="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-8"
        width="48"
        height="29"
      />
      <div className="flex flex-col">
        <span className="font-display text-2xl leading-none">
          Scale <span className="text-gold">Flow</span>
        </span>
        {showTagline && (
          <span className="label-mono mt-1 text-[8px] tracking-[0.24em] text-gold/85">
            STRATEGIC GROWTH PARTNER
          </span>
        )}
      </div>
    </Link>
  );
}

export function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Adapt to whatever section sits under the bar: ivory on light sections, charcoal on dark ones.
    const on = () => {
      setCompact(window.scrollY > 40);
      const els = document.elementsFromPoint(window.innerWidth / 2, 44);
      const under = els.find((e) => !e.closest("header"));
      const surf = under?.closest('[class*="surface-light"],[class*="surface-cream"],[class*="surface-dark"],footer,main');
      setLight(!!surf && /surface-(light|cream)/.test(surf.className));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setOpen(false);
    const t = window.setTimeout(() => window.dispatchEvent(new Event("scroll")), 60);
    return () => window.clearTimeout(t);
  }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] md:px-8">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 text-ivory backdrop-blur-md transition-[background-color,border-color,color,padding,box-shadow] duration-700 md:px-6",
          light && !open ? "surface-light !bg-[color-mix(in_oklab,var(--midnight)_82%,transparent)] border-ivory/10 shadow-[0_10px_30px_-18px_oklch(0.2_0.02_260/35%)]" : "border-ivory/10 bg-navy/85",
          compact ? "py-2.5" : "py-3.5",
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="link-underline pb-1 text-sm text-ivory/75 transition-colors hover:text-ivory" activeProps={{ className: "!text-gold" }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <WhatsAppLink message="Hi Scale Flow, I want a website developed." className="btn btn-primary hidden !min-h-0 px-4 py-2 text-sm sm:inline-flex">
            <WhatsAppIcon className="h-4 w-4" /> Let's talk
          </WhatsAppLink>
          <button onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 -z-10 flex flex-col justify-between bg-midnight px-6 pb-10 pt-28 transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] lg:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-2">
          {links.map((l, i) => (
            <li key={l.to} className={cn("transition-all duration-700", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")} style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}>
              <Link to={l.to} tabIndex={open ? 0 : -1} className="flex items-baseline gap-4 border-b border-ivory/10 py-4">
                <span className="label-mono text-gold">{l.n}</span>
                <span className="font-display text-5xl">{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-t border-ivory/10 pt-4">
            <img src="/brand/scaleflow-mark-dark.png" alt="" className="h-7 w-auto object-contain" width="46" height="28" />
            <div>
              <p className="font-display text-lg text-ivory">Scale <span className="text-gold">Flow</span></p>
              <p className="label-mono text-[8px] tracking-[0.24em] text-gold/80">STRATEGIC GROWTH PARTNER</p>
            </div>
          </div>
          <WhatsAppLink message="Hi Scale Flow, I want a website developed." className="btn btn-whatsapp w-full py-4 bg-whatsapp text-midnight">
            <WhatsAppIcon className="h-5 w-5" /> Start on WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </header>
  );
}
