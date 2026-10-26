import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileDown, Info, Sparkles } from "lucide-react";
import { z } from "zod";
import { byOrder, useDB } from "@/data/store";
import { Words } from "@/components/site/Words";
import { WhatsAppIcon } from "@/components/site/WhatsApp";
import { btnGhost, btnPrimary, btnWhatsApp } from "@/components/site/Magnetic";
import { buildQuotation, buildQuoteMessage, calculateQuote, featuresFor, formatINR, quotationFilename, whatsappLink, type QuoteDetails } from "@/lib/quote";
import { ensureGsap, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/build-your-website")({
  validateSearch: z.object({ ref: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Quotation Studio — Build Your Website | Scale Flow" },
      { name: "description", content: "Choose your website type, goals and functionality, see a transparent estimate and send your requirements to Scale Flow on WhatsApp." },
      { property: "og:title", content: "Quotation Studio — Scale Flow" },
      { property: "og:description", content: "Shape your website around your business goals and get a transparent estimate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Builder,
});

const STEPS = ["Website type", "Goals", "Functionality", "Estimate", "Send"];

/** Goals guide which features are highlighted as recommended. They never select anything automatically. */
const GOALS: { label: string; suggests: string[] }[] = [
  { label: "Generate qualified inquiries", suggests: ["forms", "whatsapp"] },
  { label: "Sell products online", suggests: ["ecommerce", "payments", "products"] },
  { label: "Showcase products or services", suggests: ["products", "animations"] },
  { label: "Build premium brand perception", suggests: ["animations", "three"] },
  { label: "Accept bookings", suggests: ["booking", "payments"] },
  { label: "Manage content independently", suggests: ["admin", "blog"] },
  { label: "Create an interactive experience", suggests: ["three", "animations"] },
];

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  business: z.string().trim().min(2, "Please enter your business name").max(100),
  phone: z.string().trim().regex(/^\+?[\d\s-]{8,16}$/, "Enter a valid WhatsApp number"),
});

function Builder() {
  const db = useDB();
  const { ref } = Route.useSearch();
  const refProject = db.projects.find((p) => p.slug === ref);
  const packages = useMemo(() => db.packages.filter((p) => p.enabled).sort(byOrder), [db.packages]);
  const [step, setStep] = useState(0);
  const [pkgId, setPkgId] = useState<string>();
  const [goals, setGoals] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [d, setD] = useState({ name: "", business: "", phone: "", extra: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "business" | "phone", string>>>({});
  const top = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const pkg = packages.find((p) => p.id === pkgId);
  const avail = featuresFor(pkg, db.features);
  const included = avail.filter((f) => f.included);
  const optional = avail.filter((f) => !f.included);
  const quote = calculateQuote(pkg, db.features, selected);
  const suggested = new Set(GOALS.filter((g) => goals.includes(g.label)).flatMap((g) => g.suggests));
  const details: QuoteDetails = {
    name: d.name,
    business: d.business,
    phone: d.phone,
    businessType: pkg?.name ?? "",
    description: d.extra,
    timeline: "",
    referenceUrl: "",
    goals,
    referenceProject: refProject ? [refProject.title, refProject.liveUrl].filter(Boolean).join(" — ") : undefined,
  };
  const message = buildQuoteMessage(pkg, quote, details);
  const waUrl = whatsappLink(db.settings.whatsapp, message);

  // The PDF module is preloaded on the last step so the download can start inside the click itself
  // (mobile browsers block downloads/new tabs that happen after an async wait).
  const pdfMod = useRef<typeof import("@/lib/quote-pdf") | null>(null);
  useEffect(() => {
    if (step === 4 && !pdfMod.current) void import("@/lib/quote-pdf").then((m) => (pdfMod.current = m));
  }, [step]);
  const [handoff, setHandoff] = useState<{ pdf: "ok" | "failed"; wa: "ok" | "blocked"; url: string | undefined; file: string; sig: string } | null>(null);
  const sig = message; // anything that changes the quotation changes the message
  const stale = handoff && handoff.sig !== sig;

  const makePdf = () => {
    const now = new Date();
    const file = quotationFilename(details, now);
    const mod = pdfMod.current;
    if (!mod) return { file, url: undefined };
    const blob = mod.renderQuotationPdf(buildQuotation(pkg, quote, details, now), {
      email: db.settings.email || "contact@joinscaleflow.com",
      phone: "+" + db.settings.whatsapp.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d+)$/, "$1 $2 $3"),
      office: db.settings.location,
    });
    return { file, url: URL.createObjectURL(blob) };
  };
  const download = (url: string, file: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const openWhatsApp = () => {
    const w = window.open(waUrl, "_blank");
    if (w) w.opener = null;
    return !!w;
  };
  const finish = () => {
    if (!validate()) return;
    if (handoff?.url) URL.revokeObjectURL(handoff.url);
    let pdf: "ok" | "failed" = "failed";
    let made: { file: string; url: string | undefined } = { file: quotationFilename(details, new Date()), url: undefined };
    try {
      made = makePdf();
      if (made.url) {
        download(made.url, made.file);
        pdf = "ok";
      }
    } catch (err) {
      console.error(err);
    }
    const wa = openWhatsApp() ? "ok" : "blocked";
    setHandoff({ pdf, wa, url: made.url, file: made.file, sig });
  };

  useIsoLayoutEffect(() => {
    const el = panel.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 24, clipPath: "inset(0% 0% 8% 0%)" }, { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll("[data-card]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.04, delay: 0.1 });
    }, el);
    return () => ctx.revert();
  }, [step]);

  const go = (n: number) => {
    if (n === 5) return;
    setStep(n);
    top.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };
  const validate = () => {
    const r = detailsSchema.safeParse(d);
    if (r.success) return setErrors({}), true;
    const e: typeof errors = {};
    r.error.issues.forEach((i) => (e[i.path[0] as keyof typeof errors] = i.message));
    setErrors(e);
    return false;
  };
  const canNext = step === 0 ? !!pkg : true;
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <main id="main" className="surface-light min-h-screen px-5 pb-32 pt-32 sm:px-8 md:px-12 md:pt-44">
      <div className="mx-auto max-w-7xl">
        <p className="label-mono mb-6 text-grey">Quotation studio</p>
        <Words as="h1" text="Shape The Website Your Business Needs." italicLast className="font-display block max-w-5xl text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95]" />
        <p className="mt-6 max-w-lg text-lg text-ivory/65">Start with what you want to achieve. We'll shape the right functionality around it.</p>
        {refProject && <p className="mt-6 inline-flex rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">Reference project: {refProject.title}</p>}

        <div ref={top} className="scroll-mt-28" />
        <ol className="mt-14 grid grid-cols-5 gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button disabled={i > step} onClick={() => go(i)} className="w-full text-left disabled:cursor-not-allowed" aria-current={i === step ? "step" : undefined}>
                <span className="block h-0.5 w-full overflow-hidden bg-ivory/12">
                  <span className={cn("block h-full bg-gold transition-transform duration-700 ease-out origin-left", i <= step ? "scale-x-100" : "scale-x-0")} />
                </span>
                <span className={cn("label-mono mt-3 hidden md:block", i === step ? "text-ivory" : "text-grey")}>{String(i + 1).padStart(2, "0")} {s}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="label-mono mt-3 text-ivory md:hidden">Step {step + 1} / 5 — {STEPS[step]}</p>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div ref={panel} key={step}>
              {step === 0 && (
                <fieldset>
                  <legend className="font-display mb-8 text-3xl md:text-4xl">What are you trying to build?</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {packages.map((p, i) => {
                      const on = p.id === pkgId;
                      return (
                        <button
                          key={p.id}
                          data-card
                          onClick={() => {
                            setPkgId(p.id);
                            setSelected([]);
                          }}
                          aria-pressed={on}
                          className={cn("select-card group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500 md:p-7", on ? "border-gold bg-card shadow-deep" : "border-ivory/12 bg-card/60 hover:-translate-y-1 hover:border-ivory/35 hover:shadow-deep")}
                        >
                          <span className="label-mono text-grey">{String(i + 1).padStart(2, "0")}</span>
                          <span className={cn("select-card absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-500", on ? "scale-100 border-gold bg-gold text-midnight" : "border-ivory/25")}>{on && <Check className="h-4 w-4" />}</span>
                          <span className="font-display mt-8 block text-2xl md:text-3xl">{p.name}</span>
                          <span className="mt-2 block text-sm text-ivory/60">{p.tagline}</span>
                          <span className="mt-6 block text-sm font-semibold text-gold">{p.price !== null ? `From ${formatINR(p.price)}` : "Custom quotation"}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset>
                  <legend className="font-display mb-3 text-3xl md:text-4xl">What should your website accomplish?</legend>
                  <p className="mb-8 text-sm text-ivory/55">Choose any that apply. We'll highlight the functionality that supports them — nothing is added for you.</p>
                  <div className="flex flex-wrap gap-3">
                    {GOALS.map((g) => {
                      const on = goals.includes(g.label);
                      return (
                        <button key={g.label} data-card aria-pressed={on} onClick={() => setGoals((s) => toggle(s, g.label))} className={cn("select-card flex items-center gap-2.5 rounded-full border px-5 py-3 text-sm transition-all duration-300", on ? "border-gold bg-gold text-midnight" : "border-ivory/15 bg-card/60 hover:border-ivory/40")}>
                          <span className={cn("select-card flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-midnight" : "border-ivory/30")}>{on && <Check className="h-3 w-3" />}</span>
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {step === 2 && pkg && (
                <div className="space-y-12">
                  {included.length > 0 && (
                    <section aria-labelledby="inc">
                      <h2 id="inc" className="label-mono mb-4 text-grey">Included in your {pkg.name}</h2>
                      <ul className="flex flex-wrap gap-2">
                        {included.map((f) => (
                          <li key={f.id} data-card className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-2 text-sm">
                            <Check className="h-3.5 w-3.5 text-gold" /> {f.name}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <fieldset>
                    <legend className="font-display mb-3 text-3xl md:text-4xl">Choose your functionality</legend>
                    <p className="mb-6 text-sm text-ivory/55">Everything here is optional and starts unselected. Included benefits above are never charged twice.</p>
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {optional.map((f) => {
                        const on = selected.includes(f.id);
                        const rec = suggested.has(f.id);
                        return (
                          <li key={f.id} data-card>
                            <button
                              aria-pressed={on}
                              onClick={() => setSelected((s) => toggle(s, f.id))}
                              className={cn("select-card group flex h-full w-full flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-500 md:p-6", on ? "border-gold bg-card shadow-deep" : "border-ivory/12 bg-card/50 hover:-translate-y-0.5 hover:border-ivory/35")}
                            >
                              <span className="flex items-start justify-between gap-3">
                                <span className={cn("select-card mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", on ? "border-gold bg-gold text-midnight" : "border-ivory/30")}>{on && <Check className="h-3.5 w-3.5" />}</span>
                                {rec && <span className="label-mono flex items-center gap-1 text-gold"><Sparkles className="h-3 w-3" /> Fits your goals</span>}
                              </span>
                              <span className="font-display block text-xl md:text-2xl">{f.name}</span>
                              <span className="block flex-1 text-sm leading-relaxed text-ivory/60">{f.description}</span>
                              <span className="text-sm font-semibold text-gold">{f.price !== null ? `+ ${formatINR(f.price)}` : "Custom quotation"}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                </div>
              )}

              {step === 3 && pkg && (
                <div>
                  <h2 className="font-display mb-8 text-3xl md:text-4xl">Your estimated investment</h2>
                  <div data-card className="rounded-3xl border border-ivory/10 bg-card p-6 shadow-deep md:p-10">
                    <Block title="Website package">
                      <Line k={pkg.name} v={pkg.price !== null ? formatINR(pkg.price) : "Custom quotation"} />
                    </Block>
                    <Block title="Included benefits">
                      {quote.included.length ? quote.included.map((f) => <Line key={f.id} k={f.name} v="Included" muted />) : <p className="text-sm text-ivory/50">—</p>}
                    </Block>
                    <Block title="Paid add-ons">
                      {quote.addons.length ? quote.addons.map((a) => <Line key={a.id} k={a.name} v={a.price !== null ? `+ ${formatINR(a.price)}` : "Custom quotation"} />) : <p className="text-sm text-ivory/50">None selected</p>}
                    </Block>
                    {goals.length > 0 && (
                      <Block title="Your goals">
                        <p className="text-sm text-ivory/70">{goals.join(" · ")}</p>
                      </Block>
                    )}
                    <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-ivory/10 pt-6">
                      <span className="label-mono text-grey">{quote.total !== null ? "Estimated total" : "Estimate"}</span>
                      {quote.total !== null ? <AnimatedPrice value={quote.total} /> : <p className="font-display text-4xl text-gold">Custom quotation</p>}
                    </div>
                    {quote.isCustom && <p className="mt-3 text-sm text-ivory/55">Some items are priced after we understand the scope. We'll confirm them with you.</p>}
                  </div>
                </div>
              )}

              {step === 4 && pkg && (
                <div>
                  <h2 className="font-display mb-8 text-3xl md:text-4xl">Send your requirements</h2>
                  <form className="grid gap-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
                    <Field label="Your name *" error={errors.name}><input className={inputCls} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" /></Field>
                    <Field label="Business name *" error={errors.business}><input className={inputCls} value={d.business} onChange={(e) => setD({ ...d, business: e.target.value })} autoComplete="organization" /></Field>
                    <Field label="Phone / WhatsApp number *" error={errors.phone}><input className={inputCls} value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+91 …" /></Field>
                    <div className="hidden sm:block" />
                    <Field label="Additional requirements (optional)" className="sm:col-span-2"><textarea rows={4} maxLength={1000} className={inputCls} value={d.extra} onChange={(e) => setD({ ...d, extra: e.target.value })} placeholder="Anything else we should know?" /></Field>
                  </form>
                  <p className="label-mono mb-3 mt-10 text-grey">Message preview</p>
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-ivory/10 bg-card p-5 font-mono text-xs text-ivory/75">{message}</pre>
                  <button
                    type="button"
                    onClick={finish}
                    className="btn btn-lg mt-6 w-full bg-whatsapp text-midnight hover:shadow-deep"
                  >
                    <FileDown className="h-5 w-5" /> Download Quotation &amp; Continue to WhatsApp
                  </button>
                  <p className="mt-3 text-center text-xs text-grey">Downloads your quotation PDF and opens WhatsApp with this message ready — nothing is sent until you press send.</p>

                  {handoff && (
                    <div role="status" className="mt-6 rounded-2xl border border-ivory/15 bg-card p-5 text-sm">
                      {stale && <p className="mb-3 text-coral">You changed your details after downloading. Download again so the PDF matches.</p>}
                      <p className="flex items-center gap-2">
                        {handoff.pdf === "ok" ? <Check className="h-4 w-4 text-gold" /> : <Info className="h-4 w-4 text-coral" />}
                        {handoff.pdf === "ok" ? <>Quotation download started: <span className="break-all font-mono text-xs">{handoff.file}</span></> : "Your browser didn't start the download."}
                      </p>
                      <p className="mt-2 flex items-center gap-2">
                        {handoff.wa === "ok" ? <Check className="h-4 w-4 text-gold" /> : <Info className="h-4 w-4 text-coral" />}
                        {handoff.wa === "ok" ? "WhatsApp opened in a new tab with your message." : "Your browser blocked WhatsApp from opening."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!stale && handoff.url) return download(handoff.url, handoff.file);
                            if (handoff.url) URL.revokeObjectURL(handoff.url);
                            const m = makePdf();
                            if (m.url) download(m.url, m.file);
                            setHandoff({ ...handoff, pdf: m.url ? "ok" : "failed", url: m.url, file: m.file, sig });
                          }}
                          className={btnGhost}
                        >
                          <FileDown className="h-4 w-4" /> Download Quotation Again
                        </button>
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => setHandoff({ ...handoff, wa: "ok" })} className={btnWhatsApp}>
                          <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-12 flex justify-between gap-3">
              <button onClick={() => go(step - 1)} disabled={step === 0} className={cn(btnGhost, "disabled:invisible")}><ArrowLeft className="h-4 w-4" /> Back</button>
              {step < 4 && (
                <button onClick={() => go(step + 1)} disabled={!canNext} className={cn(btnPrimary, "disabled:opacity-40")}>
                  {step === 2 ? "See my estimate" : step === 3 ? "Send requirements" : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4" aria-label="Live estimate">
            <div className="rounded-2xl border border-ivory/10 bg-card p-6 shadow-deep lg:sticky lg:top-28">
              <p className="label-mono text-grey">Live estimate</p>
              {pkg ? (
                <>
                  <ul className="mt-5 space-y-3 text-sm">
                    <li className="flex justify-between gap-4 font-semibold"><span>{pkg.name}</span><span className="font-mono">{pkg.price !== null ? formatINR(pkg.price) : "Custom"}</span></li>
                    {quote.included.map((f) => <li key={f.id} className="flex justify-between gap-4 text-ivory/50"><span>{f.name}</span><span className="font-mono text-xs">Included</span></li>)}
                    {quote.addons.map((a) => <li key={a.id} className="flex justify-between gap-4"><span>{a.name}</span><span className="font-mono text-ivory/70">{a.price !== null ? `+ ${formatINR(a.price)}` : "Custom"}</span></li>)}
                  </ul>
                  <div className="mt-6 border-t border-ivory/10 pt-5">
                    {quote.addonsTotal > 0 && <p className="flex justify-between text-sm text-ivory/60"><span>Add-ons</span><span className="font-mono">{formatINR(quote.addonsTotal)}</span></p>}
                    <p className="label-mono mt-4 text-grey">{quote.total !== null ? "Estimated total" : "Estimate"}</p>
                    {quote.total !== null ? <AnimatedPrice value={quote.total} /> : <p className="font-display mt-1 text-4xl text-gold">Custom quotation</p>}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-ivory/55">Choose a website type to start your estimate.</p>
              )}
              <p className="mt-6 flex gap-2 text-xs text-grey"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> This is an initial estimate. Final pricing is confirmed after discussing your project requirements.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inputCls = "w-full rounded-xl border border-ivory/15 bg-card px-4 py-3 text-base placeholder:text-grey/70 focus:border-gold focus:outline-none";

function Field({ label, error, children, className }: { label: string; error?: string | undefined; children: React.ReactElement; className?: string | undefined }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm text-ivory/75">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-sm text-coral">{error}</span>}
    </label>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ivory/10 py-5 first:pt-0">
      <p className="label-mono mb-3 text-grey">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Line({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <p className={cn("flex justify-between gap-4 text-sm", muted && "text-ivory/55")}>
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </p>
  );
}

function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const last = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = formatINR(value);
      last.current = value;
      return;
    }
    const { gsap } = ensureGsap();
    const o = { v: last.current };
    const t = gsap.to(o, { v: value, duration: 0.8, ease: "power3.out", onUpdate: () => (el.textContent = formatINR(Math.round(o.v))) });
    last.current = value;
    return () => {
      t.kill();
    };
  }, [value]);
  return <p ref={ref} aria-live="polite" className="font-display mt-1 text-5xl text-gold">{formatINR(value)}</p>;
}
