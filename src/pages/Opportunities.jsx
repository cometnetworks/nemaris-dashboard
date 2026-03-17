import React, { useState } from 'react';
import { Target, ArrowUpRight, AlertTriangle, Filter, Star } from 'lucide-react';

export default function Opportunities({ prospects, meetings, isDark, onSelect }) {
  const [activeTab, setActiveTab] = useState('prospecting');

  // Qualified: meetings marked as 'calificada'
  const qualifiedMeetings = (meetings || []).filter(m => m.status === 'calificada');
  const qualifiedProspectIds = new Set(qualifiedMeetings.map(m => m.prospectId));
  const qualifiedProspects = prospects.filter(p => qualifiedProspectIds.has(p.id));
  // Also include any prospect whose company matches a qualified meeting company
  const qualifiedCompanies = new Set(qualifiedMeetings.map(m => m.company?.toLowerCase()));
  const allQualified = [...new Set([
    ...qualifiedProspects,
    ...prospects.filter(p => qualifiedCompanies.has(p.company?.toLowerCase())),
  ])];

  // Non-qualified high priority prospects
  const prospectingOps = prospects
    .filter(p => (p.priority === 'Alta' || p.priority === 'Media-Alta' || p.score >= 80) && !qualifiedCompanies.has(p.company?.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;

  const renderProspectCard = (p, showQualifiedBadge = false) => (
    <div key={p.id} className={`p-5 rounded-xl border transition-all hover:scale-[1.01] ${isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${ isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600' }`}>
            {p.company.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{p.company}</h4>
            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{p.sector} · {p.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showQualifiedBadge && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Calificada ✓
            </span>
          )}
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
            p.score >= 90 ? (isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
            : p.score >= 80 ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700')
            : (isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700')
          }`}>{p.score}</span>
        </div>
      </div>
      
      {p.trigger && (
        <div className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
          <span className="font-bold text-orange-500">Trigger:</span> {p.trigger.substring(0, 120)}{p.trigger.length > 120 ? '…' : ''}
        </div>
      )}

      {p.ctaSugerido && (
        <div className={`text-xs p-2 rounded-lg mb-3 ${isDark ? 'bg-amber-500/5 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          <strong>CTA:</strong> {p.ctaSugerido.substring(0, 100)}
        </div>
      )}

      <button
        onClick={() => onSelect(p)}
        className="w-full mt-1 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border border-blue-500/20"
      >
        Accionar <ArrowUpRight size={12} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Tabs */}
      <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-gray-100'}`}>
        <button
          onClick={() => setActiveTab('prospecting')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'prospecting'
              ? (isDark ? 'bg-[#18181b] text-white' : 'bg-white text-gray-900 shadow-sm')
              : (isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
          }`}
        >
          <Target size={16} />
          En Prospección ({prospectingOps.length})
        </button>
        <button
          onClick={() => setActiveTab('qualified')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'qualified'
              ? (isDark ? 'bg-[#18181b] text-white' : 'bg-white text-gray-900 shadow-sm')
              : (isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
          }`}
        >
          <Star size={16} className={activeTab === 'qualified' ? 'text-emerald-400' : ''} />
          Calificadas ({allQualified.length})
        </button>
      </div>

      {/* Prospecting Tab */}
      {activeTab === 'prospecting' && (
        <>
          {/* Urgents */}
          {prospects.filter(p => p.priority === 'Alta').length > 0 && (
            <div className={cardClass}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Top Urgentes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospectingOps.filter(p => p.priority === 'Alta').map(p => renderProspectCard(p))}
              </div>
            </div>
          )}

          {/* Other qualified */}
          {prospectingOps.filter(p => p.priority !== 'Alta').length > 0 && (
            <div className={cardClass}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Filter size={16} className="text-blue-500" />
                Calificados Pipeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospectingOps.filter(p => p.priority !== 'Alta').map(p => renderProspectCard(p))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Qualified Tab */}
      {activeTab === 'qualified' && (
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Star size={16} className="text-emerald-500" />
            Oportunidades Calificadas
          </h2>
          {allQualified.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
              <Star size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">Aún no hay oportunidades calificadas</p>
              <p className="text-xs">Cuando una reunión se marque como "Calificada ✓" en la sección de Reuniones, el prospecto aparecerá aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQualified.map(p => renderProspectCard(p, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
