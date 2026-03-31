"use client";

import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "@PeerFolio/backend/convex/_generated/api";

export function CulturalSpotlight() {
  const { results, status } = usePaginatedQuery(
    api.portfolios.queries.list,
    { filter: "topRated" },
    { initialNumItems: 3 },
  );

  return (
    <section id="portfolios" className="mx-auto max-w-7xl px-6 py-28 md:py-32">
      <div className="mb-18 flex items-end justify-between gap-6 md:mb-22 cursor-default">
        <h2 className="font-serif text-4xl font-semibold text-on-surface md:text-6xl">
          Destaques Culturais
        </h2>
        <Link
          href="/feed"
          className="group inline-flex items-center gap-2.5 text-sm font-label uppercase tracking-[0.18em] text-primary"
        >
          Ver Exposição Completa
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {status === "LoadingFirstPage" ? (
          <div className="col-span-1 md:col-span-3 text-center py-12 text-on-surface-variant font-label uppercase tracking-widest">
            Carregando Arquivo...
          </div>
        ) : results.length === 0 ? (
          <div className="col-span-1 md:col-span-3 text-center py-12 text-on-surface-variant font-label uppercase tracking-widest">
            Nenhum projeto em destaque ainda.
          </div>
        ) : (
          results.map((portfolio, index) => {
            const isElevated = index === 1;

            return (
              <Link
                key={portfolio._id}
                href={`/portfolio/${portfolio._id}` as any}
                className={`group flex h-125 flex-col overflow-hidden rounded-xl border-none bg-surface-container transition-all duration-500 hover:bg-surface-container-high ${isElevated ? "bg-surface-container-high hover:bg-surface-container-highest md:-mt-12" : "md:mt-12"}`}
              >
                <div className="relative h-2/3 w-full overflow-hidden">
                  <img
                    alt={portfolio.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    src={
                      portfolio.previewImageUrl ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                    }
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest to-transparent opacity-60 z-10" />
                </div>
                <div className="flex flex-1 flex-col items-start justify-between rounded-b-xl p-8">
                  <div className="w-full text-left">
                    <span className="text-xs font-label text-primary uppercase tracking-[0.2em] mb-2 block">
                      {portfolio.area || "Objeto Físico"}
                    </span>
                    <h3 className="font-body text-2xl font-semibold text-on-surface line-clamp-2">
                      {portfolio.title}
                    </h3>
                  </div>
                  <div className="mt-auto flex w-full items-center justify-between border-t border-outline-variant/10 pt-6">
                    <span className="text-on-surface-variant font-body text-sm truncate pr-4">
                      {portfolio.author?.nickname || "Anônimo"}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
