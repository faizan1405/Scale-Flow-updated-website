import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useDB } from "@/data/store";
import { useReveal } from "@/lib/motion";
import { Logo } from "./Nav";
import { WhatsAppIcon, WhatsAppLink } from "./WhatsApp";

const NAV = [
  { to: "/work", label: "Our Work" },
  { to: "/build-your-website", label: "Build Your Website" },
  { to: "/videos", label: "Motion Vault" },
  { to: "/about", label: "About" },
] as const;

export function Footer() {
  const { settings } = useDB();
  const ref = useReveal<HTMLElement>();
  const digits = settings.whatsapp.replace(/\D/g, "");
  const display = "+" + digits.replace(/^(\d{2})(\d{5})(\d+)$/, "$1 $2 $3");
  const email = settings.email || "contact@joinscaleflow.com";
  return (
    <footer ref={ref} className="relative overflow-hidden bg-navy px-6 pb-28 pt-20 text-ivory md:px-12 md:pb-10 md:pt-28">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[70vw] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
        {/* Closing call to action */}
        <div className="grid gap-10 border-b border-ivory/10 pb-16 md:grid-cols-12 md:items-end md:pb-20">
          <div className="md:col-span-7">
            <p data-reveal className="label-mono mb-5 flex items-center gap-3 text-gold"><span className="h-px w-8 bg-gold" /> Next step</p>
            <h2 data-reveal className="font-display text-[clamp(2.2rem,5vw,4.25rem)] leading-[0.98]">
              Have a website in mind? <span className="text-ivory/45">Let's shape it together.</span>
            </h2>
          </div>
          <div data-reveal className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
            <Link to="/build-your-website" className="group inline-flex items-center gap-3 rounded-full bg-ivory px-7 py-4 text-sm font-semibold text-midnight transition-colors duration-300 hover:bg-gold">
              Build Your Website <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <WhatsAppLink message="Hi Scale Flow, I want a website developed." className="inline-flex items-center gap-3 rounded-full border border-ivory/25 px-7 py-4 text-sm font-semibold transition-colors duration-300 hover:border-whatsapp hover:text-whatsapp">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
            </WhatsAppLink>
          </div>
        </div>

        {/* Navigation + business information */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 md:grid-cols-12 md:py-16">
          <div className="sm:col-span-2 md:col-span-5">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-grey">The Digital Showroom — websites and digital experiences designed and built in New Delhi.</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="label-mono mb-5 text-grey">Explore</p>
            <ul className="space-y-3">
              {NAV.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="group inline-flex items-center gap-2 text-lg transition-colors hover:text-gold">
                    {l.label} <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="label-mono mb-5 text-grey">Studio</p>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li><a href={`mailto:${email}`} className="link-underline">{email}</a></li>
              <li><a href={`tel:+${digits}`} className="link-underline">{display}</a></li>
              {settings.location && <li className="max-w-xs text-grey">{settings.location}</li>}
            </ul>
          </div>
        </div>

        {/* Wordmark */}
        <p aria-hidden data-reveal="mask" className="font-display select-none whitespace-nowrap text-center text-[clamp(3.5rem,15vw,13rem)] leading-[0.8] text-ivory/[0.07]">
          Scale Flow
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-grey">
          <span>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</span>
          <span className="label-mono pr-16">Don't just view it — experience it.</span>
        </div>
      </div>
    </footer>
  );
}
