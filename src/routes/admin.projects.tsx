import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { byOrder, moveItem, uid, update, useDB } from "@/data/store";
import { inCategory } from "@/data/portfolio-utils";
import type { MockLayout, Project, ProjectKind } from "@/data/types";
import { aBtn, aBtnGhost, AField, aInput, OrderButtons, PageHead, slugify, Toggle, UploadButton } from "@/components/admin/kit";
import { SiteMock } from "@/components/site/SiteMock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/projects")({ component: Projects });

const blank = (order: number, categoryId: string): Project => ({
  id: uid(), slug: "", title: "", client: "", categoryId, summary: "", overview: "", context: "", goals: "", approach: "",
  capabilities: [], deliverables: [], tags: [], palette: { bg: "#151D2B", surface: "#242832", fg: "#F4F1EA", accent: "#C7A574" }, layout: "editorial",
  screenshots: [], mobileScreenshots: [], extraCategoryIds: [], kind: "unverified", featured: false, published: false, order, sample: false, updatedAt: new Date().toISOString(),
});

function Projects() {
  const db = useDB();
  const [editing, setEditing] = useState<Project | null>(null);
  const list = [...db.projects].sort(byOrder);
  const patch = (id: string, p: Partial<Project>) => update((d) => ({ ...d, projects: d.projects.map((x) => (x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x)) }));
  const descCat = db.categories.find((c) => c.slug === "descriptive" || c.id === "c-descriptive");
  const descId = descCat?.id ?? "c-descriptive";

  return (
    <>
      <PageHead title="Projects" desc="Set each project's type (Client work, Concept or Demo) once confirmed. Unconfirmed projects show no type label to visitors." action={<button className={aBtn} onClick={() => setEditing(blank(db.projects.length + 1, db.categories.find((c) => c.slug !== "descriptive")?.id ?? db.categories[0]?.id ?? "")) }><Plus className="h-4 w-4" /> New project</button>} />
      <ul className="space-y-2">
        {list.map((p, i) => {
          const isDesc = inCategory(p, descId);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-ivory/10 p-3">
              <OrderButtons first={i === 0} last={i === list.length - 1} onMove={(dir) => update((d) => ({ ...d, projects: moveItem(d.projects, p.id, dir) }))} />
              <div className="w-24 overflow-hidden rounded"><SiteMock project={p} chrome={false} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.title || "Untitled"} {p.sample && <span className="ml-2 rounded-full border border-coral/40 px-2 py-0.5 text-[10px] text-coral">Sample</span>}</p>
                <p className="text-xs text-grey">/work/{p.slug} · {db.categories.find((c) => c.id === p.categoryId)?.name ?? "No category"} · {p.kind && p.kind !== "unverified" ? p.kind : "type not confirmed"}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextExtras = isDesc
                    ? (p.extraCategoryIds ?? []).filter((id) => id !== descId)
                    : Array.from(new Set([...(p.extraCategoryIds ?? []), descId]));
                  patch(p.id, { extraCategoryIds: nextExtras });
                  toast.success(isDesc ? `Removed “${p.title}” from Descriptive` : `Added “${p.title}” to Descriptive`);
                }}
                aria-pressed={isDesc}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors cursor-pointer",
                  isDesc
                    ? "border-gold bg-gold/15 text-gold font-medium"
                    : "border-ivory/15 text-grey hover:border-ivory/30 hover:text-ivory"
                )}
                title={isDesc ? "Included in Descriptive category (click to remove)" : "Click to add to Descriptive category"}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", isDesc ? "bg-gold" : "bg-grey/40")} />
                Descriptive
              </button>
              <label className="flex items-center gap-2 text-xs">Published <Toggle label="Published" checked={p.published} onChange={(v) => patch(p.id, { published: v })} /></label>
              <button onClick={() => patch(p.id, { featured: !p.featured })} aria-pressed={p.featured} className={cn("flex items-center gap-1 text-xs", p.featured ? "text-gold" : "text-grey")}><Star className={cn("h-4 w-4", p.featured && "fill-current")} /> Featured</button>
              <button onClick={() => setEditing(p)} className={aBtnGhost}><Pencil className="h-4 w-4" /> Edit</button>
              <button onClick={() => confirm(`Delete “${p.title}”? This cannot be undone.`) && update((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== p.id) }))} className="rounded p-2 text-coral hover:bg-charcoal" aria-label={`Delete ${p.title}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          );
        })}
      </ul>
      {editing && <Editor initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function Editor({ initial, onClose }: { initial: Project; onClose: () => void }) {
  const db = useDB();
  const [p, setP] = useState<Project>(initial);
  const isNew = !db.projects.some((x) => x.id === p.id);
  const descCat = db.categories.find((c) => c.slug === "descriptive" || c.name === "Descriptive");
  const descId = descCat?.id ?? "c-descriptive";
  const isDesc = (p.extraCategoryIds ?? []).includes(descId) || p.categoryId === descId;
  const t = (k: keyof Project) => ({ value: (p[k] as string) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setP({ ...p, [k]: e.target.value }) });
  const list = (k: "capabilities" | "deliverables" | "tags") => ({ value: p[k].join(", "), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }) });

  const save = () => {
    const slug = slugify(p.slug || p.title);
    if (!p.title.trim()) { toast.error("Title is required"); return; }
    if (db.projects.some((x) => x.slug === slug && x.id !== p.id)) { toast.error("Another project already uses that slug"); return; }
    if (p.liveUrl && !/^https?:\/\//.test(p.liveUrl)) { toast.error("Live URL must start with https://"); return; }
    const next = { ...p, slug, sample: false, updatedAt: new Date().toISOString() };
    const ok = update((d) => ({ ...d, projects: isNew ? [...d.projects, next] : d.projects.map((x) => (x.id === p.id ? next : x)) }));
    toast[ok ? "success" : "error"](ok ? "Project saved" : "Saved for now, but browser storage is full");
    onClose();
  };

  const Thumbs = ({ k }: { k: "screenshots" | "mobileScreenshots" }) => (
    <div className="flex flex-wrap gap-2">
      {p[k].map((src, i) => (
        <span key={i} className="relative">
          <img src={src} alt="" className="h-16 w-24 rounded object-cover" />
          <button type="button" onClick={() => setP({ ...p, [k]: p[k].filter((_, j) => j !== i) })} className="absolute -right-1.5 -top-1.5 rounded-full bg-coral p-0.5 text-midnight" aria-label="Remove image"><X className="h-3 w-3" /></button>
        </span>
      ))}
      <UploadButton accept="image/*" multiple label="Add" onDone={(m) => setP((s) => ({ ...s, [k]: [...s[k], ...m.map((x) => x.url)] }))} />
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit project" className="fixed inset-0 z-50 flex justify-end bg-midnight/80 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-ivory/10 bg-background p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-3xl">{isNew ? "New project" : "Edit project"}</h2>
          <button onClick={onClose} className="rounded p-2 hover:bg-charcoal" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AField label="Title *"><input className={aInput} {...t("title")} /></AField>
          <AField label="Slug" hint={`/work/${slugify(p.slug || p.title)}`}><input className={aInput} {...t("slug")} /></AField>
          <AField label="Client"><input className={aInput} {...t("client")} /></AField>
          <AField label="Category">
            <select className={aInput} {...t("categoryId")}>
              {db.categories
                .filter((c) => c.slug !== "descriptive" && c.id !== "c-descriptive")
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </AField>
          <AField label="Descriptive Category" hint="Highlight this project under the public “Descriptive” filter.">
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <Toggle
                label="In Descriptive category"
                checked={isDesc}
                onChange={(v) => {
                  setP({
                    ...p,
                    extraCategoryIds: v
                      ? Array.from(new Set([...(p.extraCategoryIds ?? []), descId]))
                      : (p.extraCategoryIds ?? []).filter((id) => id !== descId),
                  });
                }}
              />
              <span className="text-xs text-ivory/80 font-medium">
                {isDesc ? "Included in Descriptive filter" : "Not in Descriptive filter"}
              </span>
            </label>
          </AField>
          <AField label="Project type" hint="Only choose Client work when it is confirmed.">
            <select className={aInput} value={p.kind ?? "unverified"} onChange={(e) => setP({ ...p, kind: e.target.value as ProjectKind })}>
              <option value="unverified">Not confirmed (no label)</option>
              <option value="client">Client work</option>
              <option value="concept">Concept</option>
              <option value="demo">Demo</option>
            </select>
          </AField>
          <AField label="Also show under">
            <div className="flex flex-wrap gap-2">
              {db.categories
                .filter((c) => c.id !== p.categoryId && c.slug !== "descriptive" && c.id !== "c-descriptive")
                .map((c) => {
                  const on = (p.extraCategoryIds ?? []).includes(c.id);
                  return (
                    <button key={c.id} type="button" aria-pressed={on} onClick={() => setP({ ...p, extraCategoryIds: on ? (p.extraCategoryIds ?? []).filter((x) => x !== c.id) : [...(p.extraCategoryIds ?? []), c.id] })} className={cn("rounded-full border px-3 py-1 text-xs", on ? "border-gold text-gold" : "border-ivory/15 text-grey")}>
                      {c.name}
                    </button>
                  );
                })}
            </div>
          </AField>
          <AField label="Short summary" className="md:col-span-2"><input className={aInput} {...t("summary")} /></AField>
          <AField label="Overview" className="md:col-span-2"><textarea rows={3} className={aInput} {...t("overview")} /></AField>
          <AField label="Business context"><textarea rows={3} className={aInput} {...t("context")} /></AField>
          <AField label="Goals"><textarea rows={3} className={aInput} {...t("goals")} /></AField>
          <AField label="Design approach" className="md:col-span-2"><textarea rows={2} className={aInput} {...t("approach")} /></AField>
          <AField label="Capabilities (comma separated)"><input className={aInput} {...list("capabilities")} /></AField>
          <AField label="Delivered (comma separated)"><input className={aInput} {...list("deliverables")} /></AField>
          <AField label="Tags (comma separated)"><input className={aInput} {...list("tags")} /></AField>
          <AField label="Live website URL"><input className={aInput} {...t("liveUrl")} placeholder="https://" /></AField>
          <AField label="Placeholder style" hint="Used only when no screenshot is uploaded.">
            <select className={aInput} value={p.layout} onChange={(e) => setP({ ...p, layout: e.target.value as MockLayout })}>
              {["editorial", "shop", "studio", "app", "catalogue", "landing"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </AField>
          <AField label="Accent colours">
            <div className="flex gap-2">
              {(["bg", "surface", "fg", "accent"] as const).map((k) => (
                <input key={k} type="color" aria-label={`${k} colour`} value={p.palette[k]} onChange={(e) => setP({ ...p, palette: { ...p.palette, [k]: e.target.value } })} className="h-9 w-12 cursor-pointer rounded border border-ivory/15 bg-transparent" />
              ))}
            </div>
          </AField>
          <AField label="Ambient glow" hint="Soft light behind this project on the homepage. Leave as is to use the accent colour.">
            <div className="flex items-center gap-3">
              <input type="color" aria-label="Ambient glow colour" value={p.ambient ?? p.palette.accent} onChange={(e) => setP({ ...p, ambient: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-ivory/15 bg-transparent" />
              {p.ambient && <button type="button" onClick={() => setP({ ...p, ambient: undefined })} className="text-xs text-grey underline">Use accent</button>}
            </div>
          </AField>
        </div>

        <div className="mt-8 space-y-5 border-t border-ivory/10 pt-6">
          <AField label="Cover image">
            <div className="flex items-center gap-3">
              {p.coverImage && <img src={p.coverImage} alt="" className="h-16 w-24 rounded object-cover" />}
              <UploadButton accept="image/*" label={p.coverImage ? "Replace" : "Upload"} onDone={(ms) => ms[0] && setP((s) => ({ ...s, coverImage: ms[0]!.url }))} />
              {p.coverImage && <button type="button" className="text-xs text-coral" onClick={() => setP({ ...p, coverImage: undefined })}>Remove</button>}
            </div>
          </AField>
          <AField label="Desktop screenshots"><Thumbs k="screenshots" /></AField>
          <AField label="Mobile screenshots"><Thumbs k="mobileScreenshots" /></AField>
          <AField label="Preview video (MP4/WebM)">
            <div className="flex items-center gap-3">
              <UploadButton accept="video/mp4,video/webm" label={p.videoUrl ? "Replace" : "Upload"} onDone={(ms) => ms[0] && setP((s) => ({ ...s, videoUrl: ms[0]!.url }))} />
              {p.videoUrl && <button type="button" className="text-xs text-coral" onClick={() => setP({ ...p, videoUrl: undefined })}>Remove video</button>}
            </div>
          </AField>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">Published <Toggle label="Published" checked={p.published} onChange={(v) => setP({ ...p, published: v })} /></label>
            <label className="flex items-center gap-2 text-sm">Featured <Toggle label="Featured" checked={p.featured} onChange={(v) => setP({ ...p, featured: v })} /></label>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-8 flex justify-end gap-2 border-t border-ivory/10 bg-background px-6 py-4 md:-mx-8 md:px-8">
          <button onClick={onClose} className={aBtnGhost}>Cancel</button>
          <button onClick={save} className={aBtn}>Save project</button>
        </div>
      </div>
    </div>
  );
}
