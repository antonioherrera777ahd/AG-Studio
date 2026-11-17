export type Department =
  | 'Dirección Ejecutiva'
  | 'Dirección Creativa y Arte'
  | 'Cuentas y Clientes'
  | 'Copywriting y Contenidos'
  | 'Diseño Web y UX/UI'
  | 'Desarrollo Tecnológico'
  | 'Medios y Audiovisual'
  | 'Producción Gráfica'
  | 'Legal y Ética'
  | 'Innovación y Generativo';

export interface Character {
  id: string;
  name: string;
  role: string;
  department: Department;
  age?: number;
  nationality?: string;
  avatar: string;
  bio: string;
  personality: string;
  specialtyList: string[];
  nonSpecialties: string[];
  quirks: string[];
  catchphrase?: string;
  typicalTone: string;
  recommendedReferrals: { [topic: string]: string }; // topic -> characterId
  active: boolean;
  variantOf?: string; // e.g. 'rebeca-lafuente' or 'martha-mendoza'
  variantTag?: string; // e.g. 'Portfolio y Reel', 'Header interactivo', 'Videojuegos'
}

export interface ProfessionalActivityRole {
  characterId: string;
  roleInActivity: string; // e.g. "Aprobación ejecutiva, viabilidad y defensa de legado"
  specificGreeting?: string; // Saludo inicial contextualizado a este encargo
  evaluationFocus?: string; // Foco específico de revisión de este personaje
}

export interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  objective: string;
  deliverables: string[];
  leadProfessionalId: string;
  collaboratorIds: string[];
  recommendedQuestions: string[];
  supplementaryResources: string[]; // titles or ids
  evaluationCriteria: string[];
  professionalRoles?: ProfessionalActivityRole[];
}

export interface ResourceItem {
  id: string;
  title: string;
  author: string;
  description: string;
  recommendedById: string; // character id
  activityIds: string[];
  format: 'PDF' | 'Guía' | 'Manual' | 'Ficha técnica' | 'Tutorial' | 'Recurso externo';
  fileUrl?: string;
  status: 'available' | 'pending';
  contentSnippet?: string;
  category: string;
}

export interface CorporateBriefing {
  companyName: string;
  subtitle: string;
  overview: string;
  sectors: string[];
  history: string;
  brandIdentityRules: string[];
  educationalNotice: string;
}

export interface MeetingMessage {
  id: string;
  speaker: 'user' | 'character' | 'system';
  characterId?: string;
  characterName?: string;
  avatar?: string;
  role?: string;
  content: string;
  timestamp: number;
  toneTag?: string;
  referralOffer?: {
    suggestedCharacterId: string;
    reason: string;
  };
}

export interface HandoverNotes {
  fromCharacterId: string;
  fromCharacterName: string;
  toCharacterId: string;
  toCharacterName: string;
  activityTitle: string;
  timestamp: number;
  summary: string;
  objective: string;
  decisionsAdopted: string[];
  proposalsPresented: string[];
  problemsDetected: string[];
  pendingQuestions: string[];
  handoverGreeting?: string;
}

export interface MeetingSession {
  id: string;
  title: string;
  type: 'single' | 'duo';
  characterIds: string[];
  activityId?: string;
  teamName: string;
  phase: number; // 1 to 5
  messages: MeetingMessage[];
  handoverNotes?: HandoverNotes;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'concluded';
}

export interface AppState {
  characters: Character[];
  activities: Activity[];
  resources: ResourceItem[];
  briefing: CorporateBriefing;
  teamName: string;
  activeMeeting: MeetingSession | null;
  savedMeetings: MeetingSession[];
  activeView: 'directory' | 'activities' | 'meeting' | 'resources' | 'admin';
}
