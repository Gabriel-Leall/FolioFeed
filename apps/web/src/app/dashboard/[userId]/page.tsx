"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Globe,
  Github,
  Heart,
  Linkedin,
  MessageSquare,
  Plus,
  Sparkles,
  Star,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { Button } from "@PeerFolio/ui/components/button";
import { Card } from "@PeerFolio/ui/components/card";
import { cn } from "@PeerFolio/ui/lib/utils";

import { PortfolioCardSkeleton } from "@/components/PortfolioCard";

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

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} de 5 estrelas`} className="text-amber-400 text-xs">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
      {rating > 0 ? rating.toFixed(1) : "—"}
    </span>
  );
}

type Tab = "portfolios" | "critiques";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getTimeBasedMessage(): string {
  const hour = new Date().getHours();
  if (hour < 12)
    return "Comece o dia explorando novos portfólios ou submetendo o seu.";
  if (hour < 18)
    return "Aproveite a tarde para dar feedback construtivo.";
  return "Um momento tranquilo para revisar suas críticas.";
}

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("portfolios");
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);

  const profile = useQuery(api.users.queries.getProfile, {
    userId: params.userId,
  });

  const meQuery = useQuery(api.users.queries.getMe);
  const upsertProfile = useMutation(api.users.mutations.upsertProfile);

  if (profile === undefined) {
    return <ProfileSkeleton />;
  }

  if (profile === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
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

  const isOwner = isSignedIn && meQuery?._id === profile._id;
  const isPublicView = isSignedIn && !isOwner;

  const hasNoActivity =
    profile.portfoliosCount === 0 &&
    profile.critiquesGivenCount === 0 &&
    profile.upvotesReceivedCount === 0;

  const displayName = profile.nickname ?? "Anônimo";

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

  const handleTabClick = (tab: Tab, e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const parentRect = button.parentElement?.getBoundingClientRect();
    if (parentRect) {
      setTabIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    const activeButton = tabsRef.current?.querySelector('button[class*="border-[#a762b5]"]') as HTMLButtonElement;
    if (activeButton) {
      const rect = activeButton.getBoundingClientRect();
      const parentRect = activeButton.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setTabIndicatorStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {isOwner && (
        <>
          <WelcomeSection
            displayName={displayName}
            avatarUrl={profile.avatarUrl}
            portfoliosCount={profile.portfoliosCount}
            critiquesGivenCount={profile.critiquesGivenCount}
            upvotesReceivedCount={profile.upvotesReceivedCount}
          />

          <QuickActionsPanel activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}

      {/* Profile header — enhanced for public view */}
      <div
        className={`flex flex-col gap-6 ${
          isPublicView ? "sm:flex-row-reverse items-start" : "sm:flex-row items-center"
        }`}
      >
        {/* Avatar — larger for public view */}
        <div className={`shrink-0 ${isPublicView ? "mx-auto sm:mx-0" : ""}`}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`Avatar de ${displayName}`}
              className={`rounded-full object-cover ring-4 shadow-lg transition-all ${
                isPublicView
                  ? "h-32 w-32 ring-[#a762b5]/20"
                  : "h-20 w-20 ring-border"
              }`}
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-4 shadow-lg font-semibold ${
                isPublicView ? "h-32 w-32 text-4xl ring-[#a762b5]/20" : "h-20 w-20 text-3xl ring-border"
              }`}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name row with badges */}
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className={`font-bold truncate ${isPublicView ? "text-3xl" : "text-2xl"}`}
            >
              @{displayName}
            </h1>

            {/* Reputation badge — more prominent in public view */}
            {profile.reputationBadge && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
                  isPublicView
                    ? "bg-linear-to-r from-amber-100 to-amber-50 dark:from-amber-900/50 dark:to-amber-800/40 text-amber-700 dark:text-amber-400 px-4 py-1.5 text-sm shadow-sm"
                    : "bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-0.5 text-xs"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {profile.reputationBadge}
              </span>
            )}

            {/* Area badge */}
            {profile.primaryArea && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {profile.primaryArea}
              </span>
            )}

            {/* Availability badge — only for owner */}
            {isOwner && profile.availabilityStatus === "available" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Disponível para trabalho
              </span>
            )}
          </div>

          {/* Bio — more readable in public view */}
          {profile.bio && (
            <p
              className={`text-muted-foreground ${isPublicView ? "text-base max-w-2xl" : "text-sm max-w-xl"}`}
            >
              {profile.bio}
            </p>
          )}

          {/* Stack tags */}
          {profile.stackTags && profile.stackTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.stackTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Social links — icon buttons for public view */}
          {profile.socialLinks && (
            <div className="flex flex-wrap gap-2">
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isPublicView
                      ? "hover:bg-[#a762b5]/5 hover:border-[#a762b5]/30 hover:text-[#a762b5]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Github className="h-4 w-4" />
                  {isPublicView ? "GitHub" : ""}
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isPublicView
                      ? "hover:bg-[#a762b5]/5 hover:border-[#a762b5]/30 hover:text-[#a762b5]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Linkedin className="h-4 w-4" />
                  {isPublicView ? "LinkedIn" : ""}
                </a>
              )}
              {profile.socialLinks.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isPublicView
                      ? "hover:bg-[#a762b5]/5 hover:border-[#a762b5]/30 hover:text-[#a762b5]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  {isPublicView ? "Website" : ""}
                </a>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/setup-profile"
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Editar perfil
              </Link>

              <button
                type="button"
                onClick={handleAvailabilityToggle}
                disabled={isTogglingAvailability}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition disabled:opacity-50 cursor-pointer"
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

          {/* Public view CTAs */}
          {isPublicView && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#a762b5] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Conectar
              </button>
              <Link
                href={`/portfolio/${profile.portfolios[0]?._id ?? ""}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#a762b5]/30 bg-[#a762b5]/5 px-4 py-2 text-sm font-medium text-[#a762b5] hover:bg-[#a762b5]/10 transition"
              >
                <Eye className="h-4 w-4" />
                Ver portfólio
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {isOwner && hasNoActivity ? (
        <ZeroActivityOnboarding />
      ) : (
        <StatsSection
          portfoliosCount={profile.portfoliosCount}
          critiquesGivenCount={profile.critiquesGivenCount}
          upvotesReceivedCount={profile.upvotesReceivedCount}
          isPublicView={isPublicView}
        />
      )}

      {isOwner && <ActivitySection profile={profile} />}

      {/* Tabs — animated with prominent counts */}
      <div>
        <div className="relative border-b" ref={tabsRef}>
          {/* Animated indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-[#a762b5] transition-all duration-300 ease-out"
            style={{
              left: tabIndicatorStyle.left,
              width: tabIndicatorStyle.width,
            }}
          />
          <div className="flex gap-1">
            <TabButton
              active={activeTab === "portfolios"}
              onClick={(e) => handleTabClick("portfolios", e)}
              count={profile.portfolios.length}
            >
              <BookOpen className="h-4 w-4 inline mr-1.5" />
              Portfólios
            </TabButton>
            <TabButton
              active={activeTab === "critiques"}
              onClick={(e) => handleTabClick("critiques", e)}
              count={profile.critiquesGiven.length}
            >
              <MessageSquare className="h-4 w-4 inline mr-1.5" />
              Críticas
            </TabButton>
          </div>
        </div>

        {/* Tab content with animation */}
        <div className="mt-6 animate-in fade-in duration-300" key={activeTab}>
          {activeTab === "portfolios" && (
            <div>
              {profile.portfolios.length === 0 ? (
                <EmptyTabState
                  icon={<BookOpen className="h-12 w-12" />}
                  title={
                    isOwner
                      ? "Nenhum portfólio ainda"
                      : "Sem portfólios públicos"
                  }
                  message={
                    isOwner
                      ? "Você ainda não submeteu nenhum portfólio. Comece a mostrar seu trabalho para a comunidade."
                      : `${displayName} ainda não possui portfólios publicados.`
                  }
                  isOwner={isOwner}
                  ownerCta={{ label: "Submeter portfólio", href: "/submit" }}
                />
              ) : (
                <div
                  className={`grid gap-5 ${
                    isPublicView
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 gap-4 sm:grid-cols-2"
                  }`}
                >
                  {profile.portfolios.map((p) => (
                    <ProfilePortfolioCard
                      key={p._id}
                      portfolio={p}
                      isPublicView={isPublicView}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "critiques" && (
            <div className={isPublicView ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
              {profile.critiquesGiven.length === 0 ? (
                <EmptyTabState
                  icon={<MessageSquare className="h-12 w-12" />}
                  title={
                    isOwner
                      ? "Nenhuma crítica ainda"
                      : "Sem críticas publicadas"
                  }
                  message={
                    isOwner
                      ? "Você ainda não deixou nenhuma crítica. Explore o feed e ajude outros a crescer com seu feedback construtivo."
                      : `${displayName} ainda não deixou críticas em portfólios.`
                  }
                  isOwner={isOwner}
                  ownerCta={{ label: "Explorar feed", href: "/" }}
                />
              ) : (
                profile.critiquesGiven.map((c) => (
                  <ProfileCritiqueCard key={c._id} critique={c} isPublicView={isPublicView} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inspired CTA — only for public view */}
      {isPublicView && profile.portfolios.length > 0 && (
        <div className="rounded-2xl border bg-linear-to-br from-[#a762b5]/5 via-[#a762b5]/10 to-[#a762b5]/5 p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-[#a762b5]/10 p-4">
            <Sparkles className="h-6 w-6 text-[#a762b5]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Inspirado por este perfil?</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Junte-se à comunidade e comece a construir seu próprio portfólio
              para receber feedback valioso de outros profissionais.
            </p>
          </div>
          {!isSignedIn && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[#a762b5] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition shadow-sm"
            >
              Criar minha conta gratuita
            </Link>
          )}
          {isSignedIn && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-lg border border-[#a762b5] bg-[#a762b5]/10 px-6 py-2.5 text-sm font-medium text-[#a762b5] hover:bg-[#a762b5]/20 transition"
            >
              <BookOpen className="h-4 w-4" />
              Submeter meu portfólio
            </Link>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Membro desde {relativeTime(profile.createdAt)}
      </p>
    </div>
  );
}

function WelcomeSection({
  displayName,
  avatarUrl,
  portfoliosCount,
  critiquesGivenCount,
  upvotesReceivedCount,
}: {
  displayName: string;
  avatarUrl?: string;
  portfoliosCount: number;
  critiquesGivenCount: number;
  upvotesReceivedCount: number;
}) {
  const greeting = getGreeting();
  const timeMessage = getTimeBasedMessage();

  return (
    <div className="relative overflow-hidden rounded-xl border bg-linear-to-br from-[#a762b5]/5 via-background to-background p-6 animate-in fade-in duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#a762b5]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#a762b5]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#a762b5]/20"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a762b5]/10 text-xl font-semibold text-[#a762b5]">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {greeting}
            </p>
            <h2 className="text-xl font-semibold">{displayName}</h2>
          </div>
        </div>

        <div className="sm:ml-auto flex flex-wrap gap-4">
          <QuickStat icon={<BookOpen className="h-4 w-4" />} value={portfoliosCount} label="portfólios" />
          <QuickStat icon={<MessageSquare className="h-4 w-4" />} value={critiquesGivenCount} label="críticas" />
          <QuickStat icon={<ThumbsUp className="h-4 w-4" />} value={upvotesReceivedCount} label="upvotes" />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground max-w-xl">
        {timeMessage}
      </p>
    </div>
  );
}

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#a762b5]">{icon}</span>
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}

function QuickActionsPanel({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link
        href="/submit"
        className="group flex items-center gap-3 rounded-xl border bg-[#a762b5]/5 hover:bg-[#a762b5]/10 p-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a762b5]/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#a762b5]/10 text-[#a762b5] group-hover:scale-110 transition-transform">
          <Plus className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Submit New Portfolio</p>
          <p className="text-xs text-muted-foreground truncate">Share your latest work</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </Link>

      <Link
        href="/setup-profile"
        className="group flex items-center gap-3 rounded-xl border bg-muted/50 hover:bg-muted p-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:scale-110 transition-transform">
          <Edit className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Edit Profile</p>
          <p className="text-xs text-muted-foreground truncate">Update your info</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </Link>

      <button
        type="button"
        onClick={() => setActiveTab("critiques")}
        className={cn(
          "group flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left w-full",
          activeTab === "critiques"
            ? "bg-muted border-[#a762b5]/30"
            : "bg-muted/50 hover:bg-muted"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            activeTab === "critiques"
              ? "bg-[#a762b5]/10 text-[#a762b5]"
              : "bg-secondary text-secondary-foreground group-hover:scale-110"
          )}
        >
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">View My Critiques</p>
          <p className="text-xs text-muted-foreground truncate">See your feedback</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function StatsSection({
  portfoliosCount,
  critiquesGivenCount,
  upvotesReceivedCount,
  isPublicView,
}: {
  portfoliosCount: number;
  critiquesGivenCount: number;
  upvotesReceivedCount: number;
  isPublicView?: boolean;
}) {
  if (isPublicView) {
    return (
      <div className="flex flex-wrap gap-6 rounded-xl border bg-card p-4">
        <QuickStat icon={<BookOpen className="h-4 w-4" />} value={portfoliosCount} label="portfólios" />
        <QuickStat icon={<MessageSquare className="h-4 w-4" />} value={critiquesGivenCount} label="críticas" />
        <QuickStat icon={<ThumbsUp className="h-4 w-4" />} value={upvotesReceivedCount} label="upvotes" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 group hover:border-[#a762b5]/30 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a762b5]/10 text-[#a762b5]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Portfólios</p>
              <p className="text-lg font-semibold tabular-nums">{portfoliosCount}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 group hover:border-[#a762b5]/30 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a762b5]/10 text-[#a762b5]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Críticas dadas</p>
              <p className="text-lg font-semibold tabular-nums">{critiquesGivenCount}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 group hover:border-[#a762b5]/30 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a762b5]/10 text-[#a762b5]">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upvotes recebidos</p>
              <p className="text-lg font-semibold tabular-nums">{upvotesReceivedCount}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

type ProfileData = {
  portfolios: ProfilePortfolioData[];
  critiquesGiven: ProfileCritiqueData[];
};

function ActivitySection({ profile }: { profile: ProfileData }) {
  const recentCritiques = profile.critiquesGiven.slice(0, 3);
  const hasRecentActivity = recentCritiques.length > 0;

  if (!hasRecentActivity) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#a762b5]" />
        <h3 className="text-sm font-medium">Atividade Recente</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recentCritiques.map((critique) => (
          <Link
            key={critique._id}
            href={`/portfolio/${critique.portfolioId}`}
            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a762b5]/10 text-[#a762b5]">
              <Star className="h-4 w-4 fill-[#a762b5] text-[#a762b5]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">
                {critique.portfolioTitle ?? "Portfólio removido"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StarDisplay rating={critique.rating} />
                <span className="text-[10px] text-muted-foreground">
                  {relativeTime(critique.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ZeroActivityOnboarding() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a762b5]/10">
        <Sparkles className="h-8 w-8 text-[#a762b5]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Bem-vindo ao PeerFolio</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        Você ainda não submeteu nenhum portfólio. Comece a construir sua presença
        na comunidade compartilhando seus melhores trabalhos.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/submit">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Submeter portfólio
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Globe className="h-4 w-4" />
            Explorar comunidade
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
        active
          ? "text-[#a762b5]"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "ml-1.5 rounded-full px-2 py-0.5 text-xs transition-colors",
            active
              ? "bg-[#a762b5]/10 text-[#a762b5]"
              : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyTabState({
  icon,
  title,
  message,
  isOwner,
  ownerCta,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  isOwner: boolean | undefined;
  ownerCta: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="rounded-full bg-muted p-4 text-muted-foreground/40">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
      </div>
      {isOwner && (
        <Link href={ownerCta.href as any}>
          <Button variant="outline" size="sm" className="gap-2">
            {ownerCta.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
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

function ProfilePortfolioCard({
  portfolio,
  isPublicView,
}: {
  portfolio: ProfilePortfolioData;
  isPublicView?: boolean;
}) {
  return (
    <Link
      href={`/portfolio/${portfolio._id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300",
        isPublicView
          ? "hover:shadow-lg hover:-translate-y-1 hover:border-[#a762b5]/30"
          : "hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      )}
    >
      {/* Preview thumbnail with hover overlay */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-t-xl bg-muted",
          isPublicView ? "aspect-4/3" : "aspect-video"
        )}
      >
        {portfolio.previewImageUrl ? (
          <img
            src={portfolio.previewImageUrl}
            alt={`Preview de ${portfolio.title}`}
            className={cn(
              "object-cover transition-all duration-500",
              isPublicView ? "group-hover:scale-110 h-full w-full" : "h-full w-full group-hover:scale-105"
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
            <Globe className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Hover overlay with CTA — only for public view */}
        {isPublicView && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#a762b5]/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#a762b5] shadow-lg flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Ver portfólio
            </span>
          </div>
        )}

        {/* Area badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-semibold shadow-xs backdrop-blur-xs">
            {portfolio.area}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-semibold line-clamp-2 flex-1 leading-tight",
              isPublicView ? "text-base" : "text-sm"
            )}
          >
            {portfolio.title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground truncate font-mono">
          {portfolio.normalizedUrl}
        </p>
      </div>

      {/* Stats bar */}
      <div className="px-4 pb-4 flex items-center justify-between border-t pt-3 mt-auto">
        <div className="flex items-center gap-3 text-xs">
          {portfolio.averageRating > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              {portfolio.averageRating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {portfolio.critiqueCount} crítica{portfolio.critiqueCount !== 1 ? "s" : ""}
          </span>
        </div>
        {isPublicView && (
          <span className="text-xs text-[#a762b5] font-medium group-hover:translate-x-1 transition-transform">
            Ver →
          </span>
        )}
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

function ProfileCritiqueCard({
  critique,
  isPublicView,
}: {
  critique: ProfileCritiqueData;
  isPublicView?: boolean;
}) {
  const isDeleted = critique.portfolioTitle === null;

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 space-y-3 transition",
        isPublicView ? "hover:shadow-md" : "hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Portfolio link or deleted label */}
        {isDeleted ? (
          <span className="text-xs text-muted-foreground italic">
            Portfólio removido pelo autor
          </span>
        ) : (
          <Link
            href={`/portfolio/${critique.portfolioId}`}
            className={cn(
              "font-medium hover:underline truncate",
              isPublicView ? "text-sm max-w-[75%]" : "text-xs max-w-[70%]"
            )}
          >
            {critique.portfolioTitle}
            {critique.portfolioArea && (
              <span className="ml-2 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {critique.portfolioArea}
              </span>
            )}
          </Link>
        )}

        <StarDisplay rating={critique.rating} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {critique.feedback}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {critique.upvotes} upvote{critique.upvotes !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {relativeTime(critique.createdAt)}
        </span>
      </div>
    </article>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-pulse">
      <div className="rounded-xl border p-6">
        <div className="flex gap-4 items-center">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-muted" />
            <div className="h-6 w-32 rounded-md bg-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="flex gap-6 items-center">
        <div className="h-20 w-20 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-40 rounded-md bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      <div className="h-16 rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <PortfolioCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
