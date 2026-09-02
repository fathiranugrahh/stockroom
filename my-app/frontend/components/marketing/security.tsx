import { Lock, RotateCcw, ShieldCheck } from "lucide-react";

import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

const BENEFITS = [
  {
    title: "Every change has a history.",
    tech: "AUDIT LOG · WHO / WHAT / WHEN",
    figure: (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex h-5 items-center rounded-full border border-violet-700/25 bg-violet-700/10 px-2 font-mono font-medium text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-400">
          ADMIN
        </span>
        <span className="text-muted-foreground">
          updated <span className="text-foreground">Wireless Mouse</span>
        </span>
        <span className="ml-auto font-mono text-muted-foreground/70">2m</span>
      </div>
    ),
  },
  {
    title: "Only the right people can make changes.",
    tech: "ROLE-BASED ACCESS · ADMIN / STAFF",
    figure: (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex h-5 items-center rounded-full border border-violet-700/25 bg-violet-700/10 px-2 font-mono font-medium text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-400">
          ADMIN
        </span>
        <span className="inline-flex h-5 items-center rounded-full border border-sky-700/25 bg-sky-700/10 px-2 font-mono font-medium text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-400">
          STAFF
        </span>
        <Lock className="ml-auto size-3.5 text-muted-foreground" />
      </div>
    ),
  },
  {
    title: "Deleted doesn't mean lost.",
    tech: "SOFT DELETE · RECOVERABLE",
    figure: (
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground line-through decoration-muted-foreground/40">
          Old Supplier Co.
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
          <RotateCcw className="size-3" /> Recoverable
        </span>
      </div>
    ),
  },
  {
    title: "Sign-ins stay protected.",
    tech: "SIGNED SESSIONS · HASHED PASSWORDS",
    figure: (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
        <span className="font-mono">jwt · argon2</span>
      </div>
    ),
  },
];

export function Security() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <Eyebrow number="04">Trust by design</Eyebrow>
          <h2 className="mt-5 text-3xl leading-[1.05] font-semibold tracking-tight sm:text-4xl">
            Numbers you can defend.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Good inventory data is only useful if you can trust it. The system
            keeps your records safe and makes every change accountable.
          </p>
        </Reveal>

        <div>
          {BENEFITS.map((b, i) => (
            <Reveal
              key={b.title}
              delay={i * 80}
              className="border-t border-border py-6 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-sm">
                  <h3 className="text-lg font-medium tracking-tight">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
                    {b.tech}
                  </p>
                </div>
                <div className="w-full max-w-[16rem] rounded-lg border border-border bg-white px-3 py-2.5 shadow-sm dark:bg-card">
                  {b.figure}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
