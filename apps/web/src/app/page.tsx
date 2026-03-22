"use client";

import { usePaginatedQuery } from "convex/react";
import { AlertCircle, FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { FeedFilter } from "@/components/FeedTabs";
import { FeedTabs } from "@/components/FeedTabs";
import PortfolioCard, {
  PortfolioCardSkeleton,
} from "@/components/PortfolioCard";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { Button } from "@PeerFolio/ui/components/button";
import { cn } from "@PeerFolio/ui/lib/utils";

// Must match AREA_VALUES in convex/lib/constants.ts
const AREAS = [
  "Frontend",
  "Backend",
  "Fullstack",
  "UI/UX",
  "Mobile",
  "Other",
] as const;

type AreaFilter = (typeof AREAS)[number];

export default function Home() {
  const [currentFilter, setCurrentFilter] = useState<FeedFilter>("latest");
  const [currentArea, setCurrentArea] = useState<AreaFilter | null>(null);

  const isFiltered = currentFilter !== "latest" || currentArea !== null;

  const { results, status, loadMore } = usePaginatedQuery(
    api.portfolios.queries.list,
    {
      filter: currentFilter,
      area: currentArea ?? undefined,
    },
    { initialNumItems: 12 },
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Descubra portfólios incríveis da comunidade.
          </p>
        </div>

        {/* Global Empty State Banner for Dev */}
        {process.env.NODE_ENV === "development" &&
          status === "Exhausted" &&
          results.length === 0 &&
          currentFilter === "latest" &&
          currentArea === null && (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <p>
                <strong>Ambiente sem dados</strong> — rode o seed script ou{" "}
                <Link href="/submit" className="underline hover:no-underline">
                  submeta o primeiro portfólio
                </Link>
                .
              </p>
            </div>
          )}

        {/* Filters Section */}
        <div className="space-y-4">
          <FeedTabs
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentArea(null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                currentArea === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground hover:bg-muted",
              )}
            >
              Todos
            </button>
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setCurrentArea(area)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  currentArea === area
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground hover:bg-muted",
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results?.map((portfolio) => (
          <PortfolioCard key={portfolio._id} portfolio={portfolio as any} />
        ))}

        {/* Loading Skeletons */}
        {status === "LoadingFirstPage" &&
          Array.from({ length: 6 }).map((_, i) => (
            <PortfolioCardSkeleton key={i} />
          ))}

        {status === "LoadingMore" &&
          Array.from({ length: 3 }).map((_, i) => (
            <PortfolioCardSkeleton key={`more-${i}`} />
          ))}
      </div>

      {/* Empty States */}
      {status === "Exhausted" && results?.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Nenhum resultado</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {currentArea !== null
              ? "Nenhum portfólio encontrado para esta área ainda."
              : currentFilter === "topRated"
                ? "Ainda não há portfólios bem avaliados nos últimos 30 dias."
                : "Nenhum portfólio encontrado para os filtros selecionados."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isFiltered && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentArea(null);
                  setCurrentFilter("latest");
                }}
              >
                Ver todos os portfólios
              </Button>
            )}
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Submeter o primeiro
            </Link>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {(status === "CanLoadMore" || status === "LoadingMore") && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => loadMore(12)}
            disabled={status === "LoadingMore"}
          >
            Carregar mais portfólios
          </Button>
        </div>
      )}
    </div>
  );
}
