import Link from "next/link";

import { BinMark, Container } from "@/components/marketing/primitives";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#17213a]/8 bg-[#f6f5f1]">
      <Container className="py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <BinMark />
              <span className="text-base font-bold text-[#17213a]">Stockroom</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#6f7b8e]">
              Clear inventory decisions for growing businesses.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-[#5b687b]">
            <Link href="#product" className="rounded-md transition-colors hover:text-[#1768e5] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none">Product</Link>
            <Link href="#flow" className="rounded-md transition-colors hover:text-[#1768e5] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none">Workflow</Link>
            <Link href="#features" className="rounded-md transition-colors hover:text-[#1768e5] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none">Features</Link>
            <Link href="/login" className="rounded-md transition-colors hover:text-[#1768e5] focus-visible:ring-2 focus-visible:ring-[#1768e5]/35 focus-visible:outline-none">Log in</Link>
          </nav>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-[#17213a]/8 pt-5 text-xs text-[#8a94a3] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Stockroom</span>
          <span>Next.js · NestJS · Prisma · Supabase</span>
        </div>
      </Container>
    </footer>
  );
}
