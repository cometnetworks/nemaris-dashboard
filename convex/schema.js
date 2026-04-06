import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prospects: defineTable({
    prospectId: v.string(), // custom ID like "continental-automotive-120326"
    company: v.string(),
    sector: v.string(),
    location: v.string(),
    priority: v.string(),
    score: v.number(),
    trigger: v.string(),
    needs: v.array(v.string()),
    projectStatus: v.string(),
    deciders: v.string(),
    linkedinLinks: v.array(v.object({ role: v.string(), url: v.string() })),
    emailSubject: v.string(),
    emailBody: v.string(),
    followUpEmail: v.string(),
    ctaSugerido: v.string(),
    discoveryNote: v.string(),
    reportDate: v.string(),
    reportSource: v.string(),
    // Editable fields
    contactName: v.optional(v.string()),
    contactTitle: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactLinkedin: v.optional(v.string()),
    contactPhotoUrl: v.optional(v.string()),
    customNotes: v.optional(v.string()),
    // Email tracking
    emailSent: v.optional(v.boolean()),
    lastEmailSentDate: v.optional(v.string()),
  }).index("by_prospectId", ["prospectId"]),

  meetings: defineTable({
    company: v.string(),
    date: v.string(),
    link: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    briefPdfId: v.optional(v.id("_storage")),
  }),

  reportHistory: defineTable({
    reportId: v.string(),
    filename: v.string(),
    date: v.string(),
    prospectsExtracted: v.number(),
    source: v.string(),
    status: v.string(),
  }),

  emailLogs: defineTable({
    prospectId: v.string(),
    status: v.string(), // "pending", "sent", "delivered", "opened", "bounced"
    subject: v.string(),
    recipient: v.string(),
    resendId: v.optional(v.string()), // Returned from Resend
    date: v.string(), // ISO String
  }).index("by_prospect", ["prospectId"])
    .index("by_resendId", ["resendId"]),

  dailyStats: defineTable({
    date: v.string(), // Format "YYYY-MM-DD"
    sentCount: v.number(),
  }).index("by_date", ["date"]),
});
