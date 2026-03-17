// localStorage wrapper with versioning for Nemaris data
const STORAGE_KEYS = {
  PROSPECTS: 'nemaris_prospects_v2',
  MEETINGS: 'nemaris_meetings_v2',
  REPORTS: 'nemaris_reports_v2',
  THEME: 'nemaris_theme',
};

export function loadData(key) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function mergeProspects(existing, incoming) {
  const map = new Map();
  existing.forEach(p => map.set(p.id, p));
  incoming.forEach(p => {
    if (!map.has(p.id)) {
      map.set(p.id, p);
    } else {
      // Update existing with new data
      map.set(p.id, { ...map.get(p.id), ...p });
    }
  });
  return Array.from(map.values());
}

export function generateProspectId(company, dateStr) {
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${slug}-${dateStr.replace(/-/g, '')}`;
}
