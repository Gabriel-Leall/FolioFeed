"use client";

import { useEffect, useRef } from "react";

export function HeroBackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const root = document.documentElement;

    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    type Particle = {
      x: number;
      y: number;
      speed: number;
      opacity: number;
      fadeDelay: number;
      fadeStart: number;
      fadingOut: boolean;
    };

    const count = () => Math.floor((canvas.width * canvas.height) / 12000);

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

    let particles: Particle[] = [];
    let raf = 0;
    let particleRgb = "216, 196, 255";
    let particleOpacityScale = 1;
    let particleHeightScale = 1;

    const applyTheme = () => {
      const isDark = root.classList.contains("dark");
      particleRgb = isDark ? "216, 196, 255" : "52, 116, 255";
      particleOpacityScale = isDark ? 1 : 1.35;
      particleHeightScale = isDark ? 1 : 1.2;
      canvas.style.mixBlendMode = isDark ? "screen" : "normal";
      canvas.style.opacity = isDark ? "0.5" : "0.48";

      if (window.innerWidth < 768) {
        canvas.style.opacity = isDark ? "0.4" : "0.36";
      }

      if (window.innerWidth < 1024) {
        canvas.style.display = "none";
      } else {
        canvas.style.display = "block";
      }
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < count(); i += 1) particles.push(make());
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

        ctx.fillStyle = `rgba(${particleRgb}, ${Math.min(1, particle.opacity * particleOpacityScale)})`;
        ctx.fillRect(particle.x, particle.y, 0.8, (Math.random() * 2 + 1) * particleHeightScale);
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      applyTheme();
      init();
    };

    const observer = new MutationObserver(applyTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    setSize();
    applyTheme();
    init();
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-hline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
        <div className="pf-home-vline" />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full opacity-55 blur-3xl bg-[radial-gradient(ellipse,rgba(90,132,255,0.14),rgba(90,132,255,0.07),transparent_72%)] dark:bg-[radial-gradient(ellipse,rgba(132,94,247,0.25),rgba(121,80,242,0.16),transparent_72%)]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-[43%] top-[22%] h-40 w-40 rounded-full opacity-30 blur-3xl bg-[rgba(90,132,255,0.14)] dark:bg-[rgba(199,173,255,0.28)]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </>
  );
}
