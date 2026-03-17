import React, { useState } from 'react';
import { Target, Activity, ArrowUpRight, Filter } from 'lucide-react';

export default function Opportunities({ prospects, isDark, onSelect }) {
  const [filter, setFilter] = useState('top');
  
  const getFiltered = () => {
    switch (filter) {
      case 'top': return prospects.filter(p => p.priority === 'Alta');
      case 'qualified': return prospects.filter(p => p.score >= 80);
      case 'all': return [...prospects].sort((a, b) => b.score - a.score);
      default: return prospects;
    }
  };

  const filtered = getFiltered();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          Vista detallada de oportunidades con emails y CTAs listos para usar.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: 'top', label: 'Top Urgentes' },
          { id: 'qualified', label: 'Calificados (80+)' },
          { id: 'all', label: 'Todos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.id
                ? (isDark ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200')
                : (isDark ? 'text-zinc-400 hover:bg-zinc-800 border border-zinc-800' : 'text-gray-600 hover:bg-gray-100 border border-gray-200')
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className={`self-center ml-2 text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{filtered.length} oportunidades</span>
      </div>

      {/* Opportunity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(p => (
          <div key={p.id} className={`p-6 rounded-2xl border flex flex-col transition-all hover:scale-[1.005] ${
            isDark ? 'bg-[#18181b] border-zinc-800/80 hover:border-zinc-700' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {p.company.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{p.company}</h3>
                  <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{p.sector} · {p.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  p.score >= 90 ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'
                }`}>{p.score}/100</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                  p.priority === 'Alta' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>{p.priority}</span>
              </div>
            </div>

            {/* Trigger */}
            <div className={`p-3 rounded-xl text-sm mb-4 border-l-2 border-orange-500 ${isDark ? 'bg-zinc-900/50 text-zinc-300' : 'bg-gray-50 text-gray-700'}`}>
              <span className="font-semibold text-orange-500 block text-xs mb-1">🔥 Trigger</span>
              {p.trigger}
            </div>

            {/* Deciders & Action */}
            <div className="flex-1">
              <p className={`text-xs mb-1 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Decisores: {p.deciders}</p>
              {p.emailSubject && (
                <div className="mt-3">
                  <p className={`text-xs mb-1 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Asunto sugerido:</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>{p.emailSubject}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            {p.ctaSugerido && (
              <div className={`mt-4 p-3 rounded-xl text-xs ${isDark ? 'bg-amber-500/5 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                <span className="font-bold">CTA Sugerido: </span>{p.ctaSugerido}
              </div>
            )}

            {/* Footer */}
            <div className={`pt-4 mt-4 border-t flex justify-between items-center ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
              <span className="text-sm font-medium text-green-500">Score: {p.score}</span>
              <button
                onClick={() => onSelect(p)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Accionar <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`py-16 text-center rounded-2xl border ${isDark ? 'border-zinc-800 bg-[#18181b]' : 'border-gray-200 bg-white'}`}>
          <Target size={48} className={`mx-auto mb-4 ${isDark ? 'text-zinc-700' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-zinc-500' : 'text-gray-400'}>No hay oportunidades con este filtro</p>
        </div>
      )}
    </div>
  );
}
