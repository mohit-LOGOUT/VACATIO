import { internalAction, internalMutation, query } from './_generated/server';
import { createAccount, modifyAccountCredentials, invalidateSessions } from '@convex-dev/auth/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

export const status = query({ args: {}, returns: v.boolean(), handler: async ctx => {
  const row = await ctx.db.query('adminSettings').withIndex('by_key', q => q.eq('key','owner')).first();
  return !!row?.userId && (row.expiresAt === undefined || row.expiresAt > Date.now());
}});
export const configure = internalAction({ args: { temporary: v.optional(v.boolean()) }, returns: v.null(), handler: async (ctx,args) => {
  const id = process.env.ADMIN_SETUP_ID?.trim().toLowerCase(), secret = process.env.ADMIN_SETUP_PASSWORD;
  if (!id || id.length > 120 || !secret || secret.length < 12) throw new Error('Set ADMIN_SETUP_ID and ADMIN_SETUP_PASSWORD (at least 12 characters) in Convex, then run configure.');
  const { user } = await createAccount(ctx, { provider: 'password', account: { id }, profile: { email: id }, shouldLinkViaEmail: false, shouldLinkViaPhone: false });
  await modifyAccountCredentials(ctx, { provider: 'password', account: { id, secret } });
  await invalidateSessions(ctx, { userId: user._id });
  await ctx.runMutation(internal.adminSetup.grant, { userId: user._id, ...(args.temporary ? { expiresAt: Date.now()+3600000 } : {}) });
  return null;
}});
export const grant = internalMutation({ args: { userId: v.id('users'), expiresAt: v.optional(v.number()) }, returns: v.null(), handler: async(ctx,args)=>{
  const row=await ctx.db.query('adminSettings').withIndex('by_key',q=>q.eq('key','owner')).first();
  if(row)await ctx.db.patch('adminSettings',row._id,{userId:args.userId,expiresAt:args.expiresAt});
  else await ctx.db.insert('adminSettings',{key:'owner',...args});
  return null;
}});
export const endTemporaryAccess = internalMutation({args:{},returns:v.null(),handler:async ctx=>{
  const row=await ctx.db.query('adminSettings').withIndex('by_key',q=>q.eq('key','owner')).first();
  if(row?.expiresAt)await ctx.db.patch('adminSettings',row._id,{expiresAt:0});
  return null;
}});
