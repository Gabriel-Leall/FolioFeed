import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CulturalSpotlight } from "@/components/landing/cultural-spotlight";
import { CtaSection } from "@/components/landing/home/cta-section";
import { FeaturesSection } from "@/components/landing/home/features-section";
import { LandingHero } from "@/components/landing/home/landing-hero";
import { messages, DEFAULT_LOCALE } from "@/i18n/messages";

export default async function Home() {
  const { userId } = await auth();
  const t = (key: string) => messages[DEFAULT_LOCALE][key] ?? key;
  const brandName = t("brand.name");

  if (userId) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingHero />

      <div className="bg-muted/20">
        <CulturalSpotlight />
      </div>

      <FeaturesSection />

      <CtaSection />

      <footer className="border-t border-border/40 bg-background">
        <div className="container mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <h3 className="mb-3 text-lg font-semibold tracking-tight">
                {brandName}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("landing.footer.description")}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("landing.footer.platform")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/feed"
                    className="text-muted-foreground transition-colors duration-150 ease-out hover:text-primary"
                  >
                    {t("landing.footer.explore")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="text-muted-foreground transition-colors duration-150 ease-out hover:text-primary"
                  >
                    {t("landing.footer.submit")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("landing.footer.community")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground transition-colors duration-150 ease-out hover:text-primary"
                  >
                    {t("landing.footer.dashboard")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("landing.footer.legal")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href={"/privacy" as any}
                    className="text-muted-foreground transition-colors duration-150 ease-out hover:text-primary"
                  >
                    {t("landing.footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/terms" as any}
                    className="text-muted-foreground transition-colors duration-150 ease-out hover:text-primary"
                  >
                    {t("landing.footer.terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground sm:flex-row">
            <p>
              &copy; 2026 {brandName}. {t("landing.footer.rights")}
            </p>
            <p className="text-xs">{t("landing.footer.byCommunity")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
