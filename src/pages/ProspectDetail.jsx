import React, { useState, useRef } from 'react';
import { ArrowLeft, Briefcase, Activity, Target, Users, FileText, Copy, ExternalLink, Zap, Edit3, Save, X, CalendarPlus, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProspectDetail({ prospect, isDark, onBack, onUpdate, onScheduleMeeting }) {
  if (!prospect) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const fileInputRef = useRef(null);

  const p = { ...prospect, ...editData };

  const startEdit = () => {
    setEditData({
      contactName: prospect.contactName || '',
      contactEmail: prospect.contactEmail || '',
      linkedinUrl: prospect.linkedinUrl || (prospect.linkedinLinks?.[0]?.url || ''),
      company: prospect.company,
      notes: prospect.notes || '',
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdate(prospect.id, editData);
    setIsEditing(false);
    toast.success('Prospecto actualizado');
  };

  const cancelEdit = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Store filename and URL for reference
    const fileUrl = URL.createObjectURL(file);
    const update = { attachedFile: { name: file.name, url: fileUrl, uploadDate: new Date().toISOString() } };
    setEditData(prev => ({ ...prev, ...update }));
    onUpdate(prospect.id, update);
    toast.success(`📎 "${file.name}" adjuntado al prospecto`);
  };

  const scheduleMeeting = () => {
    if (!meetingDate || !meetingLink) {
      toast.error('Ingresa fecha y enlace de Google Meet');
      return;
    }
    onScheduleMeeting({
      company: p.company,
      date: meetingDate,
      link: meetingLink,
      notes: `Discovery call — ${p.trigger?.substring(0, 60) || ''}`,
      status: 'por_realizar',
      prospectId: prospect.id,
    });
    setShowMeetingForm(false);
    setMeetingDate('');
    setMeetingLink('');
    toast.success(`📅 Reunión agendada con ${p.company}`);
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-slide-in-right">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className={`flex items-center gap-2 text-sm transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
          <ArrowLeft size={16} /> Volver a prospectos
        </button>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border bg-transparent hover:bg-blue-500/10 text-blue-500 border-blue-500/30">
              <Edit3 size={14} /> Editar
            </button>
          ) : (
            <>
              <button onClick={saveEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors">
                <Save size={14} /> Guardar
              </button>
              <button onClick={cancelEdit} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}>
                <X size={14} /> Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className={`p-8 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Briefcase size={24} />
            </div>
            <div>
              {isEditing ? (
                <input value={editData.company || p.company} onChange={e => setEditData(prev => ({ ...prev, company: e.target.value }))} className={`${inputClass} text-xl font-bold mb-1`} />
              ) : (
                <h1 className="text-2xl font-bold">{p.company}</h1>
              )}
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{p.sector} · {p.location}</p>
              {p.projectStatus && <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{p.projectStatus}</p>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-4xl font-black text-green-500 mb-1">{p.score}<span className="text-lg text-zinc-500 font-normal">/100</span></div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${
              p.priority === 'Alta' ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : p.priority === 'Media-Alta' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {p.priority}
            </span>
          </div>
        </div>

        {/* Editable contact fields */}
        {isEditing && (
          <div className={`mt-6 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-4 ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Nombre del Contacto</label>
              <input type="text" value={editData.contactName} onChange={e => setEditData(prev => ({ ...prev, contactName: e.target.value }))} className={inputClass} placeholder="Ej. Juan Pérez López" />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Email del Contacto</label>
              <input type="email" value={editData.contactEmail} onChange={e => setEditData(prev => ({ ...prev, contactEmail: e.target.value }))} className={inputClass} placeholder="contacto@empresa.com" />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>LinkedIn (URL correcta)</label>
              <input type="url" value={editData.linkedinUrl} onChange={e => setEditData(prev => ({ ...prev, linkedinUrl: e.target.value }))} className={inputClass} placeholder="https://www.linkedin.com/in/..." />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Notas personales</label>
              <input type="text" value={editData.notes} onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))} className={inputClass} placeholder="Notas adicionales..." />
            </div>
          </div>
        )}

        {/* Contact info display (non-edit mode) */}
        {!isEditing && (p.contactName || p.contactEmail) && (
          <div className={`mt-5 pt-4 border-t flex flex-wrap gap-4 text-sm ${isDark ? 'border-zinc-800 text-zinc-300' : 'border-gray-200 text-gray-700'}`}>
            {p.contactName && <span>👤 {p.contactName}</span>}
            {p.contactEmail && <span>📧 {p.contactEmail}</span>}
            {p.linkedinUrl && (
              <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Paperclip size={16} /> Adjuntar PDF Reunión
        </button>
        <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileUpload} className="hidden" />

        <button
          onClick={() => setShowMeetingForm(!showMeetingForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors shadow-lg shadow-green-500/20"
        >
          <CalendarPlus size={16} /> Programar Reunión
        </button>

        {p.attachedFile && (
          <a href={p.attachedFile.url} target="_blank" rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${isDark ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' : 'border-purple-200 text-purple-600 bg-purple-50'}`}
          >
            <Paperclip size={14} /> {p.attachedFile.name}
          </a>
        )}
      </div>

      {/* Schedule Meeting Form */}
      {showMeetingForm && (
        <div className={`${cardClass} animate-fade-in`}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CalendarPlus size={16} className="text-green-500" />
            Programar Reunión con {p.company}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Fecha y hora *</label>
              <input type="datetime-local" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Enlace Google Meet *</label>
              <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className={inputClass} placeholder="https://meet.google.com/..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={scheduleMeeting} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
              Confirmar Reunión
            </button>
            <button onClick={() => setShowMeetingForm(false)} className={`px-4 py-2.5 rounded-xl text-sm border ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-500'}`}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger & Needs */}
        <div className={`${cardClass} space-y-5`}>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2 mb-3">
              <Activity size={14} /> Trigger Detectado
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>{p.trigger}</p>
          </div>

          <div className={`pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2 mb-3">
              <Target size={14} /> Hipótesis de Dolor / Necesidad
            </h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
              {(p.needs || []).map((need, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  {need}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Deciders */}
        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-purple-500">
              <Users size={14} /> Decisores y Contactos
            </h3>
            <div className={`p-4 rounded-xl text-sm ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-gray-50 border border-gray-100'}`}>
              <span className="font-semibold block mb-2">Decisor principal</span>
              <span className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{p.deciders}</span>
            </div>
            {p.linkedinUrl ? (
              <a href={p.linkedinUrl} target="_blank" rel="noreferrer"
                className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-900 text-blue-400' : 'hover:bg-gray-50 text-blue-600'}`}
              >
                <ExternalLink size={14} /> Ver en LinkedIn
              </a>
            ) : (p.linkedinLinks || []).length > 0 && (
              <div className="mt-3 space-y-2">
                {p.linkedinLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-zinc-900 text-blue-400' : 'hover:bg-gray-50 text-blue-600'}`}
                  >
                    <ExternalLink size={14} /> {link.role}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className={cardClass}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-green-500 flex items-center gap-2 mb-5">
          <FileText size={14} /> Templates de Contacto
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Subject */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Asunto sugerido</span>
              <button onClick={() => copy(p.emailSubject, 'Asunto')} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <Copy size={14} />
              </button>
            </div>
            <div className={`p-3 rounded-xl text-sm font-medium ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-gray-50 border border-gray-200'}`}>
              {p.emailSubject}
            </div>
          </div>

          {/* Email Body */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Email inicial</span>
              <button onClick={() => copy(p.emailBody, 'Email')} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <Copy size={14} />
              </button>
            </div>
            <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
              {p.emailBody}
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Follow-up</span>
              <button onClick={() => copy(p.followUpEmail || '', 'Follow-up')} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <Copy size={14} />
              </button>
            </div>
            <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
              {p.followUpEmail || 'No disponible'}
            </div>
          </div>
        </div>

        {/* CTA */}
        {p.ctaSugerido && (
          <div className={`mt-5 p-4 rounded-xl border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">CTA Sugerido</span>
                <p className={`text-sm mt-1 ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>{p.ctaSugerido}</p>
              </div>
              <button onClick={() => copy(p.ctaSugerido, 'CTA')} className={`p-1 rounded hover:bg-zinc-800 transition-colors ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discovery Note */}
      {p.discoveryNote && (
        <div className={`p-6 rounded-2xl border border-orange-500/30 ${isDark ? 'bg-orange-500/5' : 'bg-orange-50'}`}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2 flex items-center gap-2">
            <Zap size={14} /> Nota para Discovery
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-gray-800'}`}>{p.discoveryNote}</p>
        </div>
      )}
    </div>
  );
}
