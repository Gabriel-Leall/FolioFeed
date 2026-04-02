"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation, useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AREA_VALUES, type Area } from "@PeerFolio/backend/convex/lib/constants";
import { CharacterCounter } from "@/components/CharacterCounter";
import { useI18n } from "@/i18n/provider";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FieldError = {
  url?: string;
  title?: string;
  area?: string;
  stack?: string;
  goalsContext?: string;
  general?: string;
};

type ValidationState = "idle" | "validating" | "valid" | "invalid";

// ---------------------------------------------------------------------------
// Predefined stack tags
// ---------------------------------------------------------------------------

const PREDEFINED_TAGS = [
  "React", "Next.js", "Vue", "Angular", "Svelte",
  "TypeScript", "JavaScript", "Python", "Rust", "Go",
  "Node.js", "FastAPI", "Django", "Rails", "Laravel",
  "Tailwind CSS", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "Docker", "AWS", "GCP", "Figma", "Three.js",
] as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SubmitPortfolioForm() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const profile = useQuery(api.users.queries.getMe);
  useEffect(() => {
    if (profile === null) {
      router.push("/setup-profile?redirect=/submit" as any);
    }
  }, [profile, router]);

  const submitMutation = useMutation(api.portfolios.mutations.submit);
  const validateUrlAction = useAction(api.portfolios.actions.validateUrl);

  // Form fields
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<Area | "">("");
  const [stackTags, setStackTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [goalsContext, setGoalsContext] = useState("");

  // Validation state
  const [urlValidation, setUrlValidation] = useState<ValidationState>("idle");
  const [normalizedUrl, setNormalizedUrl] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validate URL with 800ms debounce
  const handleUrlChange = useCallback(
    (value: string) => {
      setUrl(value);
      setUrlValidation("idle");
      setNormalizedUrl("");
      setErrors((prev) => ({ ...prev, url: undefined }));

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length === 0) return;

      setUrlValidation("validating");
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await validateUrlAction({ url: value.trim() });
          if (result.reachable) {
            setUrlValidation("valid");
            setNormalizedUrl(result.normalizedUrl);
            setErrors((prev) => ({ ...prev, url: undefined }));
          } else {
            setUrlValidation("invalid");
              setErrors((prev) => ({
                ...prev,
                url: t("submit.form.urlNotReachable"),
              }));
            }
          } catch (err: unknown) {
            setUrlValidation("invalid");
            const msg =
              err instanceof Error && err.message.includes("INVALID_URL")
                ? t("submit.form.invalidUrl")
                : err instanceof Error && err.message.includes("UNSAFE_URL")
                  ? t("submit.form.urlUnsafe")
                  : t("submit.form.urlError");
            setErrors((prev) => ({ ...prev, url: msg }));
          }
      }, 800);
    },
    [validateUrlAction],
  );

  // Stack tag management
  const toggleTag = (tag: string) => {
    setStackTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 8) {
        setErrors((e) => ({ ...e, stack: t("submit.form.maxTags") }));
        return prev;
      }
      return [...prev, tag];
    });
    setErrors((prev) => ({ ...prev, stack: undefined }));
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag) return;
    if (stackTags.length >= 8) {
      setErrors((e) => ({ ...e, stack: t("submit.form.maxTags") }));
      return;
    }
    if (!stackTags.includes(tag)) {
      setStackTags((prev) => [...prev, tag]);
    }
    setCustomTagInput("");
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FieldError = {};

    if (urlValidation !== "valid") {
      newErrors.url = t("submit.form.invalidUrl");
    }
    if (title.trim().length === 0) {
      newErrors.title = t("submit.form.titleRequired");
    } else if (title.length > 80) {
      newErrors.title = t("submit.form.titleMax");
    }
    if (!area) {
      newErrors.area = t("submit.form.areaRequired");
    }
    if (goalsContext.length > 300) {
      newErrors.goalsContext = t("submit.form.goalsContextMax");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await submitMutation({
        url: normalizedUrl || url.trim(),
        title: title.trim(),
        area: area as Area,
        stack: stackTags,
        goalsContext: goalsContext.trim() || undefined,
      });

      if (result.claimed) {
        alert(t("submit.form.claimSuccess"));
      }

      router.push(`/portfolio/${result.portfolioId}`);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : String(err);

      if (errMsg.includes("DUPLICATE_URL")) {
        setErrors({ url: t("submit.form.duplicateUrl") });
      } else if (errMsg.includes("UNAUTHENTICATED")) {
        setErrors({ general: t("submit.form.unauthenticated") });
      } else {
        setErrors({ general: t("submit.form.error") });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = urlValidation === "valid" && !isSubmitting;

  const urlBorderClass =
    urlValidation === "valid"
      ? "border-green-500 focus:ring-green-500/30"
      : urlValidation === "invalid"
        ? "border-destructive focus:ring-destructive/30"
        : "";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errors.general && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.general}
        </div>
      )}

      {/* URL */}
      <div className="space-y-1.5">
        <label htmlFor="portfolio-url" className="block text-sm font-medium">
          {t("submit.form.urlLabel")} <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            id="portfolio-url"
            type="url"
            name="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={t("submit.form.urlPlaceholder")}
            autoComplete="url"
            aria-describedby={errors.url ? "url-error" : undefined}
            aria-invalid={errors.url ? "true" : undefined}
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 ${urlBorderClass}`}
          />
          {urlValidation === "validating" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {t("submit.form.urlValidating")}
            </span>
          )}
          {urlValidation === "valid" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500">✓</span>
          )}
        </div>
        {errors.url && (
          <p id="url-error" role="alert" className="text-xs text-destructive">
            {errors.url}
          </p>
        )}
        {urlValidation === "valid" && normalizedUrl && normalizedUrl !== url && (
          <p className="text-xs text-muted-foreground">
            {t("submit.form.urlNormalized")} <span className="font-mono">{normalizedUrl}</span>
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="portfolio-title" className="block text-sm font-medium">
            {t("submit.form.titleLabel")} <span aria-hidden="true" className="text-destructive">*</span>
          </label>
          <CharacterCounter current={title.length} max={80} />
        </div>
        <input
          id="portfolio-title"
          type="text"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          placeholder={t("submit.form.titlePlaceholder")}
          maxLength={80}
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={errors.title ? "true" : undefined}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2"
        />
        {errors.title && (
          <p id="title-error" role="alert" className="text-xs text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      {/* Area */}
      <div className="space-y-1.5">
        <label htmlFor="portfolio-area" className="block text-sm font-medium">
          {t("submit.form.areaLabel")} <span aria-hidden="true" className="text-destructive">*</span>
        </label>
        <select
          id="portfolio-area"
          name="area"
          value={area}
          onChange={(e) => {
            setArea(e.target.value as Area);
            setErrors((prev) => ({ ...prev, area: undefined }));
          }}
          aria-describedby={errors.area ? "area-error" : undefined}
          aria-invalid={errors.area ? "true" : undefined}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2"
        >
          <option value="">{t("submit.form.areaPlaceholder")}</option>
          {AREA_VALUES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {errors.area && (
          <p id="area-error" role="alert" className="text-xs text-destructive">
            {errors.area}
          </p>
        )}
      </div>

      {/* Stack Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium" id="stack-label">
            {t("submit.form.stackLabel")} <span className="text-muted-foreground font-normal">{t("submit.form.stackMax")}</span>
          </span>
          {stackTags.length > 0 && (
            <span className="text-xs text-muted-foreground">{stackTags.length}/8</span>
          )}
        </div>

        <div role="group" aria-labelledby="stack-label" className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => {
            const selected = stackTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent hover:bg-muted"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Custom tag input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder={t("submit.form.customTagPlaceholder")}
            aria-label={t("submit.form.customTagPlaceholder")}
            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2"
          />
          <button
            type="button"
            onClick={addCustomTag}
            disabled={!customTagInput.trim() || stackTags.length >= 8}
            className="rounded-md border px-3 py-1.5 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("submit.form.addTag")}
          </button>
        </div>

        {/* Selected tags */}
        {stackTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stackTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setStackTags((prev) => prev.filter((t) => t !== tag))}
                  aria-label={`${t("submit.form.removeTag")} ${tag}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {errors.stack && (
          <p role="alert" className="text-xs text-destructive">
            {errors.stack}
          </p>
        )}
      </div>

      {/* Goals Context */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="goals-context" className="block text-sm font-medium">
            {t("submit.form.goalsContextLabel")} <span className="text-muted-foreground font-normal">{t("submit.form.goalsContextOptional")}</span>
          </label>
          <CharacterCounter current={goalsContext.length} max={300} />
        </div>
        <textarea
          id="goals-context"
          name="goalsContext"
          value={goalsContext}
          onChange={(e) => {
            setGoalsContext(e.target.value);
            setErrors((prev) => ({ ...prev, goalsContext: undefined }));
          }}
          placeholder={t("submit.form.goalsContextPlaceholder")}
          maxLength={300}
          rows={3}
          aria-describedby={errors.goalsContext ? "goals-error" : undefined}
          aria-invalid={errors.goalsContext ? "true" : undefined}
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2"
        />
        {errors.goalsContext && (
          <p id="goals-error" role="alert" className="text-xs text-destructive">
            {errors.goalsContext}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Submetendo…"
          : urlValidation === "validating"
            ? t("submit.form.validating")
            : t("submit.form.submitButton")}
      </button>
    </form>
  );
}
