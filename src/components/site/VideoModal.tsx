import { useEffect, useRef } from "react";
import { Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fullscreen-capable player. The <video> element only mounts while open, so nothing preloads. */
export function VideoModal({ open, onClose, src, poster, title, footer }: { open: boolean; onClose: () => void; src?: string | undefined; poster?: string | undefined; title: string; footer?: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[60] flex items-center justify-center bg-midnight/95 p-4 backdrop-blur-sm transition-opacity duration-500 md:p-10", open ? "opacity-100" : "pointer-events-none opacity-0")}
      onClick={onClose}
    >
      <div className={cn("w-full max-w-6xl transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]", open ? "scale-100" : "scale-95")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-display text-2xl md:text-3xl">{title}</p>
          <button ref={closeRef} onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold" aria-label="Close video">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-lg bg-navy">
          {open && src ? (
            <video src={src} poster={poster} controls autoPlay playsInline className="h-full w-full bg-midnight" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <Film className="h-8 w-8 text-gold" />
              <p className="font-display text-3xl">Video coming soon</p>
              <p className="max-w-sm text-sm text-grey">No video has been uploaded for this yet. It can be added from the admin dashboard.</p>
            </div>
          )}
        </div>
        {footer && <div className="mt-4 flex flex-wrap gap-3">{footer}</div>}
      </div>
    </div>
  );
}
