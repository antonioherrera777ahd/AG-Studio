import React, { useState, useEffect } from 'react';
import {
  Character,
  Activity,
  ResourceItem,
  CorporateBriefing,
  MeetingSession,
  HandoverNotes,
} from './types';
import {
  loadCharacters,
  saveCharacters,
  loadActivities,
  saveActivities,
  loadResources,
  saveResources,
  loadBriefing,
  saveBriefing,
  loadTeamName,
  saveTeamName,
  loadActiveMeeting,
  saveActiveMeeting,
  saveMeetingToHistory,
  exportFullConfiguration,
  importFullConfiguration,
  resetToFactoryDefaults,
} from './utils/storage';
import { Header } from './components/Header';
import { DirectoryView } from './components/DirectoryView';
import { ActivitiesView } from './components/ActivitiesView';
import { MeetingRoom } from './components/MeetingRoom';
import { ResourcesView } from './components/ResourcesView';
import { AdminPanel } from './components/AdminPanel';
import { CharacterModal } from './components/CharacterModal';
import { DuoMeetingModal } from './components/DuoMeetingModal';
import { ReferralModal } from './components/ReferralModal';
import { ResourceViewerModal } from './components/ResourceViewerModal';
import { CorporateBriefingModal } from './components/CorporateBriefingModal';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { ActivityMeetingPickerModal } from './components/ActivityMeetingPickerModal';
import { downloadFile, exportMeetingAsMarkdown } from './utils/exportMeeting';
import {
  MessageSquare,
  Users,
  Briefcase,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Download,
  Building2,
} from 'lucide-react';

export default function App() {
  // Global Data State with local storage persistence
  const [characters, setCharacters] = useState<Character[]>(loadCharacters);
  const [activities, setActivities] = useState<Activity[]>(loadActivities);
  const [resources, setResources] = useState<ResourceItem[]>(loadResources);
  const [briefing, setBriefing] = useState<CorporateBriefing>(loadBriefing);
  const [teamName, setTeamName] = useState<string>(loadTeamName);

  // Active view state
  const [activeView, setActiveView] = useState<
    'directory' | 'activities' | 'meeting' | 'resources' | 'admin'
  >('directory');

  // Active meeting state
  const [activeMeeting, setActiveMeeting] = useState<MeetingSession | null>(loadActiveMeeting);

  // Modal states
  const [inspectedCharacter, setInspectedCharacter] = useState<Character | null>(null);
  const [duoModalOpen, setDuoModalOpen] = useState(false);
  const [duoInitialCharId, setDuoInitialCharId] = useState<string | undefined>(undefined);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [inspectedResource, setInspectedResource] = useState<ResourceItem | null>(null);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [activityPickerChar, setActivityPickerChar] = useState<Character | null>(null);
  const [concludedMeeting, setConcludedMeeting] = useState<MeetingSession | null>(null);

  // Backend connection status
  const [apiConnected, setApiConnected] = useState(true);

  // Check backend status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') setApiConnected(true);
      })
      .catch((err) => {
        console.warn('Backend status check warning:', err);
      });
  }, []);

  // Update handlers
  const handleUpdateCharacters = (chars: Character[]) => {
    setCharacters(chars);
    saveCharacters(chars);
  };

  const handleUpdateActivities = (acts: Activity[]) => {
    setActivities(acts);
    saveActivities(acts);
  };

  const handleUpdateResources = (res: ResourceItem[]) => {
    setResources(res);
    saveResources(res);
  };

  const handleUpdateBriefing = (b: CorporateBriefing) => {
    setBriefing(b);
    saveBriefing(b);
  };

  const handleUpdateTeamName = (name: string) => {
    setTeamName(name);
    saveTeamName(name);
    if (activeMeeting) {
      const updated = { ...activeMeeting, teamName: name };
      setActiveMeeting(updated);
      saveActiveMeeting(updated);
    }
  };

  const handleUpdateSession = (session: MeetingSession) => {
    setActiveMeeting(session);
    saveActiveMeeting(session);
  };

  // Directly start a single character meeting with custom activity greeting if bound
  const startSingleMeetingDirect = (
    charId: string,
    activityId?: string,
    handover?: HandoverNotes
  ) => {
    const char = characters.find((c) => c.id === charId);
    if (!char) return;

    const activity = activityId ? activities.find((a) => a.id === activityId) : undefined;
    const specificRole = activity?.professionalRoles?.find((r) => r.characterId === char.id);

    // Activity-specific greeting or handover greeting
    let initialGreeting = `Hola, equipo ${teamName}. Soy ${char.name}, ${char.role}. `;
    if (handover?.handoverGreeting) {
      initialGreeting = handover.handoverGreeting;
    } else if (specificRole?.specificGreeting) {
      initialGreeting = specificRole.specificGreeting;
    } else if (activity) {
      initialGreeting += `Tengo aquí la ficha de la actividad "${activity.name}". ¿Qué planteamiento o dudas tenéis para empezar a trabajar?`;
    } else {
      initialGreeting += `Tengo unos minutos libres en mi agenda. ¿Qué asunto de vuestro proyecto queréis que revisemos?`;
    }

    const newSession: MeetingSession = {
      id: `ses-${Date.now()}`,
      title: `Reunión con ${char.name}${activity ? ` — ${activity.name}` : ''}`,
      type: 'single',
      characterIds: [char.id],
      activityId: activity?.id,
      teamName,
      phase: handover ? 3 : 1,
      handoverNotes: handover,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      messages: [
        {
          id: `msg-${Date.now()}`,
          speaker: 'character',
          characterId: char.id,
          characterName: char.name,
          avatar: char.avatar,
          role: char.role,
          content: initialGreeting,
          timestamp: Date.now(),
        },
      ],
    };

    setActiveMeeting(newSession);
    saveActiveMeeting(newSession);
    setInspectedCharacter(null);
    setActivityPickerChar(null);
    setActiveView('meeting');
  };

  // Launch single character meeting: if activityId is omitted, prompt user with activity picker
  const handleStartSingleMeeting = (
    charId: string,
    activityId?: string,
    handover?: HandoverNotes
  ) => {
    if (activityId || handover) {
      startSingleMeetingDirect(charId, activityId, handover);
      return;
    }

    const char = characters.find((c) => c.id === charId);
    if (!char) return;

    // Check if character has assigned activities
    const hasActivities = activities.some(
      (a) => a.leadProfessionalId === char.id || a.collaboratorIds.includes(char.id)
    );

    if (hasActivities) {
      setActivityPickerChar(char);
    } else {
      startSingleMeetingDirect(charId);
    }
  };

  // Launch duo meeting with activity context
  const handleStartDuoMeeting = (char1Id: string, char2Id: string, activityId?: string) => {
    const char1 = characters.find((c) => c.id === char1Id);
    const char2 = characters.find((c) => c.id === char2Id);
    if (!char1 || !char2) return;

    const activity = activityId ? activities.find((a) => a.id === activityId) : undefined;
    const role1 = activity?.professionalRoles?.find((r) => r.characterId === char1.id);
    const role2 = activity?.professionalRoles?.find((r) => r.characterId === char2.id);

    let duoGreeting = '';
    if (activity && role1 && role2) {
      const focus1 = role1.evaluationFocus ? role1.evaluationFocus.toLowerCase() : 'vuestra propuesta';
      const focus2 = role2.evaluationFocus ? role2.evaluationFocus.toLowerCase() : 'los criterios técnicos';
      duoGreeting = `[${char1.name}]: Bienvenidos a la sala, equipo ${teamName}. Nos incorporamos ${char2.name} y yo para evaluar conjuntamente vuestro trabajo en "${activity.name}". Desde mi área evaluaré ${focus1}.\n\n[${char2.name}]: Y por mi parte, como ${char2.role.toLowerCase()}, revisaré ${focus2}. ¿Qué propuesta habéis preparado o qué dudas queréis plantearnos?`;
    } else if (activity) {
      duoGreeting = `[${char1.name}]: Bienvenidos a la sala, equipo ${teamName}. Nos incorporamos ${char2.name} y yo para revisar vuestro encargo sobre "${activity.name}".\n\n[${char2.name}]: Exacto. Vamos a ir al grano desde nuestras respectivas áreas. ¿Qué propuesta habéis preparado para nosotros?`;
    } else {
      duoGreeting = `[${char1.name}]: Bienvenidos a la sala, equipo ${teamName}. Nos incorporamos ${char2.name} y yo para atender vuestra consulta.\n\n[${char2.name}]: Exacto. Contadnos qué dudas o planteamientos queréis que analicemos entre ambos.`;
    }

    const newSession: MeetingSession = {
      id: `ses-duo-${Date.now()}`,
      title: `Reunión Conjunta: ${char1.name} y ${char2.name}${activity ? ` — ${activity.name}` : ''}`,
      type: 'duo',
      characterIds: [char1.id, char2.id],
      activityId: activity?.id,
      teamName,
      phase: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      messages: [
        {
          id: `msg-${Date.now()}`,
          speaker: 'character',
          characterId: char1.id,
          characterName: `${char1.name} & ${char2.name}`,
          content: duoGreeting,
          timestamp: Date.now(),
        },
      ],
    };

    setActiveMeeting(newSession);
    saveActiveMeeting(newSession);
    setDuoModalOpen(false);
    setInspectedCharacter(null);
    setActivityPickerChar(null);
    setActiveView('meeting');
  };

  // Activity start launcher: supports individual meeting with any assigned character or duo meeting
  const handleStartActivityMeeting = (
    activityId: string,
    charId: string,
    partnerCharId?: string
  ) => {
    if (partnerCharId) {
      handleStartDuoMeeting(charId, partnerCharId, activityId);
    } else {
      startSingleMeetingDirect(charId, activityId);
    }
  };

  // Execute coworker referral
  const handleExecuteReferral = (targetCharId: string, handover: HandoverNotes) => {
    // 1. Save current meeting to history
    if (activeMeeting) {
      saveMeetingToHistory({ ...activeMeeting, status: 'concluded' });
    }

    // 2. Start new meeting with target character and handover notes preloaded!
    handleStartSingleMeeting(targetCharId, activeMeeting?.activityId, handover);
    setReferralModalOpen(false);
  };

  // Conclude meeting
  const handleConcludeMeeting = (session: MeetingSession) => {
    const concluded: MeetingSession = {
      ...session,
      status: 'concluded',
      updatedAt: Date.now(),
    };
    saveMeetingToHistory(concluded);
    saveActiveMeeting(null);
    setActiveMeeting(null);
    setConcludedMeeting(concluded);
  };

  // Factory reset
  const handleResetDefaults = () => {
    resetToFactoryDefaults();
    setCharacters(loadCharacters());
    setActivities(loadActivities());
    setResources(loadResources());
    setBriefing(loadBriefing());
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        teamName={teamName}
        onUpdateTeamName={handleUpdateTeamName}
        hasActiveMeeting={!!activeMeeting}
        onOpenBriefing={() => setBriefingModalOpen(true)}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        apiConnected={apiConnected}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {/* DIRECTORY VIEW */}
        {activeView === 'directory' && (
          <DirectoryView
            characters={characters}
            activities={activities}
            onSelectCharacter={(char) => setInspectedCharacter(char)}
            onStartMeeting={(charId, activityId) => handleStartSingleMeeting(charId, activityId)}
            onStartDuoMeeting={(charId) => {
              setDuoInitialCharId(charId);
              setDuoModalOpen(true);
            }}
          />
        )}

        {/* ACTIVITIES VIEW */}
        {activeView === 'activities' && (
          <ActivitiesView
            activities={activities}
            characters={characters}
            onStartActivityMeeting={handleStartActivityMeeting}
          />
        )}

        {/* MEETING ROOM VIEW */}
        {activeView === 'meeting' && (
          <>
            {activeMeeting ? (
              <MeetingRoom
                session={activeMeeting}
                characters={characters}
                activities={activities}
                briefing={briefing}
                resources={resources}
                onUpdateSession={handleUpdateSession}
                onConcludeSession={handleConcludeMeeting}
                onOpenReferral={() => setReferralModalOpen(true)}
                onOpenDuoPicker={() => {
                  setDuoInitialCharId(activeMeeting.characterIds[0]);
                  setDuoModalOpen(true);
                }}
                onViewResource={(res) => setInspectedResource(res)}
              />
            ) : (
              /* Empty meeting room waiting room */
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Sala de Juntas // Sin Reunión Activa
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-['Space_Grotesk']">
                  No hay ninguna reunión en curso en este momento
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                  Para comenzar una sesión de trabajo, elige a un directivo desde el directorio de
                  empleados o selecciona una de las 18 actividades asignadas a vuestro equipo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mt-8 text-left">
                  <div
                    onClick={() => setActiveView('directory')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <Users className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Elegir Profesional
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Reunirse con Alberto (CEO), David (Creativo), Marcos (Dev), Manolo (Print)...
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveView('activities')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <Briefcase className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
                      Ver Encargos y Actividades
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Naming, Paletas TV, Prototipado Web, Campaña, Spot, Código Ético...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* RESOURCES VIEW */}
        {activeView === 'resources' && (
          <ResourcesView
            resources={resources}
            characters={characters}
            activities={activities}
            onViewResource={(res) => setInspectedResource(res)}
          />
        )}

        {/* ADMIN PANEL VIEW */}
        {activeView === 'admin' && (
          <AdminPanel
            characters={characters}
            activities={activities}
            resources={resources}
            briefing={briefing}
            onUpdateCharacters={handleUpdateCharacters}
            onUpdateActivities={handleUpdateActivities}
            onUpdateResources={handleUpdateResources}
            onUpdateBriefing={handleUpdateBriefing}
            onExportConfig={() => {
              const json = exportFullConfiguration();
              downloadFile(json, 'ag-studio-config.json', 'application/json');
            }}
            onImportConfig={(jsonStr) => {
              const ok = importFullConfiguration(jsonStr);
              if (ok) {
                setCharacters(loadCharacters());
                setActivities(loadActivities());
                setResources(loadResources());
                setBriefing(loadBriefing());
              }
              return ok;
            }}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              AG
            </div>
            <span>
              <strong>AG STUDIO</strong> — Entorno corporativo de simulación profesional con IA. AG
              Telecomunicaciones.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setBriefingModalOpen(true)}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Canon Corporativo
            </button>
            <span>•</span>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-amber-600 transition-colors cursor-pointer"
            >
              Simulación & Deontología
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {inspectedCharacter && (
        <CharacterModal
          character={inspectedCharacter}
          onClose={() => setInspectedCharacter(null)}
          onStartSingleMeeting={(charId, activityId) => handleStartSingleMeeting(charId, activityId)}
          onOpenDuoPicker={(charId) => {
            setDuoInitialCharId(charId);
            setDuoModalOpen(true);
          }}
          allCharacters={characters}
          activities={activities}
        />
      )}

      {activityPickerChar && (
        <ActivityMeetingPickerModal
          character={activityPickerChar}
          activities={activities}
          onClose={() => setActivityPickerChar(null)}
          onSelectActivity={(activityId) => {
            startSingleMeetingDirect(activityPickerChar.id, activityId);
          }}
        />
      )}

      {duoModalOpen && (
        <DuoMeetingModal
          initialCharId={duoInitialCharId}
          characters={characters}
          activities={activities}
          onClose={() => setDuoModalOpen(false)}
          onConfirmDuo={handleStartDuoMeeting}
        />
      )}

      {referralModalOpen && activeMeeting && (
        <ReferralModal
          currentCharacters={activeMeeting.characterIds
            .map((id) => characters.find((c) => c.id === id))
            .filter((c): c is Character => !!c)}
          allCharacters={characters}
          activity={activities.find((a) => a.id === activeMeeting.activityId)}
          transcript={activeMeeting.messages
            .map((m) => `${m.speaker === 'user' ? teamName : m.characterName || 'AG'}: ${m.content}`)
            .join('\n\n')}
          onClose={() => setReferralModalOpen(false)}
          onExecuteReferral={handleExecuteReferral}
        />
      )}

      {inspectedResource && (
        <ResourceViewerModal
          resource={inspectedResource}
          characters={characters}
          onClose={() => setInspectedResource(null)}
        />
      )}

      {briefingModalOpen && (
        <CorporateBriefingModal
          briefing={briefing}
          onClose={() => setBriefingModalOpen(false)}
        />
      )}

      {privacyModalOpen && (
        <PrivacyNoticeModal onClose={() => setPrivacyModalOpen(false)} />
      )}

      {/* Meeting Concluded Wrap-Up Certificate Modal */}
      {concludedMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              Reunión Concluida y Registrada
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              La sesión con{' '}
              <strong>
                {concludedMeeting.characterIds
                  .map((id) => characters.find((c) => c.id === id)?.name)
                  .join(' y ')}
              </strong>{' '}
              ha sido archivada con éxito. Se han registrado {concludedMeeting.messages.length}{' '}
              intervenciones para el equipo <strong>{concludedMeeting.teamName}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left">
              <div className="font-bold text-slate-700 mb-1">Acta disponible para descarga:</div>
              <p className="text-[11px] text-slate-500">
                Podéis descargar la transcripción completa en formato Markdown para adjuntarla a la
                memoria de vuestro proyecto universitario.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  const md = exportMeetingAsMarkdown(
                    concludedMeeting,
                    characters,
                    activities.find((a) => a.id === concludedMeeting.activityId)
                  );
                  downloadFile(md, `acta-final-${concludedMeeting.id}.md`, 'text/markdown;charset=utf-8');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Acta (.md)</span>
              </button>

              <button
                onClick={() => setConcludedMeeting(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
