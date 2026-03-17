import React, { useState } from 'react';
import { Calendar, Plus, ExternalLink, Trash2, Clock, CheckCircle, RefreshCw, XCircle, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const MEETING_STATUSES = {
  por_realizar: { label: 'Por Realizar', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock, dot: 'bg-blue-500' },
  realizada: { label: 'Realizada', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle, dot: 'bg-green-500' },
  reagendada: { label: 'Reagendada', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: RefreshCw, dot: 'bg-amber-500' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle, dot: 'bg-red-500' },
  siguientes_pasos: { label: 'Siguientes Pasos', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: ArrowRight, dot: 'bg-purple-500' },
  calificada: { label: 'Calificada ✓', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: Star, dot: 'bg-emerald-500' },
  no_calificada: { label: 'No Calificada', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: XCircle, dot: 'bg-zinc-500' },
};

export default function Meetings({ meetings, isDark, onAdd, onUpdate, onDelete }) {
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCompany || !newDate || !newLink) {
      toast.error('Completa empresa, fecha y enlace');
      return;
    }
    onAdd({ company: newCompany, date: newDate, link: newLink, notes: newNotes, status: 'por_realizar' });
    setNewCompany(''); setNewDate(''); setNewLink(''); setNewNotes('');
    toast.success('Reunión programada');
  };

  const changeStatus = (id, newStatus) => {
    onUpdate(id, { status: newStatus });
    const label = MEETING_STATUSES[newStatus]?.label || newStatus;
    toast.success(`Estado actualizado: ${label}`);
  };

  const upcoming = meetings.filter(m => ['por_realizar', 'reagendada'].includes(m.status || 'por_realizar')).sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = meetings.filter(m => ['realizada', 'siguientes_pasos', 'calificada', 'no_calificada'].includes(m.status));
  const cancelled = meetings.filter(m => m.status === 'cancelada');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const MeetingCard = ({ m, showActions = true }) => {
    const statusInfo = MEETING_STATUSES[m.status || 'por_realizar'] || MEETING_STATUSES.por_realizar;
    const StatusIcon = statusInfo.icon;

    return (
      <div className={`p-4 rounded-xl border transition-colors ${isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${statusInfo.color}`}>
              <StatusIcon size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm">{m.company}</h4>
              <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                <Clock size={12} /> {formatDate(m.date)}
              </p>
              {m.notes && <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{m.notes}</p>}
              <span className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md text-xs font-medium border ${statusInfo.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {m.link && (
              <a href={m.link} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 text-green-500 hover:bg-green-600/20 rounded-lg text-xs font-medium transition-colors border border-green-500/20"
              >
                <ExternalLink size={12} /> Meet
              </a>
            )}
            <button onClick={() => { onDelete(m.id); toast.success('Reunión eliminada'); }}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-600 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Status change buttons */}
        {showActions && (
          <div className={`mt-3 pt-3 border-t flex flex-wrap gap-1.5 ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
            {m.status === 'por_realizar' && (
              <>
                <StatusBtn label="Realizada" onClick={() => changeStatus(m.id, 'realizada')} isDark={isDark} color="green" />
                <StatusBtn label="Reagendar" onClick={() => changeStatus(m.id, 'reagendada')} isDark={isDark} color="amber" />
                <StatusBtn label="Cancelar" onClick={() => changeStatus(m.id, 'cancelada')} isDark={isDark} color="red" />
              </>
            )}
            {m.status === 'reagendada' && (
              <>
                <StatusBtn label="Realizada" onClick={() => changeStatus(m.id, 'realizada')} isDark={isDark} color="green" />
                <StatusBtn label="Cancelar" onClick={() => changeStatus(m.id, 'cancelada')} isDark={isDark} color="red" />
              </>
            )}
            {m.status === 'realizada' && (
              <>
                <StatusBtn label="✅ Calificar Positiva" onClick={() => changeStatus(m.id, 'calificada')} isDark={isDark} color="emerald" />
                <StatusBtn label="Sgtes. Pasos" onClick={() => changeStatus(m.id, 'siguientes_pasos')} isDark={isDark} color="purple" />
                <StatusBtn label="No Calificada" onClick={() => changeStatus(m.id, 'no_calificada')} isDark={isDark} color="zinc" />
              </>
            )}
            {m.status === 'siguientes_pasos' && (
              <>
                <StatusBtn label="✅ Calificar Positiva" onClick={() => changeStatus(m.id, 'calificada')} isDark={isDark} color="emerald" />
                <StatusBtn label="No Calificada" onClick={() => changeStatus(m.id, 'no_calificada')} isDark={isDark} color="zinc" />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Add meeting form */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Plus size={16} className="text-blue-500" />
          Programar Nueva Reunión
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Empresa / Prospecto *</label>
              <input type="text" value={newCompany} onChange={e => setNewCompany(e.target.value)} className={inputClass} placeholder="Ej. Continental Automotive" />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Fecha y Hora *</label>
              <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Enlace Google Meet *</label>
              <input type="url" value={newLink} onChange={e => setNewLink(e.target.value)} className={inputClass} placeholder="https://meet.google.com/..." />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Notas (opcional)</label>
              <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} className={inputClass} placeholder="Ej. Discovery call, revisar landscape" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Agregar Reunión
          </button>
        </form>
      </div>

      {/* Upcoming */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" />
          Por Realizar ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className={`text-sm py-6 text-center ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>No hay reuniones pendientes.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(m => <MeetingCard key={m.id} m={m} />)}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className={cardClass}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Completadas ({completed.length})
          </h2>
          <div className="space-y-3">
            {completed.map(m => <MeetingCard key={m.id} m={m} />)}
          </div>
        </div>
      )}

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <div className={cardClass}>
          <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            <XCircle size={16} /> Canceladas ({cancelled.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {cancelled.map(m => <MeetingCard key={m.id} m={m} showActions={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBtn({ label, onClick, isDark, color }) {
  const colorMap = {
    green: isDark ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-green-200 text-green-600 hover:bg-green-50',
    amber: isDark ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-amber-200 text-amber-600 hover:bg-amber-50',
    red: isDark ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50',
    emerald: isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
    purple: isDark ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50',
    zinc: isDark ? 'border-zinc-600 text-zinc-400 hover:bg-zinc-800' : 'border-gray-300 text-gray-500 hover:bg-gray-100',
  };
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${colorMap[color] || colorMap.zinc}`}>
      {label}
    </button>
  );
}
