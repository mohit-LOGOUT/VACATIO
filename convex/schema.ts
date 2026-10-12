import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { contextValidator } from "./sandboxRules";

export default defineSchema({
  sandboxSessions: defineTable({ tokenHash: v.string(), expiresAt: v.number(), usage: v.number(), windowStart: v.number() }).index("by_token_hash", ["tokenHash"]),
  sandboxBookings: defineTable({ sessionId: v.id("sandboxSessions"), context: contextValidator, generation: v.number(), threadId: v.string(), busyTurnId: v.optional(v.id("sandboxTurns")) }).index("by_session", ["sessionId"]),
  sandboxTurns: defineTable({
    bookingId: v.id("sandboxBookings"), generation: v.number(), requestId: v.string(), text: v.string(),
    kind: v.union(v.literal("guest"), v.literal("host")), originalTurnId: v.optional(v.id("sandboxTurns")),
    promptMessageId: v.string(), attempt: v.number(), threadId: v.string(),
    status: v.union(v.literal("queued"), v.literal("reading"), v.literal("replying"), v.literal("complete"), v.literal("failed")),
    reply: v.optional(v.string()), sources: v.optional(v.array(v.string())), hostReason: v.optional(v.string()),
    resolved: v.optional(v.boolean()), error: v.optional(v.string()), createdAt: v.number(), completedAt: v.optional(v.number()),
  }).index("by_booking_generation", ["bookingId", "generation"]).index("by_booking_request", ["bookingId", "requestId"]),
  properties: defineTable({
    name: v.string(),
    logoutPropertyId: v.optional(v.string()),
    address: v.string(),
    mapLink: v.optional(v.string()),
    checkInTime: v.string(),
    checkOutTime: v.string(),
    timeZone: v.string(),
    parkingDetails: v.optional(v.string()),
    entryInstructions: v.string(),
    houseRules: v.string(),
    requiredIdTypes: v.array(v.string()),
  }).index("by_logout_property_id", ["logoutPropertyId"]),

  bookings: defineTable({
    propertyId: v.id("properties"),
    logoutBookingId: v.optional(v.string()),
    mainGuestName: v.string(),
    whatsappNumber: v.string(),
    // Stay dates use YYYY-MM-DD in the property's time zone.
    arrivalDate: v.string(),
    departureDate: v.string(),
    expectedGuestCount: v.number(),
    expectedArrivalTime: v.optional(v.string()),
    onboardingStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("needs_host"),
      v.literal("ready_for_check_in"),
    ),
    // Event timestamps use milliseconds since the Unix epoch.
    arrivalInformationSentAt: v.optional(v.number()),
  })
    .index("by_logout_booking_id", ["logoutBookingId"])
    .index("by_property_and_arrival", ["propertyId", "arrivalDate"])
    .index("by_property_and_status", ["propertyId", "onboardingStatus"])
    .index("by_whatsapp_number", ["whatsappNumber"]),

  guests: defineTable({
    bookingId: v.id("bookings"),
    name: v.string(),
    isMainContact: v.boolean(),
  }).index("by_booking", ["bookingId"]),

  documents: defineTable({
    guestId: v.id("guests"),
    fileId: v.id("_storage"),
    documentType: v.string(),
    reviewStatus: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("needs_human_review"),
    ),
    reviewReason: v.optional(v.string()),
    uploadedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_review_status", ["reviewStatus"])
    .index("by_guest", ["guestId"])
    .index("by_guest_and_status", ["guestId", "reviewStatus"]),

  messages: defineTable({
    bookingId: v.id("bookings"),
    sender: v.union(v.literal("guest"), v.literal("ai"), v.literal("host")),
    text: v.optional(v.string()),
    attachmentId: v.optional(v.id("_storage")),
    whatsappMessageId: v.optional(v.string()),
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
      v.literal("received"),
      v.literal("failed"),
    ),
    sentAt: v.optional(v.number()),
    receivedAt: v.optional(v.number()),
  })
    .index("by_booking", ["bookingId"])
    .index("by_whatsapp_message_id", ["whatsappMessageId"]),

  escalations: defineTable({
    bookingId: v.id("bookings"),
    guestQuestion: v.string(),
    reason: v.string(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    hostAnswer: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  }).index("by_booking_and_status", ["bookingId", "status"]),
});
