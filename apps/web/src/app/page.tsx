"use client";

import Link from "next/link";

import { CulturalSpotlight } from "@/components/landing/cultural-spotlight";
import { CtaSection } from "@/components/landing/home/cta-section";
import { FeaturesSection } from "@/components/landing/home/features-section";
import { LandingHero } from "@/components/landing/home/landing-hero";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingHero />

      <div id="portfolios" className="bg-muted/20">
        <CulturalSpotlight />
      </div>

      <FeaturesSection />
      <CtaSection />

      <footer className="border-t border-border/40 bg-background">
        <div className="container mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <h3 className="mb-3 text-lg font-semibold tracking-tight">
                PeerFolio
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Comunidade de desenvolvedores para feedback e crescimento mutuo.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Plataforma
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/feed"
                    className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    Explorar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    Submeter
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Comunidade
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href={"/privacy" as any}
                    className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/terms" as any}
                    className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground sm:flex-row">
            <p>&copy; 2026 PeerFolio. Todos os direitos reservados.</p>
            <p className="text-xs">Feito pela comunidade para a comunidade</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
