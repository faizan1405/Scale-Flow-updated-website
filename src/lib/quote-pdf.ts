// Renders a QuotationDoc to a branded PDF. Client-only: import dynamically.
import { jsPDF } from "jspdf";
import { QUOTE_NOTE, type QuotationDoc } from "./quote";

// PDF colours mirror the brand palette (jsPDF cannot read CSS variables).
const INK: [number, number, number] = [20, 23, 28];
const CHAR: [number, number, number] = [37, 43, 52];
const IVORY: [number, number, number] = [245, 242, 235];
const CREAM: [number, number, number] = [235, 231, 223];
const STONE: [number, number, number] = [218, 213, 205];
const BRONZE: [number, number, number] = [167, 125, 74];
const GREY: [number, number, number] = [104, 110, 120];

export interface PdfContact {
  email: string;
  phone: string;
  office: string;
}

export function renderQuotationPdf(doc: QuotationDoc, contact: PdfContact): Blob {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({ title: "Your Website Quotation — Scale Flow", author: "Scale Flow", subject: "Website quotation" });
  const W = 210;
  const H = 297;
  const M = 18;
  let y = 0;

  const header = (first: boolean) => {
    pdf.setFillColor(...CHAR);
    pdf.rect(0, 0, W, first ? 58 : 18, "F");
    pdf.setDrawColor(...BRONZE);
    pdf.setLineWidth(0.8);
    pdf.line(M, first ? 20 : 11, M + 6, first ? 14 : 7);
    pdf.setTextColor(...IVORY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(first ? 13 : 10);
    pdf.text("Scale Flow", M + 9, first ? 19 : 10.5);
    if (first) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...STONE);
      pdf.text("THE DIGITAL SHOWROOM", W - M, 19, { align: "right" });
      pdf.setFont("times", "normal");
      pdf.setFontSize(30);
      pdf.setTextColor(...IVORY);
      pdf.text("Your Website Quotation", M, 42);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...BRONZE);
      pdf.text(`Prepared on ${doc.date}`, M, 51);
      y = 72;
    } else y = 30;
  };
  const ensure = (need: number) => {
    if (y + need > H - 27) {
      pdf.addPage();
      header(false);
    }
  };
  const label = (t: string) => {
    ensure(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...BRONZE);
    pdf.text(t.toUpperCase(), M, y, { charSpace: 0.6 });
    y += 6;
  };
  const para = (t: string, size = 10, color = INK) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    for (const line of pdf.splitTextToSize(t, W - 2 * M) as string[]) {
      ensure(6);
      pdf.text(line, M, y);
      y += size * 0.5;
    }
  };

  header(true);

  // Client block
  label("Prepared for");
  const rows: [string, string][] = [
    ["Name", doc.client.name],
    ["Business", doc.client.business || "-"],
    ["Phone / WhatsApp", doc.client.phone],
    ["Website type", doc.websiteType],
  ];
  if (doc.referenceProject) rows.push(["Reference project", doc.referenceProject]);
  pdf.setFillColor(...CREAM);
  const blockH = rows.length * 7 + 6;
  pdf.roundedRect(M, y - 2, W - 2 * M, blockH, 2, 2, "F");
  y += 4;
  rows.forEach(([k, v]) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...GREY);
    pdf.text(k, M + 5, y);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...INK);
    pdf.text((pdf.splitTextToSize(v, W - 2 * M - 60) as string[])[0] ?? "", M + 52, y);
    y += 7;
  });
  y += 8;

  // Goals
  if (doc.goals.length) {
    label("Business goals");
    doc.goals.forEach((g) => para(`•  ${g}`));
    y += 6;
  }

  // Itemised table
  label("Itemised estimate");
  pdf.setFillColor(...CHAR);
  pdf.rect(M, y - 4, W - 2 * M, 9, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...IVORY);
  pdf.text("Item", M + 4, y + 1.6);
  pdf.text("Type", M + 104, y + 1.6);
  pdf.text("Amount", W - M - 4, y + 1.6, { align: "right" });
  y += 11;
  const kindText = { package: "Package", included: "Included", addon: "Add-on" } as const;
  doc.lines.forEach((l, i) => {
    const wrapped = pdf.splitTextToSize(l.label, 95) as string[];
    const h = Math.max(1, wrapped.length) * 5 + 4;
    ensure(h + 2);
    if (i % 2 === 1) {
      pdf.setFillColor(...IVORY);
      pdf.rect(M, y - 4.5, W - 2 * M, h, "F");
    }
    pdf.setFont("helvetica", l.kind === "package" ? "bold" : "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...(l.kind === "included" ? GREY : INK));
    pdf.text(wrapped, M + 4, y);
    pdf.setFontSize(8.5);
    pdf.setTextColor(...GREY);
    pdf.text(kindText[l.kind], M + 104, y);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...(l.kind === "included" ? GREY : INK));
    pdf.text(l.amount, W - M - 4, y, { align: "right" });
    y += h;
  });
  pdf.setDrawColor(...STONE);
  pdf.setLineWidth(0.3);
  pdf.line(M, y - 2, W - M, y - 2);
  y += 4;
  if (doc.addonsTotal) {
    ensure(8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...GREY);
    pdf.text("Add-ons", W - M - 60, y);
    pdf.text(doc.addonsTotal, W - M - 4, y, { align: "right" });
    y += 8;
  }
  ensure(22);
  pdf.setFillColor(...CHAR);
  pdf.roundedRect(W - M - 92, y - 2, 92, 18, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...BRONZE);
  pdf.text(doc.isCustom ? "ESTIMATE" : "ESTIMATED TOTAL", W - M - 87, y + 4.5, { charSpace: 0.5 });
  pdf.setFont("times", "bold");
  pdf.setFontSize(doc.isCustom ? 14 : 18);
  pdf.setTextColor(...IVORY);
  pdf.text(doc.total, W - M - 87, y + 12.5);
  y += 24;

  if (doc.requirements) {
    label("Additional requirements");
    para(doc.requirements);
    y += 6;
  }

  // Note
  ensure(17);
  pdf.setDrawColor(...BRONZE);
  pdf.setLineWidth(0.6);
  pdf.line(M, y - 3, M, y + 11);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(...GREY);
  pdf.text(pdf.splitTextToSize(QUOTE_NOTE, W - 2 * M - 6) as string[], M + 4, y);
  pdf.setFont("helvetica", "normal");
  pdf.text("This is an estimate, not a tax invoice.", M + 4, y + 11);
  y += 22;

  // Contact footer on every page
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(...CREAM);
    pdf.rect(0, H - 24, W, 24, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...INK);
    pdf.text("Scale Flow", M, H - 16);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GREY);
    pdf.text(`${contact.email}   ·   ${contact.phone}`, M, H - 11.5);
    pdf.text(pdf.splitTextToSize(contact.office, W - 2 * M - 20) as string[], M, H - 7.5);
    pdf.text(`${p} / ${pages}`, W - M, H - 16, { align: "right" });
  }
  return pdf.output("blob");
}
