import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { getInternalUser } from "../lib/auth";

const ONE_HOUR_MS = 60 * 60 * 1_000;
const MAX_CRITIQUES_PER_HOUR = 5;

// ---------------------------------------------------------------------------
// critiques.submit
// ---------------------------------------------------------------------------

export const submit = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    rating: v.number(),
    feedback: v.string(),
  },
  returns: v.object({ critiqueId: v.id("critiques") }),
  handler: async (ctx, args) => {
    const user = await getInternalUser(ctx);

    // Validate rating range (1–5)
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new ConvexError("INVALID_RATING");
    }

    // Validate feedback length (20–1000 chars)
    const feedbackLen = args.feedback.trim().length;
    if (feedbackLen < 20) {
      throw new ConvexError("FEEDBACK_TOO_SHORT");
    }
    if (feedbackLen > 1_000) {
      throw new ConvexError("FEEDBACK_TOO_LONG");
    }

    // Check portfolio exists
    const portfolio = await ctx.db.get(args.portfolioId);
    if (portfolio === null || portfolio.isDeleted) {
      throw new ConvexError("PORTFOLIO_NOT_FOUND");
    }

    // Prevent self-critique
    if (portfolio.authorId === user._id) {
      throw new ConvexError("SELF_CRITIQUE_NOT_ALLOWED");
    }

    // Enforce uniqueness — one critique per user per portfolio
    const existingCritique = await ctx.db
      .query("critiques")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", args.portfolioId))
      .filter((q) => q.eq(q.field("authorId"), user._id))
      .first();

    if (existingCritique !== null) {
      throw new ConvexError("ALREADY_CRITIQUED");
    }

    // Burst rate limit: max 5 critiques per hour per user
    const oneHourAgo = Date.now() - ONE_HOUR_MS;
    const recentCritiques = await ctx.db
      .query("critiques")
      .withIndex("by_authorId_and_createdAt", (q) =>
        q.eq("authorId", user._id).gt("createdAt", oneHourAgo),
      )
      .collect();

    if (recentCritiques.length >= MAX_CRITIQUES_PER_HOUR) {
      throw new ConvexError("RATE_LIMIT_EXCEEDED");
    }

    const now = Date.now();

    const critiqueId = await ctx.db.insert("critiques", {
      portfolioId: args.portfolioId,
      authorId: user._id,
      rating: args.rating,
      feedback: args.feedback.trim(),
      upvotes: 0,
      createdAt: now,
    });

    // Recalculate portfolio aggregates
    const allCritiques = await ctx.db
      .query("critiques")
      .withIndex("by_portfolioId", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const newCritiqueCount = allCritiques.length;
    const totalRating = allCritiques.reduce((sum, c) => sum + c.rating, 0);
    const newAverageRating =
      newCritiqueCount > 0 ? totalRating / newCritiqueCount : 0;

    // topRatedScore = avg_stars × log10(total_critiques + 1)
    const newTopRatedScore =
      newAverageRating * Math.log10(newCritiqueCount + 1);

    await ctx.db.patch(args.portfolioId, {
      critiqueCount: newCritiqueCount,
      averageRating: newAverageRating,
      topRatedScore: newTopRatedScore,
      lastCritiqueAt: now,
    });

    // Increment user's critiquesGivenCount
    await ctx.db.patch(user._id, {
      critiquesGivenCount: user.critiquesGivenCount + 1,
      reputationScore: (user.reputationScore ?? 0) + 1,
    });

    return { critiqueId };
  },
});

// ---------------------------------------------------------------------------
// critiques.upvote — T020
// ---------------------------------------------------------------------------

export const upvote = mutation({
  args: {
    critiqueId: v.id("critiques"),
  },
  returns: v.object({ upvoted: v.boolean(), upvotes: v.number() }),
  handler: async (ctx, args) => {
    const user = await getInternalUser(ctx);

    const critique = await ctx.db.get(args.critiqueId);
    if (critique === null) {
      throw new ConvexError("CRITIQUE_NOT_FOUND");
    }

    // No self-upvote
    if (critique.authorId === user._id) {
      throw new ConvexError("SELF_UPVOTE_NOT_ALLOWED");
    }

    const existingUpvote = await ctx.db
      .query("critiqueUpvotes")
      .withIndex("by_critiqueId_userId", (q) =>
        q.eq("critiqueId", args.critiqueId).eq("userId", user._id),
      )
      .unique();

    const critiqueAuthor = await ctx.db.get(critique.authorId);
    let newUpvotes = critique.upvotes;
    let newUpvoted = false;

    if (existingUpvote) {
      // Remove upvote
      await ctx.db.delete(existingUpvote._id);
      newUpvotes = Math.max(0, critique.upvotes - 1);

      if (critiqueAuthor) {
        await ctx.db.patch(critiqueAuthor._id, {
          upvotesReceivedCount: Math.max(
            0,
            critiqueAuthor.upvotesReceivedCount - 1,
          ),
          totalUpvotesReceived: Math.max(
            0,
            (critiqueAuthor.totalUpvotesReceived ?? 0) - 1,
          ),
          reputationScore: Math.max(
            0,
            (critiqueAuthor.reputationScore ?? 0) - 5,
          ),
        });
      }
    } else {
      // Add upvote
      await ctx.db.insert("critiqueUpvotes", {
        critiqueId: args.critiqueId,
        userId: user._id,
        createdAt: Date.now(),
      });
      newUpvotes = critique.upvotes + 1;
      newUpvoted = true;

      if (critiqueAuthor) {
        await ctx.db.patch(critiqueAuthor._id, {
          upvotesReceivedCount: critiqueAuthor.upvotesReceivedCount + 1,
          totalUpvotesReceived: (critiqueAuthor.totalUpvotesReceived ?? 0) + 1,
          reputationScore: (critiqueAuthor.reputationScore ?? 0) + 5,
        });
      }
    }

    await ctx.db.patch(args.critiqueId, { upvotes: newUpvotes });

    return { upvoted: newUpvoted, upvotes: newUpvotes };
  },
});
