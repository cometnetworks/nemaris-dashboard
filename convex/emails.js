import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export const getDailyLimit = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDateString();
    const stat = await ctx.db
      .query("dailyStats")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    
    return stat ? stat.sentCount : 0;
  },
});

export const getLogsForProspect = query({
  args: { prospectId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("by_prospect", (q) => q.eq("prospectId", args.prospectId))
      .order("desc")
      .collect();
  },
});

export const getAllLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("emailLogs")
      .collect();
  },
});

export const logEmailSent = mutation({
  args: {
    prospectId: v.string(),
    subject: v.string(),
    recipient: v.string(),
    resendId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const today = getTodayDateString();
    
    const stat = await ctx.db
      .query("dailyStats")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
      
    if (stat) {
      await ctx.db.patch(stat._id, { sentCount: stat.sentCount + 1 });
    } else {
      await ctx.db.insert("dailyStats", { date: today, sentCount: 1 });
    }

    const logId = await ctx.db.insert("emailLogs", {
      prospectId: args.prospectId,
      status: "sent",
      subject: args.subject,
      recipient: args.recipient,
      resendId: args.resendId,
      date: new Date().toISOString(),
    });

    // Update prospect status
    const prospect = await ctx.db
      .query("prospects")
      .withIndex("by_prospectId", (q) => q.eq("prospectId", args.prospectId))
      .first();
    
    if (prospect) {
      await ctx.db.patch(prospect._id, {
        emailSent: true,
        lastEmailSentDate: new Date().toISOString(),
      });
    }
    
    return logId;
  },
});

export const updateLogStatus = mutation({
  args: {
    resendId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db
      .query("emailLogs")
      .withIndex("by_resendId", (q) => q.eq("resendId", args.resendId))
      .first();
      
    if (log) {
      // Avoid downgrading status if it's already "opened" or "delivered" but receiving duplicate
      await ctx.db.patch(log._id, { status: args.status });
    }
  }
});

export const sendEmail = action({
  args: {
    prospectId: v.string(),
    subject: v.string(),
    body: v.string(),
    recipient: v.string(),
  },
  handler: async (ctx, args) => {
    const currentCount = await ctx.runQuery(api.emails.getDailyLimit, {});
    
    if (currentCount >= 10) {
      throw new Error("Límite diario de 10 envíos alcanzado.");
    }
    
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("La API Key de Resend no está configurada.");
    }

    const resend = new Resend(apiKey);
    
    try {
      const { data, error } = await resend.emails.send({
        from: "Nemaris <nemaris@outreach.voxmedia.com.mx>",
        to: [args.recipient],
        replyTo: "voxmedia.projects@voxmedia.agency",
        subject: args.subject,
        html: args.body.replace(/\n/g, "<br>"),
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }

      await ctx.runMutation(api.emails.logEmailSent, {
        prospectId: args.prospectId,
        subject: args.subject,
        recipient: args.recipient,
        resendId: data.id,
      });

      return { success: true, resendId: data.id };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error(error.message || "Error al conectar con Resend");
    }
  },
});
