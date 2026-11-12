import { createFileRoute, Link } from "@tanstack/react-router";
import { Words } from "@/components/site/Words";
import { useReveal } from "@/lib/motion";
import { getBreadcrumbSchema } from "@/lib/seo-schema";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Scale Flow Web Studio India" },
      {
        name: "description",
        content:
          "Scale Flow's privacy and data protection policy. Learn how we handle client data, project briefs, and communications with confidentiality and integrity.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy | Scale Flow" },
      {
        property: "og:description",
        content: "Transparent privacy policy and data practices for Scale Flow clients.",
      },
      { property: "og:url", content: "https://www.joinscaleflow.in/privacy" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.joinscaleflow.in/brand/scaleflow-social-card.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.joinscaleflow.in/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  const ref = useReveal<HTMLElement>();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ];

  return (
    <main id="main" ref={ref} className="surface-light px-6 pb-32 pt-32 sm:px-8 md:px-12 md:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(breadcrumbs)) }}
      />

      <article className="mx-auto max-w-4xl">
        <p data-reveal className="label-mono mb-4 text-gold">
          Legal & Transparency
        </p>
        <Words
          as="h1"
          text="Privacy Policy."
          italicLast
          className="font-display block text-5xl md:text-7xl"
        />
        <p data-reveal className="mt-4 text-sm text-grey">
          Last updated: November 2026 · Scale Flow Web Studio, Connaught Place, New Delhi
        </p>

        <div data-reveal className="mt-12 space-y-10 text-base leading-relaxed text-ivory/75">
          <section className="space-y-3">
            <h2 className="font-display text-2xl text-ivory">1. Introduction</h2>
            <p>
              Scale Flow ("we", "our", or "us") operates the website{" "}
              <a href="https://joinscaleflow.in" className="link-underline text-gold">
                joinscaleflow.in
              </a>
              . We are dedicated to respecting your privacy, protecting your personal data, and maintaining
              strict client confidentiality across all our web design and development engagements in India
              and internationally.
            </p>
            <p>
              This Privacy Policy explains how we collect, store, and process information when you visit
              our website, use our online Website Cost Calculator, or reach out to us via WhatsApp, phone,
              or email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl text-ivory">2. Information We Collect</h2>
            <p>
              We only collect data necessary to provide accurate estimates, communicate about project briefs,
              and build custom websites:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                <strong className="text-ivory">Direct Inquiries:</strong> Name, business name, phone/WhatsApp number,
                email address, and project requirements submitted via our Website Cost Calculator or contact channels.
              </li>
              <li>
                <strong className="text-ivory">Technical & Analytics Data:</strong> Anonymous browser telemetry
                (such as device type, browser version, and page load performance) used exclusively to monitor site
                reliability, loading performance, and user accessibility.
              </li>
              <li>
                <strong className="text-ivory">Zero Ad Trackers:</strong> We do not run invasive third-party
                advertising pixels, retargeting cookies, or sell user information to data brokers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl text-ivory">3. Client Project Confidentiality & Intellectual Property</h2>
            <p>
              Every creative design, technical architecture, and proprietary strategy discussed with Scale Flow
              is held under strict professional confidentiality:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                Client design assets, copy, business plans, and database credentials provided for custom website
                development are encrypted and never shared with unauthorized third parties.
              </li>
              <li>
                Upon project completion and final settlement, all custom frontend source code, visual assets, and
                domain configurations are 100% owned by the client.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl text-ivory">4. Indian IT Act & DPDP Act 2023 Compliance</h2>
            <p>
              Scale Flow complies with India's Information Technology Act, 2000 (and amendments) and the Digital
              Personal Data Protection Act (DPDP Act 2023). Any personal data provided is processed solely on the
              legal basis of legitimate commercial interest (responding to inquiries, executing design contracts,
              and delivering website services).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl text-ivory">5. Contact Our Privacy Officer</h2>
            <p>
              If you have any questions about our data practices, wish to update your inquiry details, or request
              data removal, contact us at:
            </p>
            <div className="rounded-xl border border-ivory/10 bg-card p-6">
              <p className="font-semibold text-ivory">Scale Flow Web Studio</p>
              <p className="mt-1 text-sm text-ivory/70">
                3rd Floor, 44, Regal Building, 69, Connaught Cir, Connaught Place, New Delhi, Delhi 110001
              </p>
              <p className="mt-2 text-sm text-ivory/70">
                Email:{" "}
                <a href="mailto:business@joinscaleflow.in" className="link-underline text-gold">
                  business@joinscaleflow.in
                </a>
              </p>
              <p className="mt-1 text-sm text-ivory/70">
                Phone / WhatsApp:{" "}
                <a href="tel:+919873721207" className="link-underline text-gold">
                  +91 98737 21207
                </a>
              </p>
            </div>
          </section>

          <div className="border-t border-ivory/10 pt-8">
            <Link to="/" className="link-underline text-sm text-gold">
              ← Return to Scale Flow Homepage
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
