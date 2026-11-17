import { MeetingSession, Character, Activity } from '../types';

export function exportMeetingAsMarkdown(
  meeting: MeetingSession,
  characters: Character[],
  activity?: Activity
): string {
  const charMap = new Map(characters.map((c) => [c.id, c]));
  const participants = meeting.characterIds
    .map((id) => {
      const c = charMap.get(id);
      return c ? `${c.name} (${c.role}, ${c.department})` : id;
    })
    .join(', ');

  const dateStr = new Date(meeting.createdAt).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  let md = `# ACTA DE REUNIÓN — AG TELECOMUNICACIONES (AG STUDIO)
**Identificador:** ${meeting.id}  
**Fecha y hora:** ${dateStr}  
**Equipo de trabajo:** ${meeting.teamName}  
**Modalidad:** ${meeting.type === 'duo' ? 'Reunión Conjunta (Dúo)' : 'Reunión Individual'}  
**Participantes de AG:** ${participants}  
${activity ? `**Actividad:** ${activity.name} (${activity.category})\n**Objetivo:** ${activity.objective}\n` : ''}

---

## 1. RESUMEN EJECUTIVO Y ACUERDOS
${
  meeting.handoverNotes
    ? `> **Traspaso previo de ${meeting.handoverNotes.fromCharacterName}:**  
> ${meeting.handoverNotes.summary}  
> *Decisiones previas:* ${meeting.handoverNotes.decisionsAdopted.join('; ')}  
\n`
    : ''
}
- **Fase alcanzada:** Fase ${meeting.phase} de 5
- **Número de intervenciones:** ${meeting.messages.length} mensajes registrados

---

## 2. DIÁLOGO ÍNTEGRO DE LA SESIÓN

`;

  meeting.messages.forEach((m) => {
    const time = new Date(m.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (m.speaker === 'user') {
      md += `### [${time}] 🎓 ${meeting.teamName || 'Equipo'}:\n${m.content}\n\n`;
    } else if (m.speaker === 'character') {
      md += `### [${time}] 💼 ${m.characterName || 'Profesional de AG'}${m.role ? ` (${m.role})` : ''}:\n${m.content}\n\n`;
    } else {
      md += `> *[${time}] Sistema: ${m.content}*\n\n`;
    }
  });

  md += `---
*Documento generado por AG STUDIO — Simulación de entornos profesionales universitarios con IA. AG Telecomunicaciones.*`;

  return md;
}

export function exportMeetingAsTxt(
  meeting: MeetingSession,
  characters: Character[],
  activity?: Activity
): string {
  const charMap = new Map(characters.map((c) => [c.id, c]));
  const participants = meeting.characterIds
    .map((id) => {
      const c = charMap.get(id);
      return c ? `${c.name} (${c.role})` : id;
    })
    .join(', ');

  const dateStr = new Date(meeting.createdAt).toLocaleString('es-ES');

  let txt = `====================================================================
AG STUDIO — ACTA DE REUNIÓN PROFESIONAL
AG TELECOMUNICACIONES
====================================================================
ID Sesión: ${meeting.id}
Fecha: ${dateStr}
Equipo: ${meeting.teamName}
Modalidad: ${meeting.type === 'duo' ? 'Reunión Conjunta' : 'Reunión Individual'}
Profesionales de AG: ${participants}
${activity ? `Actividad: ${activity.name}\nObjetivo: ${activity.objective}` : ''}
====================================================================

TRANSCRIPCIÓN CRONOLÓGICA:

`;

  meeting.messages.forEach((m) => {
    const time = new Date(m.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const speakerLabel =
      m.speaker === 'user'
        ? `[EQUIPO] ${meeting.teamName}`
        : m.speaker === 'character'
        ? `[AG] ${m.characterName} (${m.role || 'Profesional'})`
        : '[SISTEMA AG]';

    txt += `[${time}] ${speakerLabel}:\n${m.content}\n\n`;
  });

  txt += `====================================================================
Fin de acta. AG STUDIO (Entorno de simulación educativa).
====================================================================`;

  return txt;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
