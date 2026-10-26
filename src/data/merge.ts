// Three-way content merge: base (defaults the owner's copy started from),
// mine (owner's saved copy) and theirs (newer defaults shipped with the site).
// Pure functions only — no storage access — so the same rules can run on the
// future Hostinger server during a MySQL import.
import type { DB } from "./types";

export type CollectionKey = "categories" | "projects" | "videos" | "packages" | "features" | "media";
export const COLLECTIONS: CollectionKey[] = ["categories", "projects", "videos", "packages", "features", "media"];

export interface Conflict {
  /** Stable key so the same conflict is not listed twice. */
  key: string;
  collection: CollectionKey | "settings";
  id: string;
  /** Record title for display. */
  label: string;
  /** Field name, or "(record)" for add/remove conflicts. */
  field: string;
  /** Value currently in use (the owner's). */
  mine: unknown;
  /** Value offered by the newer default content. undefined = the default removed the record. */
  theirs: unknown;
  reason: "both-changed" | "removed-by-update" | "deleted-by-owner" | "id-clash";
  source: string;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
type Rec = { id: string } & Record<string, unknown>;
const labelOf = (r: Record<string, unknown> | undefined, id: string) =>
  String((r && (r["title"] ?? r["name"])) || id);

/** Fields that record bookkeeping, not owner content — never raise conflicts. */
const SILENT = new Set(["updatedAt"]);

function mergeFields(base: Record<string, unknown>, mine: Record<string, unknown>, theirs: Record<string, unknown>, ctx: Omit<Conflict, "key" | "field" | "mine" | "theirs" | "reason">, out: Conflict[]) {
  const result: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(mine), ...Object.keys(theirs)]);
  for (const k of keys) {
    const b = base[k], m = mine[k], t = theirs[k];
    const mineChanged = !same(m, b);
    const theirsChanged = !same(t, b);
    if (!mineChanged) result[k] = t; // untouched by owner → take newer default
    else if (!theirsChanged || same(m, t)) result[k] = m; // owner edit, default unchanged
    else {
      result[k] = m; // both changed → owner's value wins until they decide
      if (!SILENT.has(k)) out.push({ ...ctx, key: `${ctx.collection}:${ctx.id}:${k}`, field: k, mine: m, theirs: t, reason: "both-changed" });
    }
    if (result[k] === undefined) delete result[k];
  }
  return result;
}

function mergeCollection(key: CollectionKey, base: Rec[], mine: Rec[], theirs: Rec[], source: string, out: Conflict[]): Rec[] {
  const B = new Map(base.map((r) => [r.id, r]));
  const M = new Map(mine.map((r) => [r.id, r]));
  const T = new Map(theirs.map((r) => [r.id, r]));
  const result: Rec[] = [];
  // Owner's records first, in their order.
  for (const m of mine) {
    const b = B.get(m.id), t = T.get(m.id);
    const ctx = { collection: key, id: m.id, label: labelOf(m, m.id), source };
    if (b && t) result.push(mergeFields(b, m, t, ctx, out) as Rec);
    else if (b && !t) {
      // Default removed this record.
      if (same(m, b)) continue; // owner never touched it → follow the removal
      result.push(m);
      out.push({ ...ctx, key: `${key}:${m.id}:(record)`, field: "(record)", mine: m, theirs: undefined, reason: "removed-by-update" });
    } else if (!b && t) {
      // Owner added a record whose id later appeared in the defaults.
      if (same(m, t)) result.push(m);
      else result.push(mergeFields({}, m, t, ctx, out) as Rec);
    } else result.push(m); // owner-added record
  }
  for (const t of theirs) {
    if (M.has(t.id)) continue;
    const b = B.get(t.id);
    if (!b) result.push(t); // brand-new default record → add
    else if (!same(t, b)) {
      // Owner deleted it, but the default was updated since — keep it deleted, flag it.
      out.push({ collection: key, id: t.id, label: labelOf(t, t.id), source, key: `${key}:${t.id}:(record)`, field: "(record)", mine: undefined, theirs: t, reason: "deleted-by-owner" });
    }
    // else: owner deleted an unchanged default → stays deleted
  }
  return result;
}

/** Merge an owner's saved copy (based on `base`) onto newer defaults `theirs`. */
export function mergeDB(base: DB, mine: Partial<DB>, theirs: DB, source: string): { db: DB; conflicts: Conflict[] } {
  const conflicts: Conflict[] = [];
  const db = { ...theirs } as DB;
  for (const k of COLLECTIONS) {
    const m = mine[k];
    if (!Array.isArray(m)) continue; // owner never saved this collection
    (db as unknown as Record<string, Rec[]>)[k] = mergeCollection(k, (base[k] ?? []) as unknown as Rec[], m as unknown as Rec[], theirs[k] as unknown as Rec[], source, conflicts);
  }
  if (mine.settings) {
    db.settings = mergeFields(base.settings as unknown as Record<string, unknown>, mine.settings as unknown as Record<string, unknown>, theirs.settings as unknown as Record<string, unknown>, { collection: "settings", id: "settings", label: "Settings", source }, conflicts) as unknown as DB["settings"];
  }
  return { db, conflicts };
}

/** Combine conflict lists, keeping the newest entry per key. */
export function mergeConflicts(prev: Conflict[], next: Conflict[]): Conflict[] {
  const map = new Map(prev.map((c) => [c.key, c]));
  for (const c of next) map.set(c.key, c);
  return [...map.values()];
}

/** Apply the newer default value for one conflict (owner confirmed). */
export function acceptTheirs(db: DB, c: Conflict): DB {
  if (c.collection === "settings") return { ...db, settings: { ...db.settings, [c.field]: c.theirs } };
  const list = db[c.collection] as unknown as Rec[];
  let next: Rec[];
  if (c.field === "(record)") {
    if (c.theirs === undefined) next = list.filter((r) => r.id !== c.id);
    else next = list.some((r) => r.id === c.id) ? list.map((r) => (r.id === c.id ? (c.theirs as Rec) : r)) : [...list, c.theirs as Rec];
  } else {
    next = list.map((r) => {
      if (r.id !== c.id) return r;
      const copy = { ...r, [c.field]: c.theirs };
      if (c.theirs === undefined) delete copy[c.field];
      return copy;
    });
  }
  return { ...db, [c.collection]: next } as DB;
}
