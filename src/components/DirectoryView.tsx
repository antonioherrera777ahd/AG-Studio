import React, { useState, useMemo } from 'react';
import { Character, Activity, Department } from '../types';
import {
  Search,
  Filter,
  MessageSquare,
  Users,
  Eye,
  Briefcase,
  Sparkles,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface DirectoryViewProps {
  characters: Character[];
  activities: Activity[];
  onSelectCharacter: (char: Character) => void;
  onStartMeeting: (charId: string, activityId?: string) => void;
  onStartDuoMeeting: (char1Id: string) => void;
}

const DEPARTMENTS: (Department | 'Todos')[] = [
  'Todos',
  'Dirección Ejecutiva',
  'Dirección Creativa y Arte',
  'Cuentas y Clientes',
  'Copywriting y Contenidos',
  'Diseño Web y UX/UI',
  'Desarrollo Tecnológico',
  'Medios y Audiovisual',
  'Producción Gráfica',
  'Legal y Ética',
  'Innovación y Generativo',
];

const STATUS_BY_ID: { [id: string]: string } = {
  'alberto-garcia': 'En despacho revisando balances y auditorías',
  'david-piqueras': 'En mesa creativa bocetando con café',
  'lola-puente': 'Coordinando contrabriefing con clientes',
  'daniela-escribano': 'Puliendo eslóganes y manifiesto verbal',
  'rebeca-lafuente': 'Revisando cartas de color y dirección fotográfica',
  'rebeca-lafuente-portfolio': 'Asesorando curaduría de portfolios y reels',
  'martha-mendoza': 'Analizando pruebas de usabilidad y wireframes',
  'martha-mendoza-header': 'Diseñando microinteracciones de navegación',
  'martha-mendoza-videojuegos': 'En laboratorio lúdico testeando interfaces HUD',
  'marcos-torres': 'Inspeccionando rendimiento y semántica en código',
  'jaqueline-smith': 'Planificando parrilla de medios y spots de TV',
  'manolo-tintero': 'En taller calibrando perfiles de cuatricromía',
  'clara-valdivia': 'Auditando licencias y código deontológico',
  'nicolas-berrocal': 'Ajustando algoritmos de marcas generativas',
};

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  characters,
  activities,
  onSelectCharacter,
  onStartMeeting,
  onStartDuoMeeting,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'Todos'>('Todos');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [includeVariants, setIncludeVariants] = useState(true);

  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      if (!c.active) return false;
      if (!includeVariants && c.variantOf) return false;
      if (selectedDept !== 'Todos' && c.department !== selectedDept) return false;

      // Filter by assigned activity
      if (selectedActivityFilter !== 'all') {
        const act = activities.find((a) => a.id === selectedActivityFilter);
        if (act) {
          const isAssigned =
            act.leadProfessionalId === c.id || act.collaboratorIds.includes(c.id);
          if (!isAssigned) return false;
        }
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesRole = c.role.toLowerCase().includes(query);
        const matchesDept = c.department.toLowerCase().includes(query);
        const matchesSpec = c.specialtyList.some((s) => s.toLowerCase().includes(query));
        return matchesName || matchesRole || matchesDept || matchesSpec;
      }
      return true;
    });
  }, [characters, selectedDept, selectedActivityFilter, searchTerm, includeVariants, activities]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Directorio Corporativo // Organigrama
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk']">
              Equipo Profesional de AG Telecomunicaciones
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl mt-1">
              Conoce a los responsables de cada departamento. Cada profesional está vinculado a
              actividades concretas con objetivos y responsabilidades específicas. Puedes reunirte
              con cualquiera de ellos seleccionando el encargo que deseas trabajar.
            </p>
          </div>

          {/* Variants toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <Layers className="w-4 h-4 text-slate-500" />
            <label className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeVariants}
                onChange={(e) => setIncludeVariants(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Mostrar modalidades especializadas (Portfolio, Header, Videojuegos)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cargo, especialidad (ej. Naming, HTML, PDF/X, Spot)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filter by Activity dropdown */}
          <div className="w-full md:w-72">
            <select
              value={selectedActivityFilter}
              onChange={(e) => setSelectedActivityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Filtrar por actividad: Todas</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#0B132B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Professional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((char) => {
          const status = STATUS_BY_ID[char.id] || 'Disponible en sede';
          const assignedActs = activities.filter(
            (a) => a.leadProfessionalId === char.id || a.collaboratorIds.includes(char.id)
          );

          return (
            <div
              key={char.id}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Card Top Banner with department tag & status */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {char.department}
                    </span>

                    {char.variantTag ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {char.variantTag}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Character Avatar & Identity */}
                  <div className="flex items-start gap-4">
                    <img
                      src={char.avatar}
                      alt={char.name}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 truncate font-['Space_Grotesk'] group-hover:text-blue-600 transition-colors">
                        {char.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 leading-snug line-clamp-1">
                        {char.role}
                      </p>
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                        {char.nationality && <span>{char.nationality}</span>}
                        {char.age && <span>• {char.age} años</span>}
                      </div>
                    </div>
                  </div>

                  {/* Workplace context / Status snippet */}
                  <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 italic line-clamp-1">
                    «{status}»
                  </div>

                  {/* Bio brief */}
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {char.bio}
                  </p>

                  {/* Assigned Activities list as interactive badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-blue-600" />
                      <span>Actividades vinculadas ({assignedActs.length}):</span>
                    </div>
                    {assignedActs.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">Consultas generales</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {assignedActs.map((act) => {
                          const isLead = act.leadProfessionalId === char.id;
                          return (
                            <button
                              key={act.id}
                              onClick={() => onStartMeeting(char.id, act.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer text-left border ${
                                isLead
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                              title={`Iniciar reunión con ${char.name} sobre ${act.name}`}
                            >
                              {act.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCharacter(char)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Ver ficha completa y actividades"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ficha</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartDuoMeeting(char.id)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
                    title="Invitar a una reunión conjunta con otro colega"
                  >
                    <Users className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStartMeeting(char.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reunirse</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
          <p className="text-sm text-slate-600 mb-3">No se encontraron profesionales con ese criterio.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('Todos');
              setSelectedActivityFilter('all');
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
};
