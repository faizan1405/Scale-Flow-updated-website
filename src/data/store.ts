import { useSyncExternalStore } from "react";
import { seed } from "./seed";
import type { DB } from "./types";
import { acceptTheirs, mergeConflicts, mergeDB, type Conflict } from "./merge";
import baseV1 from "./legacy/base-v1.json";
import baseV2 from "./legacy/base-v2.json";

/**
 * Demo repository. Persists to this browser's localStorage only.
 * Swap these functions for Hostinger API calls when the backend exists —
 * pages only talk to useDB / update.
 *
 * Saved format keeps the owner's data plus the defaults it was based on, so
 * newer defaults are merged field-by-field instead of replacing the owner's
 * edits (see merge.ts). Older storage keys are only read, never deleted.
 */
const KEY = "scaleflow-content";
const BACKUP_INDEX = "scaleflow-backups";
/** Earlier storage keys, oldest first, with the defaults each was created from. */
const LEGACY: { key: string; base: DB }[] = [
  { key: "scaleflow-demo-v1", base: baseV1 as unknown as DB },
  { key: "scaleflow-demo-v2", base: baseV2 as unknown as DB },
  { key: "scaleflow-demo-v3", base: seed },
];

interface Envelope {
  format: 1;
  base: DB;
  data: DB;
  conflicts: Conflict[];
  /** Storage keys whose edits were merged in. */
  recovered: string[];
  migratedAt: string;
}

export interface BackupEntry {
  key: string;
  at: string;
  size: number;
  sources: string[];
}

export interface ContentMeta {
  conflicts: Conflict[];
  recovered: string[];
  backups: BackupEntry[];
  /** Set when the browser refused to save a backup or data. */
  storageWarning: string | null;
}

let state: DB = seed;
let meta: ContentMeta = { conflicts: [], recovered: [], backups: [], storageWarning: null };
let envelope: Envelope | null = null;
let loaded = false;
const listeners = new Set<() => void>();
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function readBackups(): BackupEntry[] {
  try {
    return JSON.parse(read(BACKUP_INDEX) ?? "[]") as BackupEntry[];
  } catch {
    return [];
  }
}

/** Copy the raw saved data (all known keys) into a new backup key. Never deletes anything. */
function backup(reason: string): boolean {
  const raw: Record<string, string> = {};
  for (const k of [...LEGACY.map((l) => l.key), KEY]) {
    const v = read(k);
    if (v !== null) raw[k] = v;
  }
  const sources = Object.keys(raw);
  if (!sources.length) return true;
  const payload = JSON.stringify({ reason, at: new Date().toISOString(), raw });
  const list = readBackups();
  const last = list[list.length - 1];
  if (last && read(last.key)?.includes(JSON.stringify(raw))) return true; // identical to latest backup
  const at = new Date().toISOString();
  const key = `scaleflow-backup:${at}`;
  try {
    window.localStorage.setItem(key, payload);
    window.localStorage.setItem(BACKUP_INDEX, JSON.stringify([...list, { key, at, size: payload.length, sources }]));
    return true;
  } catch {
    meta = { ...meta, storageWarning: "This browser is out of storage space, so a backup could not be saved. Your existing data was left untouched." };
    return false;
  }
}

function persist(): boolean {
  if (!envelope) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(envelope));
    return true;
  } catch {
    meta = { ...meta, storageWarning: "This browser is out of storage space. Recent changes show now but may be lost on refresh." };
    return false;
  }
}

function syncMeta() {
  meta = { ...meta, conflicts: envelope?.conflicts ?? [], recovered: envelope?.recovered ?? [], backups: readBackups() };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = read(KEY);
    if (raw) {
      const env = JSON.parse(raw) as Envelope;
      envelope = env;
      if (!same(env.base, seed)) {
        // Newer defaults shipped: merge them in without touching owner edits.
        const ok = backup("before merging updated default content");
        const { db, conflicts } = mergeDB(env.base, env.data, seed, "Site update");
        envelope = { ...env, base: seed, data: db, conflicts: mergeConflicts(env.conflicts, conflicts), migratedAt: new Date().toISOString() };
        if (ok) persist();
      }
    } else {
      // First run of the merge system: recover edits saved under older keys.
      let db: DB = seed;
      let conflicts: Conflict[] = [];
      const recovered: string[] = [];
      for (const l of LEGACY) {
        const v = read(l.key);
        if (!v) continue;
        try {
          const saved = JSON.parse(v) as Partial<DB>;
          const r = mergeDB(l.base, saved, db, `Recovered from ${l.key}`);
          db = r.db;
          conflicts = mergeConflicts(conflicts, r.conflicts);
          recovered.push(l.key);
        } catch {
          /* unreadable legacy copy — left in place, skipped */
        }
      }
      envelope = { format: 1, base: seed, data: db, conflicts, recovered, migratedAt: new Date().toISOString() };
      if (recovered.length) {
        if (backup("before recovering earlier admin edits")) persist();
      }
    }
    if (envelope && !envelope.data.categories.some((c) => c.slug === "descriptive" || c.id === "c-descriptive")) {
      const maxOrder = Math.max(0, ...envelope.data.categories.map((c) => c.order || 0));
      envelope.data.categories.push({
        id: "c-descriptive",
        name: "Descriptive",
        slug: "descriptive",
        enabled: true,
        order: maxOrder + 1,
      });
      persist();
    }
    if (envelope) {
      // Ensure selected projects and all .com projects include the Descriptive category in extraCategoryIds
      const descCat = envelope.data.categories.find((c) => c.slug === "descriptive" || c.id === "c-descriptive");
      const descId = descCat?.id ?? "c-descriptive";
      const descriptiveProjectIds = new Set([
        "pf-afforda",
        "pf-mainika",
        "pf-yaarl",
        "pf-tourism",
        "pf-ezymiles",
        "pf-blackpearl",
        "pf-teenntees",
      ]);
      let updatedProjects = false;
      envelope.data.projects = envelope.data.projects.map((p) => {
        if (p.id === "pf-tourism" && p.liveUrl !== "https://silvercircletravel.com/") {
          p = { ...p, liveUrl: "https://silvercircletravel.com/" };
          updatedProjects = true;
        }
        const isTarget = descriptiveProjectIds.has(p.id) || (p.liveUrl && /\.com(?:\/|$)/i.test(p.liveUrl));
        if (isTarget) {
          if (!p.extraCategoryIds?.includes(descId) && p.categoryId !== descId) {
            updatedProjects = true;
            return {
              ...p,
              extraCategoryIds: [...(p.extraCategoryIds ?? []), descId],
            };
          }
        }
        return p;
      });
      if (updatedProjects) persist();
    }
    state = envelope.data;
  } catch {
    /* corrupted storage — show defaults, leave stored data untouched */
    envelope = null;
    state = seed;
  }
  syncMeta();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => seed;
const emptyMeta: ContentMeta = { conflicts: [], recovered: [], backups: [], storageWarning: null };
const getMeta = () => {
  load();
  return meta;
};

/** Returns false if the browser refused to store (quota exceeded). Memory state still updates. */
export function update(fn: (d: DB) => DB): boolean {
  state = fn(getSnapshot());
  envelope = { ...(envelope ?? { format: 1, base: seed, conflicts: [], recovered: [], migratedAt: new Date().toISOString() }), data: state };
  const ok = persist();
  listeners.forEach((l) => l());
  return ok;
}

/** Owner decision on a conflict: keep their value, or take the newer default. */
export function resolveConflict(key: string, choice: "mine" | "theirs") {
  load();
  if (!envelope) return;
  const c = envelope.conflicts.find((x) => x.key === key);
  if (!c) return;
  const data = choice === "theirs" ? acceptTheirs(envelope.data, c) : envelope.data;
  envelope = { ...envelope, data, conflicts: envelope.conflicts.filter((x) => x.key !== key) };
  state = data;
  persist();
  syncMeta();
  listeners.forEach((l) => l());
}

/** Raw text of a backup, for download. */
export function readBackup(key: string): string | null {
  return read(key);
}

/** Restores defaults after taking a backup. Older saved keys and backups are kept. */
export function resetDemo() {
  load();
  backup("before reset to defaults");
  envelope = { format: 1, base: seed, data: seed, conflicts: [], recovered: envelope?.recovered ?? [], migratedAt: new Date().toISOString() };
  state = seed;
  persist();
  syncMeta();
  listeners.forEach((l) => l());
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useContentMeta(): ContentMeta {
  return useSyncExternalStore(subscribe, getMeta, () => emptyMeta);
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export function moveItem<T extends { id: string; order: number }>(list: T[], id: string, dir: -1 | 1): T[] {
  const sorted = [...list].sort(byOrder);
  const i = sorted.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sorted.length) return list;
  const tmp = sorted[i]!;
  sorted[i] = sorted[j]!;
  sorted[j] = tmp;
  return sorted.map((x, k) => ({ ...x, order: k + 1 }));
}
