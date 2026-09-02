import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Package,
  Search,
} from "lucide-react";

import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

const PRODUCTS = [
  { name: "Wireless Mouse", sku: "ELEC-MOUSE-001", stock: 8, minimum: 10, status: "Low" },
  { name: "Kopi Bubuk 250g", sku: "GROC-KOPI-014", stock: 4, minimum: 12, status: "Low" },
  { name: "Cooking Oil 2L", sku: "GROC-OIL-002", stock: 63, minimum: 20, status: "Healthy" },
];

const METRICS = [
  { value: "150", label: "products tracked" },
  { value: "82", label: "movements today" },
  { value: "99.9%", label: "records accounted for" },
];

export function Showcase() {
  return (
    <section id="product" className="bg-white py-20 md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <Reveal>
            <Eyebrow number="01">One clear source of truth</Eyebrow>
            <h2 className="mt-5 max-w-xl text-4xl leading-[1.05] font-bold text-[#17213a] sm:text-5xl">
              See the issue. Understand it. Act on it.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="max-w-xl text-lg leading-8 text-[#647187] lg:ml-auto">
              Stockroom turns inventory data into a short, useful action list.
              No hunting through sheets, recounting shelves, or asking who made
              the last change.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid border-y border-[#17213a]/10 sm:grid-cols-3">
          {METRICS.map((metric, index) => (
            <Reveal
              key={metric.label}
              delay={index * 60}
              className="border-b border-[#17213a]/10 px-2 py-6 last:border-b-0 sm:border-r sm:border-b-0 sm:px-6 sm:last:border-r-0"
            >
              <p className="text-3xl font-bold tabular-nums text-[#1768e5]">{metric.value}</p>
              <p className="mt-1 text-sm text-[#6f7b8e]">{metric.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <Reveal>
            <div className="h-full overflow-hidden rounded-lg border border-[#17213a]/10 bg-[#fbfcfe] shadow-[0_18px_50px_rgba(42,58,86,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17213a]/8 bg-white px-5 py-4">
                <div>
                  <p className="font-bold text-[#17213a]">Products</p>
                  <p className="mt-0.5 text-xs text-[#7c8797]">150 items across 12 categories</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 items-center gap-2 rounded-md border border-[#17213a]/10 bg-[#f8fafc] px-3 text-xs text-[#8993a1]"><Search className="size-3.5" /> Search products</span>
                  <span className="flex size-9 items-center justify-center rounded-md bg-[#1768e5] text-white"><Package className="size-4" /></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr] border-b border-[#17213a]/8 bg-[#f4f7fb] px-5 py-2.5 text-[10px] font-bold text-[#7c8797] uppercase">
                    <span>Product</span><span>SKU</span><span>Stock / min</span><span>Status</span>
                  </div>
                  {PRODUCTS.map((product) => (
                    <div key={product.sku} className="grid grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr] items-center border-b border-[#17213a]/7 bg-white px-5 py-4 last:border-0">
                      <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-md bg-[#eaf1fd] text-[#1768e5]"><Package className="size-4" /></span><span className="text-sm font-semibold text-[#2c3850]">{product.name}</span></div>
                      <span className="font-mono text-[10px] text-[#7c8797]">{product.sku}</span>
                      <span className="text-sm font-semibold tabular-nums text-[#3f4c62]">{product.stock} / {product.minimum}</span>
                      <span className={`w-fit rounded-md px-2 py-1 text-[10px] font-bold ${product.status === "Low" ? "bg-[#fff0d8] text-[#b86c0d]" : "bg-[#e6f5ed] text-[#247b59]"}`}>{product.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex h-full flex-col justify-between rounded-lg border border-[#e7b55d]/45 bg-[#fff8eb] p-6">
              <div>
                <span className="flex size-10 items-center justify-center rounded-md bg-[#f7dfb6] text-[#b86c0d]"><AlertTriangle className="size-5" /></span>
                <p className="mt-7 text-xs font-bold text-[#a76717] uppercase">Attention needed</p>
                <p className="mt-2 text-5xl font-bold tabular-nums text-[#17213a]">3</p>
                <p className="mt-2 text-sm leading-6 text-[#745d3d]">products have crossed their minimum stock threshold.</p>
              </div>
              <div className="mt-8 border-t border-[#b86c0d]/15 pt-5">
                <div className="flex items-center gap-2 text-xs text-[#745d3d]"><CheckCircle2 className="size-4 text-[#247b59]" /> Supplier details are ready</div>
                <div className="mt-3 flex items-center justify-between"><span className="text-sm font-bold text-[#17213a]">Review items</span><ArrowUpRight className="size-4 text-[#1768e5]" /></div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-[#68758a]">
          <ArrowDownRight className="size-4 text-[#1768e5]" />
          Every stock movement updates these signals automatically.
        </Reveal>
      </Container>
    </section>
  );
}
