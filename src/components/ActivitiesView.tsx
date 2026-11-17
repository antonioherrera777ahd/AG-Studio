import React, { useState } from 'react';
import { Activity, Character } from '../types';
import {
  Briefcase,
  Users,
  CheckCircle2,
  HelpCircle,
  FileText,
  ArrowRight,
  Filter,
  Sparkles,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

interface ActivitiesViewProps {
  activities: Activity[];
  characters: Character[];
  onStartActivityMeeting: (activityId: string, charId: string, partnerCharId?: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  characters,
  onStartActivityMeeting,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(activities[0] || null);

  const charMap = new Map(characters.map((c) => [c.id, c]));

  const categories = ['Todas', ...Array.from(new Set(activities.map((a) => a.category)))];

  const filteredActivities = activities.filter((act) => {
    if (selectedCategory !== 'Todas' && act.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          Catálogo Oficial // Proyectos Grupales
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk']">
          Actividades Profesionales y Encargos de AG
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Cada actividad reproduce un encargo corporativo real con entregables concretos, criterios de
          revisión profesional y especialistas asignados. Puedes reunirte individualmente con cada
          profesional para recibir su orientación especializada o convocar una reunión conjunta con el equipo.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0B132B] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two-column layout: Left activity list, Right detailed activity card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Activities list */}
        <div className="lg:col-span-5 space-y-3">
          {filteredActivities.map((act) => {
            const isSelected = selectedActivity?.id === act.id;
            const lead = charMap.get(act.leadProfessionalId);
            const allAssignedIds = [act.leadProfessionalId, ...act.collaboratorIds];

            return (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                    {act.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {act.deliverables.length} entregables
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] mb-1">
                  {act.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {act.description}
                </p>

                {/* Professional avatars */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Equipo:</span>
                    <div className="flex -space-x-1.5">
                      {allAssignedIds.map((cid) => {
                        const c = charMap.get(cid);
                        if (!c) return null;
                        return (
                          <img
                            key={cid}
                            src={c.avatar}
                            alt={c.name}
                            title={`${c.name} (${c.role})`}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                          />
                        );
                      })}
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium ml-1">
                      {allAssignedIds.length} profesionales
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Activity Sheet */}
        <div className="lg:col-span-7">
          {selectedActivity ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Header banner */}
              <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] text-white p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded border border-blue-500/30">
                  {selectedActivity.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-2 font-['Space_Grotesk']">
                  {selectedActivity.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedActivity.description}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Team assignments: Each with their specialized role and meeting button */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Profesionales asignados a este encargo</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Reuniones especializadas por departamento
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* All assigned characters (Lead + Collaborators) */}
                    {[
                      { id: selectedActivity.leadProfessionalId, isLead: true },
                      ...selectedActivity.collaboratorIds.map((cid) => ({ id: cid, isLead: false })),
                    ].map(({ id: cid, isLead }) => {
                      const char = charMap.get(cid);
                      if (!char) return null;
                      const roleData = selectedActivity.professionalRoles?.find(
                        (r) => r.characterId === cid
                      );

                      return (
                        <div
                          key={cid}
                          className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/70 hover:bg-white transition-all shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <img
                                src={char.avatar}
                                alt={char.name}
                                className={`w-12 h-12 rounded-xl object-cover ring-2 ${
                                  isLead ? 'ring-blue-500 shadow-xs' : 'ring-slate-300'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                                    {char.name}
                                  </h5>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isLead
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-slate-200/80 text-slate-700'
                                    }`}
                                  >
                                    {isLead ? 'Responsable Principal' : 'Colaborador'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">{char.role}</div>
                              </div>
                            </div>

                            {/* Direct meeting button for this character on this activity */}
                            <button
                              onClick={() => onStartActivityMeeting(selectedActivity.id, char.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                              title={`Reunirse con ${char.name} para tratar ${selectedActivity.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Reunión con {char.name.split(' ')[0]}</span>
                            </button>
                          </div>

                          {/* Specific role in this activity */}
                          {roleData && (
                            <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="font-bold text-blue-900 block text-[10px] uppercase tracking-wider mb-0.5">
                                  Rol en este encargo:
                                </span>
                                <span className="text-slate-700 leading-snug">
                                  {roleData.roleInActivity}
                                </span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                                <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">
                                  Foco de evaluación:
                                </span>
                                <span className="text-slate-600 leading-snug">
                                  {roleData.evaluationFocus}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Objective */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Objetivo pedagógico del encargo</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {selectedActivity.objective}
                  </p>
                </div>

                {/* Deliverables */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Entregables requeridos</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedActivity.deliverables.map((deliv, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evaluation Criteria */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Criterios profesionales de revisión</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedActivity.evaluationCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-600 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended starter questions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Preguntas recomendadas para abrir la reunión</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedActivity.recommendedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-600 italic bg-purple-50/50 p-2 rounded-lg border border-purple-200/60"
                      >
                        «{q}»
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  {selectedActivity.collaboratorIds.length > 0
                    ? `Encargo colaborativo con ${1 + selectedActivity.collaboratorIds.length} profesionales`
                    : 'Encargo asignado a responsable único'}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Joint meeting button if multiple professionals */}
                  {selectedActivity.collaboratorIds.length > 0 && (
                    <button
                      onClick={() =>
                        onStartActivityMeeting(
                          selectedActivity.id,
                          selectedActivity.leadProfessionalId,
                          selectedActivity.collaboratorIds[0]
                        )
                      }
                      className="px-4 py-2 rounded-xl border border-blue-300 hover:border-blue-400 text-blue-700 bg-white hover:bg-blue-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Reunirse simultáneamente con el responsable principal y colaborador"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Reunión Conjunta (Dúo)</span>
                    </button>
                  )}

                  {/* Main meeting button */}
                  <button
                    onClick={() =>
                      onStartActivityMeeting(
                        selectedActivity.id,
                        selectedActivity.leadProfessionalId
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>
                      Reunirse con {charMap.get(selectedActivity.leadProfessionalId)?.name.split(' ')[0] || 'Responsable'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              Selecciona una actividad para ver sus detalles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
