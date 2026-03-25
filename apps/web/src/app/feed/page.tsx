"use client";

import { usePaginatedQuery } from "convex/react";
import { Compass, Loader2 } from "lucide-react";
import { useState } from "react";

import PortfolioCard, {
  PortfolioCardSkeleton,
} from "@/components/PortfolioCard";
import { FeedTabs, type FeedFilter } from "@/components/FeedTabs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { Button } from "@PeerFolio/ui/components/button";
import { cn } from "@PeerFolio/ui/lib/utils";

// ---------------------------------------------------------------------------
// Area filter options
// ---------------------------------------------------------------------------

const AREA_OPTIONS = [
  { label: "Todos", value: undefined },
  { label: "Frontend", value: "Frontend" },
  { label: "Backend", value: "Backend" },
  { label: "Fullstack", value: "Fullstack" },
  { label: "UI/UX", value: "UI/UX" },
  { label: "Mobile", value: "Mobile" },
  { label: "Outros", value: "Other" },
] as const;

type AreaValue = (typeof AREA_OPTIONS)[number]["value"];

// ---------------------------------------------------------------------------
// Feed Page
// ---------------------------------------------------------------------------

export default function FeedPage() {
  const [currentFilter, setCurrentFilter] = useState<FeedFilter>("latest");
  const [selectedArea, setSelectedArea] = useState<AreaValue>(undefined);

  const { results, status, loadMore } = usePaginatedQuery(
    api.portfolios.queries.list,
    { filter: currentFilter, area: selectedArea },
    { initialNumItems: 12 },
  );

  const isFirstLoad = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";
  const hasResults = results && results.length > 0;
  const isDoneEmpty = status === "Exhausted" && !hasResults;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 pt-10 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explorar Portfolios
          </h1>
          <p className="mt-2 text-muted-foreground">
            Descubra projetos incriveis da comunidade
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Tabs */}
          <FeedTabs
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />

          {/* Area pills */}
          <div className="-mt-px flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {AREA_OPTIONS.map((option) => {
              const isActive = selectedArea === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSelectedArea(option.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Portfolio Grid */}
        {(hasResults || isFirstLoad) && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results?.map((portfolio) => (
              <PortfolioCard
                key={portfolio._id}
                portfolio={portfolio as any}
              />
            ))}

            {isFirstLoad &&
              Array.from({ length: 12 }).map((_, i) => (
                <PortfolioCardSkeleton key={`skeleton-${i}`} />
              ))}

            {isLoadingMore &&
              Array.from({ length: 6 }).map((_, i) => (
                <PortfolioCardSkeleton key={`more-${i}`} />
              ))}
          </div>
        )}

        {/* Load More */}
        {(canLoadMore || isLoadingMore) && hasResults && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => loadMore(12)}
              disabled={isLoadingMore}
              className="min-w-45"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Carregar mais"
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {isDoneEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Compass className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">
              Nenhum portfolio encontrado
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Nao encontramos portfolios com esses filtros. Tente ajustar a area
              ou o tipo de ordenacao.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSelectedArea(undefined);
                setCurrentFilter("latest");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
