"use client";

import { Code2, MessageSquare, Users } from "lucide-react";

import { Reveal } from "./reveal";

const stats = [
  { icon: <Code2 className="h-5 w-5" />, value: "2.5K+", label: "Portfolios" },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    value: "8K+",
    label: "Criticas",
  },
  {
    icon: <Users className="h-5 w-5" />,
    value: "1.2K+",
    label: "Desenvolvedores",
  },
];

export function StatsMarquee() {
  return (
    <section className="border-y border-border/40 bg-muted/20 py-8">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-background via-background/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-background via-background/70 to-transparent" />
        <Reveal>
          <div className="pf-home-marquee-track flex w-max items-center gap-5 px-6">
            {stats.concat(stats).map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="flex min-w-56 items-center justify-center gap-3 rounded-lg border border-white/8 bg-surface-container/55 px-5 py-4 text-center backdrop-blur-sm"
              >
                <div className="text-primary">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold tracking-tight md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
