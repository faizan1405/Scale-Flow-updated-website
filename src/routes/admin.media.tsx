import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Film, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { byOrder, moveItem, uid, update, useDB } from "@/data/store";
import type { MediaItem, Video } from "@/data/types";
import { aBtn, AField, aInput, fmtSize, OrderButtons, PageHead, Toggle, UploadButton } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/media")({ component: Media });

function Media() {
  const db = useDB();
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const inUse = (url: string) =>
    db.projects.some((p) => p.coverImage === url || p.screenshots.includes(url) || p.mobileScreenshots.includes(url) || p.videoUrl === url) ||
    db.videos.some((v) => v.src === url || v.thumbnail === url) ||
    db.settings.showreelUrl === url;
  const remove = (m: MediaItem) => {
    if (inUse(m.url)) { toast.error("This file is in use. Remove it from its project or video first."); return; }
    if (!confirm(`Delete ${m.name}?`)) return;
    update((d) => ({ ...d, media: d.media.filter((x) => x.id !== m.id) }));
  };
  const videos = [...db.videos].sort(byOrder);
  const setVideo = (id: string, patch: Partial<Video>) => update((d) => ({ ...d, videos: d.videos.map((v) => (v.id === id ? { ...v, ...patch, sample: false, updatedAt: new Date().toISOString() } : v)) }));

  return (
    <>
      <PageHead title="Media & videos" desc="Images are saved in this browser (max 1.5 MB). Videos (MP4/WebM) play for this session only until Hostinger storage is connected." action={<UploadButton accept="image/*,video/mp4,video/webm" multiple onDone={(m) => toast.success(`${m.length} file(s) uploaded`)} />} />

      {db.media.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ivory/15 p-10 text-center text-sm text-grey">No media uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {db.media.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-lg border border-ivory/10">
              <button onClick={() => setPreview(m)} className="block aspect-video w-full bg-charcoal" aria-label={`Preview ${m.name}`}>
                {m.type === "image" ? <img src={m.url} alt={m.name} className="h-full w-full object-cover" /> : <Film className="mx-auto h-6 w-6 text-gold" />}
              </button>
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="min-w-0">
                  <p className="truncate text-xs">{m.name}</p>
                  <p className="text-[10px] text-grey">{fmtSize(m.size)} · {m.persisted ? "saved" : "session only"}</p>
                </div>
                <button onClick={() => remove(m)} className="rounded p-1 text-coral hover:bg-charcoal" aria-label={`Delete ${m.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 mt-14 flex items-center justify-between">
        <h2 className="font-display text-3xl">Video gallery</h2>
        <button
          className={aBtn}
          onClick={() => update((d) => ({ ...d, videos: [...d.videos, { id: uid(), title: "New video", description: "", featured: false, published: false, order: d.videos.length + 1, sample: false, updatedAt: new Date().toISOString() }] }))}
        >
          <Plus className="h-4 w-4" /> Add video
        </button>
      </div>
      <ul className="space-y-3">
        {videos.map((v, i) => (
          <li key={v.id} className="grid gap-4 rounded-lg border border-ivory/10 p-4 md:grid-cols-[auto_1fr_1fr_auto]">
            <OrderButtons first={i === 0} last={i === videos.length - 1} onMove={(dir) => update((d) => ({ ...d, videos: moveItem(d.videos, v.id, dir) }))} />
            <div className="space-y-3">
              <AField label="Title"><input className={aInput} value={v.title} onChange={(e) => setVideo(v.id, { title: e.target.value })} /></AField>
              <AField label="Description"><textarea rows={2} className={aInput} value={v.description} onChange={(e) => setVideo(v.id, { description: e.target.value })} /></AField>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <AField label="Project">
                  <select className={aInput} value={v.projectId ?? ""} onChange={(e) => setVideo(v.id, { projectId: e.target.value || undefined })}>
                    <option value="">None</option>
                    {db.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </AField>
                <AField label="Category">
                  <select className={aInput} value={v.categoryId ?? ""} onChange={(e) => setVideo(v.id, { categoryId: e.target.value || undefined })}>
                    <option value="">None</option>
                    {db.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </AField>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <UploadButton accept="video/mp4,video/webm" label={v.src ? "Replace video" : "Upload video"} onDone={(ms) => ms[0] && setVideo(v.id, { src: ms[0].url })} />
                <UploadButton accept="image/*" label={v.thumbnail ? "Replace thumbnail" : "Thumbnail"} onDone={(ms) => ms[0] && setVideo(v.id, { thumbnail: ms[0].url })} />
                <span className={cn(v.src ? "text-gold" : "text-grey")}>{v.src ? "Video attached" : "No video"}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 md:flex-col md:items-end">
              <label className="flex items-center gap-2 text-xs">Published <Toggle label="Published" checked={v.published} onChange={(x) => setVideo(v.id, { published: x })} /></label>
              <button onClick={() => setVideo(v.id, { featured: !v.featured })} className={cn("flex items-center gap-1 text-xs", v.featured ? "text-gold" : "text-grey")} aria-pressed={v.featured}><Star className={cn("h-4 w-4", v.featured && "fill-current")} /> Featured</button>
              <button onClick={() => confirm(`Delete “${v.title}”?`) && update((d) => ({ ...d, videos: d.videos.filter((x) => x.id !== v.id) }))} className="rounded p-1 text-coral hover:bg-charcoal" aria-label={`Delete ${v.title}`}><Trash2 className="h-4 w-4" /></button>
              {v.sample && <span className="rounded-full border border-coral/40 px-2 py-0.5 text-[10px] text-coral">Sample</span>}
            </div>
          </li>
        ))}
      </ul>

      {preview && (
        <div role="dialog" aria-modal="true" aria-label={preview.name} className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/90 p-6" onClick={() => setPreview(null)}>
          <div className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {preview.type === "image" ? <img src={preview.url} alt={preview.name} className="max-h-[80vh] rounded" /> : <video src={preview.url} controls className="max-h-[80vh] rounded" />}
            <button onClick={() => setPreview(null)} className={aBtn + " mt-4"}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
