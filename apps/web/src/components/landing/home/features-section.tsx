"use client";

import { Lightbulb, MessageSquare, Users } from "lucide-react";

import { cn } from "@PeerFolio/ui/lib/utils";

import { Reveal } from "./reveal";

const features = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Obtenha Criticas Construtivas",
    description:
      "Receba feedback genuino de outros desenvolvedores que querem ajudar voce a melhorar.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Descubra Inspiracao",
    description:
      "Explore portfolios de devs talentosos e encontre novas ideias para seus proprios projetos.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Cresca Junto",
    description:
      "Faca parte de uma comunidade engajada focada em crescimento mutuo e aprendizado continuo.",
  },
];

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-7 md:p-8 backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
          "hover:scale-[1.02] cursor-default",
        )}
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-primary/15 via-transparent to-secondary/15" />

        <div className="relative z-10">
          <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors duration-200 group-hover:bg-primary/20">
            {icon}
          </div>
          <h3 className="mb-3 font-sans text-xl font-semibold tracking-tight text-on-surface">
            {title}
          </h3>
          <p className="font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export function FeaturesSection() {
  return (
    <section className="relative bg-background py-28 md:py-36">
      <div className="container mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-16 text-center md:mb-18">
            <h2 className="mb-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-on-surface md:text-5xl">
              Por que escolher o <span className="text-primary">PeerFolio</span>
              ?
            </h2>
            <p className="mx-auto max-w-2xl font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
              Uma plataforma construida para desenvolvedores que buscam crescer
              atraves de feedback genuino e colaboracao.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
