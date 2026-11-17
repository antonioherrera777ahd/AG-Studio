import React, { useState } from 'react';
import { Character, Activity } from '../types';
import {
  X,
  Briefcase,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ActivityMeetingPickerModalProps {
  character: Character;
  activities: Activity[];
  onClose: () => void;
  onSelectActivity: (activityId?: string) => void;
}

export const ActivityMeetingPickerModal: React.FC<ActivityMeetingPickerModalProps> = ({
  character,
  activities,
  onClose,
  onSelectActivity,
}) => {
  const [showOtherActivities, setShowOtherActivities] = useState(false);

  // Activities where this character is lead or collaborator
  const assignedActivities = activities.filter(
    (a) => a.leadProfessionalId === character.id || a.collaboratorIds.includes(character.id)
  );

  // Other activities
  const otherActivities = activities.filter(
    (a) => a.leadProfessionalId !== character.id && !a.collaboratorIds.includes(character.id)
  );

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

          <div className="flex items-center gap-4">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500 shadow-md"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-400/30">
                Preparar Reunión Profesional
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] mt-1 text-white">
                Reunión con {character.name}
              </h2>
              <p className="text-xs text-slate-300">
                {character.role} • {character.department}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Selecciona la actividad o encargo para esta reunión</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Al vincular una actividad, {character.name.split(' ')[0]} enfocará la conversación
              estrictamente en su rol y en los entregables de dicho proyecto.
            </p>
          </div>

          {/* Assigned Activities to this Character */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block">
              Actividades donde {character.name.split(' ')[0]} participa directamente ({assignedActivities.length})
            </div>

            {assignedActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tiene actividades asignadas formalmente en el catálogo.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {assignedActivities.map((act) => {
                  const roleData = act.professionalRoles?.find((r) => r.characterId === character.id);
                  const isLead = act.leadProfessionalId === character.id;

                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act.id)}
                      className="group p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer text-left shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {act.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLead
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isLead ? '★ Responsable Principal' : 'Colaborador'}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {act.name}
                      </h4>

                      {roleData && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white border border-blue-100 text-xs text-slate-700">
                          <span className="font-bold text-blue-900 block text-[11px] mb-0.5">
                            Rol de {character.name.split(' ')[0]} en esta actividad:
                          </span>
                          <span className="leading-snug">{roleData.roleInActivity}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-blue-600 font-semibold pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          {act.deliverables.length} entregables requeridos
                        </span>
                        <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Comenzar reunión de este encargo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* General meeting without specific activity */}
          <div className="pt-2 border-t border-slate-200">
            <div
              onClick={() => onSelectActivity(undefined)}
              className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Consulta general / Reunión abierta
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tratar dudas generales sin vincular la reunión a una actividad específica del catálogo
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Other activities (expandable) */}
          {otherActivities.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowOtherActivities(!showOtherActivities)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-between w-full py-1 cursor-pointer"
              >
                <span>Ver otras actividades del catálogo corporativo ({otherActivities.length})</span>
                {showOtherActivities ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showOtherActivities && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 animate-in fade-in">
                  {otherActivities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act.id)}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-colors cursor-pointer text-left text-xs"
                    >
                      <div className="font-bold text-slate-800 truncate">{act.name}</div>
                      <div className="text-[10px] text-slate-500">{act.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
