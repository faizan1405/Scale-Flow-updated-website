import { Fragment, useState } from "react";
import type { Project } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Coded website preview used until real screenshots are uploaded.
 * Colours come from the project's own palette data (project identity), not the site theme.
 */
export function SiteMock({
  project,
  variant = "desktop",
  image,
  className,
  chrome = true,
}: {
  project: Project;
  variant?: "desktop" | "mobile";
  image?: string | undefined;
  className?: string | undefined;
  chrome?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = image ?? (variant === "desktop" ? project.coverImage : project.mobileScreenshots[0]);
  const { bg, surface, fg } = project.palette;
  const mobile = variant === "mobile";

  return (
    <div className={cn("relative overflow-hidden", mobile ? "aspect-[9/19]" : "aspect-[16/10]", className)} style={{ background: bg, color: fg }}>
      {chrome && !mobile && (
        <div className="absolute inset-x-0 top-0 z-10 flex h-[6%] min-h-3 items-center gap-[1%] px-[2%]" style={{ background: surface }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="aspect-square h-[35%] rounded-full" style={{ background: fg, opacity: 0.25 }} />
          ))}
          <span className="ml-[3%] h-[40%] w-[30%] rounded-full" style={{ background: fg, opacity: 0.08 }} />
        </div>
      )}
      {src && !failed ? (
        <img src={src} alt={`${project.title} ${variant} screenshot`} loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("absolute inset-0 h-full w-full object-cover object-top transition-[object-position] duration-[2.4s] ease-out motion-reduce:transition-none", !mobile && "group-hover:object-[50%_35%]", chrome && !mobile && "top-[6%] h-[94%]")} />
      ) : (
        <div className={cn("absolute inset-0 flex flex-col", chrome && !mobile && "top-[6%]")} style={{ containerType: "inline-size" }}>
          <MockBody project={project} mobile={mobile} />
        </div>
      )}
      {failed && <span className="absolute bottom-2 left-2 label-mono opacity-60">Image unavailable</span>}
      <span className="sr-only">{`Preview of ${project.title}${src ? "" : " (coded sample visual)"}`}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: `inset 0 0 0 1px ${fg}14` }} />
    </div>
  );
}

function MockBody({ project, mobile }: { project: Project; mobile: boolean }) {
  const { surface, fg, accent } = project.palette;
  const words = project.title.split(" ");
  const nav = (
    <div className="flex items-center justify-between px-[6cqw] py-[3cqw]">
      <span style={{ fontFamily: "var(--font-display)", fontSize: mobile ? "7cqw" : "2.4cqw" }}>{words[0]}</span>
      {!mobile ? (
        <div className="flex gap-[2.5cqw]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-[0.5cqw] w-[4cqw] rounded-full" style={{ background: fg, opacity: 0.35 }} />
          ))}
        </div>
      ) : (
        <span className="h-[1cqw] w-[7cqw]" style={{ background: fg, opacity: 0.5 }} />
      )}
    </div>
  );
  const head = (size: number) => (
    <div style={{ fontFamily: "var(--font-display)", fontSize: `${size}cqw`, lineHeight: 0.92 }}>
      {words.map((w, i) => (
        <div key={i} style={i === words.length - 1 ? { color: accent, fontStyle: "italic" } : undefined}>
          {w}
        </div>
      ))}
    </div>
  );
  const lines = (n: number, w = 60) => (
    <div className="flex flex-col gap-[1.2cqw]">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="h-[0.8cqw] rounded-full" style={{ width: `${w - i * 12}%`, background: fg, opacity: 0.2 }} />
      ))}
    </div>
  );
  const art = (cls: string, seed = 0) => (
    <div className={cn("relative overflow-hidden", cls)} style={{ background: surface }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`g${project.id}${seed}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={35 + seed * 18} cy={55 - seed * 6} r="42" fill={`url(#g${project.id}${seed})`} />
        <circle cx={70 - seed * 10} cy={40} r={14 + seed * 4} fill="none" stroke={fg} strokeOpacity="0.25" strokeWidth="0.4" />
        <rect x={52} y={60} width={30} height={0.4} fill={fg} opacity="0.3" />
      </svg>
    </div>
  );

  if (mobile) {
    return (
      <>
        {nav}
        <div className="px-[6cqw] pt-[6cqw]">{head(15)}</div>
        <div className="px-[6cqw] py-[5cqw]">{lines(3, 90)}</div>
        <div className="mx-[6cqw] mb-[5cqw] h-[8cqw] w-[40cqw] rounded-full" style={{ background: accent }} />
        {art("mx-[6cqw] flex-1 rounded-[3cqw] mb-[6cqw]", 1)}
      </>
    );
  }

  switch (project.layout) {
    case "shop":
      return (
        <>
          {nav}
          <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-[3cqw] px-[6cqw] pb-[4cqw]">
            <div className="flex flex-col justify-center gap-[3cqw]">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1cqw", color: accent, letterSpacing: "0.2em" }}>NEW COLLECTION</span>
              {head(6.5)}
              {lines(2)}
            </div>
            <div className="grid grid-cols-2 gap-[1.5cqw]">
              {[0, 1, 2, 3].map((i) => <Fragment key={i}>{art("rounded-[0.6cqw]", i % 3)}</Fragment>)}
            </div>
          </div>
        </>
      );
    case "editorial":
      return (
        <>
          {nav}
          <div className="px-[6cqw]">{head(9)}</div>
          <div className="mt-[3cqw] grid flex-1 grid-cols-3 gap-[1.5cqw] px-[6cqw] pb-[4cqw]">
            {art("col-span-2", 0)}
            <div className="flex flex-col justify-end">{lines(4, 90)}</div>
          </div>
        </>
      );
    case "studio":
      return (
        <>
          {nav}
          <div className="relative flex flex-1 items-center justify-center">
            <div className="absolute aspect-square w-[34cqw] rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${fg}, ${accent} 40%, ${surface} 75%)` }} />
            <div className="relative text-center mix-blend-difference" style={{ fontFamily: "var(--font-display)", fontSize: "10cqw" }}>
              {project.title}
            </div>
          </div>
        </>
      );
    case "app":
      return (
        <div className="grid flex-1 grid-cols-[18%_1fr]">
          <div className="flex flex-col gap-[2cqw] p-[2.5cqw]" style={{ background: surface }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.4cqw" }}>{words[0]}</span>
            {lines(6, 90)}
          </div>
          <div className="flex flex-col gap-[2cqw] p-[3cqw]">
            <div className="grid grid-cols-3 gap-[1.5cqw]">
              {["₹4.2L", "38", "12d"].map((v, i) => (
                <div key={v} className="rounded-[0.8cqw] p-[2cqw]" style={{ background: surface }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1cqw", opacity: 0.5 }}>METRIC 0{i + 1}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "4cqw", color: i === 0 ? accent : fg }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-1 items-end gap-[1cqw] rounded-[0.8cqw] p-[2cqw]" style={{ background: surface }}>
              {[40, 65, 50, 80, 58, 90, 72, 60, 85, 70].map((h, i) => (
                <span key={i} className="flex-1 rounded-t-[0.4cqw]" style={{ height: `${h}%`, background: i === 5 ? accent : fg, opacity: i === 5 ? 1 : 0.18 }} />
              ))}
            </div>
          </div>
        </div>
      );
    case "catalogue":
      return (
        <>
          {nav}
          <div className="flex items-end justify-between px-[6cqw] pb-[2cqw]">
            {head(5)}
            <span className="h-[3.5cqw] w-[25cqw] rounded-[0.5cqw]" style={{ background: surface }} />
          </div>
          <div className="grid flex-1 grid-cols-5 gap-[1.2cqw] px-[6cqw] pb-[4cqw]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[0.8cqw]">
                {art("flex-1 rounded-[0.4cqw]", i % 3)}
                <span className="h-[0.6cqw] w-2/3 rounded-full" style={{ background: fg, opacity: 0.3 }} />
              </div>
            ))}
          </div>
        </>
      );
    default:
      return (
        <>
          {nav}
          {art("absolute inset-x-0 bottom-0 top-[30%] opacity-70", 2)}
          <div className="relative flex flex-1 flex-col items-center justify-center gap-[3cqw] text-center">
            {head(8)}
            <span className="h-[4cqw] w-[18cqw] rounded-full" style={{ background: accent }} />
          </div>
        </>
      );
  }
}
