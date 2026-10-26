import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { update, uid } from "@/data/store";
import type { MediaItem } from "@/data/types";
import { cn } from "@/lib/utils";

export const aInput = "w-full rounded-md border border-ivory/15 bg-midnight px-3 py-2 text-sm focus:border-gold focus:outline-none";
export const aBtn = "inline-flex items-center gap-2 rounded-md bg-ivory px-3.5 py-2 text-sm font-semibold text-midnight hover:bg-gold disabled:opacity-40";
export const aBtnGhost = "inline-flex items-center gap-2 rounded-md border border-ivory/15 px-3 py-2 text-sm hover:border-gold hover:text-gold disabled:opacity-40";

export function PageHead({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ivory/10 pb-6">
      <div>
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        {desc && <p className="mt-2 max-w-xl text-sm text-ivory/60">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function AField({ label, children, className, hint }: { label: string; children: ReactNode; className?: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ivory/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-grey">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-gold" : "bg-charcoal")}>
      <span className={cn("absolute left-0 top-0.5 h-5 w-5 rounded-full bg-ivory transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export function OrderButtons({ onMove, first, last }: { onMove: (d: -1 | 1) => void; first: boolean; last: boolean }) {
  return (
    <span className="inline-flex gap-1">
      <button type="button" disabled={first} onClick={() => onMove(-1)} className="rounded p-1 hover:bg-charcoal disabled:opacity-20" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" disabled={last} onClick={() => onMove(1)} className="rounded p-1 hover:bg-charcoal disabled:opacity-20" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
    </span>
  );
}

const MAX_IMAGE = 1.5 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;

/**
 * Demo upload: images become data URLs saved in this browser; videos become session-only blob URLs.
 * Replace with a Hostinger upload endpoint in production.
 */
export function readUpload(file: File, onProgress: (p: number) => void): Promise<MediaItem> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) return Promise.reject(new Error("Only images and MP4/WebM videos are supported."));
  if (isVideo && !["video/mp4", "video/webm"].includes(file.type)) return Promise.reject(new Error("Please use MP4 or WebM video."));
  if (isImage && file.size > MAX_IMAGE) return Promise.reject(new Error("Images must be under 1.5 MB in demo mode."));
  if (isVideo && file.size > MAX_VIDEO) return Promise.reject(new Error("Videos must be under 200 MB."));
  const base = { id: uid(), name: file.name, size: file.size, createdAt: new Date().toISOString() };
  if (isVideo) {
    onProgress(100);
    return Promise.resolve({ ...base, type: "video", url: URL.createObjectURL(file), persisted: false });
  }
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    r.onerror = () => rej(new Error("Could not read file."));
    r.onload = () => {
      onProgress(100);
      res({ ...base, type: "image", url: String(r.result), persisted: true });
    };
    r.readAsDataURL(file);
  });
}

export function addMedia(item: MediaItem) {
  const ok = update((d) => ({ ...d, media: [item, ...d.media] }));
  if (!ok) toast.error("Browser storage is full — this file will disappear on refresh.");
}

export function UploadButton({ accept, multiple, onDone, label = "Upload" }: { accept: string; multiple?: boolean; onDone: (items: MediaItem[]) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    const out: MediaItem[] = [];
    for (const f of Array.from(files)) {
      try {
        setProgress(0);
        const item = await readUpload(f, setProgress);
        addMedia(item);
        out.push(item);
      } catch (e) {
        toast.error(`${f.name}: ${(e as Error).message}`);
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
    if (out.length) onDone(out);
  };
  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={() => input.current?.click()} className={aBtnGhost}><Upload className="h-4 w-4" /> {label}</button>
      <input ref={input} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handle(e.target.files)} />
      {progress !== null && (
        <span className="flex items-center gap-2 text-xs text-grey">
          <span className="h-1 w-24 overflow-hidden rounded bg-charcoal"><span className="block h-full bg-gold transition-all" style={{ width: `${progress}%` }} /></span>
          {progress}%
        </span>
      )}
    </span>
  );
}

export const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
