import React, { useState, useMemo } from 'react';
import { ResourceItem, Character, Activity } from '../types';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourceItem[];
  characters: Character[];
  activities: Activity[];
  onViewResource: (res: ResourceItem) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  characters,
  activities,
  onViewResource,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'pending'>('all');

  const charMap = new Map(characters.map((c) => [c.id, c]));

  const formats = ['Todos', 'Manual', 'Guía', 'Ficha técnica', 'Tutorial', 'PDF', 'Recurso externo'];

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (selectedFormat !== 'Todos' && res.format !== selectedFormat) return false;
      if (selectedStatus === 'available' && res.status !== 'available') return false;
      if (selectedStatus === 'pending' && res.status !== 'pending') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesDesc = res.description.toLowerCase().includes(q);
        const matchesAuthor = res.author.toLowerCase().includes(q);
        const matchesCat = res.category.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesAuthor || matchesCat;
      }
      return true;
    });
  }, [resources, selectedFormat, selectedStatus, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          Documentación Corporativa // Fondos de Conocimiento
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk']">
          Recursos que comparte el equipo
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Guías oficiales, manuales de marca, checklists de preimpresión y plantillas técnicas
          proporcionadas por los departamentos de AG Telecomunicaciones para complementar vuestros
          proyectos grupales.
        </p>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, temática, autor (ej. PDF/X, WCAG, Naming, Color)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                selectedStatus === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
              }`}
            >
              Todos ({resources.length})
            </button>
            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                selectedStatus === 'available'
                  ? 'bg-white shadow-xs text-emerald-700 font-bold'
                  : 'text-slate-500'
              }`}
            >
              Disponibles ({resources.filter((r) => r.status === 'available').length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-white shadow-xs text-amber-700 font-bold'
                  : 'text-slate-500'
              }`}
            >
              Pendientes ({resources.filter((r) => r.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Format chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedFormat === fmt
                  ? 'bg-[#0B132B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const recommender = charMap.get(res.recommendedById);

          return (
            <div
              key={res.id}
              onClick={() => onViewResource(res)}
              className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all p-5 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Format and Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {res.format}
                  </span>

                  {res.status === 'available' ? (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Disponible</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>Pendiente</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-['Space_Grotesk'] leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>
              </div>

              {/* Footer Recommender Info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {recommender ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={recommender.avatar}
                      alt={recommender.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 text-[11px] text-slate-600 truncate">
                      {recommender.name}
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">{res.author}</span>
                )}

                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
