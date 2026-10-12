import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { isReadyForCheckIn } from "./checkInRules";

function authorize(accessKey: string) {
  const expected = process.env.REVIEW_ACCESS_KEY;
  if (!expected || expected.length < 32 || accessKey !== expected) {
    throw new Error("Review access denied. Check your host access key.");
  }
}

const status = v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("needs_human_review"));
const row = v.object({
  id: v.id("documents"), guestName: v.string(), propertyName: v.string(),
  arrivalDate: v.string(), documentType: v.string(), reviewStatus: status,
  reason: v.string(), uploadedAt: v.number(),
});

export const list = query({
  args: { accessKey: v.string(), status, paginationOpts: paginationOptsValidator },
  returns: v.object({ page: v.array(row), isDone: v.boolean(), continueCursor: v.string() }),
  handler: async (ctx, args) => {
    authorize(args.accessKey);
    const results = await ctx.db.query("documents")
      .withIndex("by_review_status", q => q.eq("reviewStatus", args.status))
      .order("desc").paginate({ ...args.paginationOpts, numItems: Math.min(25, args.paginationOpts.numItems) });
    const page = [];
    for (const document of results.page) {
      const guest = await ctx.db.get("guests", document.guestId);
      const booking = guest ? await ctx.db.get("bookings", guest.bookingId) : null;
      const property = booking ? await ctx.db.get("properties", booking.propertyId) : null;
      if (!guest || !booking || !property) continue;
      page.push({ id: document._id, guestName: guest.name, propertyName: property.name,
        arrivalDate: booking.arrivalDate, documentType: document.documentType,
        reviewStatus: document.reviewStatus, reason: document.reviewReason ?? "Awaiting a host review. No automatic assessment is available.", uploadedAt: document.uploadedAt });
    }
    return { page, isDone: results.isDone, continueCursor: results.continueCursor };
  },
});

export const detail = query({
  args: { accessKey: v.string(), documentId: v.id("documents") },
  returns: v.union(v.null(), v.object({
    id: v.id("documents"), guestName: v.string(), propertyName: v.string(), arrivalDate: v.string(),
    documentType: v.string(), reviewStatus: status, reason: v.string(), url: v.union(v.string(), v.null()),
    contentType: v.string(), requirements: v.array(v.string()), expectedGuestCount: v.number(),
    guests: v.array(v.object({ name: v.string(), complete: v.boolean() })),
  })),
  handler: async (ctx, args) => {
    authorize(args.accessKey);
    const doc = await ctx.db.get("documents", args.documentId);
    const guest = doc ? await ctx.db.get("guests", doc.guestId) : null;
    const booking = guest ? await ctx.db.get("bookings", guest.bookingId) : null;
    const property = booking ? await ctx.db.get("properties", booking.propertyId) : null;
    if (!doc || !guest || !booking || !property) return null;
    const guests = await ctx.db.query("guests").withIndex("by_booking", q => q.eq("bookingId", booking._id)).take(101);
    const completion = [];
    for (const person of guests.slice(0, 100)) {
      const accepted = await ctx.db.query("documents").withIndex("by_guest_and_status", q => q.eq("guestId", person._id).eq("reviewStatus", "accepted")).take(100);
      completion.push({ name: person.name, complete: property.requiredIdTypes.length > 0 && property.requiredIdTypes.every(type => accepted.some(d => d.documentType === type)) });
    }
    const file = await ctx.db.system.get("_storage", doc.fileId);
    return { id: doc._id, guestName: guest.name, propertyName: property.name,
      arrivalDate: booking.arrivalDate, documentType: doc.documentType, reviewStatus: doc.reviewStatus,
      reason: doc.reviewReason ?? "Awaiting a host review. No automatic assessment is available.",
      url: await ctx.storage.getUrl(doc.fileId), contentType: file?.contentType ?? "application/octet-stream",
      requirements: property.requiredIdTypes, expectedGuestCount: booking.expectedGuestCount, guests: completion };
  },
});

export const decide = mutation({
  args: { accessKey: v.string(), documentId: v.id("documents"), decision: v.union(v.literal("accepted"), v.literal("rejected")), reason: v.string() },
  returns: v.object({ status, readyForCheckIn: v.boolean(), replacementQueued: v.boolean() }),
  handler: async (ctx, args) => {
    authorize(args.accessKey);
    const doc = await ctx.db.get("documents", args.documentId);
    if (!doc || !["pending", "needs_human_review"].includes(doc.reviewStatus)) throw new Error("This document has already been reviewed. Refresh to see the latest decision.");
    const guest = await ctx.db.get("guests", doc.guestId);
    const booking = guest ? await ctx.db.get("bookings", guest.bookingId) : null;
    const property = booking ? await ctx.db.get("properties", booking.propertyId) : null;
    if (!guest || !booking || !property) throw new Error("The linked booking could not be found.");
    const reason = args.reason.trim();
    if (args.decision === "rejected" && !reason) throw new Error("Give the guest a reason so they know what to upload again.");
    if (reason.length > 1000) throw new Error("Keep the review note under 1,000 characters.");
    if (args.decision === "accepted" && !property.requiredIdTypes.includes(doc.documentType)) throw new Error("This document type does not match the property's ID requirements.");
    await ctx.db.patch("documents", doc._id, { reviewStatus: args.decision, reviewReason: reason || "Approved by the host after manual review.", reviewedAt: Date.now() });
    if (args.decision === "rejected") {
      await ctx.db.insert("messages", { bookingId: booking._id, sender: "host", text: `Please upload a new ${doc.documentType} for ${guest.name}. ${reason}`, deliveryStatus: "pending" });
    }
    const guests = await ctx.db.query("guests").withIndex("by_booking", q => q.eq("bookingId", booking._id)).take(101);
    const acceptedTypesByGuest = [];
    for (const person of guests) {
      const docs = await ctx.db.query("documents").withIndex("by_guest_and_status", q => q.eq("guestId", person._id).eq("reviewStatus", "accepted")).take(100);
      acceptedTypesByGuest.push(docs.map(d => d.documentType));
    }
    const openIssues = await ctx.db.query("escalations").withIndex("by_booking_and_status", q => q.eq("bookingId", booking._id).eq("status", "open")).take(1);
    const ready = isReadyForCheckIn({ expectedGuestCount: booking.expectedGuestCount,
      requiredIdTypes: property.requiredIdTypes, acceptedTypesByGuest,
      arrivalInformationSentAt: booking.arrivalInformationSentAt, hasOpenEscalation: openIssues.length > 0 });
    await ctx.db.patch("bookings", booking._id, { onboardingStatus: ready ? "ready_for_check_in" : (openIssues.length ? "needs_host" : "in_progress") });
    return { status: args.decision, readyForCheckIn: ready, replacementQueued: args.decision === "rejected" };
  },
});
