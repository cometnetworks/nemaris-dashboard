import React, { useState, useRef } from 'react';
import { UploadCloud, Search, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { parseProspectsWithAI } from '../utils/aiParser';

export default function Reports({ isDark, reportHistory, onDataExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) processFile(e.target.files[0]);
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.pdf')) {
      toast.error('Solo se aceptan archivos PDF');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccessInfo(null);

    try {
      // Step 1: Extract text from PDF
      setStatusText('Extrayendo texto del PDF...');
      setProgress(15);
      const text = await extractTextFromPDF(file);
      
      if (!text || text.length < 100) {
        throw new Error('No se pudo extraer texto suficiente del PDF. Verifica que el archivo no sea una imagen escaneada.');
      }
      
      setProgress(35);
      setStatusText('Texto extraído. Enviando a la IA para análisis...');

      // Step 2: Extract date from filename (e.g., "Report-Mexico-120326" -> "2026-03-12")
      const dateMatch = file.name.match(/(\d{2})(\d{2})(\d{2})/);
      let reportDate = new Date().toISOString().split('T')[0];
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        reportDate = `20${year}-${month}-${day}`;
      }

      // Step 3: Parse with AI
      setStatusText('La IA está analizando prospectos, scores, decisores y generando emails...');
      setProgress(55);
      
      const prospects = await parseProspectsWithAI(text, reportDate);
      
      setProgress(85);
      setStatusText('Integrando datos al dashboard...');

      // Step 4: Add to dashboard
      const reportInfo = {
        id: `report-${Date.now()}`,
        filename: file.name,
        date: reportDate,
        prospectsExtracted: prospects.length,
        source: 'AI Extraction',
        status: 'processed'
      };
      
      onDataExtracted(prospects, reportInfo);
      
      setProgress(100);
      setSuccessInfo({
        count: prospects.length,
        filename: file.name,
        date: reportDate
      });
      
      toast.success(`✅ ${prospects.length} prospectos extraídos de ${file.name}`);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardClass = `p-6 rounded-2xl border ${isDark ? 'bg-[#18181b] border-zinc-800/80' : 'bg-white border-gray-100 shadow-sm'}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Upload Zone */}
      <div
        className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
          : (isDark ? 'border-zinc-700 bg-[#18181b] hover:border-zinc-600' : 'border-gray-300 bg-gray-50 hover:border-gray-400')
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Idle State */}
        {!isProcessing && !successInfo && !error && (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Cargar Nuevo Reporte Diario</h3>
            <p className={`text-sm mb-6 max-w-md ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Arrastra tu PDF aquí o haz clic para seleccionar. La IA extraerá automáticamente prospectos, scores, decisores y emails en 30-60 segundos.
            </p>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              Seleccionar Archivo
            </button>
            <p className={`text-xs mt-3 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>PDF · máx. 10MB</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 relative flex items-center justify-center mb-4">
              <div className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-zinc-800' : 'border-gray-200'}`} />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <Search size={24} className="text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Motor de IA Extrayendo Inteligencia...</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>{statusText}</p>
            <div className={`w-full max-w-md h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{progress}%</span>
          </div>
        )}

        {/* Success State */}
        {successInfo && (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center text-green-500 mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-green-500">¡Reporte Procesado con Éxito!</h3>
            <p className={`text-sm mb-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              <strong>{successInfo.count}</strong> prospectos extraídos de <strong>{successInfo.filename}</strong>
            </p>
            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
              Dashboard y Pipeline actualizados automáticamente.
            </p>
            <button onClick={() => setSuccessInfo(null)} className="mt-4 text-sm text-blue-500 hover:underline">
              Cargar otro reporte
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-red-500">Error al Procesar</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{error}</p>
            <button onClick={() => setError(null)} className="text-sm text-blue-500 hover:underline">
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Report History */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold mb-4">Historial de Reportes</h2>
        {reportHistory.length === 0 ? (
          <p className={`text-sm py-4 text-center ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>No hay reportes cargados aún.</p>
        ) : (
          <div className="space-y-2">
            {reportHistory.map(r => (
              <div key={r.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-4">
                  <FileText className={isDark ? 'text-zinc-500' : 'text-gray-400'} size={20} />
                  <div>
                    <p className="font-medium text-sm">{r.filename}</p>
                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
                      {r.date} · {r.prospectsExtracted} prospectos extraídos · {r.source}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                  r.status === 'processed'
                    ? (isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200')
                    : (isDark ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : 'bg-gray-100 text-gray-600 border-gray-200')
                }`}>
                  {r.status === 'processed' ? '✓ Procesado' : r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
