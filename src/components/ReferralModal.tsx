import React, { useState } from 'react';
import { Character, Activity, HandoverNotes } from '../types';
import { X, CornerDownRight, Loader2, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

interface ReferralModalProps {
  currentCharacters: Character[];
  allCharacters: Character[];
  activity?: Activity;
  transcript: string;
  onClose: () => void;
  onExecuteReferral: (targetCharId: string, handover: HandoverNotes) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  currentCharacters,
  allCharacters,
  activity,
  transcript,
  onClose,
  onExecuteReferral,
}) => {
  const currentChar = currentCharacters[0];
  const eligibleChars = allCharacters.filter(
    (c) => c.active && !currentCharacters.some((cur) => cur.id === c.id)
  );

  const [targetCharId, setTargetCharId] = useState<string>(eligibleChars[0]?.id || '');
  const [generating, setGenerating] = useState(false);
  const [previewHandover, setPreviewHandover] = useState<HandoverNotes | null>(null);

  const targetChar = eligibleChars.find((c) => c.id === targetCharId);

  // Generate Handover via /api/summarize-handover
  const handleGenerateHandover = async () => {
    if (!targetChar || !currentChar) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/summarize-handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCharacterName: currentChar.name,
          fromCharacterRole: currentChar.role,
          toCharacterName: targetChar.name,
          toCharacterRole: targetChar.role,
          activityTitle: activity?.name || 'Consulta corporativa',
          transcript,
        }),
      });

      const data = await res.json();
      const rawHandover = data.handover || {};

      const handover: HandoverNotes = {
        fromCharacterId: currentChar.id,
        fromCharacterName: currentChar.name,
        toCharacterId: targetChar.id,
        toCharacterName: targetChar.name,
        activityTitle: activity?.name || 'Consulta corporativa',
        timestamp: Date.now(),
        summary: rawHandover.summary || `Derivación de ${currentChar.name} a ${targetChar.name}.`,
        objective: rawHandover.objective || `Resolver dudas técnicas con ${targetChar.name}.`,
        decisionsAdopted: rawHandover.decisionsAdopted || ['Revisión previa realizada.'],
        proposalsPresented: rawHandover.proposalsPresented || ['Planteamiento de base del equipo.'],
        problemsDetected: rawHandover.problemsDetected || ['Necesidad de validación por especialista.'],
        pendingQuestions: rawHandover.pendingQuestions || ['Consultar requerimientos específicos.'],
        handoverGreeting:
          rawHandover.handoverGreeting ||
          `Hola equipo, me comenta ${currentChar.name} que venís de hablar de ${activity?.name || 'vuestro proyecto'}. ¿En qué os puedo ayudar?`,
      };

      setPreviewHandover(handover);
    } catch (err) {
      console.error('Error generating handover:', err);
      // Fallback
      setPreviewHandover({
        fromCharacterId: currentChar.id,
        fromCharacterName: currentChar.name,
        toCharacterId: targetChar.id,
        toCharacterName: targetChar.name,
        activityTitle: activity?.name || 'Consulta corporativa',
        timestamp: Date.now(),
        summary: `Derivación del departamento de ${currentChar.department} a ${targetChar.department}.`,
        objective: `Tratar aspectos de ${targetChar.role} con ${targetChar.name}.`,
        decisionsAdopted: ['Reunión previa registrada.'],
        proposalsPresented: ['Propuesta del equipo universitario.'],
        problemsDetected: ['Materia fuera del alcance del profesional previo.'],
        pendingQuestions: ['Consultar especificaciones.'],
        handoverGreeting: `Hola equipo, me comunica ${currentChar.name} que habéis estado reunidos. ¿Qué dudas tenéis para mi departamento?`,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmTransfer = () => {
    if (previewHandover && targetCharId) {
      onExecuteReferral(targetCharId, previewHandover);
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            <CornerDownRight className="w-4 h-4 text-amber-400" />
            <span>Protocolo de Derivación Interdepartamental</span>
          </div>
          <h2 className="text-xl font-bold font-['Space_Grotesk']">
            Transferir Reunión a otro Compañero
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Transfiere el contexto y las notas de la reunión actual a otro profesional de AG
            Telecomunicaciones sin perder las decisiones ni las propuestas ya evaluadas.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Target employee select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Seleccionar profesional de destino
            </label>
            <select
              value={targetCharId}
              onChange={(e) => {
                setTargetCharId(e.target.value);
                setPreviewHandover(null); // reset preview on change
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eligibleChars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.role} ({c.department})
                </option>
              ))}
            </select>

            {targetChar && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={targetChar.avatar}
                  alt={targetChar.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800">{targetChar.name}</div>
                  <div className="text-[11px] text-slate-500">{targetChar.role}</div>
                  <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                    Especialista en: {targetChar.specialtyList.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action to generate Handover */}
          {!previewHandover && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
              <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-blue-900 mb-1">
                Generar Acta Ejecutiva de Traspaso (Handover)
              </h4>
              <p className="text-xs text-blue-700/80 mb-3">
                El sistema de coordinación de AG sintetizará lo hablado con {currentChar?.name} para
                que {targetChar?.name} reciba un informe claro con las decisiones, problemas y dudas
                pendientes.
              </p>
              <button
                onClick={handleGenerateHandover}
                disabled={generating}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redactando acta de derivación...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Redactar Acta de Traspaso</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Handover preview */}
          {previewHandover && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Acta de Traspaso Lista</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700">
                  {currentChar?.name} ➔ {targetChar?.name}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Resumen de lo tratado:
                </span>
                <p className="text-xs text-emerald-950 mt-0.5">{previewHandover.summary}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Objetivo para {targetChar?.name}:
                </span>
                <p className="text-xs text-emerald-950 mt-0.5 font-medium">
                  {previewHandover.objective}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Problemas o cuestiones pendientes:
                </span>
                <ul className="text-xs text-emerald-950 list-disc list-inside mt-0.5 space-y-0.5">
                  {previewHandover.pendingQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Saludo inicial de {targetChar?.name}:
                </span>
                <p className="text-xs text-emerald-900 italic mt-0.5 bg-white/70 p-2 rounded-lg border border-emerald-200">
                  «{previewHandover.handoverGreeting}»
                </p>
              </div>
            </div>
          )}
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
            onClick={handleConfirmTransfer}
            disabled={!previewHandover}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Entrar al Despacho de {targetChar?.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
