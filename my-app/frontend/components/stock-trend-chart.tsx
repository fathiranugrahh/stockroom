"use client";

import type { StockTrendPoint } from "@/lib/api";

const CHART_HEIGHT = 150;

export function StockTrendChart({ data }: { data: StockTrendPoint[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.in, d.out)));
  const totalIn = data.reduce((s, d) => s + d.in, 0);
  const totalOut = data.reduce((s, d) => s + d.out, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500" />
          <span className="text-muted-foreground">In</span>
          <span className="font-semibold text-emerald-400">{totalIn}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-rose-500" />
          <span className="text-muted-foreground">Out</span>
          <span className="font-semibold text-rose-400">{totalOut}</span>
        </span>
      </div>

      <div
        className="flex items-end gap-1.5 overflow-x-auto"
        style={{ height: CHART_HEIGHT }}
      >
        {data.map((d) => {
          const usable = CHART_HEIGHT - 22;
          const inH = Math.round((d.in / max) * usable);
          const outH = Math.round((d.out / max) * usable);
          const label = d.date.slice(5); // MM-DD
          return (
            <div
              key={d.date}
              className="group flex min-w-7 flex-1 flex-col items-center justify-end gap-1.5"
              title={`${d.date} · in ${d.in} · out ${d.out}`}
            >
              <div className="flex h-full w-full items-end justify-center gap-0.5">
                <div
                  className="w-1/2 max-w-3 rounded-t-sm bg-emerald-500/80 transition-all group-hover:bg-emerald-400"
                  style={{ height: Math.max(d.in > 0 ? 3 : 0, inH) }}
                />
                <div
                  className="w-1/2 max-w-3 rounded-t-sm bg-rose-500/80 transition-all group-hover:bg-rose-400"
                  style={{ height: Math.max(d.out > 0 ? 3 : 0, outH) }}
                />
              </div>
              <span className="text-[10px] whitespace-nowrap text-muted-foreground/70">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
