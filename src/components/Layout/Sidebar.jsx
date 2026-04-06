import React from 'react';
import {
  LayoutDashboard, Activity, Users, Target, Calendar, FileText,
  Sun, Moon, ChevronLeft, ChevronRight, Mail
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: Activity },
  { id: 'prospects', label: 'Prospectos', icon: Users },
  { id: 'opportunities', label: 'Oportunidades', icon: Target },
  { id: 'meetings', label: 'Reuniones', icon: Calendar },
  { id: 'reports', label: 'Reportes', icon: FileText },
  { id: 'email-tracking', label: 'Seguimiento', icon: Mail },
];

export default function Sidebar({ activeTab, onTabChange, isDark, onToggleTheme, stats, collapsed, onToggleCollapse, latestReportDate }) {
  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} border-r flex flex-col justify-between transition-all duration-300 relative flex-shrink-0 ${
      isDark ? 'bg-[#111115] border-zinc-800' : 'bg-white border-gray-200'
    }`}>
      {/* Collapse button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-colors ${
          isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-gray-300 text-gray-500 hover:text-gray-900'
        }`}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Logo */}
        <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-[#0f1c2e] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 overflow-hidden p-1.5">
            <img src="/nemaris-logo.png" alt="Nemaris" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg tracking-tight">Nemaris</span>
              <span className={`text-xs block ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Intelligence OS</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`${collapsed ? 'px-2' : 'px-3'} space-y-1 mt-2`}>
          {!collapsed && <p className={`text-[10px] uppercase tracking-widest font-semibold mb-3 px-3 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>Navegación</p>}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? (isDark ? 'bg-blue-600/15 text-blue-400 font-medium shadow-sm shadow-blue-500/5' : 'bg-blue-50 text-blue-600 font-medium')
                    : (isDark ? 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Stats mini panel */}
        {!collapsed && stats && (
          <div className={`mx-4 mt-6 p-4 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-semibold mb-3 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
              Último Reporte
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Prospectos</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Score prom.</span>
                <span className="font-semibold text-blue-500">{stats.avgScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Alta prioridad</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">{stats.highPriority}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="text-sm">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
        </button>
      </div>
    </aside>
  );
}
