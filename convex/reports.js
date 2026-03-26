import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reportHistory").collect();
  },
});

export const add = mutation({
  args: {
    reportId: v.string(),
    filename: v.string(),
    date: v.string(),
    prospectsExtracted: v.number(),
    source: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reportHistory", args);
  },
});
