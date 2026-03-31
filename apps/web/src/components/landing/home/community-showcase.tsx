"use client";

import Link from "next/link";
import { usePaginatedQuery } from "convex/react";

import { api } from "@PeerFolio/backend/convex/_generated/api";

export function CommunityShowcase() {
  const { results, status } = usePaginatedQuery(
    api.portfolios.queries.list,
    { filter: "topRated" },
    { initialNumItems: 6 },
  );

  const isLoading = status === "LoadingFirstPage";
  const isEmpty = !isLoading && results.length === 0;

  return (
    <section
      className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32"
      aria-labelledby="community-showcase-title"
    >
      <div className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.22em] text-primary/80">
            Curadoria em evidencia
          </p>
          <h2
            id="community-showcase-title"
            className="font-serif text-3xl text-on-surface md:text-5xl"
          >
            Vitrine da comunidade
          </h2>
        </div>

        <Link
          href="/feed"
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-surface-container/70 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-surface-container-high"
        >
          Ver acervo
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            east
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-lg border border-border/50 px-6 py-14 text-center font-sans text-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Carregando vitrine...
        </div>
      ) : isEmpty ? (
        <div className="glass-panel rounded-lg border border-border/50 px-6 py-14 text-center font-sans text-sm uppercase tracking-[0.18em] text-on-surface-variant">
          Ainda nao ha portfolios em destaque.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((portfolio) => (
            <Link
              key={portfolio._id}
              href={`/portfolio/${portfolio._id}` as any}
              className="group glass-panel overflow-hidden rounded-lg border border-border/60 bg-surface-container/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-surface-container-high"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-highest">
                <img
                  alt={portfolio.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={
                    portfolio.previewImageUrl ||
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                  }
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
              </div>

              <div className="space-y-4 p-5">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-primary/90">
                  {portfolio.area || "Projeto Curado"}
                </p>
                <h3 className="line-clamp-2 font-serif text-2xl leading-tight text-on-surface">
                  {portfolio.title}
                </h3>

                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <span className="truncate pr-3 font-sans text-sm text-on-surface-variant">
                    {portfolio.author?.nickname || "Anonimo"}
                  </span>
                  <span
                    className="material-symbols-outlined text-primary transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
