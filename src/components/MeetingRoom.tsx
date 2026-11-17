import React, { useState, useEffect, useRef } from 'react';
import {
  Character,
  Activity,
  MeetingSession,
  MeetingMessage,
  CorporateBriefing,
  ResourceItem,
  HandoverNotes,
} from '../types';
import {
  buildSingleCharacterPrompt,
  buildDuoCharactersPrompt,
} from '../utils/promptBuilder';
import { exportMeetingAsMarkdown, exportMeetingAsTxt, downloadFile } from '../utils/exportMeeting';
import {
  Send,
  Loader2,
  Users,
  CornerDownRight,
  Download,
  CheckCircle,
  FileText,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Target,
  X,
} from 'lucide-react';

interface MeetingRoomProps {
  session: MeetingSession;
  characters: Character[];
  activities: Activity[];
  briefing: CorporateBriefing;
  resources: ResourceItem[];
  onUpdateSession: (updated: MeetingSession) => void;
  onConcludeSession: (session: MeetingSession) => void;
  onOpenReferral: () => void;
  onOpenDuoPicker: () => void;
  onViewResource: (res: ResourceItem) => void;
  onSwitchActivity?: (activityId?: string) => void;
}

const PHASES = [
  '1. Recepción y presentación',
  '2. Aclaración de objetivos',
  '3. Revisión de propuestas',
  '4. Debate y objeciones',
  '5. Acuerdos y cierre',
];

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  session,
  characters,
  activities,
  briefing,
  resources,
  onUpdateSession,
  onConcludeSession,
  onOpenReferral,
  onOpenDuoPicker,
  onViewResource,
  onSwitchActivity,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showResourcesDrawer, setShowResourcesDrawer] = useState(false);
  const [showHandoverDetails, setShowHandoverDetails] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charMap = new Map(characters.map((c) => [c.id, c]));
  const currentChars = session.characterIds
    .map((id) => charMap.get(id))
    .filter((c): c is Character => !!c);

  const primaryChar = currentChars[0];
  const secondaryChar = currentChars[1];

  const currentActivity = activities.find((a) => a.id === session.activityId);

  // Relevant resources for this meeting
  const linkedResources = resources.filter((r) => {
    if (session.activityId && r.activityIds.includes(session.activityId)) return true;
    if (session.characterIds.includes(r.recommendedById)) return true;
    return false;
  });

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isSending]);

  // Request AI response for a given session snapshot
  const requestAssistantReply = async (targetSession: MeetingSession) => {
    if (isSending) return;
    setErrorMessage(null);
    setIsSending(true);

    try {
      const targetMessages = targetSession.messages;
      if (targetSession.type === 'duo' && primaryChar && secondaryChar) {
        // Duo Meeting
        const systemInstruction = buildDuoCharactersPrompt({
          character1: primaryChar,
          character2: secondaryChar,
          allCharacters: characters,
          activity: currentActivity,
          briefing,
          teamName: targetSession.teamName,
          handoverNotes: targetSession.handoverNotes,
        });

        const historyPayload = targetMessages.map((m) => ({
          role: m.speaker === 'user' ? 'user' : 'assistant',
          content: m.content,
          speakerName: m.characterName || (m.speaker === 'user' ? targetSession.teamName : undefined),
        }));

        const res = await fetch('/api/chat-duo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction,
            messages: historyPayload,
            character1: primaryChar.name,
            character2: secondaryChar.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error del servidor HTTP ${res.status}`);
        }

        const data = await res.json();
        const replyText = data.reply || '';

        const replyMessage: MeetingMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          speaker: 'character',
          characterId: primaryChar.id,
          characterName: `${primaryChar.name} & ${secondaryChar.name}`,
          content: replyText,
          timestamp: Date.now(),
        };

        onUpdateSession({
          ...targetSession,
          messages: [...targetMessages, replyMessage],
          updatedAt: Date.now(),
        });
      } else if (primaryChar) {
        // Single character meeting
        const systemInstruction = buildSingleCharacterPrompt({
          character: primaryChar,
          allCharacters: characters,
          activity: currentActivity,
          briefing,
          teamName: targetSession.teamName,
          handoverNotes: targetSession.handoverNotes,
        });

        const historyPayload = targetMessages.map((m) => ({
          role: m.speaker === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction,
            messages: historyPayload,
            characterName: primaryChar.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error del servidor HTTP ${res.status}`);
        }

        const data = await res.json();
        const replyText = data.reply || '';

        // Check if the response contains a referral hint
        let referralOffer = undefined;
        for (const [topic, refId] of Object.entries(primaryChar.recommendedReferrals)) {
          if (
            replyText.toLowerCase().includes(topic) ||
            replyText.toLowerCase().includes('marcos') ||
            replyText.toLowerCase().includes('daniela') ||
            replyText.toLowerCase().includes('clara') ||
            replyText.toLowerCase().includes('manolo')
          ) {
            const refChar = charMap.get(refId);
            if (refChar) {
              referralOffer = {
                suggestedCharacterId: refId,
                reason: `Recomendado consultar con ${refChar.name} (${refChar.role})`,
              };
              break;
            }
          }
        }

        const replyMessage: MeetingMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          speaker: 'character',
          characterId: primaryChar.id,
          characterName: primaryChar.name,
          avatar: primaryChar.avatar,
          role: primaryChar.role,
          content: replyText,
          timestamp: Date.now(),
          referralOffer,
        };

        onUpdateSession({
          ...targetSession,
          messages: [...targetMessages, replyMessage],
          updatedAt: Date.now(),
        });
      }
    } catch (err: unknown) {
      console.error('Error in chat:', err);
      const msg = err instanceof Error ? err.message : 'Error desconocido al enviar el mensaje';
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  // Send message to Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    setInputText('');

    const userMessage: MeetingMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      speaker: 'user',
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...session.messages, userMessage];

    // Determine current phase progression gently
    const nextPhase = Math.min(5, Math.max(session.phase, Math.floor(newMessages.length / 4) + 1));

    const updatedSession: MeetingSession = {
      ...session,
      phase: nextPhase,
      messages: newMessages,
      updatedAt: Date.now(),
    };
    onUpdateSession(updatedSession);

    await requestAssistantReply(updatedSession);
  };

  // Retry requesting reply for the current session without duplicating user message
  const handleRetryLastMessage = async () => {
    if (isSending) return;
    await requestAssistantReply(session);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Switch or bind activity in ongoing meeting
  const handleSwitchActivity = (newActivityId?: string) => {
    setShowActivityPicker(false);
    if (newActivityId === session.activityId) return;

    if (onSwitchActivity) {
      onSwitchActivity(newActivityId);
      return;
    }

    const newActivity = newActivityId ? activities.find((a) => a.id === newActivityId) : undefined;
    const leadChar = currentChars[0];
    const specificRole = newActivity?.professionalRoles?.find((r) => r.characterId === leadChar?.id);

    let transitionMessage = '';
    if (newActivity && specificRole) {
      transitionMessage = `[${leadChar?.name || 'Dirección'}]: Muy bien, pasamos a enfocar esta reunión en la actividad "${newActivity.name}". Mi papel en este encargo es: ${specificRole.roleInActivity}. Mi criterio prioritario de evaluación será: ${specificRole.evaluationFocus}. ¿Qué propuesta habéis preparado o qué puntos queréis revisar conmigo?`;
    } else if (newActivity) {
      transitionMessage = `[${leadChar?.name || 'Dirección'}]: Entendido. Ajustamos la sesión al encargo "${newActivity.name}". Adelante con vuestras dudas o entregables.`;
    } else {
      transitionMessage = `[${leadChar?.name || 'Dirección'}]: Pasamos la reunión a modo de consulta general abierta. ¿Qué otro aspecto de vuestro proyecto queréis que tratemos?`;
    }

    const updatedSession: MeetingSession = {
      ...session,
      activityId: newActivity?.id,
      title: `Reunión con ${currentChars.map((c) => c.name).join(' y ')}${newActivity ? ` — ${newActivity.name}` : ''}`,
      messages: [
        ...session.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          speaker: 'character',
          characterId: leadChar?.id || 'ag',
          characterName: leadChar?.name || 'AG Telecomunicaciones',
          content: transitionMessage,
          timestamp: Date.now(),
        },
      ],
      updatedAt: Date.now(),
    };
    onUpdateSession(updatedSession);
  };

  // Export handlers
  const handleExportMarkdown = () => {
    const md = exportMeetingAsMarkdown(session, characters, currentActivity);
    downloadFile(md, `acta-reunion-${session.id}.md`, 'text/markdown;charset=utf-8');
    setShowExportMenu(false);
  };

  const handleExportTxt = () => {
    const txt = exportMeetingAsTxt(session, characters, currentActivity);
    downloadFile(txt, `acta-reunion-${session.id}.txt`, 'text/plain;charset=utf-8');
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
        {/* Top Header of the Meeting Room */}
        <div className="bg-gradient-to-r from-[#0B132B] via-[#152238] to-[#0F1E36] text-white p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Participants Identity */}
            <div className="flex items-center gap-3.5">
              {/* Avatars */}
              <div className="flex -space-x-3 overflow-hidden">
                {currentChars.map((c) => (
                  <img
                    key={c.id}
                    src={c.avatar}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500 shadow-md"
                  />
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                    {currentChars.map((c) => c.name).join(' & ')}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {session.type === 'duo' ? 'Reunión Conjunta' : primaryChar?.department}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {currentChars.map((c) => `${c.role}`).join(' • ')}
                </p>
                {currentActivity && (
                  <div className="text-[11px] text-amber-300 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold">Encargo:</span>
                    <span className="truncate">{currentActivity.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Meeting Action Buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
              {session.type === 'single' && (
                <button
                  onClick={onOpenDuoPicker}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Incorporar a un segundo profesional a esta reunión"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Invitar profesional</span>
                </button>
              )}

              <button
                onClick={onOpenReferral}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Derivar esta reunión a otro compañero con acta de traspaso"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Derivar a compañero</span>
              </button>

              <button
                onClick={() => setShowResourcesDrawer(!showResourcesDrawer)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  showResourcesDrawer
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Ver recursos y manuales recomendados para esta sesión"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Recursos ({linkedResources.length})</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-slate-800 animate-in fade-in">
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Descargar Markdown (.md)</span>
                    </button>
                    <button
                      onClick={handleExportTxt}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span>Descargar Texto (.txt)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Finish Meeting Button */}
              <button
                onClick={() => onConcludeSession(session)}
                className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Dar por concluida la reunión y registrar acuerdos"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar acta</span>
              </button>
            </div>
          </div>

          {/* Phase progression track */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
            {PHASES.map((phaseLabel, idx) => {
              const phaseNum = idx + 1;
              const isPassed = session.phase > phaseNum;
              const isCurrent = session.phase === phaseNum;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-white text-blue-900'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {phaseNum}
                  </span>
                  <span>{phaseLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Focus Banner */}
        <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          {currentActivity ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="p-1 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </span>
              <div className="truncate">
                <span className="text-slate-400 font-normal">Encargo actual:</span>{' '}
                <strong className="text-white">{currentActivity.name}</strong>{' '}
                <span className="text-[10px] text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded ml-1 border border-blue-400/20">
                  {currentActivity.category}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 flex-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Consulta general abierta (sin actividad del catálogo vinculada).</span>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {currentActivity && (
              <button
                onClick={() => setShowActivityDetails(!showActivityDetails)}
                className="text-[11px] font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{showActivityDetails ? 'Ocultar criterios' : 'Ver roles y criterios'}</span>
                {showActivityDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            <button
              onClick={() => setShowActivityPicker(true)}
              className="text-[11px] font-semibold text-blue-300 hover:text-white px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Vincular o cambiar la actividad asignada a esta reunión"
            >
              <Target className="w-3 h-3" />
              <span>{currentActivity ? 'Cambiar encargo' : 'Vincular encargo'}</span>
            </button>
          </div>
        </div>

        {/* Expanded Activity Details */}
        {currentActivity && showActivityDetails && (
          <div className="bg-slate-950/90 text-slate-200 border-b border-slate-800 p-4 text-xs space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Professional Roles in this meeting */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Roles de los profesionales en esta actividad:
                </span>
                {currentChars.map((c) => {
                  const roleData = currentActivity.professionalRoles?.find(
                    (r) => r.characterId === c.id
                  );
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                    >
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({c.role})</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Rol asignado:</strong>{' '}
                        {roleData?.roleInActivity || 'Supervisión y asesoría general'}
                      </div>
                      <div className="text-[11px] text-amber-300">
                        <strong className="text-amber-400/80">Criterio de evaluación:</strong>{' '}
                        {roleData?.evaluationFocus || 'Coherencia corporativa y viabilidad'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deliverables Checklist */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Entregables esperados ({currentActivity.deliverables.length}):
                </span>
                <ul className="space-y-1 text-[11px]">
                  {currentActivity.deliverables.map((deliv, i) => (
                    <li
                      key={i}
                      className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 flex items-start gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Handover Notice Banner if transferred */}
        {session.handoverNotes && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold">Traspaso de {session.handoverNotes.fromCharacterName}:</span>{' '}
                <span>{session.handoverNotes.summary}</span>
              </div>
            </div>
            <button
              onClick={() => setShowHandoverDetails(!showHandoverDetails)}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
            >
              <span>{showHandoverDetails ? 'Ocultar notas' : 'Ver notas'}</span>
              {showHandoverDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Expanded Handover Notes */}
        {session.handoverNotes && showHandoverDetails && (
          <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-3 text-xs text-amber-950 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in">
            <div>
              <div className="font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">
                Decisiones Previas:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {session.handoverNotes.decisionsAdopted.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">
                Problemas Detectados:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {session.handoverNotes.problemsDetected.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">
                Dudas para {primaryChar?.name}:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {session.handoverNotes.pendingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Meeting Area Container (Split into Chat + Optional Resources Sidebar) */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Chat Stream */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
            {/* Conversation start notice */}
            <div className="text-center my-2">
              <span className="text-[11px] font-mono text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                Reunión iniciada • AG Telecomunicaciones • Sesión #{session.id.slice(-6)}
              </span>
            </div>

            {/* Messages */}
            {session.messages.map((msg) => {
              const isUser = msg.speaker === 'user';
              const speakerChar = msg.characterId ? charMap.get(msg.characterId) : primaryChar;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      EQ
                    </div>
                  ) : (
                    <img
                      src={speakerChar?.avatar || primaryChar?.avatar}
                      alt={msg.characterName || 'AG'}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 shrink-0 shadow-xs"
                    />
                  )}

                  {/* Speech Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {/* Header with speaker label */}
                    <div
                      className={`flex items-center justify-between gap-2 mb-1.5 pb-1 border-b ${
                        isUser
                          ? 'border-blue-500/50 text-blue-100'
                          : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-bold text-xs">
                        {isUser ? session.teamName : msg.characterName || primaryChar?.name}
                      </span>
                      <span className="text-[10px] opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Content body with line breaks support */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Referral chip if the character recommended a coworker */}
                    {msg.referralOffer && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-amber-700 font-medium">
                          💡 {msg.referralOffer.reason}
                        </span>
                        <button
                          onClick={onOpenReferral}
                          className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Derivar ahora</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Thinking Indicator */}
            {isSending && (
              <div className="flex items-center gap-3 max-w-lg mr-auto animate-in fade-in">
                <img
                  src={primaryChar?.avatar}
                  alt={primaryChar?.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs text-slate-500 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>
                    {session.type === 'duo'
                      ? `${primaryChar?.name} y ${secondaryChar?.name} deliberan...`
                      : `${primaryChar?.name} está analizando vuestra propuesta...`}
                  </span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleRetryLastMessage}
                  disabled={isSending}
                  className="px-2.5 py-1 rounded bg-rose-200 hover:bg-rose-300 disabled:opacity-50 text-rose-900 font-bold text-[11px] cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Slide-out Linked Resources Drawer */}
          {showResourcesDrawer && (
            <div className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto shrink-0 shadow-lg animate-in slide-in-from-right duration-150">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Recursos de Reunión</span>
                </span>
                <button
                  onClick={() => setShowResourcesDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {linkedResources.length === 0 ? (
                  <p className="text-xs text-slate-400">No hay documentos vinculados a esta sesión.</p>
                ) : (
                  linkedResources.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => onViewResource(res)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer text-left"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {res.format}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {res.description}
                      </p>
                      <div className="mt-2 text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <span>Consultar documento</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activity Quick Question Chips */}
        {currentActivity?.recommendedQuestions && currentActivity.recommendedQuestions.length > 0 && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Sugerencia de planteamiento:
            </span>
            {currentActivity.recommendedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                «{q.length > 55 ? q.slice(0, 52) + '...' : q}»
              </button>
            ))}
          </div>
        )}

        {/* Input Textarea & Send Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              rows={2}
              placeholder={`Habla con ${currentChars.map((c) => c.name.split(' ')[0]).join(' y ')}... Presenta tus propuestas, pide aclaraciones o defiende tus decisiones.`}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs shrink-0"
              title="Enviar mensaje (Enter)"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>
              Presiona <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Enter</kbd> para enviar,{' '}
              <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> para nueva línea.
            </span>
            <span>
              Interviniendo como: <strong className="text-slate-600">{session.teamName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* In-Meeting Activity Switcher Dialog */}
      {showActivityPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-['Space_Grotesk'] text-slate-900">
                  Vincular o cambiar encargo en la reunión
                </h3>
              </div>
              <button
                onClick={() => setShowActivityPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Selecciona el encargo del catálogo corporativo para que{' '}
              <strong>{currentChars.map((c) => c.name).join(' y ')}</strong> enfoquen sus preguntas,
              criterios y objeciones en los entregables específicos de dicha actividad.
            </p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {/* General Option */}
              <div
                onClick={() => handleSwitchActivity(undefined)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  !session.activityId
                    ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Consulta general / Sin actividad específica</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Conversación abierta sobre el proyecto sin evaluar entregables concretos
                </div>
              </div>

              {activities.map((act) => {
                const isCurrent = act.id === session.activityId;
                const roleData = act.professionalRoles?.find((r) =>
                  session.characterIds.includes(r.characterId)
                );
                const isAssigned =
                  session.characterIds.includes(act.leadProfessionalId) ||
                  session.characterIds.some((id) => act.collaboratorIds.includes(id));

                return (
                  <div
                    key={act.id}
                    onClick={() => handleSwitchActivity(act.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900 shadow-2xs ring-1 ring-blue-400'
                        : isAssigned
                        ? 'border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{act.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAssigned && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            Asignado a este personaje
                          </span>
                        )}
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {act.category}
                        </span>
                      </div>
                    </div>
                    {roleData && (
                      <div className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
                        <strong className="text-slate-700">Rol:</strong> {roleData.roleInActivity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setShowActivityPicker(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
