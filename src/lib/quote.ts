import type { QuoteFeature, QuotePackage } from "@/data/types";

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

export function featuresFor(pkg: QuotePackage | undefined, features: QuoteFeature[]) {
  if (!pkg) return [];
  return features
    .filter((f) => f.enabled && (f.availableFor.length === 0 || f.availableFor.includes(pkg.id)))
    .sort((a, b) => a.order - b.order)
    .map((f) => ({ ...f, included: pkg.includedFeatureIds.includes(f.id) }));
}

export interface QuoteResult {
  packagePrice: number | null;
  addons: { id: string; name: string; price: number | null }[];
  included: { id: string; name: string }[];
  addonsTotal: number;
  /** null when any part is custom-priced */
  total: number | null;
  isCustom: boolean;
}

export function calculateQuote(pkg: QuotePackage | undefined, features: QuoteFeature[], selectedIds: string[]): QuoteResult {
  const avail = featuresFor(pkg, features);
  const included = avail.filter((f) => f.included).map((f) => ({ id: f.id, name: f.name }));
  // Included features are never charged, even if selected.
  const addons = avail.filter((f) => !f.included && selectedIds.includes(f.id)).map((f) => ({ id: f.id, name: f.name, price: f.price }));
  const addonsTotal = addons.reduce((s, a) => s + (a.price ?? 0), 0);
  const packagePrice = pkg?.price ?? null;
  const isCustom = !pkg || packagePrice === null || addons.some((a) => a.price === null);
  return { packagePrice, addons, included, addonsTotal, total: isCustom ? null : (packagePrice ?? 0) + addonsTotal, isCustom };
}

export const normalizePhone = (n: string) => n.replace(/\D/g, "");

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`;
}

export interface QuoteDetails {
  name: string;
  business: string;
  phone: string;
  businessType: string;
  description: string;
  timeline: string;
  referenceUrl: string;
  /** What the client wants the website to accomplish. */
  goals: string[];
  referenceProject?: string | undefined;
}

export function buildQuoteMessage(pkg: QuotePackage | undefined, q: QuoteResult, d: QuoteDetails) {
  const features = [...q.included.map((f) => `- ${f.name} (included)`), ...q.addons.map((a) => `- ${a.name}`)];
  const lines = [
    "Hi Scale Flow,",
    "",
    "I would like to get a website developed.",
    "",
    `Name: ${d.name}`,
    `Business: ${d.business || "-"}`,
    `Business Type: ${d.businessType}`,
    `WhatsApp: ${d.phone}`,
    `Website Type: ${pkg?.name ?? "-"}`,
    "",
    "Required Features:",
    ...(features.length ? features : ["- None selected"]),
    "",
    "Business Goals:",
    ...(d.goals.length ? d.goals.map((g) => `- ${g}`) : ["- Not specified"]),
    "",
    `Estimated Budget: ${q.total !== null ? formatINR(q.total) : "Price to be confirmed"}`,
  ];
  if (d.timeline) lines.push(`Preferred Timeline: ${d.timeline}`);
  if (d.referenceProject) lines.push(`Reference Project: ${d.referenceProject}`);
  if (d.referenceUrl) lines.push(`Reference Website: ${d.referenceUrl}`);
  lines.push("", "Additional Requirements:", d.description || "-", "", "Please contact me to discuss my project.");
  return lines.join("\n");
}

/** Amount text used in the PDF (its built-in fonts have no ₹ glyph). Same numbers as the WhatsApp message. */
export const formatINRText = (n: number) => "INR " + n.toLocaleString("en-IN");

export const QUOTE_NOTE =
  "This quotation is an initial estimate based on your selected requirements. Final scope, pricing and delivery terms will be confirmed after project discussion.";

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** e.g. ScaleFlow_Website_Quotation_Acme_Foods_2026-10-26.pdf — business name first, then client name. */
export function quotationFilename(d: Pick<QuoteDetails, "name" | "business">, date: Date) {
  const who =
    (d.business.trim() || d.name.trim())
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "_")
      .slice(0, 40)
      .replace(/_+$/, "") || "Client";
  return `ScaleFlow_Website_Quotation_${who}_${isoDate(date)}.pdf`;
}

export interface QuotationDoc {
  date: string;
  client: { name: string; business: string; phone: string };
  websiteType: string;
  goals: string[];
  lines: { label: string; amount: string; kind: "package" | "included" | "addon" }[];
  addonsTotal: string | null;
  total: string;
  isCustom: boolean;
  referenceProject: string | null;
  requirements: string;
}

/** Everything the PDF prints, derived from the same quote the WhatsApp message uses. */
export function buildQuotation(pkg: QuotePackage | undefined, q: QuoteResult, d: QuoteDetails, date: Date): QuotationDoc {
  const price = (n: number | null) => (n === null ? "Price to be confirmed" : formatINRText(n));
  return {
    date: isoDate(date),
    client: { name: d.name.trim(), business: d.business.trim(), phone: d.phone.trim() },
    websiteType: pkg?.name ?? "-",
    goals: d.goals,
    lines: [
      { label: pkg?.name ?? "Website", amount: price(q.packagePrice), kind: "package" },
      ...q.included.map((f) => ({ label: f.name, amount: "Included", kind: "included" as const })),
      ...q.addons.map((a) => ({ label: a.name, amount: price(a.price), kind: "addon" as const })),
    ],
    addonsTotal: q.addons.length && q.addonsTotal > 0 ? formatINRText(q.addonsTotal) : null,
    total: q.total !== null ? formatINRText(q.total) : "Price to be confirmed",
    isCustom: q.isCustom,
    referenceProject: d.referenceProject ?? null,
    requirements: d.description.trim(),
  };
}
