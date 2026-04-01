"use client";

import { Code2, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { FlowButton } from "@/components/flow-button";
import { Button } from "@PeerFolio/ui/components/button";

const HeroBackgroundEffects = dynamic(
  () => import("./hero-background-effects").then((mod) => mod.HeroBackgroundEffects),
  {
    ssr: false,
    loading: () => null,
  },
);

const STATS = [
  { icon: <Code2 className="h-4 w-4" />, value: "2.5K+", label: "Portfolios" },
  { icon: <MessageSquare className="h-4 w-4" />, value: "8K+", label: "Criticas" },
  { icon: <Users className="h-4 w-4" />, value: "1.2K+", label: "Desenvolvedores" },
];

export function LandingHero() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <HeroBackgroundEffects />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <h1 className="pf-home-fade-1 mb-12 font-headline text-5xl leading-tight tracking-tight text-on-surface md:text-8xl">
          A Galeria Digital para
          <br className="hidden md:block" />a{" "}
          <span className="font-light italic text-primary">
            Elite Criativa.
          </span>
        </h1>

        <p className="pf-home-fade-2 mx-auto mb-16 max-w-2xl font-body text-lg text-on-surface-variant leading-relaxed md:text-xl">
          Um santuário curado por pares, onde design, engenharia e estrategia
          convergem para elevar o nivel dos seus projetos visuais.
        </p>

        <div className="pf-home-fade-3 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link href={"/sign-up" as any} className="w-full sm:w-auto">
            <FlowButton text="Apply for Membership" />
          </Link>
          <Link href={"/feed" as any}>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full border border-border/60 bg-background/85 px-7 text-sm font-medium text-on-surface transition-all duration-150 ease-out hover:border-primary/60 hover:bg-muted hover:text-on-surface active:scale-[0.97]"
            >
              Explorar Arquivo
            </Button>
          </Link>
        </div>

        <div className="pf-home-fade-4 mt-8 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 font-body">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-2 text-base text-on-surface-variant"
            >
              <div className="text-primary/60 dark:text-primary/45">{stat.icon}</div>
              <span className="font-semibold text-on-surface/70">{stat.value}</span>
              <span className="text-on-surface-variant/70">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
