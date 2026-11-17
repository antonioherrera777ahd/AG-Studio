import React, { useState } from 'react';
import {
  Character,
  Activity,
  ResourceItem,
  CorporateBriefing,
  Department,
} from '../types';
import {
  Settings,
  Users,
  Briefcase,
  BookOpen,
  Building,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import { downloadFile } from '../utils/exportMeeting';

interface AdminPanelProps {
  characters: Character[];
  activities: Activity[];
  resources: ResourceItem[];
  briefing: CorporateBriefing;
  onUpdateCharacters: (chars: Character[]) => void;
  onUpdateActivities: (acts: Activity[]) => void;
  onUpdateResources: (res: ResourceItem[]) => void;
  onUpdateBriefing: (briefing: CorporateBriefing) => void;
  onExportConfig: () => void;
  onImportConfig: (json: string) => boolean;
  onResetDefaults: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  characters,
  activities,
  resources,
  briefing,
  onUpdateCharacters,
  onUpdateActivities,
  onUpdateResources,
  onUpdateBriefing,
  onExportConfig,
  onImportConfig,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'activities' | 'resources' | 'briefing' | 'backup'>('characters');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Character editing state
  const [editingChar, setEditingChar] = useState<Character | null>(null);

  // Activity editing state
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Briefing edit state
  const [tempBriefing, setTempBriefing] = useState<CorporateBriefing>(briefing);

  // Import JSON text state
  const [importJsonText, setImportJsonText] = useState('');

  const showFeedback = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Character Handlers
  const handleToggleCharActive = (id: string) => {
    const updated = characters.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    onUpdateCharacters(updated);
    showFeedback('Estado del personaje actualizado.');
  };

  const handleSaveChar = () => {
    if (!editingChar) return;
    const updated = characters.map((c) => (c.id === editingChar.id ? editingChar : c));
    onUpdateCharacters(updated);
    setEditingChar(null);
    showFeedback(`Ficha de ${editingChar.name} guardada.`);
  };

  // Activity Handlers
  const handleSaveActivity = () => {
    if (!editingActivity) return;
    const exists = activities.some((a) => a.id === editingActivity.id);
    let updated: Activity[];
    if (exists) {
      updated = activities.map((a) => (a.id === editingActivity.id ? editingActivity : a));
    } else {
      updated = [...activities, editingActivity];
    }
    onUpdateActivities(updated);
    setEditingActivity(null);
    showFeedback(`Actividad "${editingActivity.name}" guardada.`);
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta actividad del catálogo?')) {
      const updated = activities.filter((a) => a.id !== id);
      onUpdateActivities(updated);
      showFeedback('Actividad eliminada.');
    }
  };

  // Briefing Handlers
  const handleSaveBriefing = () => {
    onUpdateBriefing(tempBriefing);
    showFeedback('Briefing corporativo de AG Telecomunicaciones actualizado.');
  };

  // Backup Import Handler
  const handleExecuteImport = () => {
    if (!importJsonText.trim()) return;
    const ok = onImportConfig(importJsonText);
    if (ok) {
      showFeedback('Configuración importada con éxito.');
      setImportJsonText('');
    } else {
      alert('Error al parsear el JSON de configuración. Verifica el formato.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            Consola Docente // Administración del Sistema
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk']">
            Panel de Configuración y Matriz de AG STUDIO
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Adapta los personajes, personalidades, matriz de actividades, entregables y briefing
            corporativo sin necesidad de reconstruir ni modificar el código de la aplicación.
          </p>
        </div>

        {/* Global Notice */}
        {statusNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'characters'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personajes ({characters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'activities'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Actividades ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('briefing')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'briefing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Briefing Corporativo</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Copia JSON / Restaurar</span>
        </button>
      </div>

      {/* Tab: Characters */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{char.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {char.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{char.role}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1">
                      "{char.personality}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingChar(char)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Editar personaje"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleCharActive(char.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      char.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {char.active ? 'Activo' : 'Desactivado'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Character Modal */}
          {editingChar && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Editar Personaje: {editingChar.name}
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingChar.name}
                    onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={editingChar.role}
                    onChange={(e) => setEditingChar({ ...editingChar, role: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Descripción y Personalidad (Instrucción psicológica del modelo)
                  </label>
                  <textarea
                    rows={3}
                    value={editingChar.personality}
                    onChange={(e) =>
                      setEditingChar({ ...editingChar, personality: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Especialidades (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={editingChar.specialtyList.join(', ')}
                    onChange={(e) =>
                      setEditingChar({
                        ...editingChar,
                        specialtyList: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setEditingChar(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveChar}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() =>
                setEditingActivity({
                  id: `act-custom-${Date.now()}`,
                  name: 'Nueva Actividad Universitaria',
                  category: 'Diseño y Creatividad',
                  description: 'Descripción del encargo...',
                  objective: 'Objetivo pedagógico...',
                  deliverables: ['Entregable 1', 'Entregable 2'],
                  leadProfessionalId: characters[0]?.id || 'alberto-garcia',
                  collaboratorIds: [],
                  recommendedQuestions: ['Pregunta de inicio...'],
                  supplementaryResources: [],
                  evaluationCriteria: ['Criterio 1'],
                })
              }
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nueva Actividad</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {act.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {act.deliverables.length} entregables
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{act.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{act.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Lead: {characters.find((c) => c.id === act.leadProfessionalId)?.name || 'Sin asignar'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingActivity(act)}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                      title="Editar actividad"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Activity Modal */}
          {editingActivity && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Configurar Actividad: {editingActivity.name}
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingActivity.name}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, name: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editingActivity.category}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, category: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Profesional Responsable Principal
                  </label>
                  <select
                    value={editingActivity.leadProfessionalId}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        leadProfessionalId: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Objetivo Pedagógico
                  </label>
                  <textarea
                    rows={2}
                    value={editingActivity.objective}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, objective: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Entregables (separados por punto y coma)
                  </label>
                  <input
                    type="text"
                    value={editingActivity.deliverables.join('; ')}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        deliverables: e.target.value.split(';').map((s) => s.trim()),
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setEditingActivity(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveActivity}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Guardar Actividad
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Briefing */}
      {activeTab === 'briefing' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-3xl">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Nombre de la Empresa Simula
            </label>
            <input
              type="text"
              value={tempBriefing.companyName}
              onChange={(e) => setTempBriefing({ ...tempBriefing, companyName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Resumen Corporativo e Historia (Inyectado en cada conversación)
            </label>
            <textarea
              rows={4}
              value={tempBriefing.overview}
              onChange={(e) => setTempBriefing({ ...tempBriefing, overview: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Sectores de Operación (separados por coma)
            </label>
            <input
              type="text"
              value={tempBriefing.sectors.join(', ')}
              onChange={(e) =>
                setTempBriefing({
                  ...tempBriefing,
                  sectors: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Reglas de Identidad de Marca (inviolabilidad de siglas, etc.)
            </label>
            <textarea
              rows={4}
              value={tempBriefing.brandIdentityRules.join('\n')}
              onChange={(e) =>
                setTempBriefing({
                  ...tempBriefing,
                  brandIdentityRules: e.target.value.split('\n').filter((l) => l.trim()),
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleSaveBriefing}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Briefing Corporativo</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Backup & JSON */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Download className="w-4 h-4" />
              <span>Exportar Configuración Completa</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Descarga un archivo JSON con todos los personajes, personalidades, actividades,
              entregables y reglas del briefing para compartirlo con otros docentes o guardarlo de
              respaldo.
            </p>
            <button
              onClick={onExportConfig}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Descargar ag-studio-config.json</span>
            </button>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-rose-800 mb-1">Restaurar Valores de Fábrica</div>
              <p className="text-xs text-slate-500 mb-3">
                Si deseas reiniciar todos los personajes, actividades y el briefing a sus valores
                originales especificados en el documento maestro:
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Seguro que deseas restaurar la configuración de fábrica? Se sobrescribirán tus cambios personalizados.'
                    )
                  ) {
                    onResetDefaults();
                    showFeedback('Configuración restaurada a los valores de fábrica.');
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Fábrica</span>
              </button>
            </div>
          </div>

          {/* Import card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
              <Upload className="w-4 h-4" />
              <span>Importar Configuración JSON</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pega aquí el contenido JSON exportado previamente para cargar instantáneamente un nuevo
              set de actividades o personajes:
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Pega aquí el JSON exportado..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
            />
            <button
              onClick={handleExecuteImport}
              disabled={!importJsonText.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Aplicar Configuración</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
