import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { requirementsValidator, idType, readingValidator } from "./precheckRules";
import { trainingValidator } from "./trainerRules";
import { contextValidator } from "./sandboxRules";

export default defineSchema({
  ...authTables,
  hermesTraining: defineTable({key:v.literal("hermes"),settings:trainingValidator,revision:v.number(),updatedAt:v.number(),updatedBy:v.id("users")}).index("by_key",["key"]),
  precheckRuns: defineTable({bookingId:v.id("sandboxBookings"),names:v.array(v.string()),requirements:requirementsValidator,revision:v.number(),email:v.string(),complete:v.boolean(),arrivalProvided:v.boolean(),paused:v.boolean(),replyReminderSent:v.optional(v.boolean()),lastReminderAt:v.number(),createdAt:v.number(),updatedAt:v.number(),completionAt:v.optional(v.number()),propertyId:v.optional(v.id("properties"))}).index("by_booking",["bookingId"]),
  precheckDocuments: defineTable({runId:v.id("precheckRuns"),revision:v.number(),guestIndex:v.number(),expectedName:v.string(),type:idType,requestId:v.string(),status:v.union(v.literal("uploading"),v.literal("checking"),v.literal("passed"),v.literal("review"),v.literal("replacement"),v.literal("failed"),v.literal("expired")),fileId:v.optional(v.id("_storage")),sha:v.optional(v.string()),reading:v.optional(readingValidator),reason:v.optional(v.string()),method:v.optional(v.string()),attempt:v.number(),createdAt:v.number(),checkedAt:v.optional(v.number()),expiresAt:v.number()}).index("by_run",["runId"]).index("by_run_request",["runId","requestId"]).index("by_file",["fileId"]),
  precheckEvents: defineTable({runId:v.id("precheckRuns"),revision:v.number(),text:v.string(),kind:v.union(v.literal("receipt"),v.literal("result"),v.literal("complete"),v.literal("arrival"),v.literal("setup")),createdAt:v.number()}).index("by_run",["runId"]),
  adminSettings: defineTable({key:v.literal("owner"),trainerWindowStart:v.optional(v.number()),trainerUses:v.optional(v.number()),userId:v.id("users"),expiresAt:v.optional(v.number())}).index("by_key",["key"]),
  propertyImports: defineTable({sourceUrl:v.string(),requestedBy:v.id("users"),status:v.union(v.literal("queued"),v.literal("reading"),v.literal("extracting"),v.literal("importing_photos"),v.literal("complete"),v.literal("failed")),propertyId:v.optional(v.id("properties")),error:v.optional(v.string()),createdAt:v.number(),finishedAt:v.optional(v.number())}).index("by_source",["sourceUrl"]).index("by_status",["status"]),
  sandboxSessions: defineTable({ tokenHash: v.string(), expiresAt: v.number(), usage: v.number(), windowStart: v.number() }).index("by_token_hash", ["tokenHash"]),
  sandboxBookings: defineTable({ sessionId: v.id("sandboxSessions"), context: contextValidator, generation: v.number(), threadId: v.string(), busyTurnId: v.optional(v.id("sandboxTurns")) }).index("by_session", ["sessionId"]),
  sandboxTurns: defineTable({
    bookingId: v.id("sandboxBookings"), generation: v.number(), requestId: v.string(), text: v.string(),
    kind: v.union(v.literal("guest"), v.literal("host")), originalTurnId: v.optional(v.id("sandboxTurns")),
    promptMessageId: v.string(), attempt: v.number(), threadId: v.string(),
    status: v.union(v.literal("queued"), v.literal("reading"), v.literal("replying"), v.literal("complete"), v.literal("failed")),
    reply: v.optional(v.string()), replies: v.optional(v.array(v.string())), sources: v.optional(v.array(v.string())), hostReason: v.optional(v.string()),
    resolved: v.optional(v.boolean()), error: v.optional(v.string()), createdAt: v.number(), completedAt: v.optional(v.number()),
  }).index("by_booking_generation", ["bookingId", "generation"]).index("by_booking_request", ["bookingId", "requestId"]),
  properties: defineTable({
    photos: v.optional(v.array(v.object({fileId:v.id("_storage"),sourceUrl:v.string()}))),
    photoImportStatus: v.optional(v.union(v.literal("pending"),v.literal("ready"),v.literal("partial"),v.literal("unavailable"),v.literal("failed"))),
    photoImportMessage: v.optional(v.string()), photoImportJobId:v.optional(v.id("propertyImports")),
    name: v.string(),
    sourceUrl: v.optional(v.string()), importedAt: v.optional(v.number()),
    description: v.optional(v.string()), propertyType: v.optional(v.string()),
    guestCapacity: v.optional(v.number()), bedrooms: v.optional(v.number()), beds: v.optional(v.number()), bathrooms: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())), directions: v.optional(v.string()), notes: v.optional(v.string()),
    missingFields: v.optional(v.array(v.string())), revision: v.optional(v.number()),
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
  }).index("by_logout_property_id", ["logoutPropertyId"]).index("by_source",["sourceUrl"]),

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
