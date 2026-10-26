// Export + pre-import validation for the future Hostinger MySQL import.
// Pure functions: the same validator will run server-side in the import preview.
import type { DB } from "./types";
import type { Conflict } from "./merge";

export const EXPORT_FORMAT = "scaleflow-export@1";

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  exportedAt: string;
  data: DB;
  conflicts: Conflict[];
}

export interface ValidationReport {
  ok: boolean;
  counts: { projects: number; featured: number; categories: number; videos: number; packages: number; features: number; media: number };
  errors: string[];
  warnings: string[];
}

export function buildExport(data: DB, conflicts: Conflict[], now = new Date()): ExportFile {
  return { format: EXPORT_FORMAT, exportedAt: now.toISOString(), data, conflicts };
}

const dupes = (xs: string[]) => [...new Set(xs.filter((x, i) => xs.indexOf(x) !== i))];

export function validateExport(f: ExportFile): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const d = f.data;
  if (f.format !== EXPORT_FORMAT) errors.push(`Unknown export format "${String(f.format)}".`);
  const catIds = new Set(d.categories.map((c) => c.id));
  const projIds = new Set(d.projects.map((p) => p.id));

  for (const id of dupes(d.projects.map((p) => p.id))) errors.push(`Duplicate project id: ${id}`);
  for (const s of dupes(d.projects.map((p) => p.slug))) errors.push(`Duplicate project slug: ${s}`);
  for (const s of dupes(d.categories.map((c) => c.slug))) errors.push(`Duplicate category slug: ${s}`);

  for (const p of d.projects) {
    if (!p.title.trim()) errors.push(`Project ${p.id} has no title.`);
    if (!/^[a-z0-9-]+$/.test(p.slug)) errors.push(`Project ${p.id} has an invalid slug "${p.slug}".`);
    if (!catIds.has(p.categoryId)) errors.push(`Project ${p.id} points to missing category ${p.categoryId}.`);
    for (const c of p.extraCategoryIds ?? []) if (!catIds.has(c)) warnings.push(`Project ${p.id} has unknown extra category ${c} (will be skipped).`);
    if (p.liveUrl && !/^https?:\/\//.test(p.liveUrl)) warnings.push(`Project ${p.id} live URL is not a web address.`);
    const imgs = [p.coverImage, ...p.screenshots, ...p.mobileScreenshots].filter(Boolean) as string[];
    if (imgs.some((u) => u.startsWith("data:"))) warnings.push(`Project ${p.id} has embedded images — they will be converted to files.`);
    if (imgs.some((u) => u.startsWith("blob:"))) errors.push(`Project ${p.id} has temporary images that no longer exist — re-upload them.`);
    if (p.videoUrl?.startsWith("blob:")) warnings.push(`Project ${p.id} video was temporary — re-upload it after import.`);
  }
  for (const v of d.videos) {
    if (v.projectId && !projIds.has(v.projectId)) warnings.push(`Video ${v.id} points to missing project ${v.projectId}.`);
    if (v.src?.startsWith("blob:")) warnings.push(`Video ${v.id} file was temporary — re-upload it after import.`);
  }
  const featIds = new Set(d.features.map((x) => x.id));
  for (const p of d.packages) {
    if (p.price !== null && (!Number.isInteger(p.price) || p.price < 0)) errors.push(`Package ${p.id} has an invalid price.`);
    for (const fid of p.includedFeatureIds) if (!featIds.has(fid)) warnings.push(`Package ${p.id} includes unknown feature ${fid}.`);
  }
  for (const x of d.features) if (x.price !== null && (!Number.isInteger(x.price) || x.price < 0)) errors.push(`Feature ${x.id} has an invalid price.`);
  for (const m of d.media) if (!m.persisted) warnings.push(`Media "${m.name}" was temporary — re-upload it after import.`);
  if (f.conflicts.length) warnings.push(`${f.conflicts.length} unresolved conflict(s) — owner's values will be imported.`);

  return {
    ok: errors.length === 0,
    counts: {
      projects: d.projects.length,
      featured: d.projects.filter((p) => p.featured).length,
      categories: d.categories.length,
      videos: d.videos.length,
      packages: d.packages.length,
      features: d.features.length,
      media: d.media.length,
    },
    errors,
    warnings,
  };
}
