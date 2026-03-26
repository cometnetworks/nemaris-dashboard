import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prospects").collect();
  },
});

export const upsertMany = mutation({
  args: {
    prospects: v.array(
      v.object({
        prospectId: v.string(),
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
      })
    ),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    for (const p of args.prospects) {
      const existing = await ctx.db
        .query("prospects")
        .withIndex("by_prospectId", (q) => q.eq("prospectId", p.prospectId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, p);
        updated++;
      } else {
        await ctx.db.insert("prospects", p);
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

export const update = mutation({
  args: {
    id: v.id("prospects"),
    updates: v.object({
      company: v.optional(v.string()),
      sector: v.optional(v.string()),
      location: v.optional(v.string()),
      priority: v.optional(v.string()),
      score: v.optional(v.number()),
      trigger: v.optional(v.string()),
      needs: v.optional(v.array(v.string())),
      projectStatus: v.optional(v.string()),
      deciders: v.optional(v.string()),
      linkedinLinks: v.optional(v.array(v.object({ role: v.string(), url: v.string() }))),
      emailSubject: v.optional(v.string()),
      emailBody: v.optional(v.string()),
      followUpEmail: v.optional(v.string()),
      ctaSugerido: v.optional(v.string()),
      discoveryNote: v.optional(v.string()),
      contactName: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactLinkedin: v.optional(v.string()),
      customNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    // Filter out undefined values
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});
