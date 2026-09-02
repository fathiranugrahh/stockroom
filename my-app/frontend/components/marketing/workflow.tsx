import { BellRing, Fingerprint, ScanBarcode } from "lucide-react";

import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

const STEPS = [
  {
    title: "Record the movement",
    copy: "Log stock in or out while the change is happening, with quantity and notes attached.",
    icon: ScanBarcode,
    meta: "IN +48  /  OUT -12",
  },
  {
    title: "Keep the context",
    copy: "Every update preserves the user, product, timestamp, and reason behind the count.",
    icon: Fingerprint,
    meta: "USER  /  ITEM  /  TIME",
  },
  {
    title: "Act on the signal",
    copy: "Low stock is surfaced early, so purchasing can respond before operations are affected.",
    icon: BellRing,
    meta: "MINIMUM CROSSED",
  },
];

export function Workflow() {
  return (
    <section id="flow" className="bg-[#eef4fd] py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow number="02" className="justify-center">From movement to decision</Eyebrow>
          <h2 className="mt-5 text-4xl leading-[1.05] font-bold text-[#17213a] sm:text-5xl">
            A workflow your team can actually follow.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#647187]">
            Three simple steps keep the physical shelf and the system in sync.
          </p>
        </Reveal>

        <div className="relative mt-14 grid gap-4 lg:grid-cols-3">
          <div aria-hidden className="absolute top-10 right-[17%] left-[17%] hidden border-t border-dashed border-[#1768e5]/28 lg:block" />
          {STEPS.map(({ title, copy, icon: Icon, meta }, index) => (
            <Reveal key={title} delay={index * 70}>
              <article className="relative h-full rounded-lg border border-[#17213a]/9 bg-white p-6 shadow-[0_14px_36px_rgba(42,58,86,0.07)]">
                <div className="flex items-center justify-between">
                  <span className="relative z-10 flex size-12 items-center justify-center rounded-md bg-[#1768e5] text-white shadow-[0_7px_20px_rgba(23,104,229,0.2)]"><Icon className="size-5" /></span>
                  <span className="font-mono text-xs font-bold text-[#1768e5]">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold text-[#17213a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#68758a]">{copy}</p>
                <p className="mt-7 border-t border-[#17213a]/8 pt-4 font-mono text-[10px] font-semibold text-[#768399]">{meta}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
