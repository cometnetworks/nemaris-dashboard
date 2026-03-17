import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PRIORITY_COLORS = { 'Alta': '#ef4444', 'Media-Alta': '#f97316', 'Media': '#3b82f6', 'Baja': '#6b7280' };
const SCORE_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#22c55e'];

export default function Pipeline({ prospects, isDark }) {
  // Score distribution
  const scoreData = [
    { range: 'En riesgo (0-69)', count: prospects.filter(p => p.score < 70).length, fill: SCORE_COLORS[0] },
    { range: 'Potencial (70-79)', count: prospects.filter(p => p.score >= 70 && p.score < 80).length, fill: SCORE_COLORS[1] },
    { range: 'Calificado (80-89)', count: prospects.filter(p => p.score >= 80 && p.score < 90).length, fill: SCORE_COLORS[2] },
    { range: 'Cierre Fuerte (90+)', count: prospects.filter(p => p.score >= 90).length, fill: SCORE_COLORS[3] },
  ];

  // Priority distribution
  const priorityData = Object.entries(
    prospects.reduce((acc, p) => { acc[p.priority] = (acc[p.priority] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, color: PRIORITY_COLORS[name] || '#6b7280' }));

  // Sector distribution
  const sectorData = Object.entries(
    prospects.reduce((acc, p) => {
      const s = p.sector.split('(')[0].trim();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  // Location distribution
  const locationData = Object.entries(
    prospects.reduce((acc, p) => { acc[p.location] = (acc[p.location] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreData.map((item, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{item.range}</span>
            </div>
            <span className="text-2xl font-bold">{item.count}</span>
            <span className={`text-xs ml-2 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>prospectos</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-6">Distribución por Score</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData} barSize={40}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#71717a' : '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: isDark ? '#18181b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`, borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {scoreData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Donut */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-6">Distribución por Prioridad</h2>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: isDark ? '#18181b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`, borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {priorityData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={isDark ? 'text-zinc-400' : 'text-gray-600'}>{item.name}</span>
                  <span className="font-semibold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Sector */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-5">Por Sector</h2>
          <div className="space-y-4">
            {sectorData.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{s.name}</span>
                  <span className="font-medium">{s.count} prospectos</span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${(s.count / (prospects.length || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Location */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-5">Por Ubicación</h2>
          <div className="space-y-4">
            {locationData.map((l, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{l.name}</span>
                  <span className="font-medium">{l.count}</span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-700"
                    style={{ width: `${(l.count / (prospects.length || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
