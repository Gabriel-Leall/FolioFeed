import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const submitFeedback = mutation({
  args: {
    feedback: v.string(),
  },
  returns: v.id("appFeedback"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const feedbackId = await ctx.db.insert("appFeedback", {
      authorId: user._id,
      feedback: args.feedback,
      status: "pending",
      createdAt: Date.now(),
    });

    return feedbackId;
  },
});
