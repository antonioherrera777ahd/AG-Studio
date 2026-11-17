import React from 'react';
import { CorporateBriefing } from '../types';
import { X, Building2, Shield, Layers, Award, Sparkles } from 'lucide-react';

interface CorporateBriefingModalProps {
  briefing: CorporateBriefing;
  onClose: () => void;
}

export const CorporateBriefingModal: React.FC<CorporateBriefingModalProps> = ({
  briefing,
  onClose,
}) => {
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Documento Oficial // Canon Corporativo</span>
          </div>
          <h2 className="text-2xl font-bold font-['Space_Grotesk']">{briefing.companyName}</h2>
          <p className="text-xs text-slate-300 mt-1">{briefing.subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Resumen Ejecutivo y Contexto</span>
            </h3>
            <p className="whitespace-pre-line">{briefing.overview}</p>
          </div>

          {/* History */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Historia y Filosofía de Don Alberto García
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{briefing.history}</p>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Sectores en los que opera el conglomerado:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {briefing.sectors.map((sec, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/70 text-xs font-medium text-blue-950 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{sec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Identity Rules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Reglas Institucionales y Líneas Rojas de Marca:</span>
            </h3>
            <ul className="space-y-2">
              {briefing.brandIdentityRules.map((rule, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
