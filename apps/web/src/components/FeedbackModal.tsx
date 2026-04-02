"use client";

import { useState } from "react";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@PeerFolio/ui/components/button";
import { cn } from "@PeerFolio/ui/lib/utils";
import { toast } from "sonner";
import { useI18n } from "@/i18n/provider";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useMutation(api.feedback.mutations.submitFeedback);

  const feedbackLen = feedback.trim().length;
  const canSubmit = feedbackLen >= 20 && !isSubmitting;

  const handleSubmit = async () => {
    if (!isSignedIn) {
      toast.error(t("modal.auth.description"));
      return;
    }

    if (!canSubmit) {
      toast.error(t("portfolio.form.minCritique"));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({ feedback: feedback.trim() });
      toast.success(t("portfolio.form.success"));
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || t("portfolio.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md mx-4 p-6 rounded-2xl bg-[#131313] border border-white/10 shadow-2xl">
        <h2 className="font-serif text-xl text-white mb-2">
          {`Feedback do ${t("brand.name")}`}
        </h2>
        <p className="text-white/60 text-sm mb-4">
          {t("feed.feedbackPrompt")}
        </p>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
          placeholder={t("portfolio.form.critiquePlaceholder")}
          className="w-full p-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
        />

        <div className="flex justify-between items-center mt-3 mb-4">
          <span className={cn(
            "text-xs",
            feedbackLen > 900
              ? "text-red-400"
              : feedbackLen < 20 && feedbackLen > 0
                ? "text-yellow-400"
                : "text-white/40"
          )}>
            {feedbackLen > 0 ? `${feedbackLen}/1000` : t("portfolio.form.minCritique")}
          </span>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-white/10 text-white hover:bg-white/5"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-primary hover:bg-secondary"
          >
            {isSubmitting ? t("portfolio.form.submitting") : t("feed.contributeFeedback")}
          </Button>
        </div>
      </div>
    </div>
  );
}
