import type { UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = Pick<QueryCtx, "auth"> | Pick<MutationCtx, "auth">;
type InternalUserCtx =
  | Pick<QueryCtx, "auth" | "db">
  | Pick<MutationCtx, "auth" | "db">;

export async function requireAuth(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();

  if (identity === null) {
    throw new ConvexError("UNAUTHENTICATED");
  }

  return identity;
}

export async function getInternalUser(
  ctx: InternalUserCtx,
): Promise<Doc<"users">> {
  const identity = await requireAuth(ctx);

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (user === null) {
    throw new ConvexError("USER_NOT_FOUND");
  }

  return user;
}
