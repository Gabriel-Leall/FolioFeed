"use client";

import { Code2, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { FlowButton } from "@/components/flow-button";
import { Button } from "@PeerFolio/ui/components/button";

function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    setSize();

    type Particle = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;
    };

    let particles: Particle[] = [];
    let raf = 0;

    const count = () => Math.floor((canvas.width * canvas.height) / 8000);

    const make = (): Particle => {
      const fadeDelay = Math.random() * 600 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() / 5 + 0.1,
        opacity: 0.7,
        fadeDelay,
        fadeStart: Date.now() + fadeDelay,
        fadingOut: false,
      };
    };

    const reset = (particle: Particle) => {
      particle.x = Math.random() * canvas.width;
      particle.y = Math.random() * canvas.height;
      particle.speed = Math.random() / 5 + 0.1;
      particle.opacity = 0.7;
      particle.fadeDelay = Math.random() * 600 + 100;
      particle.fadeStart = Date.now() + particle.fadeDelay;
      particle.fadingOut = false;
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < count(); i++) particles.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.y -= particle.speed;
        if (particle.y < 0) reset(particle);
        if (!particle.fadingOut && Date.now() > particle.fadeStart) {
          particle.fadingOut = true;
        }
        if (particle.fadingOut) {
          particle.opacity -= 0.008;
          if (particle.opacity <= 0) reset(particle);
        }

        ctx.fillStyle = `rgba(216, 196, 255, ${particle.opacity})`;
        ctx.fillRect(particle.x, particle.y, 0.8, Math.random() * 2 + 1);
      }
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

export function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);
  const stats = [
    { icon: <Code2 className="h-4 w-4" />, value: "2.5K+", label: "Portfolios" },
    { icon: <MessageSquare className="h-4 w-4" />, value: "8K+", label: "Criticas" },
    { icon: <Users className="h-4 w-4" />, value: "1.2K+", label: "Desenvolvedores" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
        style={{ mixBlendMode: "screen" }}
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(132,94,247,0.25), rgba(121,80,242,0.16), transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-[43%] top-[22%] h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: "rgba(199, 173, 255, 0.28)" }}
        aria-hidden="true"
      />

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
              className="h-12 rounded-full border border-white/10 bg-[#131313]/85 px-7 text-sm font-medium text-white transition-all duration-300 hover:border-primary/60 hover:bg-[#1b1b1f] hover:text-[#e9dcff]"
            >
              Explorar Arquivo
            </Button>
          </Link>
        </div>

        <div className="pf-home-fade-4 mt-8 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 font-body">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-2 text-base text-foreground/55"
            >
              <div className="text-primary/45">{stat.icon}</div>
              <span className="font-semibold text-foreground/70">{stat.value}</span>
              <span className="text-foreground/45">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
