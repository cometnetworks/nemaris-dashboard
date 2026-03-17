import React from 'react';
import { Download, FileDown } from 'lucide-react';
import { exportProspectsToExcel, exportWeeklyReport } from '../../utils/excelExport';

export default function Header({ title, isDark, prospects, meetings, latestReportDate }) {
  return (
    <header className={`h-16 flex items-center justify-between px-6 lg:px-8 border-b flex-shrink-0 ${
      isDark ? 'bg-[#09090b]/80 border-zinc-800/60 backdrop-blur-sm' : 'bg-white/80 border-gray-200 backdrop-blur-sm'
    }`}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        {latestReportDate && (
          <span className={`text-xs px-2 py-1 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
            Último reporte: {latestReportDate}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => exportWeeklyReport(prospects, meetings)}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors border ${
            isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileDown size={16} />
          <span className="hidden md:inline">Reporte Semanal</span>
        </button>
        <button
          onClick={() => exportProspectsToExcel(prospects)}
          className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          <Download size={16} />
          <span className="hidden md:inline">Exportar XLSX</span>
        </button>
      </div>
    </header>
  );
}
