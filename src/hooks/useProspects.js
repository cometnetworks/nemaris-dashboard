import { useState, useEffect } from 'react';
import { loadData, saveData, mergeProspects } from '../utils/dataStore';
import { initialProspects, initialReportHistory } from '../data/initialData';

export function useProspects() {
  const [prospects, setProspects] = useState(() => {
    return loadData('PROSPECTS') || initialProspects;
  });

  const [reportHistory, setReportHistory] = useState(() => {
    return loadData('REPORTS') || initialReportHistory;
  });

  useEffect(() => {
    saveData('PROSPECTS', prospects);
  }, [prospects]);

  useEffect(() => {
    saveData('REPORTS', reportHistory);
  }, [reportHistory]);

  const addProspects = (newProspects, reportInfo) => {
    setProspects(prev => mergeProspects(prev, newProspects));
    if (reportInfo) {
      setReportHistory(prev => [reportInfo, ...prev]);
    }
  };

  const updateProspect = (id, updates) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const stats = {
    total: prospects.length,
    avgScore: Math.round(prospects.reduce((a, b) => a + b.score, 0) / (prospects.length || 1)),
    highPriority: prospects.filter(p => p.priority === 'Alta').length,
    sectors: [...new Set(prospects.map(p => p.sector))].length,
  };

  return { prospects, addProspects, updateProspect, reportHistory, stats };
}
