import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StockMovementType } from "@/lib/api";

const base =
  "inline-flex h-5 w-fit items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap [&>svg]:size-3";

export function MovementBadge({
  type,
  className,
}: {
  type: StockMovementType;
  className?: string;
}) {
  if (type === "IN") {
    return (
      <span
        className={cn(
          base,
          "border-emerald-700/25 bg-emerald-700/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
          className,
        )}
      >
        <ArrowDownRight />
        IN
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        "border-rose-700/25 bg-rose-700/10 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400",
        className,
      )}
    >
      <ArrowUpRight />
      OUT
    </span>
  );
}

export function LowStockBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        base,
        "border-amber-700/25 bg-amber-700/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400",
        className,
      )}
    >
      <AlertTriangle />
      Low
    </span>
  );
}
