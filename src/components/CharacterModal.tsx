import React from 'react';
import { Character, Activity } from '../types';
import {
  X,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  CornerDownRight,
  Sparkles,
  Building,
} from 'lucide-react';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onStartSingleMeeting: (charId: string, activityId?: string) => void;
  onOpenDuoPicker: (charId: string) => void;
  allCharacters: Character[];
  activities: Activity[];
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onStartSingleMeeting,
  onOpenDuoPicker,
  allCharacters,
  activities,
}) => {
  if (!character) return null;

  const charMap = new Map(allCharacters.map((c) => [c.id, c]));

  // Related activities where this character is lead or collaborator
  const relatedActivities = activities.filter(
    (a) => a.leadProfessionalId === character.id || a.collaboratorIds.includes(character.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with corporate photo banner */}
        <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0F1E36] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg"
            />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {character.department}
                </span>
                {character.variantTag && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Especialidad: {character.variantTag}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                {character.name}
              </h2>
              <p className="text-sm font-medium text-slate-300">{character.role}</p>
              <div className="mt-2 text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {character.age && <span>{character.age} años</span>}
                {character.nationality && <span>• Nacionalidad: {character.nationality}</span>}
                <span>• AG Telecomunicaciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Bio & Personality */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Perfil y Trayectoria Laboral
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{character.bio}</p>
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Carácter y tono profesional en reuniones:</span>
              </div>
              <p className="text-xs text-slate-600 italic">"{character.personality}"</p>
              {character.catchphrase && (
                <p className="text-xs text-blue-900 font-medium mt-2">
                  Lema: {character.catchphrase}
                </p>
              )}
            </div>
          </div>

          {/* Specialties vs Non-specialties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Especialidades profesionales</span>
              </div>
              <ul className="space-y-1.5">
                {character.specialtyList.map((spec, i) => (
                  <li key={i} className="text-xs text-emerald-950 flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Límites y derivaciones</span>
              </div>
              <ul className="space-y-1.5">
                {character.nonSpecialties.map((non, i) => (
                  <li key={i} className="text-xs text-rose-950 flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{non}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quirks & Habits */}
          {character.quirks && character.quirks.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Manías y particularidades en las reuniones
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {character.quirks.map((q, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related activities with specific roles and meeting launchers */}
          {relatedActivities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Actividades vinculadas a {character.name.split(' ')[0]} ({relatedActivities.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Reunión temática según encargo</span>
              </div>

              <div className="space-y-2.5">
                {relatedActivities.map((act) => {
                  const roleData = act.professionalRoles?.find((r) => r.characterId === character.id);
                  const isLead = act.leadProfessionalId === character.id;

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{act.name}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isLead
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isLead ? 'Responsable' : 'Colaborador'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{act.category}</div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onStartSingleMeeting(character.id, act.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                          title={`Reunirse con ${character.name.split(' ')[0]} para tratar ${act.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Reunirse en esta actividad</span>
                        </button>
                      </div>

                      {roleData && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                          <div>
                            <span className="font-semibold text-slate-700">Rol: </span>
                            <span className="text-slate-600">{roleData.roleInActivity}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Foco de evaluación: </span>
                            <span className="text-slate-500">{roleData.evaluationFocus}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => onOpenDuoPicker(character.id)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white shadow-xs"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Reunión Conjunta (Dúo)</span>
          </button>
          <button
            onClick={() => onStartSingleMeeting(character.id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Iniciar Reunión con {character.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
