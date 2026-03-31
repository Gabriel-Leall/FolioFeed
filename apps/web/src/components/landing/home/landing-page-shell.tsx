import { CulturalSpotlight } from "@/components/landing/cultural-spotlight";

import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { LandingFooter } from "./landing-footer";
import { LandingHero } from "./landing-hero";

export function LandingPageShell() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <LandingHero />

      <div id="portfolios" className="bg-muted/20">
        <CulturalSpotlight />
      </div>

      <FeaturesSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
