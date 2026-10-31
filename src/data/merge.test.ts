import { describe, expect, it } from "vitest";
import { acceptTheirs, mergeDB } from "./merge";
import { seed } from "./seed";
import baseV2 from "./legacy/base-v2.json";
import type { DB } from "./types";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const proj = (db: DB, id: string) => db.projects.find((p) => p.id === id)!;

describe("non-destructive content merge", () => {
  it("keeps an owner-edited project title while taking new default screenshots", () => {
    const base = baseV2 as unknown as DB;
    const mine = clone(base);
    proj(mine, "pf-mainika").title = "Mainika (owner edit)";
    const { db, conflicts } = mergeDB(base, mine, seed, "t");
    expect(proj(db, "pf-mainika").title).toBe("Mainika (owner edit)");
    expect(proj(db, "pf-mainika").screenshots).toEqual(proj(seed, "pf-mainika").screenshots);
    expect(conflicts).toHaveLength(0);
  });

  it("merges defaults onto untouched old data, preserving existing projects and adding new defaults", () => {
    const base = baseV2 as unknown as DB;
    const { db } = mergeDB(base, clone(base), seed, "t");
    expect(db.projects).toHaveLength(27);
    expect(new Set(db.projects.map((p) => p.id)).size).toBe(27);
    expect(db.projects.filter((p) => p.featured)).toHaveLength(6);
  });

  it("keeps owner quote prices and settings", () => {
    const mine = clone(seed);
    mine.packages.find((p) => p.id === "basic")!.price = 18000;
    mine.settings.email = "owner@example.com";
    const theirs = clone(seed);
    theirs.settings.heroSub = "New default sub";
    const { db } = mergeDB(seed, mine, theirs, "t");
    expect(db.packages.find((p) => p.id === "basic")!.price).toBe(18000);
    expect(db.settings.email).toBe("owner@example.com");
    expect(db.settings.heroSub).toBe("New default sub");
    expect(db.settings.whatsapp).toBe("919873721207");
  });

  it("flags a conflict instead of overwriting when both sides changed a field", () => {
    const mine = clone(seed);
    proj(mine, "pf-bmw").summary = "Mine";
    const theirs = clone(seed);
    proj(theirs, "pf-bmw").summary = "Update";
    const { db, conflicts } = mergeDB(seed, mine, theirs, "t");
    expect(proj(db, "pf-bmw").summary).toBe("Mine");
    expect(conflicts).toHaveLength(1);
    expect(proj(acceptTheirs(db, conflicts[0]!), "pf-bmw").summary).toBe("Update");
  });

  it("adds new default projects without duplicates and keeps owner-added ones and media", () => {
    const mine = clone(seed);
    mine.projects.push({ ...clone(proj(seed, "pf-bmw")), id: "own-1", slug: "own" });
    mine.media.push({ id: "m1", name: "a.jpg", type: "image", size: 1, url: "data:x", persisted: true, createdAt: "x" });
    const theirs = clone(seed);
    theirs.projects.push({ ...clone(proj(seed, "pf-bmw")), id: "new-1", slug: "new" });
    const { db } = mergeDB(seed, mine, theirs, "t");
    expect(db.projects).toHaveLength(29);
    expect(db.projects.filter((p) => p.id === "pf-bmw")).toHaveLength(1);
    expect(db.media.map((m) => m.id)).toEqual(["m1"]);
  });

  it("keeps a project the owner deleted deleted", () => {
    const mine = clone(seed);
    mine.projects = mine.projects.filter((p) => p.id !== "pf-bmw");
    const { db } = mergeDB(seed, mine, seed, "t");
    expect(db.projects.some((p) => p.id === "pf-bmw")).toBe(false);
  });
});
