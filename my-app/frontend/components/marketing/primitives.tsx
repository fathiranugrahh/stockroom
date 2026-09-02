import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-5 sm:px-7", className)}>
      {children}
    </div>
  );
}

/** Technical mono micro-label, e.g. "STOCK · UNITS". */
export function Tag({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] font-semibold text-[#49617f] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Section index marker: "02 / Live system". */
export function Eyebrow({
  number,
  children,
  className,
}: {
  number: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-mono text-xs font-bold text-[#1768e5]">
        {number}
      </span>
      <span className="h-px w-8 bg-[#1768e5]/25" />
      <Tag>{children}</Tag>
    </div>
  );
}

/**
 * Faint ruled "graph paper" backdrop — the measurement/precision motif.
 * Depth without shadows: structural hairlines that fade at the edges.
 */
export function Ruled({
  className,
  fade = "top",
  size = 56,
}: {
  className?: string;
  fade?: "top" | "center" | "bottom";
  size?: number;
}) {
  const mask =
    fade === "center"
      ? "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 78%)"
      : fade === "bottom"
        ? "linear-gradient(to top, black, transparent 70%)"
        : "radial-gradient(ellipse 90% 70% at 50% 0%, black, transparent 75%)";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

/** The signature: an oversized tabular numeral with a unit + label. */
export function BinMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 grid-cols-2 grid-rows-2 gap-0.5 rounded-md bg-[#1768e5] p-1.5 shadow-[0_5px_16px_rgba(23,104,229,0.24)]",
        className,
      )}
      aria-hidden
    >
      <span className="rounded-[2px] bg-white" />
      <span className="rounded-[2px] bg-white/45" />
      <span className="rounded-[2px] bg-white/45" />
      <span className="rounded-[2px] bg-[#ffd18d]" />
    </span>
  );
}
