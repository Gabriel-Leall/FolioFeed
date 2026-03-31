"use client";

import { Lightbulb, MessageSquare, Users } from "lucide-react";

import { cn } from "@PeerFolio/ui/lib/utils";

import { Reveal } from "./reveal";

const features = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Curadoria editorial de portfolios",
    description:
      "Destaques selecionados para facilitar a descoberta de trabalhos autorais com qualidade visual e narrativa clara.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Descoberta com curadoria especializada",
    description:
      "Explore galerias organizadas por estilo, processo e contexto para encontrar referencias que realmente inspiram novas direcoes.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Reconhecimento que circula na comunidade",
    description:
      "Publique seu portfolio em uma vitrine curada para ampliar alcance, fortalecer reputacao e gerar novas oportunidades criativas.",
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
          "group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-7 backdrop-blur-sm",
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
          <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-section-title"
      className="bg-background py-24 md:py-32"
    >
      <div className="container mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-14 text-center">
            <h2
              className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
              id="features-section-title"
            >
              Por que PeerFolio
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Uma plataforma editorial para descobrir portfolios criativos,
              publicar trabalhos autorais e transformar visibilidade em
              reconhecimento.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
