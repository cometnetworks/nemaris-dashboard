import React from 'react';
import { Mail, Clock, CheckCircle, AlertCircle, Eye, CornerUpRight, Trash2, ExternalLink } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function EmailTracking({ isDark }) {
  const emailLogs = useQuery(api.emails.getAllLogs) || [];

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;

  const renderStatus = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
            <CornerUpRight size={12} /> ENVIADO
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
            <CheckCircle size={12} /> ENTREGADO
          </span>
        );
      case 'opened':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
            <Eye size={12} /> ABIERTO
          </span>
        );
      case 'bounced':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
            <AlertCircle size={12} /> REBOTADO
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1 flex items-center gap-3">
            <Mail className="text-blue-500" /> Control de Envíos
          </h1>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
            Seguimiento en tiempo real de todos los correos outbound.
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b ${isDark ? 'border-zinc-800 bg-[#111115]' : 'border-gray-200 bg-gray-50'}`}>
              <tr>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Destinatario</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Asunto</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider">Estatus</th>
                <th className="px-5 py-3.5 font-medium text-xs uppercase tracking-wider text-right">ID Resend</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800/50' : 'divide-gray-100'}`}>
              {emailLogs.length > 0 ? emailLogs.map((log) => (
                <tr key={log._id} className={isDark ? 'hover:bg-zinc-900/40' : 'hover:bg-gray-50'}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500" />
                      {new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-blue-500">{log.recipient}</td>
                  <td className="px-5 py-4 truncate max-w-xs">{log.subject}</td>
                  <td className="px-5 py-4">{renderStatus(log.status)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-xs font-mono text-zinc-500">{log.resendId?.substring(0, 8)}...</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-zinc-500">
                    No se han registrado envíos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
