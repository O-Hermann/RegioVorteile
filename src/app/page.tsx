import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { Hero } from "@/components/landing/hero";
import { LeakScrollytelling } from "@/components/landing/leak-scrollytelling";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { ProcessSection } from "@/components/landing/process-section";
import { DisclaimerSection } from "@/components/landing/disclaimer-section";
import { TargetGroupSection } from "@/components/landing/target-group-section";
import { IntroSection } from "@/components/landing/intro-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HashScrollHandler } from "@/components/landing/hash-scroll-handler";

export default function LandingPage() {
  return (
    <>
      <HashScrollHandler />
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <LeakScrollytelling />
        <ProblemSection />
        <FeatureSection />
        <ProcessSection />
        <DisclaimerSection />
        <TargetGroupSection />
        <IntroSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
