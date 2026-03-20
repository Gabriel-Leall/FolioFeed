"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Globe,
  MessageSquare,
  Star,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { PortfolioCardSkeleton } from "@/components/PortfolioCard";

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffDays = Math.floor(diffMs / (1_000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears > 0) return `há ${diffYears} ano${diffYears > 1 ? "s" : ""}`;
  if (diffMonths > 0) return `há ${diffMonths} mês${diffMonths > 1 ? "es" : ""}`;
  if (diffDays > 0) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  return "hoje";
}

// ---------------------------------------------------------------------------
// Star display
// ---------------------------------------------------------------------------

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} de 5 estrelas`} className="text-amber-400 text-xs">
      {"★".repeat(rating)}
      <span className="text-muted-foreground/30">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type Tab = "portfolios" | "critiques";

// ---------------------------------------------------------------------------
// Profile Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("portfolios");
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const profile = useQuery(api.users.queries.getProfile, {
    userId: params.userId,
  });

  const meQuery = useQuery(api.users.queries.getMe);
  const upsertProfile = useMutation(api.users.mutations.upsertProfile);

  // --- Loading state ---
  if (profile === undefined) {
    return <ProfileSkeleton />;
  }

  // --- Not found ---
  if (profile === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-2xl font-bold mb-2">Usuário não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Este perfil não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          Voltar ao feed
        </Link>
      </div>
    );
  }

  // Is the viewer the profile owner?
  // meQuery._id is the Convex user ID (same as profile._id)
  const isOwner = isSignedIn && meQuery?._id === profile._id;

  const hasNoActivity =
    profile.portfoliosCount === 0 &&
    profile.critiquesGivenCount === 0 &&
    profile.upvotesReceivedCount === 0;

  const displayName = profile.nickname ?? "Anônimo";

  // --- Availability toggle handler ---
  const handleAvailabilityToggle = async () => {
    if (!isOwner || isTogglingAvailability) return;
    setIsTogglingAvailability(true);
    try {
      await upsertProfile({
        availabilityStatus:
          profile.availabilityStatus === "available" ? "unavailable" : "available",
      });
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Profile header                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`Avatar de ${displayName}`}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-3xl font-semibold text-secondary-foreground ring-2 ring-border">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold truncate">@{displayName}</h1>

            {/* Reputation badge */}
            {profile.reputationBadge && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {profile.reputationBadge}
              </span>
            )}

            {/* Area badge */}
            {profile.primaryArea && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {profile.primaryArea}
              </span>
            )}

            {/* Availability badge */}
            {profile.availabilityStatus === "available" && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                🟢 Disponível para trabalho
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground max-w-xl">{profile.bio}</p>
          )}

          {/* Stack tags */}
          {profile.stackTags && profile.stackTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.stackTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {profile.socialLinks && (
            <div className="flex flex-wrap gap-3 text-xs">
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                >
                  <Globe className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                >
                  <Globe className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {profile.socialLinks.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                >
                  <Globe className="h-3.5 w-3.5" /> Site
                </a>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/setup-profile"
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
              >
                Editar perfil
              </Link>

              {/* Availability toggle — T034 */}
              <button
                type="button"
                onClick={handleAvailabilityToggle}
                disabled={isTogglingAvailability}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition disabled:opacity-50"
                aria-label={
                  profile.availabilityStatus === "available"
                    ? "Marcar como indisponível"
                    : "Marcar como disponível para trabalho"
                }
              >
                {profile.availabilityStatus === "available" ? (
                  <ToggleRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                )}
                {profile.availabilityStatus === "available"
                  ? "Disponível para trabalho"
                  : "Indisponível"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats row — T033                                                     */}
      {/* ------------------------------------------------------------------ */}
      {isOwner && hasNoActivity ? (
        // Zero-activity onboarding block — T032
        <div className="rounded-xl border border-dashed p-6 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Você ainda não submeteu nenhum portfólio.
          </p>
          <Link
            href="/submit"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Submeter meu portfólio
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 rounded-xl border p-4">
          <Stat
            icon={<BookOpen className="h-4 w-4" />}
            value={profile.portfoliosCount}
            label="portfólio"
            plural="portfólios"
          />
          <Stat
            icon={<MessageSquare className="h-4 w-4" />}
            value={profile.critiquesGivenCount}
            label="crítica dada"
            plural="críticas dadas"
          />
          <Stat
            icon={<ThumbsUp className="h-4 w-4" />}
            value={profile.upvotesReceivedCount}
            label="upvote recebido"
            plural="upvotes recebidos"
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Tabs                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <div className="flex border-b">
          <TabButton
            active={activeTab === "portfolios"}
            onClick={() => setActiveTab("portfolios")}
          >
            Portfólios ({profile.portfolios.length})
          </TabButton>
          <TabButton
            active={activeTab === "critiques"}
            onClick={() => setActiveTab("critiques")}
          >
            Críticas dadas ({profile.critiquesGiven.length})
          </TabButton>
        </div>

        {/* Portfolios tab */}
        {activeTab === "portfolios" && (
          <div className="mt-6">
            {profile.portfolios.length === 0 ? (
              <EmptyTabState
                icon="📂"
                message="Nenhum portfólio ainda."
                isOwner={isOwner}
                ownerCta={{ label: "Submeter portfólio", href: "/submit" }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {profile.portfolios.map((p) => (
                  <ProfilePortfolioCard key={p._id} portfolio={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Critiques tab */}
        {activeTab === "critiques" && (
          <div className="mt-6 space-y-4">
            {profile.critiquesGiven.length === 0 ? (
              <EmptyTabState
                icon="💬"
                message="Você ainda não deixou nenhuma crítica. Explore o feed e ajude outros a crescer."
                isOwner={isOwner}
                ownerCta={{ label: "Explorar feed", href: "/" }}
              />
            ) : (
              profile.critiquesGiven.map((c) => (
                <ProfileCritiqueCard key={c._id} critique={c} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Member since */}
      <p className="text-xs text-muted-foreground text-center">
        Membro desde {relativeTime(profile.createdAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stat({
  icon,
  value,
  label,
  plural,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  plural: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">{value !== 1 ? plural : label}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyTabState({
  icon,
  message,
  isOwner,
  ownerCta,
}: {
  icon: string;
  message: string;
  isOwner: boolean | undefined;
  ownerCta: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
      {isOwner && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Link
          href={ownerCta.href as any}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition"
        >
          {ownerCta.label}
        </Link>
      )}
    </div>
  );
}

type ProfilePortfolioData = {
  _id: string;
  title: string;
  area: string;
  stack: string[];
  averageRating: number;
  critiqueCount: number;
  likeCount: number;
  previewImageUrl?: string;
  normalizedUrl: string;
  createdAt: number;
};

function ProfilePortfolioCard({ portfolio }: { portfolio: ProfilePortfolioData }) {
  return (
    <Link
      href={`/portfolio/${portfolio._id}`}
      className="group flex flex-col gap-2 rounded-xl border p-4 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Preview thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {portfolio.previewImageUrl ? (
          <img
            src={portfolio.previewImageUrl}
            alt={`Preview de ${portfolio.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
            <Globe className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold line-clamp-2 flex-1">{portfolio.title}</h3>
          <span className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {portfolio.area}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{portfolio.normalizedUrl}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          {portfolio.averageRating > 0 ? portfolio.averageRating.toFixed(1) : "—"}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {portfolio.critiqueCount}
        </span>
      </div>
    </Link>
  );
}

type ProfileCritiqueData = {
  _id: string;
  portfolioId: string;
  rating: number;
  feedback: string;
  upvotes: number;
  createdAt: number;
  portfolioTitle: string | null;
  portfolioArea: string | null;
};

function ProfileCritiqueCard({ critique }: { critique: ProfileCritiqueData }) {
  const isDeleted = critique.portfolioTitle === null;

  return (
    <article className="rounded-xl border p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        {/* Portfolio link or deleted label */}
        {isDeleted ? (
          <span className="text-xs text-muted-foreground italic">
            Portfólio removido pelo autor
          </span>
        ) : (
          <Link
            href={`/portfolio/${critique.portfolioId}`}
            className="text-xs font-medium hover:underline truncate max-w-[70%]"
          >
            {critique.portfolioTitle}
            {critique.portfolioArea && (
              <span className="ml-1.5 rounded border px-1 py-0.5 text-[10px] text-muted-foreground">
                {critique.portfolioArea}
              </span>
            )}
          </Link>
        )}

        <StarDisplay rating={critique.rating} />
      </div>

      <p className="text-sm leading-relaxed line-clamp-3">{critique.feedback}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
        <span>▲ {critique.upvotes} upvote{critique.upvotes !== 1 ? "s" : ""}</span>
        <span>{relativeTime(critique.createdAt)}</span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse">
      <div className="flex gap-6 items-center">
        <div className="h-20 w-20 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-40 rounded-md bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
        </div>
      </div>
      <div className="h-16 rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PortfolioCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
