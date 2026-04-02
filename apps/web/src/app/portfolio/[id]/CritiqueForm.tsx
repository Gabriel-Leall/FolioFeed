"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import type { Id } from "@PeerFolio/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

import AuthModal from "@/components/AuthModal";
import { CharacterCounter } from "@/components/CharacterCounter";
import { useI18n } from "@/i18n/provider";

// ---------------------------------------------------------------------------
// Star Rating sub-component
// ---------------------------------------------------------------------------

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label={t("portfolio.form.ratingHelper")}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`text-2xl transition disabled:cursor-not-allowed ${
            star <= (hovered || value) ? "text-amber-400" : "text-muted-foreground/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CritiqueForm
// ---------------------------------------------------------------------------

type CritiqueFormProps = {
  portfolioId: Id<"portfolios">;
  portfolioUrl: string;
  isOwner: boolean;
};

export default function CritiqueForm({ portfolioId, portfolioUrl, isOwner }: CritiqueFormProps) {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const submitCritique = useMutation(api.critiques.mutations.submit);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const feedbackLen = feedback.trim().length;
  const canSubmit = rating > 0 && feedbackLen >= 20 && feedbackLen <= 1000 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    if (rating === 0) {
      setError(t("portfolio.form.ratingHelper"));
      return;
    }
    if (feedbackLen < 20) {
      setError(t("portfolio.form.minCritique"));
      return;
    }
    if (feedbackLen > 1_000) {
      setError("O feedback pode ter no máximo 1.000 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitCritique({ portfolioId, rating, feedback: feedback.trim() });
      setSuccess(true);
      setFeedback("");
      setRating(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("ALREADY_CRITIQUED")) {
        setError("Voce ja deixou uma critica para este portfolio.");
      } else if (msg.includes("SELF_CRITIQUE_NOT_ALLOWED")) {
        setError("Voce nao pode criticar seu proprio portfolio.");
      } else if (msg.includes("RATE_LIMIT_EXCEEDED")) {
        setError("Voce atingiu o limite de 5 criticas por hora. Tente mais tarde.");
      } else {
        setError(t("portfolio.form.error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOwner) {
    return null;
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400"
      >
        ✓ {t("portfolio.form.success")}
      </div>
    );
  }

  return (
    <>
      <form id="critique-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium">
            {t("portfolio.form.ratingLabel")} <span aria-hidden="true" className="text-destructive">*</span>
          </span>
          <StarRating value={rating} onChange={setRating} disabled={isSubmitting} />
        </div>

        {/* Feedback Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="critique-feedback" className="block text-sm font-medium">
              {t("portfolio.form.critiqueLabel")} <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <CharacterCounter current={feedbackLen} max={1000} />
          </div>
          <textarea
            id="critique-feedback"
            name="feedback"
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              setError(null);
            }}
            placeholder={t("portfolio.form.critiquePlaceholder")}
            minLength={20}
            maxLength={1000}
            rows={5}
            disabled={isSubmitting}
            aria-describedby={error ? "critique-error" : "critique-hint"}
            aria-invalid={error ? "true" : undefined}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
          />
          <p id="critique-hint" className="text-xs text-muted-foreground">
            {t("portfolio.form.critiqueHelper")}
          </p>
        </div>

        {error && (
          <p id="critique-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit && isSignedIn !== false}
          onClick={!isSignedIn ? () => setShowAuthModal(true) : undefined}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t("portfolio.form.submitting") : t("portfolio.detail.critiqueButton")}
        </button>
      </form>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title={t("modal.auth.title")}
        description={t("modal.auth.description")}
        redirectTo={`/portfolio/${portfolioId}`}
      />
    </>
  );
}
