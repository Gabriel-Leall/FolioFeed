import { query } from "../_generated/server";
import { v } from "convex/values";

export const listFeedback = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("appFeedback"),
      feedback: v.string(),
      status: v.string(),
      createdAt: v.number(),
      author: v.optional(
        v.object({
          _id: v.id("users"),
          nickname: v.optional(v.string()),
          avatarUrl: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx) => {
    const feedbacks = await ctx.db
      .query("appFeedback")
      .order("desc")
      .collect();

    return Promise.all(
      feedbacks.map(async (feedback) => {
        const author = await ctx.db.get(feedback.authorId);
        return {
          ...feedback,
          author: author
            ? {
                _id: author._id,
                nickname: author.nickname,
                avatarUrl: author.avatarUrl,
              }
            : undefined,
        };
      })
    );
  },
});

export const getFeedbackByUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("appFeedback"),
      feedback: v.string(),
      status: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const feedbacks = await ctx.db
      .query("appFeedback")
      .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
      .order("desc")
      .collect();

    return feedbacks;
  },
});
