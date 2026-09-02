"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Check, PackageCheck } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { Container, Tag } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCta() {
  const { status } = useAuth();
  const authed = status === "authenticated";

  return (
    <section className="bg-[#ffe9d5] py-20 md:py-24">
      <Container>
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.7fr]">
            <div>
              <Tag className="text-[#975913]">Your inventory can be this clear</Tag>
              <h2 className="mt-5 max-w-[12ch] text-[2.8rem] leading-[1] font-bold text-[#17213a] text-balance sm:text-6xl lg:text-[5.5rem]">
                Put every count back under control.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#665a50]">
                Give your team one place to manage products, movements,
                suppliers, and low-stock decisions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={authed ? "/dashboard" : "/login"}
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-[#1768e5] px-6 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(23,104,229,0.22)] transition-[background-color,transform] duration-150 ease-out hover:bg-[#0f5bcd] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
                >
                  {authed ? "Open dashboard" : "Start managing stock"}
                  <ArrowRight className="size-4" />
                </Link>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#665a50]"><Check className="size-4 text-[#247b59]" /> Built for everyday inventory work</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md py-8">
              <div className="ml-auto w-[82%] rounded-lg border border-[#17213a]/10 bg-white p-5 shadow-[0_20px_50px_rgba(92,67,45,0.12)]">
                <div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-md bg-[#e8f0fe] text-[#1768e5]"><Boxes className="size-4" /></span><span className="rounded-md bg-[#e8f5ee] px-2 py-1 text-[10px] font-bold text-[#247b59]">IN SYNC</span></div>
                <p className="mt-8 text-4xl font-bold tabular-nums text-[#17213a]">150</p>
                <p className="mt-1 text-sm text-[#6f7b8e]">products under control</p>
                <div className="mt-6 h-2 overflow-hidden rounded-md bg-[#edf1f6]"><div className="h-full w-[88%] bg-[#1768e5]" /></div>
              </div>
              <div className="absolute bottom-0 left-0 flex w-[58%] items-center gap-3 rounded-lg border border-[#17213a]/10 bg-[#13233f] p-4 text-white shadow-[0_18px_44px_rgba(19,35,63,0.2)]">
                <PackageCheck className="size-5 text-[#9ad6b8]" />
                <div><p className="text-xs font-bold">Count confirmed</p><p className="mt-0.5 text-[10px] text-white/55">Updated just now</p></div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
