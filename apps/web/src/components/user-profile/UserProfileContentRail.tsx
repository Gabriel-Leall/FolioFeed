import { BookOpen, MessageSquare, Plus, Sparkles, Inbox } from "lucide-react";
import Link from "next/link";

import type { UserProfileTab, UserProfilePortfolio, UserProfileCritique, UserProfileReceivedCritique } from "./types";
import { UserProfilePortfolioCardXL } from "./UserProfilePortfolioCardXL";
import { UserProfileCritiqueCardXL } from "./UserProfileCritiqueCardXL";

type UserProfileContentRailProps = {
  activeTab: UserProfileTab;
  portfolios: UserProfilePortfolio[];
  critiques: UserProfileCritique[];
  receivedCritiques?: UserProfileReceivedCritique[];
  isOwner?: boolean;
};

function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-low py-16 text-center">
      <div className="rounded-full bg-surface-container p-4 text-on-surface-variant/40">{icon}</div>
      <h3 className="mt-4 font-serif text-xl italic text-on-surface">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-on-surface-variant">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function ReceivedCritiquesTab({
  receivedCritiques,
  isOwner,
}: {
  receivedCritiques: UserProfileReceivedCritique[];
  isOwner?: boolean;
}) {
  if (receivedCritiques.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-8 w-8" />}
        title={isOwner ? "Nenhuma crítica recebida" : "Sem críticas recebidas"}
        message={
          isOwner
            ? "Você ainda não recebeu nenhuma crítica nos seus portfólios. Compartilhe seus portfólios para receber feedback!"
            : "Este usuário ainda não recebeu críticas nos seus portfólios."
        }
        action={
          isOwner ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              Compartilhar portfólio
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {receivedCritiques.map((c) => (
        <div
          key={c._id}
          className="rounded-xl border border-white/5 bg-[#0a0a0a] p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {c.author.avatarUrl ? (
                <img
                  src={c.author.avatarUrl}
                  alt={c.author.nickname || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  {(c.author.nickname?.[0] || "?").toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-white">
                  {c.author.nickname || "Anônimo"}
                </p>
                <p className="text-xs text-white/50">
                  Crítica em: {c.portfolio.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < c.rating ? "text-yellow-400" : "text-white/20"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-white/80 leading-relaxed">
            {c.feedback}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
            <span>{c.upvotes} upvotes</span>
            <span>
              {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserProfileContentRail({
  activeTab,
  portfolios,
  critiques,
  receivedCritiques = [],
  isOwner,
}: UserProfileContentRailProps) {
  if (activeTab === "portfolios") {
    if (portfolios.length === 0) {
      return (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={isOwner ? "Nenhum portfólio ainda" : "Sem portfólios"}
          message={
            isOwner
              ? "Você ainda não submeteu nenhum portfólio. Comece a mostrar seu trabalho."
              : "Este usuário ainda não possui portfólios publicados."
          }
          action={
            isOwner ? (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Submeter portfólio
              </Link>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="grid gap-6">
        {portfolios.map((p) => (
          <UserProfilePortfolioCardXL key={p._id} portfolio={p} />
        ))}
      </div>
    );
  }

  if (activeTab === "critiques") {
    if (critiques.length === 0) {
      return (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title={isOwner ? "Nenhuma crítica ainda" : "Sem críticas"}
          message={
            isOwner
              ? "Você ainda não deixou nenhuma crítica. Explore o feed e ajude outros."
              : "Este usuário ainda não deixou críticas em portfólios."
          }
          action={
            isOwner ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Explorar feed
              </Link>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="grid gap-4">
        {critiques.map((c) => (
          <UserProfileCritiqueCardXL key={c._id} critique={c} />
        ))}
      </div>
    );
  }

  if (activeTab === "received") {
    return (
      <ReceivedCritiquesTab
        receivedCritiques={receivedCritiques}
        isOwner={isOwner}
      />
    );
  }

  return null;
}
