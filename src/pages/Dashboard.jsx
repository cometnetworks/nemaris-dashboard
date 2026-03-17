import React from 'react';
import { Briefcase, TrendingUp, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { exportWeeklyReport } from '../utils/excelExport';

function MetricCard({ title, value, subtitle, icon: Icon, color, isDark, delay = 0 }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] animate-fade-in ${
      isDark ? 'bg-[#18181b] border-zinc-800/80 hover:border-zinc-700' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
    }`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{title}</h3>
        {Icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon size={16} /></div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {subtitle && <span className={`text-xs pb-1 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{subtitle}</span>}
      </div>
    </div>
  );
}

export default function Dashboard({ prospects, meetings, stats, isDark, onViewProspect }) {
  const urgents = prospects.filter(p => p.priority === 'Alta').slice(0, 4);
  
  // Chart data
  const scoreDistribution = [
    { range: '60-69', count: prospects.filter(p => p.score >= 60 && p.score < 70).length, fill: '#ef4444' },
    { range: '70-79', count: prospects.filter(p => p.score >= 70 && p.score < 80).length, fill: '#f97316' },
    { range: '80-89', count: prospects.filter(p => p.score >= 80 && p.score < 90).length, fill: '#3b82f6' },
    { range: '90-100', count: prospects.filter(p => p.score >= 90).length, fill: '#22c55e' },
  ];

  const sectorData = Object.entries(
    prospects.reduce((acc, p) => {
      const s = p.sector.split('(')[0].trim();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + '…' : name, count }));

  const upcomingMeetings = meetings
    .filter(m => new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Prospectos" value={stats.total} subtitle="Acumulados" icon={Briefcase} color={isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'} isDark={isDark} delay={0} />
        <MetricCard title="Score Promedio" value={`${stats.avgScore}`} subtitle="de 100" icon={TrendingUp} color={isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'} isDark={isDark} delay={50} />
        <MetricCard title="Alta Prioridad" value={stats.highPriority} subtitle="Acción inmediata" icon={AlertCircle} color={isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600'} isDark={isDark} delay={100} />
        <MetricCard title="Reuniones" value={upcomingMeetings.length} subtitle="Próximas" icon={Calendar} color={isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'} isDark={isDark} delay={150} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Chart */}
        <div className={`col-span-1 p-6 rounded-2xl border animate-fade-in ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`} style={{ animationDelay: '200ms' }}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Distribución por Score
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistribution} barSize={32}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: isDark ? '#71717a' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#71717a' : '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: isDark ? '#18181b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`, borderRadius: 12, fontSize: 12 }}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sectors */}
        <div className={`col-span-1 p-6 rounded-2xl border animate-fade-in ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`} style={{ animationDelay: '250ms' }}>
          <h2 className="text-sm font-semibold mb-4">Sectores</h2>
          <div className="space-y-3">
            {sectorData.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-zinc-400' : 'text-gray-600'}>{s.name}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${(s.count / (stats.total || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className={`col-span-1 p-6 rounded-2xl border flex flex-col animate-fade-in ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`} style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-500" />
            Resumen Ejecutivo
          </h2>
          <p className={`text-sm leading-relaxed flex-1 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            Se han detectado <strong className="text-blue-400">{stats.total} prospectos</strong> con un score promedio de <strong className="text-green-400">{stats.avgScore}/100</strong>.
            {stats.highPriority > 0 && (
              <> Hay <strong className="text-orange-400">{stats.highPriority} oportunidades de alta prioridad</strong> que requieren acción inmediata, concentradas en sectores de manufactura y servicios SAP.</>
            )}
            {' '}Se detectan fuertes patrones de inversión en migración a S/4HANA. Ventana crítica para posicionar servicios de infraestructura SAP Basis.
          </p>
          <button
            onClick={() => exportWeeklyReport(prospects, meetings)}
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            Descargar Reporte Semanal
          </button>
        </div>
      </div>

      {/* Top Urgentes */}
      <div className={`p-6 rounded-2xl border animate-fade-in ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`} style={{ animationDelay: '350ms' }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-semibold">Top Urgentes</h2>
          <button onClick={() => {}} className="text-xs text-blue-500 hover:underline">Ver todos →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgents.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onViewProspect(p)}
              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {p.company.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{p.company}</h4>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{p.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  p.score >= 90 ? (isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                    : (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700')
                }`}>{p.score}</span>
                <ArrowUpRight size={14} className={isDark ? 'text-zinc-600' : 'text-gray-400'} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
