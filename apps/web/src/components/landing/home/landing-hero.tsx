"use client";

import Link from "next/link";

import { Button } from "@PeerFolio/ui/components/button";

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-120 w-180 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(132,94,247,0.24), rgba(121,80,242,0.14), transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <p className="pf-home-fade-1 mb-4 font-sans text-xs uppercase tracking-[0.22em] text-primary/80">
          Comunidade curada para portfolios criativos
        </p>

        <h1 className="pf-home-fade-2 mb-8 font-serif text-5xl leading-tight tracking-tight text-on-surface md:text-7xl">
          Onde artistas digitais transformam portfolio em reconhecimento.
        </h1>

        <p className="pf-home-fade-3 mx-auto mb-12 max-w-2xl font-sans text-base leading-relaxed text-on-surface-variant md:text-lg">
          Explore uma vitrine editorial com projetos em destaque e publique seu
          trabalho em um ambiente feito para descoberta qualificada.
        </p>

        <div className="pf-home-fade-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link href="/feed" className="w-full sm:w-auto" aria-label="Explorar artistas">
            <Button size="lg" className="h-12 w-full rounded-md px-7 sm:w-auto">
              Explorar artistas
            </Button>
          </Link>

          <Link href="/submit" className="w-full sm:w-auto" aria-label="Publicar meu portfolio">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-md border-border/60 bg-surface-container/70 px-7 text-on-surface hover:bg-surface-container-high sm:w-auto"
            >
              Publicar meu portfolio
            </Button>
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
