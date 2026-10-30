import { describe, expect, it } from "vitest";
import { buildExport, validateExport } from "./export";
import { seed } from "./seed";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe("export validation", () => {
  it("accepts the current content: 26 projects, 6 featured, 9 categories", () => {
    const r = validateExport(buildExport(seed, []));
    expect(r.ok).toBe(true);
    expect(r.counts.projects).toBe(26);
    expect(r.counts.featured).toBe(6);
    expect(r.counts.categories).toBe(9);
  });

  it("rejects duplicate project slugs", () => {
    const d = clone(seed);
    d.projects[1]!.slug = d.projects[0]!.slug;
    expect(validateExport(buildExport(d, [])).ok).toBe(false);
  });

  it("rejects a negative package price", () => {
    const d = clone(seed);
    d.packages[0]!.price = -1;
    expect(validateExport(buildExport(d, [])).ok).toBe(false);
  });
});
