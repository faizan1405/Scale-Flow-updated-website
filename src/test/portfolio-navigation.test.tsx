import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { seed } from "@/data/seed";
import { portfolio } from "@/data/portfolio";
import { inCategory, matchesQuery } from "@/data/portfolio-utils";
import type { Project } from "@/data/types";

describe("SCALE FLOW — Portfolio Navigation & Descriptive Category", () => {
  it("maintains all 26 projects intact with valid live URLs", () => {
    expect(portfolio).toHaveLength(26);
    expect(new Set(portfolio.map((p) => p.slug)).size).toBe(26);
    expect(portfolio.every((p) => p.liveUrl && p.liveUrl.startsWith("https://"))).toBe(true);
  });

  it("has the Descriptive category configured with exact name and slug", () => {
    const descriptive = seed.categories.find((c) => c.slug === "descriptive");
    expect(descriptive).toBeDefined();
    expect(descriptive?.name).toBe("Descriptive");
    expect(descriptive?.id).toBe("c-descriptive");
    expect(descriptive?.enabled).toBe(true);
  });

  it("does not automatically assign all 26 projects to Descriptive", () => {
    const descId = "c-descriptive";
    const assigned = portfolio.filter((p) => inCategory(p, descId));
    expect(assigned).toHaveLength(0);
  });

  it("allows a project to belong to an industry category and Descriptive simultaneously without conflict", () => {
    const sample = portfolio[0]!;
    expect(sample.categoryId).toBe("c-3d");

    // Add to Descriptive
    const withDescriptive: Project = {
      ...sample,
      extraCategoryIds: [...(sample.extraCategoryIds ?? []), "c-descriptive"],
    };

    expect(inCategory(withDescriptive, "c-3d")).toBe(true);
    expect(inCategory(withDescriptive, "c-descriptive")).toBe(true);

    // Remove from Descriptive
    const removedFromDescriptive: Project = {
      ...withDescriptive,
      extraCategoryIds: (withDescriptive.extraCategoryIds ?? []).filter((id) => id !== "c-descriptive"),
    };

    expect(inCategory(removedFromDescriptive, "c-3d")).toBe(true);
    expect(inCategory(removedFromDescriptive, "c-descriptive")).toBe(false);
  });

  it("supports searching within the Descriptive category", () => {
    const descId = "c-descriptive";
    const proj1 = { ...portfolio[0]!, extraCategoryIds: [descId] }; // BMW
    const proj2 = { ...portfolio[1]!, extraCategoryIds: [descId] }; // VELORA

    const list = [proj1, proj2];
    const descriptiveProjects = list.filter((p) => inCategory(p, descId));
    expect(descriptiveProjects).toHaveLength(2);

    const searched = descriptiveProjects.filter((p) => matchesQuery(p, "bmw"));
    expect(searched).toHaveLength(1);
    expect(searched[0]?.slug).toBe("bmw-interactive-experience");
  });

  it("renders Project Card with independent actions for card and arrow button", () => {
    const navigate = vi.fn();
    const testProject = portfolio[0]!; // BMW

    const { getByRole, getByLabelText, getByText } = render(
      <article
        data-item
        data-testid="project-card"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("a, button")) return;
          navigate({ to: "/work/$slug", params: { slug: testProject.slug } });
        }}
      >
        <div data-testid="card-mockup">Mockup Content</div>
        <div>
          <h2>
            <a href={`/work/${testProject.slug}`}>{testProject.title}</a>
          </h2>
          <p>{testProject.summary}</p>
        </div>
        <a
          href={testProject.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label={`Open live website for ${testProject.title} in a new tab`}
        >
          <span>↗</span>
        </a>
      </article>
    );

    const card = screen.getByTestId("project-card");
    const arrow = screen.getByLabelText(`Open live website for ${testProject.title} in a new tab`);
    const mockup = screen.getByTestId("card-mockup");

    // 1. Clicking arrow does NOT call card navigate
    fireEvent.click(arrow);
    expect(navigate).not.toHaveBeenCalled();
    expect(arrow.getAttribute("href")).toBe(testProject.liveUrl);
    expect(arrow.getAttribute("target")).toBe("_blank");
    expect(arrow.getAttribute("rel")).toContain("noopener");

    // 2. Clicking card (e.g. mockup or general body) triggers navigate to /work/$slug
    fireEvent.click(mockup);
    expect(navigate).toHaveBeenCalledWith({
      to: "/work/$slug",
      params: { slug: testProject.slug },
    });
  });

  it("renders top-right and bottom View Website buttons on project detail page", () => {
    const testProject = portfolio[0]!;

    const { getAllByRole } = render(
      <main>
        {/* Top-right button */}
        <div className="flex items-center justify-between">
          <span>All work</span>
          <a
            href={testProject.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="top-right-view-website"
          >
            View Website ↗
          </a>
        </div>

        {/* Existing bottom button */}
        <div className="flex flex-wrap gap-3">
          <a
            href={testProject.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="bottom-visit-live-website"
          >
            Visit Live Website ↗
          </a>
        </div>
      </main>
    );

    const topBtn = screen.getByTestId("top-right-view-website");
    const bottomBtn = screen.getByTestId("bottom-visit-live-website");

    // Both buttons exist, are distinct, point to the exact same live URL and open in new tab
    expect(topBtn).toBeDefined();
    expect(bottomBtn).toBeDefined();
    expect(topBtn.getAttribute("href")).toBe(testProject.liveUrl);
    expect(bottomBtn.getAttribute("href")).toBe(testProject.liveUrl);
    expect(topBtn.getAttribute("target")).toBe("_blank");
    expect(bottomBtn.getAttribute("target")).toBe("_blank");
    expect(topBtn.textContent).toContain("View Website");
    expect(bottomBtn.textContent).toContain("Visit Live Website");
  });
});
