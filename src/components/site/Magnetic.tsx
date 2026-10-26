import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kept for compatibility only: buttons never move toward the cursor (owner rejected magnetic behaviour).
 * Renders children unchanged.
 */
export function Magnetic({ children, className }: { children: ReactNode; className?: string; strength?: number }) {
  return <span className={cn("inline-block", className)}>{children}</span>;
}

/** Masked sliding label (Animation B). Button width is fixed by the first copy. */
export function SlideLabel({ children }: { children: string }) {
  return (
    <span className="btn-label">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}

/* Reusable variants — styles live in src/styles.css (.btn system). */
export const btnPrimary = "btn btn-md btn-primary";
export const btnGhost = "btn btn-md btn-outline";
export const btnWhatsApp = "btn btn-md btn-whatsapp";
export const btnLarge = "btn btn-lg btn-primary btn-sheen shadow-deep";
export const btnLargeGhost = "btn btn-lg btn-whatsapp";
