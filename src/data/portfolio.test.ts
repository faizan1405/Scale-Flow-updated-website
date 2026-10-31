import { describe, expect, it } from "vitest";
import { portfolio } from "./portfolio";
import { seed } from "./seed";
import { inCategory, matchesQuery } from "./portfolio-utils";

describe("imported portfolio", () => {
  it("has exactly 27 unique projects", () => {
    expect(portfolio).toHaveLength(27);
    expect(new Set(portfolio.map((p) => p.slug)).size).toBe(27);
    expect(new Set(portfolio.map((p) => p.liveUrl)).size).toBe(27);
  });
  it("keeps the supplied live URLs", () => {
    const url = (s: string) => portfolio.find((p) => p.slug === s)?.liveUrl;
    expect(url("bmw-interactive-experience")).toBe("https://bmw.joinscaleflow.in/");
    expect(url("a-and-i-realty")).toBe("https://aireality.joinscaleflow.in/");
    expect(url("afforda-technologies")).toBe("https://affordaindia.com/");
    expect(url("jsb-stonex-marble")).toBe("https://marble.joinscaleflow.in/");
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
  it("assigns selected projects (including .com, Black Pearl, Teenntees, Silver Circle, and eZyMiles) to Descriptive", () => {
    const descId = "c-descriptive";
    const targetSlugs = [
      "afforda-technologies",
      "mainika",
      "yaarl-styles",
      "silver-circle-travel",
      "ezymiles",
      "black-pearl-apparels",
      "teen-and-tees",
    ];

    for (const slug of targetSlugs) {
      const p = portfolio.find((item) => item.slug === slug);
      expect(p, `Project with slug ${slug} should exist`).toBeDefined();
      expect(inCategory(p!, descId), `Project ${slug} should be in Descriptive`).toBe(true);
    }

    // Silver Circle Travel has the updated domain
    const silverCircle = portfolio.find((p) => p.slug === "silver-circle-travel")!;
    expect(silverCircle.liveUrl).toBe("https://silvercircletravel.com/");
    expect(silverCircle.categoryId).toBe("c-travel");
    expect(silverCircle.extraCategoryIds).toContain("c-descriptive");

    // Black Pearl Apparels keeps c-fashion + c-ecommerce while in Descriptive
    const blackPearl = portfolio.find((p) => p.slug === "black-pearl-apparels")!;
    expect(blackPearl.categoryId).toBe("c-fashion");
    expect(blackPearl.extraCategoryIds).toContain("c-ecommerce");
    expect(blackPearl.extraCategoryIds).toContain("c-descriptive");

    // Teenntees keeps c-fashion + c-ecommerce while in Descriptive
    const teenntees = portfolio.find((p) => p.slug === "teen-and-tees")!;
    expect(teenntees.categoryId).toBe("c-fashion");
    expect(teenntees.extraCategoryIds).toContain("c-ecommerce");
    expect(teenntees.extraCategoryIds).toContain("c-descriptive");

    // eZyMiles keeps c-travel while in Descriptive
    const ezymiles = portfolio.find((p) => p.slug === "ezymiles")!;
    expect(ezymiles.categoryId).toBe("c-travel");
    expect(ezymiles.extraCategoryIds).toContain("c-descriptive");
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

  it("includes JSB Stonex 3D scroll-based experience in 3D Interactive category", () => {
    const marble = portfolio.find((p) => p.slug === "jsb-stonex-marble");
    expect(marble).toBeDefined();
    expect(marble?.categoryId).toBe("c-3d");
    expect(marble?.extraCategoryIds).toContain("c-realestate");
    expect(marble?.liveUrl).toBe("https://marble.joinscaleflow.in/");
    expect(marble?.tags).toContain("3D");
    expect(marble?.tags).toContain("Scroll-based");
    expect(inCategory(marble!, "c-3d")).toBe(true);
    expect(inCategory(marble!, "c-realestate")).toBe(true);
  });
});
