import { describe, expect, it } from "vitest";
import { portfolio } from "./portfolio";
import { seed } from "./seed";
import { inCategory, matchesQuery } from "./portfolio-utils";

describe("imported portfolio", () => {
  it("has exactly 26 unique projects", () => {
    expect(portfolio).toHaveLength(26);
    expect(new Set(portfolio.map((p) => p.slug)).size).toBe(26);
    expect(new Set(portfolio.map((p) => p.liveUrl)).size).toBe(26);
  });
  it("keeps the supplied live URLs", () => {
    const url = (s: string) => portfolio.find((p) => p.slug === s)?.liveUrl;
    expect(url("bmw-interactive-experience")).toBe("https://bmw.joinscaleflow.in/");
    expect(url("a-and-i-realty")).toBe("https://aireality.joinscaleflow.in/");
    expect(url("afforda-technologies")).toBe("https://affordaindia.com/");
  });
  it("features the six chosen projects", () => {
    expect(portfolio.filter((p) => p.featured).map((p) => p.title)).toEqual([
      "BMW Interactive Experience", "VELORA Serum", "A & I Realty", "Noctra Mattress", "Ananta Ayurveda", "Afforda Technologies",
    ]);
  });
  it("never claims client work until confirmed", () => {
    expect(portfolio.every((p) => p.kind === "unverified")).toBe(true);
  });
  it("every project points to a real category", () => {
    const ids = new Set(seed.categories.map((c) => c.id));
    expect(portfolio.every((p) => ids.has(p.categoryId) && (p.extraCategoryIds ?? []).every((c) => ids.has(c)))).toBe(true);
  });
  it("secondary categories count for filters", () => {
    const lehenga = portfolio.find((p) => p.slug === "kalavruti-lehenga")!;
    expect(inCategory(lehenga, "c-fashion")).toBe(true);
    expect(inCategory(lehenga, "c-ecommerce")).toBe(true);
    expect(inCategory(lehenga, "c-travel")).toBe(false);
  });
  it("search matches by name", () => {
    expect(portfolio.filter((p) => matchesQuery(p, "velora")).map((p) => p.slug)).toEqual(["velora-serum"]);
  });
  it("includes the Descriptive category with exact name and slug", () => {
    const desc = seed.categories.find((c) => c.slug === "descriptive");
    expect(desc).toBeDefined();
    expect(desc?.name).toBe("Descriptive");
    expect(desc?.id).toBe("c-descriptive");
    expect(desc?.enabled).toBe(true);
  });
  it("assigns all .com domain projects to Descriptive while preserving original categories", () => {
    const descId = "c-descriptive";
    const comProjects = portfolio.filter((p) => (p.liveUrl ?? "").includes(".com"));
    expect(comProjects).toHaveLength(3);
    expect(comProjects.every((p) => inCategory(p, descId))).toBe(true);

    // Afforda keeps c-catalogue + c-business while having c-descriptive
    const afforda = portfolio.find((p) => p.slug === "afforda-technologies")!;
    expect(afforda.categoryId).toBe("c-catalogue");
    expect(afforda.extraCategoryIds).toContain("c-business");
    expect(afforda.extraCategoryIds).toContain("c-descriptive");

    // Mainika keeps c-fashion + c-ecommerce while having c-descriptive
    const mainika = portfolio.find((p) => p.slug === "mainika")!;
    expect(mainika.categoryId).toBe("c-fashion");
    expect(mainika.extraCategoryIds).toContain("c-ecommerce");
    expect(mainika.extraCategoryIds).toContain("c-descriptive");

    // Yaarl Styles keeps c-fashion + c-ecommerce while having c-descriptive
    const yaarl = portfolio.find((p) => p.slug === "yaarl-styles")!;
    expect(yaarl.categoryId).toBe("c-fashion");
    expect(yaarl.extraCategoryIds).toContain("c-ecommerce");
    expect(yaarl.extraCategoryIds).toContain("c-descriptive");
  });
  it("allows a project to belong to an industry category and Descriptive simultaneously", () => {
    const bmw = portfolio.find((p) => p.slug === "bmw-interactive-experience")!;
    const markedBmw = {
      ...bmw,
      extraCategoryIds: [...(bmw.extraCategoryIds ?? []), "c-descriptive"],
    };
    expect(inCategory(markedBmw, "c-3d")).toBe(true);
    expect(inCategory(markedBmw, "c-descriptive")).toBe(true);
    expect(inCategory(markedBmw, "c-travel")).toBe(false);
  });
});
