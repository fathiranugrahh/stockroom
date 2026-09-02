import { cn } from "@/lib/utils";
import { Container, Ruled, Tag } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";
import { previewProducts } from "@/components/marketing/preview-data";

// Four representative counts — the number is the hero.
const CELLS = previewProducts.slice(0, 4);

export function LedgerStrip() {
  return (
    <section className="relative border-y border-border bg-white/70 py-16 backdrop-blur dark:bg-background/70 md:py-20">
      <Ruled fade="center" size={44} />
      <Container>
        <Reveal className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Tag>The count, at a glance</Tag>
          <p className="max-w-sm text-sm text-muted-foreground">
            Every product carries an exact, current quantity — flagged the
            moment it drops below its minimum.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border shadow-[0_22px_70px_-54px_rgba(15,23,42,0.75)] lg:grid-cols-4">
          {CELLS.map((p, i) => {
            const low = p.stock <= p.minStock;
            return (
              <Reveal
                key={p.id}
                delay={i * 80}
                className="flex flex-col justify-between gap-6 bg-white p-6 dark:bg-card/75 dark:backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                    {p.sku}
                  </span>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      low ? "bg-amber-400" : "bg-emerald-400",
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "font-mono text-6xl leading-none font-semibold tracking-tighter tabular-nums lg:text-7xl",
                        low ? "text-amber-700 dark:text-amber-400" : "text-foreground",
                      )}
                    >
                      {p.stock}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      units
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-medium">{p.name}</p>
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-[11px] tracking-wide uppercase",
                      low
                        ? "text-amber-700 dark:text-amber-400/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {low ? `Low · min ${p.minStock}` : "Healthy"}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
