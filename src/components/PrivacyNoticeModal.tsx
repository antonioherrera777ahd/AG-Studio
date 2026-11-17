import React from 'react';
import { X, ShieldCheck, Cpu, UserCheck, Lock, AlertCircle } from 'lucide-react';

interface PrivacyNoticeModalProps {
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Marco Ético, Simulación y Privacidad</span>
          </div>
          <h2 className="text-xl font-bold font-['Space_Grotesk']">
            Aviso de Simulación Educativa y Protección de Datos
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[65vh] overflow-y-auto">
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-950 block text-xs mb-1">
                Simulación Profesional con Inteligencia Artificial
              </strong>
              Todos los personajes de AG Telecomunicaciones (Alberto García, David Piqueras, Martha
              Mendoza, etc.) son simulaciones profesionales operadas por modelos avanzados de
              lenguaje (Google Gemini). No son trabajadores humanos ni tutores académicos.
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block text-xs mb-1">
                Sin Recopilación de Datos Personales Sensibles
              </strong>
              No se solicitan nombres completos reales, correos electrónicos, contraseñas ni
              información académica privada. El nombre de equipo asignado es una etiqueta temporal de
              sesión puramente funcional.
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-950 block text-xs mb-1">
                Almacenamiento Local en Navegador y Descargas
              </strong>
              Las reuniones y traspasos se guardan en el almacenamiento local (localStorage) de este
              navegador. Los estudiantes pueden exportar y descargar las actas completas en formato
              Markdown o TXT en cualquier momento para su entrega académica.
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950 block text-xs mb-1">
                Límites de Uso y Cuotas de Modelo
              </strong>
              La aplicación opera con los niveles de servicio y cuotas del SDK de Google Gemini. En
              caso de alta concurrencia o saturación temporal de cuota por minuto, la aplicación
              mostrará un aviso para reintentar la intervención transcurridos unos segundos.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
