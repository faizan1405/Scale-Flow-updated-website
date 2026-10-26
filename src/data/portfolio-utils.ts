import type { Project } from "./types";
import { KIND_LABEL } from "./types";

/** A project appears under its main category and any secondary ones. */
export const inCategory = (p: Project, categoryId: string) => p.categoryId === categoryId || (p.extraCategoryIds ?? []).includes(categoryId);

export const matchesQuery = (p: Project, q: string) =>
  !q || [p.title, p.client, p.summary, ...p.tags].join(" ").toLowerCase().includes(q.trim().toLowerCase());

/** Public label for the project type; empty when not yet confirmed. Legacy sample items read as "Sample concept". */
export const kindLabel = (p: Project) => (p.sample ? "Sample concept" : KIND_LABEL[p.kind ?? "unverified"]);
