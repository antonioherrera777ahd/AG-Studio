import React, { useState } from 'react';
import { Character, Activity } from '../types';
import { X, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

interface DuoMeetingModalProps {
  initialCharId?: string;
  characters: Character[];
  activities: Activity[];
  onClose: () => void;
  onConfirmDuo: (char1Id: string, char2Id: string, activityId?: string) => void;
}

export const DuoMeetingModal: React.FC<DuoMeetingModalProps> = ({
  initialCharId,
  characters,
  activities,
  onClose,
  onConfirmDuo,
}) => {
  const activeChars = characters.filter((c) => c.active);

  const [char1Id, setChar1Id] = useState<string>(initialCharId || activeChars[0]?.id || '');
  const [char2Id, setChar2Id] = useState<string>(
    activeChars.find((c) => c.id !== (initialCharId || activeChars[0]?.id))?.id || ''
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  const char1 = activeChars.find((c) => c.id === char1Id);
  const char2 = activeChars.find((c) => c.id === char2Id);

  // Suggested high-synergy corporate duos according to prompt section 8
  const SUGGESTED_DUOS = [
    {
      c1: 'david-piqueras',
      c2: 'daniela-escribano',
      title: 'Campañas Publicitarias y Storytelling',
      desc: 'David lidera el concepto visual y Daniela articula el mensaje verbal y los copys.',
    },
    {
      c1: 'jaqueline-smith',
      c2: 'david-piqueras',
      title: 'Spot Televisivo y Estrategia Audiovisual',
      desc: 'Jaqueline gestiona la distribución, tiempos y ROI; David la dirección creativa y el arte.',
    },
    {
      c1: 'martha-mendoza',
      c2: 'marcos-torres',
      title: 'Diseño Web, UX y Desarrollo Frontend',
      desc: 'Martha vela por la experiencia de usuario y accesibilidad; Marcos por la viabilidad en código.',
    },
    {
      c1: 'david-piqueras',
      c2: 'rebeca-lafuente',
      title: 'Dirección de Arte e Identidad Visual',
      desc: 'Sinergia entre estética fotográfica, armonías cromáticas y conceptualización gráfica.',
    },
    {
      c1: 'alberto-garcia',
      c2: 'lola-puente',
      title: 'Defensa Ejecutiva y Requisitos de Negocio',
      desc: 'Exigencia máxima en viabilidad corporativa y coherencia de contrabriefing.',
    },
  ];

  const handleApplySuggestedDuo = (c1: string, c2: string) => {
    setChar1Id(c1);
    setChar2Id(c2);
  };

  const handleStart = () => {
    if (char1Id && char2Id && char1Id !== char2Id) {
      onConfirmDuo(char1Id, char2Id, selectedActivityId || undefined);
    }
  };

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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Modalidad de Reunión Conjunta</span>
          </div>
          <h2 className="text-xl font-bold font-['Space_Grotesk']">
            Reunión con Dos Profesionales de AG
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Reúnete simultáneamente con dos responsables. Cada profesional intervendrá desde su
            especialidad, pudiendo contrastar opiniones y debatir entre ellos.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Suggested Pairs */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dúos recomendados por AG Telecomunicaciones:</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTED_DUOS.map((d, i) => (
                <div
                  key={i}
                  onClick={() => handleApplySuggestedDuo(d.c1, d.c2)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    (char1Id === d.c1 && char2Id === d.c2) || (char1Id === d.c2 && char2Id === d.c1)
                      ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400/40'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{d.title}</span>
                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      Seleccionar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{d.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selector 1 and 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Primer Profesional
              </label>
              <select
                value={char1Id}
                onChange={(e) => setChar1Id(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeChars.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === char2Id}>
                    {c.name} — {c.role}
                  </option>
                ))}
              </select>
              {char1 && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <img
                    src={char1.avatar}
                    alt={char1.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1 text-[11px]">
                    <div className="font-bold text-slate-800 truncate">{char1.name}</div>
                    <div className="text-slate-500 truncate">{char1.department}</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Segundo Profesional
              </label>
              <select
                value={char2Id}
                onChange={(e) => setChar2Id(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activeChars.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === char1Id}>
                    {c.name} — {c.role}
                  </option>
                ))}
              </select>
              {char2 && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <img
                    src={char2.avatar}
                    alt={char2.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1 text-[11px]">
                    <div className="font-bold text-slate-800 truncate">{char2.name}</div>
                    <div className="text-slate-500 truncate">{char2.department}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity selector (Optional) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Actividad o encargo a tratar (opcional)
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Reunión general sin actividad específica vinculada --</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleStart}
            disabled={!char1Id || !char2Id || char1Id === char2Id}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Iniciar Reunión Conjunta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
