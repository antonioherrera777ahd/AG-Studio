import { Character, Activity, ResourceItem, CorporateBriefing, MeetingSession } from '../types';
import { INITIAL_CHARACTERS } from '../data/characters';
import { INITIAL_ACTIVITIES } from '../data/activities';
import { INITIAL_RESOURCES } from '../data/resources';
import { INITIAL_BRIEFING } from '../data/briefing';

const STORAGE_KEYS = {
  CHARACTERS: 'ag_studio_characters_v1',
  ACTIVITIES: 'ag_studio_activities_v1',
  RESOURCES: 'ag_studio_resources_v1',
  BRIEFING: 'ag_studio_briefing_v1',
  TEAM_NAME: 'ag_studio_team_name_v1',
  ACTIVE_MEETING: 'ag_studio_active_meeting_v1',
  SAVED_MEETINGS: 'ag_studio_saved_meetings_v1',
};

export function loadCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading characters from storage:', e);
  }
  return INITIAL_CHARACTERS;
}

export function saveCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  } catch (e) {
    console.error('Error saving characters to storage:', e);
  }
}

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading activities from storage:', e);
  }
  return INITIAL_ACTIVITIES;
}

export function saveActivities(activities: Activity[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities to storage:', e);
  }
}

export function loadResources(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading resources from storage:', e);
  }
  return INITIAL_RESOURCES;
}

export function saveResources(resources: ResourceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  } catch (e) {
    console.error('Error saving resources to storage:', e);
  }
}

export function loadBriefing(): CorporateBriefing {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRIEFING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading briefing from storage:', e);
  }
  return INITIAL_BRIEFING;
}

export function saveBriefing(briefing: CorporateBriefing): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRIEFING, JSON.stringify(briefing));
  } catch (e) {
    console.error('Error saving briefing to storage:', e);
  }
}

export function loadTeamName(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.TEAM_NAME) || 'Grupo 3 — Nexus Creative';
  } catch {
    return 'Grupo 3 — Nexus Creative';
  }
}

export function saveTeamName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_NAME, name);
  } catch (e) {
    console.error('Error saving team name:', e);
  }
}

export function loadActiveMeeting(): MeetingSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEETING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading active meeting:', e);
  }
  return null;
}

export function saveActiveMeeting(meeting: MeetingSession | null): void {
  try {
    if (meeting) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEETING, JSON.stringify(meeting));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MEETING);
    }
  } catch (e) {
    console.error('Error saving active meeting:', e);
  }
}

export function loadSavedMeetings(): MeetingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_MEETINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading saved meetings:', e);
  }
  return [];
}

export function saveMeetingToHistory(meeting: MeetingSession): void {
  try {
    const current = loadSavedMeetings();
    const filtered = current.filter((m) => m.id !== meeting.id);
    const updated = [meeting, ...filtered].slice(0, 30); // keep last 30
    localStorage.setItem(STORAGE_KEYS.SAVED_MEETINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving meeting to history:', e);
  }
}

export function exportFullConfiguration(): string {
  const config = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    characters: loadCharacters(),
    activities: loadActivities(),
    resources: loadResources(),
    briefing: loadBriefing(),
  };
  return JSON.stringify(config, null, 2);
}

export function importFullConfiguration(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.characters) saveCharacters(data.characters);
    if (data.activities) saveActivities(data.activities);
    if (data.resources) saveResources(data.resources);
    if (data.briefing) saveBriefing(data.briefing);
    return true;
  } catch (e) {
    console.error('Failed to import configuration:', e);
    return false;
  }
}

export function resetToFactoryDefaults(): void {
  try {
    saveCharacters(INITIAL_CHARACTERS);
    saveActivities(INITIAL_ACTIVITIES);
    saveResources(INITIAL_RESOURCES);
    saveBriefing(INITIAL_BRIEFING);
  } catch (e) {
    console.error('Error resetting factory defaults:', e);
  }
}
