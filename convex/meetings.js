import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("meetings").collect();
  },
});

export const add = mutation({
  args: {
    company: v.string(),
    date: v.string(),
    link: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    briefPdfId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetings", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("meetings"),
    updates: v.object({
      company: v.optional(v.string()),
      date: v.optional(v.string()),
      link: v.optional(v.string()),
      notes: v.optional(v.string()),
      status: v.optional(v.string()),
      briefPdfId: v.optional(v.id("_storage")),
    }),
  },
  handler: async (ctx, args) => {
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(args.updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(args.id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("meetings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
