import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useProspects() {
  const convexProspects = useQuery(api.prospects.list) ?? [];
  const convexReports = useQuery(api.reports.list) ?? [];
  const upsertMany = useMutation(api.prospects.upsertMany);
  const updateProspect = useMutation(api.prospects.update);
  const removeProspect = useMutation(api.prospects.remove);
  const deduplicateAllMutation = useMutation(api.prospects.deduplicateAll);
  const addReport = useMutation(api.reports.add);

  // Map Convex docs to the shape the app expects (use _id as id, keep prospectId)
  const prospects = convexProspects.map(p => ({
    ...p,
    id: p.prospectId,
  }));

  const reportHistory = convexReports
    .map(r => ({
      ...r,
      id: r.reportId,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const addProspects = async (newProspects, reportInfo) => {
    // Map incoming prospects to the Convex schema shape
    const mapped = newProspects.map(p => ({
      prospectId: p.id || p.prospectId || `prospect-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      company: p.company || 'Desconocido',
      sector: p.sector || 'No especificado',
      location: p.location || 'No especificado',
      priority: p.priority || 'Media',
      score: typeof p.score === 'number' ? p.score : 75,
      trigger: p.trigger || '',
      needs: Array.isArray(p.needs) ? p.needs : [],
      projectStatus: p.projectStatus || '',
      deciders: p.deciders || '',
      linkedinLinks: Array.isArray(p.linkedinLinks) ? p.linkedinLinks : [],
      emailSubject: p.emailSubject || '',
      emailBody: p.emailBody || '',
      followUpEmail: p.followUpEmail || '',
      ctaSugerido: p.ctaSugerido || '',
      discoveryNote: p.discoveryNote || '',
      reportDate: p.reportDate || new Date().toISOString().split('T')[0],
      reportSource: p.reportSource || 'Unknown',
    }));

    await upsertMany({ prospects: mapped });

    if (reportInfo) {
      await addReport({
        reportId: reportInfo.id || `report-${Date.now()}`,
        filename: reportInfo.filename || 'unknown.pdf',
        date: reportInfo.date || new Date().toISOString().split('T')[0],
        prospectsExtracted: reportInfo.prospectsExtracted || newProspects.length,
        source: reportInfo.source || 'Unknown',
        status: reportInfo.status || 'processed',
      });
    }
  };

  const handleUpdateProspect = async (id, updates) => {
    // Find the Convex doc _id from the prospectId
    const doc = convexProspects.find(p => p.prospectId === id);
    if (doc) {
      await updateProspect({ id: doc._id, updates });
    }
  };

  const handleDeleteProspect = async (id) => {
    const doc = convexProspects.find(p => p.prospectId === id);
    if (!doc) {
      throw new Error('Prospecto no encontrado');
    }
    await removeProspect({ id: doc._id });
  };

  const deduplicateAll = async () => {
    return await deduplicateAllMutation();
  };

  const enrichedCount = prospects.filter(p => p.contactName && p.contactEmail).length;
  const readyToSendCount = prospects.filter(p => p.contactName && p.contactEmail && p.emailBody).length;
  const pendingEnrichmentCount = prospects.length - enrichedCount;

  const stats = {
    total: prospects.length,
    avgScore: Math.round(prospects.reduce((a, b) => a + (b.score || 0), 0) / (prospects.length || 1)),
    highPriority: prospects.filter(p => p.priority === 'Alta').length,
    sectors: [...new Set(prospects.map(p => p.sector))].length,
    enriched: enrichedCount,
    readyToSend: readyToSendCount,
    pendingEnrichment: pendingEnrichmentCount
  };

  return { prospects, addProspects, updateProspect: handleUpdateProspect, deleteProspect: handleDeleteProspect, deduplicateAll, reportHistory, stats };
}
