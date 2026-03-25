"use client";

import Link from "next/link";
import { Card, CardFooter, Image } from "@heroui/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@PeerFolio/backend/convex/_generated/api";

export function CulturalSpotlight() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.portfolios.queries.list,
    { filter: "topRated" },
    { initialNumItems: 3 },
  );

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-24 cursor-default">
        <h2 className="font-body text-4xl font-semibold md:text-6xl text-on-surface">
          Destaques Culturais
        </h2>
        <Link
          href="/feed"
          className="group flex items-center gap-4 text-sm font-label uppercase tracking-[0.2em] text-primary"
        >
          Ver Exposição Completa
          <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
            east
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            // Apply different positioning/styling based on index to mimic the original magazine layout
            const isElevated = index === 1;

            return (
              <Card
                key={portfolio._id}
                isPressable
                as={Link}
                href={`/portfolio/${portfolio._id}` as any}
                shadow="lg"
                className={`group h-125 border-none bg-surface-container hover:bg-surface-container-high transition-all duration-500 rounded-xl ${isElevated ? "md:-mt-12 bg-surface-container-high hover:bg-surface-container-highest" : "md:mt-12"}`}
              >
                <div className="relative h-2/3 w-full overflow-hidden">
                  <Image
                    removeWrapper
                    alt={portfolio.title}
                    className="z-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 rounded-none"
                    src={
                      portfolio.previewImageUrl ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                    }
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest to-transparent opacity-60 z-10"></div>
                </div>
                <CardFooter className="p-8 flex-col items-start justify-between grow rounded-b-xl">
                  <div className="w-full text-left">
                    <span className="text-xs font-label text-primary uppercase tracking-[0.2em] mb-2 block">
                      {portfolio.area || "Objeto Físico"}
                    </span>
                    <h3 className="font-body text-2xl font-semibold text-on-surface line-clamp-2">
                      {portfolio.title}
                    </h3>
                  </div>
                  <div className="flex w-full justify-between items-center pt-6 border-t border-outline-variant/10 mt-auto">
                    <span className="text-on-surface-variant font-body text-sm truncate pr-4">
                      {portfolio.author?.nickname || "Anônimo"}
                    </span>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
