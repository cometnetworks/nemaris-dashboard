import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Normalize a company name for comparison
 */
function normalizeCompanyName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s*(s\.?a\.?\s*de\s*c\.?v\.?|s\.?a\.?p\.?i?\.?\s*de\s*c\.?v\.?|s\.?a\.?|s\.?c\.?|s\.? de r\.?l\.?)\s*/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

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

    // Get all existing prospects for company name matching
    const allExisting = await ctx.db.query("prospects").collect();

    for (const p of args.prospects) {
      // First try exact match by prospectId
      let existing = await ctx.db
        .query("prospects")
        .withIndex("by_prospectId", (q) => q.eq("prospectId", p.prospectId))
        .first();

      // If no exact match, try fuzzy match by company name
      if (!existing) {
        const normalizedNew = normalizeCompanyName(p.company);
        existing = allExisting.find(
          (e) => normalizeCompanyName(e.company) === normalizedNew
        );
      }

      if (existing) {
        // Merge: keep the version with more data, but always update with newer data
        const merged = mergeProspects(existing, p);
        await ctx.db.patch(existing._id, merged);
        updated++;
      } else {
        await ctx.db.insert("prospects", p);
        inserted++;
      }
    }
    return { inserted, updated };
  },
});

/**
 * Merge two prospect records, keeping the one with more/better data
 */
function mergeProspects(existing, incoming) {
  const merged = {};
  const fields = [
    'company', 'sector', 'location', 'priority', 'trigger',
    'projectStatus', 'deciders', 'emailSubject', 'emailBody',
    'followUpEmail', 'ctaSugerido', 'discoveryNote',
    'reportDate', 'reportSource', 'prospectId',
  ];

  for (const field of fields) {
    const existingVal = existing[field] || '';
    const incomingVal = incoming[field] || '';
    // Keep the longer/more detailed value
    merged[field] = incomingVal.length > existingVal.length ? incomingVal : existingVal;
  }

  // Score: keep the higher score
  merged.score = Math.max(existing.score || 0, incoming.score || 0);

  // Priority: keep the highest priority
  const priorityRank = { 'Alta': 4, 'Media-Alta': 3, 'Media': 2, 'Baja': 1 };
  merged.priority = (priorityRank[incoming.priority] || 0) >= (priorityRank[existing.priority] || 0)
    ? incoming.priority : existing.priority;

  // Arrays: merge and deduplicate
  merged.needs = [...new Set([...(existing.needs || []), ...(incoming.needs || [])])];

  // LinkedIn links: merge by role
  const linkMap = new Map();
  for (const link of [...(existing.linkedinLinks || []), ...(incoming.linkedinLinks || [])]) {
    if (link.url && link.url.length > 5) {
      linkMap.set(link.role, link);
    }
  }
  merged.linkedinLinks = [...linkMap.values()];

  // Keep the most recent date
  if (incoming.reportDate > (existing.reportDate || '')) {
    merged.reportDate = incoming.reportDate;
    merged.reportSource = incoming.reportSource;
  }

  // Preserve editable fields from existing
  if (existing.contactName) merged.contactName = existing.contactName;
  if (existing.contactEmail) merged.contactEmail = existing.contactEmail;
  if (existing.contactLinkedin) merged.contactLinkedin = existing.contactLinkedin;
  if (existing.customNotes) merged.customNotes = existing.customNotes;

  return merged;
}

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
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

/**
 * Deduplicate existing prospects by company name.
 * Keeps the record with the most data, merges info from duplicates, then deletes extras.
 */
export const deduplicateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("prospects").collect();
    const groups = new Map();

    // Group by normalized company name
    for (const p of all) {
      const key = normalizeCompanyName(p.company);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(p);
    }

    let merged = 0;
    let deleted = 0;

    for (const [key, group] of groups.entries()) {
      if (group.length <= 1) continue;

      // Sort by data richness: more fields filled = keep
      group.sort((a, b) => {
        const scoreA = dataRichness(a);
        const scoreB = dataRichness(b);
        return scoreB - scoreA; // richest first
      });

      const keeper = group[0];
      // Merge all duplicates into the keeper
      for (let i = 1; i < group.length; i++) {
        const dup = group[i];
        const mergedData = mergeProspects(keeper, dup);
        await ctx.db.patch(keeper._id, mergedData);
        await ctx.db.delete(dup._id);
        deleted++;
      }
      merged++;
    }

    return { merged, deleted, remaining: all.length - deleted };
  },
});

function dataRichness(p) {
  let score = 0;
  const fields = ['trigger', 'projectStatus', 'deciders', 'emailSubject', 'emailBody', 
                  'followUpEmail', 'ctaSugerido', 'discoveryNote', 'contactName', 'contactEmail'];
  for (const f of fields) {
    if (p[f] && p[f].length > 0) score += p[f].length;
  }
  score += (p.needs?.length || 0) * 10;
  score += (p.linkedinLinks?.length || 0) * 15;
  return score;
}
