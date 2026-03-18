import { v } from "convex/values";

import { internalMutation } from "../_generated/server";

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    nickname: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const patch: {
      nickname?: string;
      avatarUrl?: string;
    } = {};

    if (
      args.nickname !== undefined &&
      args.nickname !== existingUser?.nickname
    ) {
      patch.nickname = args.nickname;
    }

    if (
      args.avatarUrl !== undefined &&
      args.avatarUrl !== existingUser?.avatarUrl
    ) {
      patch.avatarUrl = args.avatarUrl;
    }

    if (existingUser === null) {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        nickname: args.nickname,
        avatarUrl: args.avatarUrl,
        availabilityStatus: "unavailable",
        portfoliosCount: 0,
        critiquesGivenCount: 0,
        upvotesReceivedCount: 0,
        createdAt: Date.now(),
      });
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existingUser._id, patch);
    }

    return existingUser._id;
  },
});
