"use client";

import { useState } from "react";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@PeerFolio/ui/components/button";
import { cn } from "@PeerFolio/ui/lib/utils";
import { toast } from "sonner";

const PORTFOLIO_REASONS = [
  { value: "SPAM", label: "SPAM", description: "URL que não é portfólio" },
  { value: "PLAGIARISM", label: "PLAGIARISM", description: "Portfólio copiado" },
  { value: "DUPLICATE", label: "DUPLICATE", description: "Mesmo portfólio com outro título" },
  { value: "INAPPROPRIATE", label: "INAPPROPRIATE", description: "Conteúdo ofensivo" },
  { value: "NOT_PORTFOLIO", label: "NOT_PORTFOLIO", description: "Site que não é portfólio" },
  { value: "OTHER", label: "OTHER", description: "Outro motivo" },
] as const;

const CRITIQUE_REASONS = [
  { value: "OFFENSIVE", label: "OFFENSIVE", description: "Comentário abusivo" },
  { value: "SPAM", label: "SPAM", description: "Crítica sem conteúdo real" },
  { value: "HARASSMENT", label: "HARASSMENT", description: "Ataque pessoal" },
  { value: "FAKE_REVIEW", label: "FAKE_REVIEW", description: "Crítica coordenada" },
  { value: "OTHER", label: "OTHER", description: "Outro motivo" },
] as const;

interface ReportModalProps {
  targetId: any;
  targetType: "portfolio" | "critique";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({ targetId, targetType, open, onOpenChange }: ReportModalProps) {
  const { isSignedIn } = useUser();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReport = useMutation(api.reports.mutations.create);

  const reasons = targetType === "portfolio" ? PORTFOLIO_REASONS : CRITIQUE_REASONS;

  const handleSubmit = async () => {
    if (!isSignedIn) {
      toast.error("Faça login para denunciar");
      return;
    }

    if (!selectedReason) return;
    if (selectedReason === "OTHER" && !description.trim()) {
      toast.error("Por favor, descreva o motivo");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        targetId,
        targetType,
        reason: selectedReason as any,
        description: selectedReason === "OTHER" ? description : undefined,
      });
      toast.success("Denúncia enviada. Obrigado!");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar denúncia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription("");
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
          Denunciar {targetType === "portfolio" ? "Portfólio" : "Crítica"}
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Selecione o motivo da denúncia
        </p>

        <div className="grid gap-2 max-h-[300px] overflow-y-auto mb-4">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                selectedReason === reason.value
                  ? "border-primary bg-primary/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <span className={cn(
                "font-medium",
                selectedReason === reason.value ? "text-primary" : "text-white"
              )}>
                {reason.label}
              </span>
              <span className="text-xs text-white/50">{reason.description}</span>
            </button>
          ))}

          {selectedReason === "OTHER" && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              placeholder="Descreva o motivo (máx. 300 caracteres)"
              className="mt-2 w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-white/10 text-white hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-primary hover:bg-secondary"
          >
            {isSubmitting ? "Enviando..." : "Denunciar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
