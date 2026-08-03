import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { ProcessSection } from "@/components/landing/process-section";
import { TargetGroupSection } from "@/components/landing/target-group-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <FeatureSection />
        <ProcessSection />
        <TargetGroupSection />
        <ComparisonSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
