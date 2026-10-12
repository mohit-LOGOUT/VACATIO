import { ConvexError } from 'convex/values';
import { getAuthUserId, getAuthSessionId } from '@convex-dev/auth/server';
import type { QueryCtx, MutationCtx } from './_generated/server';
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx), sessionId = await getAuthSessionId(ctx);
  if (!userId || !sessionId) throw new ConvexError('Sign in to access the admin dashboard.');
  const session = await ctx.db.get('authSessions', sessionId);
  const settings = await ctx.db.query('adminSettings').withIndex('by_key', q => q.eq('key', 'owner')).first();
  if (!session || session.expirationTime <= Date.now() || session.userId !== userId || settings?.userId !== userId || (settings.expiresAt !== undefined && settings.expiresAt <= Date.now())) throw new ConvexError('Admin access is unavailable. Sign in with the configured owner account.');
  return userId;
}
