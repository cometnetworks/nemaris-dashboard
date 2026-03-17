import React, { useState } from 'react';
import { Calendar, Plus, ExternalLink, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Meetings({ meetings, isDark, onAdd, onUpdate, onDelete }) {
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCompany || !newDate || !newLink) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    onAdd({ company: newCompany, date: newDate, link: newLink, notes: newNotes, status: 'confirmed' });
    setNewCompany(''); setNewDate(''); setNewLink(''); setNewNotes('');
    toast.success('Reunión agregada exitosamente');
  };

  const upcoming = meetings.filter(m => new Date(m.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = meetings.filter(m => new Date(m.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

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
          <Calendar size={16} className="text-green-500" />
          Próximas Reuniones ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className={`text-sm py-6 text-center ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>No hay reuniones programadas.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(m => (
              <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{m.company}</h4>
                    <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                      <Clock size={12} /> {formatDate(m.date)}
                    </p>
                    {m.notes && <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{m.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={m.link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600/10 text-green-500 hover:bg-green-600/20 rounded-xl text-xs font-medium transition-colors border border-green-500/20"
                  >
                    <ExternalLink size={14} /> Unirse
                  </a>
                  <button onClick={() => { onDelete(m.id); toast.success('Reunión eliminada'); }}
                    className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className={cardClass}>
          <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            Reuniones Pasadas ({past.length})
          </h2>
          <div className="space-y-2">
            {past.map(m => (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl opacity-60 ${
                isDark ? 'bg-zinc-900/30' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className={isDark ? 'text-zinc-600' : 'text-gray-400'} />
                  <span className="text-sm">{m.company}</span>
                  <span className={`text-xs ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>{formatDate(m.date)}</span>
                </div>
                <button onClick={() => { onDelete(m.id); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-zinc-800 text-zinc-600' : 'hover:bg-gray-200 text-gray-400'}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
