import { v } from "convex/values";

import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { isSafeUrl } from "../lib/urlUtils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8_000;
const MAX_PREVIEW_ATTEMPTS = 3;
const OFFLINE_ARCHIVE_THRESHOLD = 30; // consecutive offline → archive
const ONLINE_BADGE_THRESHOLD = 3;     // consecutive offline → show badge

// ---------------------------------------------------------------------------
// updatePreviewResult — internal mutation to write preview result to DB
// ---------------------------------------------------------------------------

export const updatePreviewResult = internalMutation({
  args: {
    portfolioId: v.id("portfolios"),
    previewImageUrl: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("failed")),
    attemptCount: v.number(),
  },
  handler: async (ctx, { portfolioId, previewImageUrl, status, attemptCount }) => {
    if (status === "success" && previewImageUrl) {
      await ctx.db.patch(portfolioId, {
        previewImageUrl,
        previewStatus: "success",
        previewAttemptCount: attemptCount,
      });
    } else {
      await ctx.db.patch(portfolioId, {
        previewStatus: attemptCount >= MAX_PREVIEW_ATTEMPTS ? "failed" : "pending",
        previewAttemptCount: attemptCount,
      });
    }
  },
});

// ---------------------------------------------------------------------------
// T036 — generatePreview: fires after portfolio insert
// Calls ScreenshotOne API; retries up to 3x with exponential back-off
// ---------------------------------------------------------------------------

export const generatePreview = internalAction({
  args: {
    portfolioId: v.id("portfolios"),
    normalizedUrl: v.string(),
    attemptCount: v.number(),
  },
  handler: async (ctx, { portfolioId, normalizedUrl, attemptCount }) => {
    const newAttemptCount = attemptCount + 1;

    const screenshotApiKey = process.env.SCREENSHOT_ONE_KEY;

    // If no API key configured, mark as failed immediately
    if (!screenshotApiKey) {
      await ctx.runMutation(internal.portfolios.scheduled.updatePreviewResult, {
        portfolioId,
        status: "failed",
        attemptCount: newAttemptCount,
      });
      return;
    }

    const screenshotUrl =
      `https://api.screenshotone.com/take` +
      `?access_key=${screenshotApiKey}` +
      `&url=${encodeURIComponent(normalizedUrl)}` +
      `&viewport_width=1280&viewport_height=800` +
      `&format=webp&image_quality=80` +
      `&full_page=false&delay=2` +
      `&response_type=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(screenshotUrl, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Screenshot API returned ${response.status}`);
      }

      const data = (await response.json()) as { url?: string };
      const previewImageUrl = data.url;

      if (!previewImageUrl) {
        throw new Error("No URL in screenshot response");
      }

      await ctx.runMutation(internal.portfolios.scheduled.updatePreviewResult, {
        portfolioId,
        previewImageUrl,
        status: "success",
        attemptCount: newAttemptCount,
      });
    } catch {
      // Schedule retry if under max attempts
      if (newAttemptCount < MAX_PREVIEW_ATTEMPTS) {
        // Exponential backoff: 15min → 1h → 24h
        const delayMs = newAttemptCount === 1
          ? 15 * 60 * 1000
          : newAttemptCount === 2
          ? 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

        await ctx.scheduler.runAfter(
          delayMs,
          internal.portfolios.scheduled.generatePreview,
          { portfolioId, normalizedUrl, attemptCount: newAttemptCount },
        );
      } else {
        // Max retries reached — mark as failed
        await ctx.runMutation(internal.portfolios.scheduled.updatePreviewResult, {
          portfolioId,
          status: "failed",
          attemptCount: newAttemptCount,
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }
  },
});

// ---------------------------------------------------------------------------
// updateUrlHealthResult — internal mutation to write URL health to DB
// ---------------------------------------------------------------------------

export const updateUrlHealthResult = internalMutation({
  args: {
    portfolioId: v.id("portfolios"),
    isOnline: v.boolean(),
    currentConsecutiveOfflineCount: v.number(),
    authorId: v.id("users"),
  },
  handler: async (ctx, { portfolioId, isOnline, currentConsecutiveOfflineCount, authorId }) => {
    void authorId; // reserved for future notification system

    if (isOnline) {
      await ctx.db.patch(portfolioId, {
        urlStatus: "online",
        consecutiveOfflineCount: 0,
      });
    } else {
      const newOfflineCount = currentConsecutiveOfflineCount + 1;

      // After 30 consecutive offline days → archive
      if (newOfflineCount >= OFFLINE_ARCHIVE_THRESHOLD) {
        await ctx.db.patch(portfolioId, {
          urlStatus: "offline",
          consecutiveOfflineCount: newOfflineCount,
          isArchived: true,
        });
      } else {
        await ctx.db.patch(portfolioId, {
          urlStatus: "offline",
          consecutiveOfflineCount: newOfflineCount,
        });
      }
    }
  },
});

// ---------------------------------------------------------------------------
// T037 — checkUrlHealth: HEAD request on a single portfolio's normalizedUrl
// Called by the cron (checkAllUrlHealth) once per day per portfolio
// ---------------------------------------------------------------------------

export const checkUrlHealth = internalAction({
  args: {
    portfolioId: v.id("portfolios"),
    normalizedUrl: v.string(),
    consecutiveOfflineCount: v.number(),
    authorId: v.id("users"),
  },
  handler: async (ctx, { portfolioId, normalizedUrl, consecutiveOfflineCount, authorId }) => {
    if (!isSafeUrl(normalizedUrl)) {
      return; // Skip unsafe URLs (shouldn't happen, but guard anyway)
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let isOnline = false;

    try {
      const response = await fetch(normalizedUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });
      isOnline = response.status >= 200 && response.status < 400;
    } catch {
      // Network error or timeout → treat as offline
      isOnline = false;
    } finally {
      clearTimeout(timeoutId);
    }

    await ctx.runMutation(internal.portfolios.scheduled.updateUrlHealthResult, {
      portfolioId,
      isOnline,
      currentConsecutiveOfflineCount: consecutiveOfflineCount,
      authorId,
    });
  },
});

// ---------------------------------------------------------------------------
// checkAllUrlHealth — internal action fanned out from cron
// Iterates all active portfolios and schedules individual health checks
// ---------------------------------------------------------------------------

export const checkAllUrlHealth = internalAction({
  args: {},
  handler: async (ctx) => {
    // We use runQuery to fetch all active portfolios
    const portfolios = await ctx.runQuery(
      internal.portfolios.scheduled.listActivePortfoliosForHealthCheck,
    );

    for (const portfolio of portfolios) {
      await ctx.scheduler.runAfter(
        0,
        internal.portfolios.scheduled.checkUrlHealth,
        {
          portfolioId: portfolio._id,
          normalizedUrl: portfolio.normalizedUrl,
          consecutiveOfflineCount: portfolio.consecutiveOfflineCount ?? 0,
          authorId: portfolio.authorId,
        },
      );
    }
  },
});

// ---------------------------------------------------------------------------
// listActivePortfoliosForHealthCheck — internal query used by the cron fan-out
// ---------------------------------------------------------------------------

export const listActivePortfoliosForHealthCheck = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Return portfolios that are active (not deleted, not archived)
    const all = await ctx.db
      .query("portfolios")
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.neq(q.field("isArchived"), true),
        ),
      )
      .collect();

    return all.map((p) => ({
      _id: p._id,
      normalizedUrl: p.normalizedUrl,
      consecutiveOfflineCount: p.consecutiveOfflineCount ?? 0,
      authorId: p.authorId,
    }));
  },
});

// ---------------------------------------------------------------------------
// Retry delay helpers (exported for tests)
// ---------------------------------------------------------------------------

export const RETRY_DELAYS_MS = [
  15 * 60 * 1000,   // 15 min
  60 * 60 * 1000,   // 1 hour
  24 * 60 * 60 * 1000, // 24 hours
] as const;

export { ONLINE_BADGE_THRESHOLD, OFFLINE_ARCHIVE_THRESHOLD, MAX_PREVIEW_ATTEMPTS };
