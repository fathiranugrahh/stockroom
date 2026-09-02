import { Boxes, History, ShieldCheck, Truck } from "lucide-react";

import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Reveal } from "@/components/marketing/reveal";

const FEATURES = [
  { title: "Low-stock alerts", copy: "Set a minimum for every item and know exactly which products need attention.", icon: Boxes, tone: "bg-[#ffdca8] text-[#8a5310]" },
  { title: "Movement history", copy: "Trace every incoming and outgoing unit without reconstructing the story manually.", icon: History, tone: "bg-[#b9d6ff] text-[#124f9f]" },
  { title: "Supplier records", copy: "Keep purchasing context close to the products your team needs to replenish.", icon: Truck, tone: "bg-[#bfe7d1] text-[#176947]" },
  { title: "Role-based access", copy: "Admins manage structure while staff handle daily stock movement with clear boundaries.", icon: ShieldCheck, tone: "bg-[#e2cef7] text-[#6e3c91]" },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-[#13233f] py-20 text-white md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <Reveal>
            <Eyebrow number="03" className="[&_span:first-child]:text-[#8bbcff] [&_span:last-child]:text-white/55">Built for daily operations</Eyebrow>
            <h2 className="mt-5 max-w-xl text-4xl leading-[1.05] font-bold sm:text-5xl">
              Everything you need. Nothing to work around.
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="max-w-xl text-lg leading-8 text-white/62 lg:ml-auto">
              The important tools stay close, the risky states stand out, and
              routine work stays quiet enough to finish quickly.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 md:grid-cols-2">
          {FEATURES.map(({ title, copy, icon: Icon, tone }, index) => (
            <Reveal key={title} delay={index * 60} className="bg-[#13233f]">
              <article className="group min-h-64 p-7 transition-colors duration-200 ease-out hover:bg-white/[0.035] sm:p-8">
                <span className={`flex size-11 items-center justify-center rounded-md ${tone}`}><Icon className="size-5" /></span>
                <h3 className="mt-10 text-2xl font-bold">{title}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/58">{copy}</p>
                <span className="mt-7 block font-mono text-[10px] font-semibold text-white/32">FEATURE / 0{index + 1}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
