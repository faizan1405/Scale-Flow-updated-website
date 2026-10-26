import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useDB } from "@/data/store";
import { Words } from "@/components/site/Words";
import { btnGhost } from "@/components/site/Magnetic";
import { WhatsAppIcon } from "@/components/site/WhatsApp";
import { whatsappLink } from "@/lib/quote";
import { useRef, useState } from "react";
import { ensureGsap, prefersReducedMotion, useIsoLayoutEffect, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Contact — Scale Flow" },
      { name: "description", content: "Scale Flow is a web development studio crafting premium websites and digital experiences. Start a conversation on WhatsApp." },
      { property: "og:title", content: "About & Contact — Scale Flow" },
      { property: "og:description", content: "Meet Scale Flow and start a conversation about your website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const PROCESS = [
  { t: "Conversation", d: "We start by listening: your business, your customers and what a good result looks like for you.", out: "A clear brief and an estimate" },
  { t: "Direction", d: "We agree the structure of the site and its look before building, so there are no surprises later.", out: "Page plan and visual direction" },
  { t: "Craft", d: "Design and development happen together. You review real pages at each milestone and tell us what to change.", out: "Working pages to review" },
  { t: "Launch", d: "We test on phones, tablets and computers, put the site live and stay available as your business grows.", out: "A live website and ongoing support" },
];

/** Vertical journey: a gold line draws as you scroll and each stage lights up when it reaches the centre. */
function ProcessJourney() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset["step"]))),
      { rootMargin: "-48% 0px -48% 0px" },
    );
    el.querySelectorAll("[data-step]").forEach((n) => io.observe(n));
    if (prefersReducedMotion()) return () => io.disconnect();
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: true } });
      el.querySelectorAll<HTMLElement>("[data-step]").forEach((n) => {
        gsap.fromTo(n.querySelectorAll("[data-step-in]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: n, start: "top 80%", once: true } });
      });
    }, el);
    return () => (io.disconnect(), ctx.revert());
  }, []);
  return (
    <ol ref={ref} className="relative">
      <span aria-hidden className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-ivory/15 md:left-[calc(25%-0.5px)]" />
      <span aria-hidden data-line className="absolute bottom-0 left-[1.15rem] top-0 w-px origin-top bg-gold md:left-[calc(25%-0.5px)]" />
      {PROCESS.map((p, i) => {
        const on = i <= active;
        return (
          <li key={p.t} data-step={i} className="relative grid gap-4 pb-16 pl-12 last:pb-0 md:grid-cols-4 md:gap-10 md:pb-24 md:pl-0">
            <span
              aria-hidden
              className={cn(
                "absolute left-[1.15rem] top-3 h-3 w-3 -translate-x-1/2 rounded-full border transition-all duration-700 md:left-1/4",
                on ? "scale-125 border-gold bg-gold shadow-[0_0_0_6px_color-mix(in_oklab,var(--gold)_18%,transparent)]" : "border-ivory/30 bg-midnight",
              )}
            />
            <p data-step-in className={cn("font-display text-[clamp(4rem,9vw,8rem)] leading-[0.8] transition-colors duration-700 md:pr-10 md:text-right", on ? "text-gold" : "text-outline text-ivory/30")}>
              {String(i + 1).padStart(2, "0")}
            </p>
            <div className="md:col-span-3 md:pl-12">
              <h3 data-step-in className="font-display text-4xl md:text-5xl">{p.t}</h3>
              <p data-step-in className="mt-4 max-w-xl text-lg leading-relaxed text-ivory/70">{p.d}</p>
              <p data-step-in className={cn("mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors duration-700", on ? "border-gold/50 bg-card text-ivory" : "border-ivory/10 text-ivory/50")}>
                <span className="label-mono text-gold">You get</span> {p.out}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function About() {
  const { settings } = useDB();
  const ref = useReveal<HTMLElement>();
  const digits = settings.whatsapp.replace(/\D/g, "");
  const display = "+" + digits.replace(/^(\d{2})(\d+)$/, "$1 $2");
  const email = settings.email || "contact@joinscaleflow.com";
  const cards = [
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}`, cta: "Write to us", external: false, long: false },
    { icon: Phone, label: "Call us", value: display, href: `tel:+${digits}`, cta: "Call now", external: false, long: false },
    { icon: WhatsAppIcon, label: "WhatsApp", value: display, href: whatsappLink(settings.whatsapp, "Hi Scale Flow, I'd like to enquire about a website."), cta: "Start a chat", external: true, long: false },
    { icon: MapPin, label: "Visit our office", value: settings.location, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.location)}`, cta: "Open in Google Maps", external: true, long: true },
  ];
  return (
    <main id="main" ref={ref} className="surface-light px-5 pb-32 pt-32 sm:px-8 md:px-12 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <p data-reveal className="label-mono mb-6 text-grey">About Scale Flow</p>
        <Words as="h1" text="A studio for websites worth exploring." italicLast className="font-display block max-w-5xl text-[clamp(3rem,8vw,7.5rem)] leading-[0.92]" />
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <p data-reveal className="text-xl text-ivory/75 md:col-span-6">
            Scale Flow designs and builds websites, stores and web applications. We believe a website should be experienced, not just viewed — precise, fast, and made for the people who use it.
          </p>
          <p data-reveal className="text-ivory/60 md:col-span-5 md:col-start-8">
            Every project combines considered design, solid engineering and a clear path for your visitors to get in touch. This showroom is itself an example of the craft we bring to client work.
          </p>
        </div>

        <section className="mt-28 md:mt-36" aria-label="How we work">
          <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p data-reveal className="label-mono mb-4 text-grey">How we work</p>
              <Words as="h2" text="Conversation to launch, in four steps." italicLast className="font-display block text-5xl md:text-6xl" />
            </div>
            <p data-reveal className="text-ivory/65 md:col-span-4 md:col-start-9">You always know where your project is and what comes next.</p>
          </div>
          <ProcessJourney />
        </section>

        <section className="mt-32" aria-labelledby="contact">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <Words as="h2" text="Let's talk." className="font-display block text-5xl md:text-6xl" />
            <p data-reveal className="max-w-sm text-ivory/60">Reach us whichever way suits you. WhatsApp is usually fastest.</p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {cards.map((c, i) => (
              <li key={c.label} data-reveal data-delay={i * 0.1}>
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group flex h-full flex-col justify-between gap-12 rounded-3xl border border-ivory/10 bg-card p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-deep md:p-9"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/15 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-midnight">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-ivory/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
                  </span>
                  <span>
                    <span className="label-mono block text-grey">{c.label}</span>
                    <span className={c.long ? "mt-3 block text-base leading-relaxed" : "font-display mt-3 block break-words text-2xl md:text-3xl"}>{c.value}</span>
                    <span className="mt-5 block text-sm font-semibold text-gold">{c.cta} →</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link data-reveal to="/build-your-website" className={btnGhost + " mt-10"}>Or build a website estimate first</Link>
        </section>
      </div>
    </main>
  );
}
