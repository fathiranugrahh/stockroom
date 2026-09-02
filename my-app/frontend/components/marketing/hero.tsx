"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Boxes,
  CircleCheck,
  Clock3,
  Package,
  PackageCheck,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { Container, Tag } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

export function Hero() {
  const { status } = useAuth();
  const authed = status === "authenticated";

  return (
    <section className="relative isolate overflow-hidden border-b border-[#17213a]/8 bg-[#f6f5f1]">
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-[46%] bg-[#dfeaff]" />
      <div aria-hidden className="absolute bottom-0 left-0 -z-10 h-[58%] w-[38%] bg-[#fff0e5]" />

      <Container className="flex flex-col items-center pt-9 pb-6 text-center sm:pt-12">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-md border border-[#1768e5]/15 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#1768e5]" />
            <Tag>Built for growing inventory teams</Tag>
          </div>
        </Reveal>

        <Reveal delay={60} className="w-full">
          <div className="relative mx-auto mt-5 max-w-[940px] border border-dashed border-[#49617f]/25 px-4 py-5 sm:px-10 sm:py-6">
            <h1 className="mx-auto max-w-[16ch] text-[2.7rem] leading-[0.98] font-bold text-[#111827] text-balance sm:text-6xl lg:text-[5.5rem]">
              Stop guessing stock. Start controlling it.
            </h1>
            <div className="absolute -left-4 top-1/2 hidden -translate-x-full -translate-y-1/2 items-center gap-2 rounded-md border border-[#17213a]/10 bg-white p-3 text-left shadow-[0_10px_30px_rgba(31,41,55,0.10)] lg:flex">
              <span className="flex size-8 items-center justify-center rounded-md bg-[#fff2dc] text-[#d47a12]"><BellRing className="size-4" /></span>
              <span><strong className="block text-xs">3 items low</strong><span className="text-[11px] text-[#6b7688]">Ready to review</span></span>
            </div>
            <div className="absolute -right-4 top-1/2 hidden translate-x-full -translate-y-1/2 items-center gap-2 rounded-md border border-[#17213a]/10 bg-white p-3 text-left shadow-[0_10px_30px_rgba(31,41,55,0.10)] lg:flex">
              <span className="flex size-8 items-center justify-center rounded-md bg-[#e4f6ed] text-[#20875d]"><PackageCheck className="size-4" /></span>
              <span><strong className="block text-xs">Stock synced</strong><span className="text-[11px] text-[#6b7688]">Updated now</span></span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#52627a] sm:text-lg">
            See what is running low, record every stock movement, and keep your
            whole team working from one reliable source of truth.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={authed ? "/dashboard" : "/login"}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#1768e5] px-5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(23,104,229,0.22)] transition-[background-color,transform] duration-150 ease-out hover:bg-[#0f5bcd] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
            >
              {authed ? "Open dashboard" : "Start managing stock"}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#product"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-[#17213a]/12 bg-white/70 px-5 text-sm font-semibold text-[#25334d] transition-[background-color,transform] duration-150 ease-out hover:bg-white active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
            >
              See how it works
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={220} className="mt-7 w-full max-w-[1000px]">
          <div className="grid items-end gap-4 lg:grid-cols-[0.7fr_2.6fr_0.7fr]">
            <div className="hidden border border-dashed border-[#49617f]/25 bg-white/55 p-4 text-left lg:block">
              <ShoppingCart className="size-5 text-[#1768e5]" />
              <p className="mt-5 text-sm font-bold text-[#17213a]">Restock sooner</p>
              <p className="mt-1 text-xs leading-5 text-[#68758a]">Minimum-stock signals appear before shelves run empty.</p>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#17213a]/12 bg-white text-left shadow-[0_24px_70px_rgba(42,58,86,0.16)]">
              <div className="flex h-9 items-center justify-between border-b border-[#17213a]/8 bg-[#fbfcfe] px-3">
                <div className="flex gap-1.5"><span className="size-2 rounded-full bg-[#ffb6aa]" /><span className="size-2 rounded-full bg-[#ffd991]" /><span className="size-2 rounded-full bg-[#a8dfc3]" /></div>
                <span className="font-mono text-[9px] font-semibold text-[#7b8798]">STOCKROOM / OVERVIEW</span>
                <Clock3 className="size-3.5 text-[#9aa4b2]" />
              </div>
              <div className="grid grid-cols-[46px_1fr] sm:grid-cols-[112px_1fr]">
                <aside className="border-r border-[#17213a]/8 bg-[#f8fafc] p-2 sm:p-3">
                  <div className="flex size-7 items-center justify-center rounded-md bg-[#1768e5] text-white"><Boxes className="size-3.5" /></div>
                  <div className="mt-4 space-y-2">
                    {["Overview", "Products", "Movements", "Suppliers"].map((item, index) => (
                      <div key={item} className={`h-5 rounded-md ${index === 0 ? "bg-[#e7f0ff]" : "bg-transparent"}`}>
                        <span className="hidden px-2 text-[9px] leading-5 font-medium text-[#5b6a7e] sm:block">{item}</span>
                      </div>
                    ))}
                  </div>
                </aside>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between"><div><p className="text-xs font-bold text-[#17213a] sm:text-sm">Good morning, Alex</p><p className="mt-0.5 text-[9px] text-[#8490a0] sm:text-[10px]">Here is what needs attention today.</p></div><span className="rounded-md bg-[#e8f5ee] px-2 py-1 text-[9px] font-semibold text-[#20875d]">Live</span></div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[{ label: "Products", value: "150", icon: Package }, { label: "Low stock", value: "3", icon: TrendingDown }, { label: "Stock value", value: "Rp 48m", icon: CircleCheck }].map(({ label, value, icon: Icon }, index) => (
                      <div key={label} className={`rounded-md border p-2 ${index === 1 ? "border-[#f3c77b] bg-[#fff9ed]" : "border-[#17213a]/8 bg-white"}`}>
                        <Icon className={`size-3 ${index === 1 ? "text-[#d47a12]" : "text-[#1768e5]"}`} />
                        <p className="mt-2 text-xs font-bold text-[#17213a] sm:text-sm">{value}</p><p className="text-[8px] text-[#8490a0] sm:text-[9px]">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md border border-[#17213a]/8">
                    <div className="flex items-center justify-between border-b border-[#17213a]/8 px-2.5 py-2"><span className="text-[9px] font-bold text-[#17213a] sm:text-[10px]">Low stock products</span><span className="text-[8px] font-semibold text-[#1768e5]">View all</span></div>
                    {["Wireless Mouse", "Kopi Bubuk 250g"].map((name, index) => (
                      <div key={name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[#17213a]/6 px-2.5 py-1.5 last:border-0"><span className="truncate text-[8px] font-medium text-[#45536a] sm:text-[9px]">{name}</span><span className="text-[8px] text-[#9a6b22]">{index === 0 ? "8 / 10" : "4 / 12"}</span><span className="rounded bg-[#fff0d8] px-1.5 py-0.5 text-[7px] font-bold text-[#b86c0d]">LOW</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden border border-dashed border-[#49617f]/25 bg-white/55 p-4 text-left lg:block">
              <CircleCheck className="size-5 text-[#20875d]" />
              <p className="mt-5 text-sm font-bold text-[#17213a]">Trust every count</p>
              <p className="mt-1 text-xs leading-5 text-[#68758a]">Each movement keeps its user, item, time, and note attached.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
