import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, Trash2 } from 'lucide-react';

const PRIORITY_STYLES = {
  'Alta': { bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500' },
  'Media-Alta': { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-500' },
  'Media': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  'Baja': { bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', dot: 'bg-zinc-500' },
};

export default function Prospects({ prospects, isDark, onSelect, onDelete }) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [sectorFilter, setSectorFilter] = useState('Todos');

  const sectors = useMemo(() => ['Todos', ...new Set(prospects.map(p => p.sector))], [prospects]);
  const priorities = ['Todos', 'Alta', 'Media-Alta', 'Media', 'Baja'];

  const filtered = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = search === '' || 
        p.company.toLowerCase().includes(search.toLowerCase()) ||
        p.sector.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'Todos' || p.priority === priorityFilter;
      const matchesSector = sectorFilter === 'Todos' || p.sector === sectorFilter;
      return matchesSearch && matchesPriority && matchesSector;
    }).sort((a, b) => a.company.localeCompare(b.company));
  }, [prospects, search, priorityFilter, sectorFilter]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{filtered.length} prospectos encontrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex-1 min-w-[240px] flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
          isDark ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-gray-200'
        }`}>
          <Search size={16} className={isDark ? 'text-zinc-500' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`bg-transparent border-none outline-none w-full text-sm ${isDark ? 'text-white placeholder-zinc-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm ${
            isDark ? 'bg-[#18181b] border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          {priorities.map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todas las prioridades' : p}</option>)}
        </select>
        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm max-w-[220px] ${
            isDark ? 'bg-[#18181b] border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          {sectors.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos los sectores' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-zinc-800/80 bg-[#18181b]' : 'border-gray-200 bg-white shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b ${isDark ? 'border-zinc-800 bg-[#111115]' : 'border-gray-200 bg-gray-50'}`}>
              <tr>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Empresa</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Ubicación</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Score</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Prioridad</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800/50' : 'divide-gray-100'}`}>
              {filtered.map(p => {
                const pStyle = PRIORITY_STYLES[p.priority] || PRIORITY_STYLES['Baja'];
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-zinc-900/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {p.company.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{p.company}</div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{p.sector}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>{p.location}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        p.score >= 90 ? (isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                        : p.score >= 80 ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700')
                        : (isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700')
                      }`}>{p.score}/100</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${pStyle.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Estás seguro de eliminar a ${p.company}?`)) {
                              onDelete(p.id);
                            }
                          }}
                          className={`${isDark ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                          title="Eliminar prospecto"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-xs font-medium">
                          Ver detalle <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className={`py-12 text-center ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
            No se encontraron prospectos con los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}
