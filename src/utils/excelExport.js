import * as XLSX from 'xlsx';

/**
 * Export prospects data to a real .xlsx file
 */
export function exportProspectsToExcel(prospects, filename = null) {
  const data = prospects.map((p, idx) => ({
    '#': idx + 1,
    'Empresa': p.company,
    'Sector': p.sector,
    'Ubicación': p.location,
    'Prioridad': p.priority,
    'Score': p.score,
    'Trigger Detectado': p.trigger,
    'Necesidades': (p.needs || []).join('; '),
    'Estado del Proyecto': p.projectStatus || '',
    'Decisores': p.deciders,
    'Asunto Email': p.emailSubject,
    'Fecha Reporte': p.reportDate || '',
    'Fuente': p.reportSource || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 4 }, { wch: 30 }, { wch: 25 }, { wch: 20 },
    { wch: 12 }, { wch: 8 }, { wch: 50 }, { wch: 40 },
    { wch: 25 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 12 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Prospectos');

  const fname = filename || `Nemaris_Prospectos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fname);
}

/**
 * Generate weekly executive report as XLSX
 */
export function exportWeeklyReport(prospects, meetings) {
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const highPriority = prospects.filter(p => p.priority === 'Alta');
  const avgScore = Math.round(prospects.reduce((a, b) => a + b.score, 0) / (prospects.length || 1));
  
  const summaryData = [
    { 'Métrica': 'Total Prospectos', 'Valor': prospects.length },
    { 'Métrica': 'Alta Prioridad', 'Valor': highPriority.length },
    { 'Métrica': 'Score Promedio', 'Valor': avgScore },
    { 'Métrica': 'Reuniones Programadas', 'Valor': meetings.length },
    { 'Métrica': 'Fecha del Reporte', 'Valor': new Date().toISOString().split('T')[0] },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen Ejecutivo');

  // Top prospects sheet
  const topData = highPriority.map((p, i) => ({
    '#': i + 1,
    'Empresa': p.company,
    'Score': p.score,
    'Sector': p.sector,
    'Trigger': p.trigger,
    'Decisores': p.deciders,
    'Acción': p.ctaSugerido || 'Contactar',
  }));
  const topWs = XLSX.utils.json_to_sheet(topData);
  topWs['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 8 }, { wch: 25 }, { wch: 50 }, { wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, topWs, 'Top Urgentes');

  // All prospects sheet
  const allData = prospects.map((p, i) => ({
    '#': i + 1,
    'Empresa': p.company,
    'Sector': p.sector,
    'Ubicación': p.location,
    'Prioridad': p.priority,
    'Score': p.score,
    'Trigger': p.trigger,
    'Decisores': p.deciders,
  }));
  const allWs = XLSX.utils.json_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, allWs, 'Todos los Prospectos');

  // Meetings sheet
  const meetData = meetings.map((m, i) => ({
    '#': i + 1,
    'Empresa': m.company,
    'Fecha': m.date?.replace('T', ' '),
    'Link': m.link,
    'Estado': m.status || 'Pendiente',
  }));
  const meetWs = XLSX.utils.json_to_sheet(meetData);
  XLSX.utils.book_append_sheet(wb, meetWs, 'Reuniones');

  const fname = `Nemaris_Reporte_Semanal_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fname);
}
