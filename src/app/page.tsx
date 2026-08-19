import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { Hero } from "@/components/landing/hero";
import { LeakScrollytelling } from "@/components/landing/leak-scrollytelling";
import { MoreLeaksSection } from "@/components/landing/more-leaks-section";
import { ImpactNumbersSection } from "@/components/landing/impact-numbers-section";
import { RecoveryReportSection } from "@/components/landing/recovery-report-section";
import { FutureSection } from "@/components/landing/future-section";
import { SecuritySection } from "@/components/landing/security-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { HashScrollHandler } from "@/components/landing/hash-scroll-handler";

export default function LandingPage() {
  return (
    <>
      <HashScrollHandler />
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <LeakScrollytelling />
        <MoreLeaksSection />
        <ImpactNumbersSection />
        <RecoveryReportSection />
        <FutureSection />
        <SecuritySection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
