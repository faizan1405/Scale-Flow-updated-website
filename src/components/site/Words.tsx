import { Fragment, type ElementType } from "react";
import { cn } from "@/lib/utils";

/** Splits text into masked words for staggered reveals. Use with data-reveal="words" or a GSAP timeline on [data-word]. */
export function Words({ text, as: Tag = "span", className, italicLast }: { text: string; as?: ElementType; className?: string; italicLast?: boolean }) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-word className={cn("inline-block will-change-transform", italicLast && i === words.length - 1 && "text-gold")}>
              {w}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
