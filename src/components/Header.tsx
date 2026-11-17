import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  MessageSquare,
  BookOpen,
  Settings,
  Info,
  ShieldCheck,
  Building2,
  Edit2,
  Check,
} from 'lucide-react';

interface HeaderProps {
  activeView: 'directory' | 'activities' | 'meeting' | 'resources' | 'admin';
  setActiveView: (view: 'directory' | 'activities' | 'meeting' | 'resources' | 'admin') => void;
  teamName: string;
  onUpdateTeamName: (name: string) => void;
  hasActiveMeeting: boolean;
  onOpenBriefing: () => void;
  onOpenPrivacy: () => void;
  apiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  teamName,
  onUpdateTeamName,
  hasActiveMeeting,
  onOpenBriefing,
  onOpenPrivacy,
  apiConnected,
}) => {
  const [editingTeam, setEditingTeam] = useState(false);
  const [tempTeam, setTempTeam] = useState(teamName);

  const handleSaveTeam = () => {
    if (tempTeam.trim()) {
      onUpdateTeamName(tempTeam.trim());
    }
    setEditingTeam(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B132B] text-white border-b border-slate-800 shadow-md">
      {/* Top bar with corporate seal and simulation notice */}
      <div className="bg-[#070D1E] px-4 py-1 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300">AG TELECOMUNICACIONES // ENTORNO DE SIMULACIÓN PROFESIONAL</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Proyecto Universitario Transversal</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBriefing}
            className="hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Consultar Briefing Corporativo y Cultura de AG"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Briefing Corporativo</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Aviso de Privacidad y Simulación Pedagógica"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulación & Privacidad</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-inner border border-blue-400/30">
              AG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                  AG STUDIO
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulación de entornos profesionales con inteligencia artificial
              </p>
            </div>
          </div>

          {/* Mobile team badge toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setEditingTeam(!editingTeam)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5"
            >
              <span>{teamName}</span>
              <Edit2 className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveView('directory')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'directory'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de Profesionales</span>
          </button>

          <button
            onClick={() => setActiveView('activities')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'activities'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Catálogo de Actividades</span>
          </button>

          <button
            onClick={() => setActiveView('meeting')}
            className={`relative px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'meeting'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Sala de Reunión</span>
            {hasActiveMeeting && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Reunión en curso" />
            )}
          </button>

          <button
            onClick={() => setActiveView('resources')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'resources'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Biblioteca de Recursos</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeView === 'admin'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Administración</span>
          </button>
        </nav>

        {/* Desktop Team Name Badge */}
        <div className="hidden md:flex items-center gap-3">
          {editingTeam ? (
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-md border border-slate-700">
              <input
                type="text"
                value={tempTeam}
                onChange={(e) => setTempTeam(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTeam()}
                className="bg-slate-900 text-white text-xs px-2 py-1 rounded outline-none w-44"
                placeholder="Nombre del grupo..."
                autoFocus
              />
              <button
                onClick={handleSaveTeam}
                className="p-1 text-emerald-400 hover:bg-slate-700 rounded cursor-pointer"
                title="Guardar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempTeam(teamName);
                setEditingTeam(true);
              }}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 cursor-pointer transition-colors group"
              title="Haz clic para cambiar el nombre de tu equipo"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Equipo de trabajo
                </div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                  {teamName}
                </div>
              </div>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 ml-1" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
