import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { useDB } from "@/data/store";
import { Words } from "@/components/site/Words";
import { btnLarge, btnLargeGhost, btnPrimary } from "@/components/site/Magnetic";
import { WhatsAppIcon, WhatsAppLink } from "@/components/site/WhatsApp";
import { useReveal } from "@/lib/motion";
import { CONTACT_PAGE_SCHEMA, getBreadcrumbSchema } from "@/lib/seo-schema";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Scale Flow | Best Website Maker & Developer in Delhi" },
      {
        name: "description",
        content:
          "Connect with Scale Flow, the premier website maker and web developer in Connaught Place, New Delhi. Get instant website cost estimates, visit our studio, or chat on WhatsApp.",
      },
      {
        name: "keywords",
        content:
          "contact scale flow, website maker in delhi, website developer in delhi, web design agency connaught place, website development studio delhi, hire website maker delhi",
      },
      { property: "og:title", content: "Contact Scale Flow | Web Developer in Delhi" },
      {
        property: "og:description",
        content:
          "Visit our Delhi studio in Connaught Place or chat on WhatsApp. Transparent pricing in INR and instant estimates.",
      },
      { property: "og:url", content: "https://www.joinscaleflow.in/contact" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.joinscaleflow.in/brand/scaleflow-social-card.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Scale Flow | Website Maker in Delhi" },
      {
        name: "twitter:description",
        content: "Bespoke websites and digital experiences built in New Delhi, India.",
      },
      { name: "twitter:image", content: "https://www.joinscaleflow.in/brand/scaleflow-social-card.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.joinscaleflow.in/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { settings } = useDB();
  const ref = useReveal<HTMLElement>();
  const digits = settings.whatsapp.replace(/\D/g, "");
  const display = "+" + digits.replace(/^(\d{2})(\d{5})(\d+)$/, "$1 $2 $3");
  const email = settings.email || "business@joinscaleflow.in";

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <main id="main" ref={ref} className="surface-light px-6 pb-32 pt-32 sm:px-8 md:px-12 md:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CONTACT_PAGE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(breadcrumbs)) }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <p data-reveal className="label-mono mb-6 text-gold">
          Get in touch — Connaught Place, New Delhi
        </p>
        <Words
          as="h1"
          text="Let's Build Something Exceptional."
          italicLast
          className="font-display block text-[clamp(3rem,8vw,7.5rem)] leading-[0.92]"
        />
        <p data-reveal className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/70 md:text-xl">
          Whether you're looking for the best website maker in Delhi to launch a new brand, redesign
          an existing platform, or build a custom 3D web experience, we're ready to collaborate.
        </p>

        {/* Contact Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Main Action Card */}
          <div
            data-reveal
            className="rounded-3xl border border-ivory/15 bg-card p-8 shadow-deep sm:p-12 lg:col-span-7"
          >
            <span className="label-mono text-gold">Direct channel</span>
            <h2 className="font-display mt-4 text-3xl md:text-4xl text-ivory">
              Start on WhatsApp for an Instant Estimate
            </h2>
            <p className="mt-4 leading-relaxed text-ivory/65">
              Skip back-and-forth emails. Message our lead design engineers directly with your project
              ideas, references, or timeline. We typically reply within 15 minutes during business
              hours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <WhatsAppLink
                message="Hi Scale Flow, I'd like to discuss a website project for my business."
                className={btnLarge + " w-full sm:w-auto bg-whatsapp text-midnight hover:bg-whatsapp/90"}
              >
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </WhatsAppLink>
              <Link to="/build-your-website" className={btnLargeGhost + " w-full sm:w-auto"}>
                Calculate Cost in INR <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 border-t border-ivory/10 pt-8">
              <p className="label-mono text-xs text-grey">What you can expect</p>
              <ul className="mt-4 grid gap-3 text-sm text-ivory/70 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Transparent quote in INR within 1 hour
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Zero generic themes or template bloat
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Direct engineer & designer communication
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Fast 7 to 14-day production turnaround
                </li>
              </ul>
            </div>
          </div>

          {/* Details & Physical Studio */}
          <div data-reveal className="space-y-6 lg:col-span-5">
            {/* Studio Address */}
            <div className="rounded-2xl border border-ivory/10 bg-midnight/60 p-6 md:p-8">
              <div className="flex items-center gap-3 text-gold">
                <MapPin className="h-5 w-5" />
                <span className="label-mono text-xs uppercase tracking-wider">Delhi Studio</span>
              </div>
              <h3 className="font-display mt-3 text-xl text-ivory">Connaught Place Studio</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/65">
                3rd Floor, 44, Regal Building, 69, Connaught Cir, Hanuman Road Area, Connaught
                Place, New Delhi, Delhi 110001
              </p>
              <a
                href="https://maps.google.com/?q=Regal+Building+Connaught+Place+New+Delhi"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-4 inline-flex items-center gap-1.5 text-xs text-gold"
              >
                View on Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Direct Contacts */}
            <div className="rounded-2xl border border-ivory/10 bg-midnight/60 p-6 md:p-8">
              <div className="flex items-center gap-3 text-gold">
                <Phone className="h-5 w-5" />
                <span className="label-mono text-xs uppercase tracking-wider">Phone & Email</span>
              </div>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-grey">Direct Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:+${digits}`} className="font-mono text-base text-ivory hover:text-gold">
                      {display}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-grey">Inquiries & Briefs</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${email}`} className="font-mono text-base text-ivory hover:text-gold">
                      {email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Business Hours */}
            <div className="rounded-2xl border border-ivory/10 bg-midnight/60 p-6 md:p-8">
              <div className="flex items-center gap-3 text-gold">
                <Clock className="h-5 w-5" />
                <span className="label-mono text-xs uppercase tracking-wider">Hours of Operation</span>
              </div>
              <p className="mt-3 text-sm text-ivory">
                Monday to Saturday: <span className="text-ivory/65">9:30 AM – 8:00 PM IST</span>
              </p>
              <p className="mt-1 text-xs text-grey">Sunday: Emergency support & deployments only</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
