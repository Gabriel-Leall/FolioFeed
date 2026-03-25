"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@PeerFolio/ui/components/button";

import { Reveal } from "./reveal";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(132,94,247,0.34), rgba(121,80,242,0.2), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Pronto para melhorar seu portfolio?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
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
