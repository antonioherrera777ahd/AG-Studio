import React from 'react';
import { ResourceItem, Character } from '../types';
import { X, BookOpen, Download, User, CheckCircle2, Clock } from 'lucide-react';
import { downloadFile } from '../utils/exportMeeting';

interface ResourceViewerModalProps {
  resource: ResourceItem | null;
  characters: Character[];
  onClose: () => void;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  characters,
  onClose,
}) => {
  if (!resource) return null;

  const charMap = new Map(characters.map((c) => [c.id, c]));
  const recommender = charMap.get(resource.recommendedById);

  const handleDownload = () => {
    const content = `# ${resource.title}\nAutor / Recomendado por: ${recommender ? recommender.name : resource.author}\nFormato: ${resource.format}\n\n${resource.description}\n\n---\n\n${resource.contentSnippet || 'Documento técnico de AG Telecomunicaciones.'}`;
    downloadFile(content, `${resource.id}.txt`, 'text/plain;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {resource.format}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
              {resource.category}
            </span>
            {resource.status === 'available' ? (
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Disponible para consulta</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Pendiente de incorporación</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] leading-tight">
            {resource.title}
          </h2>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
            {recommender && (
              <div className="flex items-center gap-1.5">
                <img
                  src={recommender.avatar}
                  alt={recommender.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-400"
                />
                <span>Recomendado por {recommender.name} ({recommender.role})</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Descripción del Documento
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {resource.status === 'available' && resource.contentSnippet ? (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Extracto Técnico Oficial
              </h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                {resource.contentSnippet}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-amber-900">
                Documento en fase de catalogación interna
              </h4>
              <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
                Este manual se encuentra en proceso de incorporación a los fondos documentales de
                AG Telecomunicaciones. Puedes consultar las directrices directamente con{' '}
                {recommender?.name || 'el profesional asignado'} durante tu reunión.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            AG TELECOM // REF #{resource.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            {resource.status === 'available' && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Documento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
