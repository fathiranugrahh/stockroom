import { Hero } from "@/components/marketing/hero";
import { Showcase } from "@/components/marketing/showcase";
import { Workflow } from "@/components/marketing/workflow";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { FinalCta } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Showcase />
      <Workflow />
      <FeatureShowcase />
      <FinalCta />
    </>
  );
}
