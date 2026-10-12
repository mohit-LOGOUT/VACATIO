import { query, mutation, internalQuery, internalMutation, action } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal, components } from "./_generated/api";
import { createThread, saveMessage } from "@convex-dev/agent";
import { v } from "convex/values";
import { contextValidator, samples, validateContext } from "./sandboxRules";

async function tokenHash(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Open your sandbox again to restore access.");
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map(x => x.toString(16).padStart(2, "0")).join("");
}
async function session(ctx: QueryCtx | MutationCtx, token: string) {
  const awaitHash = await tokenHash(token);
  const row = await ctx.db.query("sandboxSessions").withIndex("by_token_hash", q => q.eq("tokenHash", awaitHash)).first();
  if (!row || row.expiresAt < Date.now()) throw new Error("Your sandbox session has expired. Open it again.");
  return row;
}
async function ownedBooking(ctx: QueryCtx | MutationCtx, token: string, bookingId: Id<"sandboxBookings">) {
  const owner = await session(ctx, token);
  const booking = await ctx.db.get("sandboxBookings", bookingId);
  if (!booking || booking.sessionId !== owner._id) throw new Error("This booking is not in your sandbox.");
  return { owner, booking };
}
async function budget(ctx: MutationCtx, owner: NonNullable<Awaited<ReturnType<typeof session>>>) {
  const fresh = Date.now() - owner.windowStart > 86400000;
  if (!fresh && owner.usage >= 100) throw new Error("You've reached 100 replies for today. Try again tomorrow.");
  await ctx.db.patch("sandboxSessions", owner._id, { usage: fresh ? 1 : owner.usage + 1, windowStart: fresh ? Date.now() : owner.windowStart });
}
export const open = action({
  args: { token: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.sandbox.initialize, { hash: await tokenHash(args.token) });
    return null;
  },
});
export const initialize = internalMutation({
  args: { hash: v.string() }, returns: v.null(),
  handler: async (ctx, { hash }) => {
    const existing = await ctx.db.query("sandboxSessions").withIndex("by_token_hash", q => q.eq("tokenHash", hash)).first();
    if (existing) {
      await ctx.db.patch("sandboxSessions", existing._id, { expiresAt: Date.now() + 30 * 86400000 });
      return null;
    }
    const sessionId = await ctx.db.insert("sandboxSessions", { tokenHash: hash, expiresAt: Date.now() + 30 * 86400000, usage: 0, windowStart: Date.now() });
    for (const context of samples) {
      const threadId = await createThread(ctx, components.agent, { userId: sessionId, title: `Hermes: ${context.guestName}` });
      await ctx.db.insert("sandboxBookings", { sessionId, context, generation: 0, threadId });
    }
    return null;
  },
});
const turnView = v.object({ id: v.id("sandboxTurns"), text: v.string(), kind: v.union(v.literal("guest"), v.literal("host")), status: v.string(), reply: v.union(v.string(), v.null()), sources: v.array(v.string()), hostReason: v.union(v.string(), v.null()), resolved: v.boolean(), error: v.union(v.string(), v.null()), createdAt: v.number(), completedAt: v.union(v.number(), v.null()) });
export const state = query({
  args: { token: v.string() },
  returns: v.array(v.object({ id: v.id("sandboxBookings"), context: contextValidator, generation: v.number(), busy: v.boolean(), turns: v.array(turnView) })),
  handler: async (ctx, { token }) => {
    const owner = await session(ctx, token);
    const bookings = await ctx.db.query("sandboxBookings").withIndex("by_session", q => q.eq("sessionId", owner._id)).take(3);
    return await Promise.all(bookings.map(async b => ({ id: b._id, context: b.context, generation: b.generation, busy: !!b.busyTurnId,
      turns: (await ctx.db.query("sandboxTurns").withIndex("by_booking_generation", q => q.eq("bookingId", b._id).eq("generation", b.generation)).take(101)).map(t => ({ id: t._id, text: t.text, kind: t.kind, status: t.status, reply: t.reply ?? null, sources: t.sources ?? [], hostReason: t.hostReason ?? null, resolved: t.resolved ?? false, error: t.error ?? null, createdAt: t.createdAt, completedAt: t.completedAt ?? null }))
    })));
  },
});
export const edit = mutation({
  args: { token: v.string(), bookingId: v.id("sandboxBookings"), context: contextValidator }, returns: v.null(),
  handler: async (ctx, args) => {
    const { booking } = await ownedBooking(ctx, args.token, args.bookingId);
    if (booking.busyTurnId) throw new Error("Wait for Hermes to finish before editing details.");
    validateContext(args.context);
    await ctx.db.patch("sandboxBookings", booking._id, { context: args.context }); return null;
  },
});
export const restart = mutation({
  args: { token: v.string(), bookingId: v.id("sandboxBookings") }, returns: v.null(),
  handler: async (ctx, args) => {
    const { booking } = await ownedBooking(ctx, args.token, args.bookingId);
    if (booking.busyTurnId) throw new Error("Wait for Hermes to finish before restarting.");
    const threadId = await createThread(ctx, components.agent, { userId: booking.sessionId, title: `Hermes: ${booking.context.guestName}` });
    await ctx.db.patch("sandboxBookings", booking._id, { generation: booking.generation + 1, threadId }); return null;
  },
});
export const send = mutation({
  args: { token: v.string(), bookingId: v.id("sandboxBookings"), requestId: v.string(), text: v.string(), hostRequestId: v.optional(v.id("sandboxTurns")) }, returns: v.id("sandboxTurns"),
  handler: async (ctx, args) => {
    const { owner, booking } = await ownedBooking(ctx, args.token, args.bookingId);
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(args.requestId)) throw new Error("Invalid request. Reload and try again.");
    const duplicate = await ctx.db.query("sandboxTurns").withIndex("by_booking_request", q => q.eq("bookingId", booking._id).eq("requestId", args.requestId)).first();
    if (duplicate) return duplicate._id;
    if (booking.busyTurnId) throw new Error("Hermes is still replying to this booking.");
    const text = args.text.trim(); if (!text || text.length > 2000) throw new Error("Write a message of 1–2,000 characters.");
    const turns = await ctx.db.query("sandboxTurns").withIndex("by_booking_generation", q => q.eq("bookingId", booking._id).eq("generation", booking.generation)).take(101);
    if (turns.length >= 100) throw new Error("This test has 100 messages. Restart it to continue.");
    if (turns.some(t => t.status === "failed")) throw new Error("Retry the failed reply or restart this test before continuing.");
    let hostPrompt = "";
    if (args.hostRequestId) {
      const issue = await ctx.db.get("sandboxTurns", args.hostRequestId);
      if (!issue || issue.bookingId !== booking._id || issue.generation !== booking.generation || !issue.hostReason || issue.resolved) throw new Error("This host request is no longer open.");
      if (turns.some(t => t.originalTurnId === issue._id)) throw new Error("A host answer has already been submitted for this question.");
      hostPrompt = `The host supplied an answer for the guest question ${JSON.stringify(issue.text)}: ${JSON.stringify(text)}. Reply to the guest using this answer; do not save it as permanent property knowledge.`;
    }
    await budget(ctx, owner);
    const saved = await saveMessage(ctx, components.agent, { threadId: booking.threadId, message: { role: "user", content: hostPrompt || text } });
    const turnId = await ctx.db.insert("sandboxTurns", { bookingId: booking._id, generation: booking.generation, requestId: args.requestId, text, kind: args.hostRequestId ? "host" : "guest", ...(args.hostRequestId ? { originalTurnId: args.hostRequestId } : {}), promptMessageId: saved.messageId, attempt: 1, threadId: booking.threadId, status: "queued", createdAt: Date.now() });
    await ctx.db.patch("sandboxBookings", booking._id, { busyTurnId: turnId });
    await ctx.scheduler.runAfter(0, internal.hermes.reply, { turnId, attempt: 1 });
    await ctx.scheduler.runAfter(120000, internal.sandbox.timeout, { turnId, attempt: 1 });
    return turnId;
  },
});
export const retry = mutation({
  args: { token: v.string(), turnId: v.id("sandboxTurns") }, returns: v.null(),
  handler: async (ctx, args) => {
    const turn = await ctx.db.get("sandboxTurns", args.turnId); if (!turn) throw new Error("Message not found.");
    const { owner, booking } = await ownedBooking(ctx, args.token, turn.bookingId);
    if (booking.generation !== turn.generation) throw new Error("This test has been restarted.");
    if (turn.status !== "failed") return null;
    if (booking.busyTurnId) throw new Error("Wait for the current reply.");
    await budget(ctx, owner);
    const attempt = turn.attempt + 1;
    await ctx.db.patch("sandboxTurns", turn._id, { attempt, status: "queued", error: undefined });
    await ctx.db.patch("sandboxBookings", booking._id, { busyTurnId: turn._id });
    await ctx.scheduler.runAfter(0, internal.hermes.reply, { turnId: turn._id, attempt });
    await ctx.scheduler.runAfter(120000, internal.sandbox.timeout, { turnId: turn._id, attempt });
    return null;
  },
});
export const generationContext = internalQuery({
  args: { turnId: v.id("sandboxTurns"), attempt: v.number() }, returns: v.any(),
  handler: async (ctx, args) => {
    const turn = await ctx.db.get("sandboxTurns", args.turnId); if (!turn || turn.attempt !== args.attempt || turn.status === "complete" || turn.status === "failed") return null;
    const booking = await ctx.db.get("sandboxBookings", turn.bookingId); if (!booking || booking.generation !== turn.generation) return null;
    const turns = await ctx.db.query("sandboxTurns").withIndex("by_booking_generation", q => q.eq("bookingId", booking._id).eq("generation", booking.generation)).take(101);
    return { turn, context: booking.context, hostAnswers: turns.filter(t => t.kind === "host").map(t => ({ question: turns.find(x => x._id === t.originalTurnId)?.text, answer: t.text })), sessionId: booking.sessionId };
  },
});
export const stage = internalMutation({
  args: { turnId: v.id("sandboxTurns"), attempt: v.number(), status: v.union(v.literal("reading"), v.literal("replying")) }, returns: v.null(),
  handler: async (ctx, args) => {
    const turn = await ctx.db.get("sandboxTurns", args.turnId);
    if (turn && turn.attempt === args.attempt && !["complete", "failed"].includes(turn.status)) await ctx.db.patch("sandboxTurns", turn._id, { status: args.status }); return null;
  },
});
export const finish = internalMutation({
  args: { turnId: v.id("sandboxTurns"), attempt: v.number(), reply: v.optional(v.string()), sources: v.optional(v.array(v.string())), hostReason: v.optional(v.string()), error: v.optional(v.string()) }, returns: v.null(),
  handler: async (ctx, args) => {
    const turn = await ctx.db.get("sandboxTurns", args.turnId);
    if (!turn || turn.attempt !== args.attempt || ["complete", "failed"].includes(turn.status)) return null;
    const booking = await ctx.db.get("sandboxBookings", turn.bookingId);
    if (!booking || booking.generation !== turn.generation) return null;
    if (args.reply) await saveMessage(ctx, components.agent, { threadId: turn.threadId, promptMessageId: turn.promptMessageId, message: { role: "assistant", content: args.reply } });
    await ctx.db.patch("sandboxTurns", turn._id, { status: args.error ? "failed" : "complete", ...(args.reply ? { reply: args.reply } : {}), sources: args.sources ?? [], ...(args.hostReason ? { hostReason: args.hostReason, resolved: false } : {}), ...(args.error ? { error: args.error } : {}), completedAt: Date.now() });
    if (!args.error && turn.originalTurnId) await ctx.db.patch("sandboxTurns", turn.originalTurnId, { resolved: true });
    if (booking.busyTurnId === turn._id) await ctx.db.patch("sandboxBookings", booking._id, { busyTurnId: undefined }); return null;
  },
});
export const timeout = internalMutation({
  args: { turnId: v.id("sandboxTurns"), attempt: v.number() }, returns: v.null(),
  handler: async (ctx, args) => {
    const turn = await ctx.db.get("sandboxTurns", args.turnId);
    if (!turn || turn.attempt !== args.attempt || ["complete", "failed"].includes(turn.status)) return null;
    await ctx.db.patch("sandboxTurns", turn._id, { status: "failed", error: "Hermes took too long to reply. Try again.", completedAt: Date.now() });
    const booking = await ctx.db.get("sandboxBookings", turn.bookingId);
    if (booking?.busyTurnId === turn._id) await ctx.db.patch("sandboxBookings", booking._id, { busyTurnId: undefined }); return null;
  },
});
