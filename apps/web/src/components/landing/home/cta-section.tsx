"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@PeerFolio/ui/components/button";

import { Reveal } from "./reveal";

export function CtaSection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-background py-28 md:py-36">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(132,94,247,0.34), rgba(121,80,242,0.2), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="mx-auto mb-6 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-on-surface md:text-5xl">
            Pronto para melhorar seu portfolio?
          </h2>
          <p className="mx-auto mb-11 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
            Junte-se a milhares de desenvolvedores que ja estao crescendo
            juntos. E gratuito e facil comecar.
          </p>
          <Link href={"/sign-in" as any}>
            <Button
              size="lg"
              className="pf-home-glow-pulse h-12 cursor-pointer bg-primary text-white transition-all duration-200 hover:scale-105 hover:bg-secondary"
            >
              Criar Minha Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
