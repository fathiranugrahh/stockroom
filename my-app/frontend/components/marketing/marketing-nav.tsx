"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { BinMark } from "@/components/marketing/primitives";

export function MarketingNav() {
  const { status } = useAuth();
  const authed = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 border-b border-[#17213a]/8 bg-[#f6f5f1]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-7">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
        >
          <BinMark />
          <span className="text-[17px] font-bold text-[#17213a]">Stockroom</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-lg border border-[#17213a]/8 bg-white/80 p-1 shadow-[0_8px_24px_rgba(31,41,55,0.06)] md:flex">
          <Link
            href="#product"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[#52627a] transition-colors hover:bg-[#edf3fb] hover:text-[#17213a] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
          >
            Product
          </Link>
          <Link
            href="#flow"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[#52627a] transition-colors hover:bg-[#edf3fb] hover:text-[#17213a] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
          >
            Workflow
          </Link>
          <Link
            href="#features"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[#52627a] transition-colors hover:bg-[#edf3fb] hover:text-[#17213a] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
          >
            Features
          </Link>
        </nav>

        <nav className="flex items-center gap-2">
          <Link
            href={authed ? "/dashboard" : "/login"}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#1768e5] px-4 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(23,104,229,0.22)] transition-[background-color,transform] duration-150 ease-out hover:bg-[#0f5bcd] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none"
          >
            {authed ? "Dashboard" : "Log in"}
            <ArrowRight className="size-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
