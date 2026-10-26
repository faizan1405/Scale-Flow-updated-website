import { describe, expect, it } from "vitest";
import { seed } from "@/data/seed";
import { buildQuoteMessage, calculateQuote, whatsappLink } from "./quote";

const pkg = (id: string) => seed.packages.find((p) => p.id === id);

describe("quotation builder", () => {
  it("Business package (₹30,000) plus booking (₹7,000) and payments (₹5,000) totals ₹42,000", () => {
    const q = calculateQuote(pkg("business"), seed.features, ["booking", "payments"]);
    expect(q.total).toBe(42000);
  });

  it("does not charge for features already included in the package", () => {
    const q = calculateQuote(pkg("premium"), seed.features, ["admin", "blog"]);
    expect(q.total).toBe(45000);
  });

  it("custom-priced packages show no total", () => {
    const q = calculateQuote(pkg("ecommerce"), seed.features, []);
    expect(q.total).toBeNull();
    expect(q.isCustom).toBe(true);
  });

  it("selecting a custom-priced add-on removes the fixed total", () => {
    const q = calculateQuote(pkg("premium"), seed.features, ["three"]);
    expect(q.total).toBeNull();
  });

  it("opens wa.me for +91 9873721207 with encoded text", () => {
    const url = whatsappLink("+91 98737 21207", "Hi & hello\nNext");
    expect(url).toBe("https://wa.me/919873721207?text=Hi%20%26%20hello%0ANext");
  });

  it("message lists the estimated amount", () => {
    const p = pkg("basic");
    const q = calculateQuote(p, seed.features, []);
    const msg = buildQuoteMessage(p, q, { name: "Asha", business: "", phone: "1", businessType: "Cafe", description: "", timeline: "", referenceUrl: "", goals: ["Generate qualified inquiries"] });
    expect(msg).toContain("Estimated Budget: ₹15,000");
    expect(msg).toContain("- Generate qualified inquiries");
    expect(msg).not.toContain("Pages");
  });

  it("no optional add-on is charged until the visitor selects it", () => {
    const q = calculateQuote(pkg("business"), seed.features, []);
    expect(q.addons).toHaveLength(0);
    expect(q.total).toBe(30000);
  });
});

describe("quotation PDF data", () => {
  const date = new Date(2026, 9, 26);
  it("names the file after the business, then the client", async () => {
    const { quotationFilename } = await import("./quote");
    expect(quotationFilename({ name: "Riya", business: "Acme Foods / Delhi" }, date)).toBe("ScaleFlow_Website_Quotation_Acme_Foods_Delhi_2026-10-26.pdf");
    expect(quotationFilename({ name: "Riya Sen", business: " " }, date)).toBe("ScaleFlow_Website_Quotation_Riya_Sen_2026-10-26.pdf");
  });
  it("shows the same total as the estimate and never charges included features", async () => {
    const { buildQuotation, calculateQuote } = await import("./quote");
    const pkg = { id: "p", name: "Business", tagline: "", price: 30000, includedFeatureIds: ["inc"], enabled: true, order: 1 };
    const feats = [
      { id: "inc", name: "Contact form", description: "", price: 5000, availableFor: [], enabled: true, order: 1 },
      { id: "a", name: "Blog", description: "", price: 8000, availableFor: [], enabled: true, order: 2 },
    ];
    const q = calculateQuote(pkg, feats, ["inc", "a"]);
    const doc = buildQuotation(pkg, q, { name: "R", business: "B", phone: "9", businessType: "", description: "", timeline: "", referenceUrl: "", goals: [] }, date);
    expect(doc.total).toBe("INR 38,000");
    expect(doc.lines.find((l) => l.label === "Contact form")?.amount).toBe("Included");
  });
  it("says price to be confirmed for custom-priced quotes", async () => {
    const { buildQuotation, calculateQuote } = await import("./quote");
    const pkg = { id: "p", name: "Custom", tagline: "", price: null, includedFeatureIds: [], enabled: true, order: 1 };
    const doc = buildQuotation(pkg, calculateQuote(pkg, [], []), { name: "R", business: "", phone: "9", businessType: "", description: "", timeline: "", referenceUrl: "", goals: [] }, date);
    expect(doc.total).toBe("Price to be confirmed");
  });
  it("long names never leave a dangling underscore before the date", async () => {
    const { quotationFilename } = await import("./quote");
    expect(quotationFilename({ name: "", business: "Qureshi Healthcare Diagnostics & Wellness Network" }, date)).toBe("ScaleFlow_Website_Quotation_Qureshi_Healthcare_Diagnostics_Wellness_2026-10-26.pdf");
  });
  it("WhatsApp and PDF use the same words for custom-priced quotes", async () => {
    const { buildQuotation, calculateQuote } = await import("./quote");
    const p = pkg("ecommerce");
    const q = calculateQuote(p, seed.features, []);
    const d = { name: "R", business: "", phone: "9", businessType: "", description: "", timeline: "", referenceUrl: "", goals: [] };
    expect(buildQuoteMessage(p, q, d)).toContain("Estimated Budget: Price to be confirmed");
    expect(buildQuotation(p, q, d, date).total).toBe("Price to be confirmed");
  });
});
