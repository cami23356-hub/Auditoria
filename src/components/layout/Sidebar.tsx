/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileSignature,
  CheckSquare,
  AlertTriangle,
  Grid3X3,
  FileCheck2,
  FileText,
  TrendingUp,
  FolderTree,
  ScanLine,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  Award,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'schedule'
  | 'plan'
  | 'initiation-minute'
  | 'checklist'
  | 'findings'
  | 'risks'
  | 'closing-minute'
  | 'final-report'
  | 'improvement-plan'
  | 'evaluation'
  | 'file-manager'
  | 'scanner'
  | 'manual';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetData: () => void;
  pendingFindingsCount: number;
  criticalRisksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onExportBackup,
  onImportBackup,
  onResetData,
  pendingFindingsCount,
  criticalRisksCount,
}) => {
  const navSections = [
    {
      group: 'PANEL & PROGRAMACIÓN',
      items: [
        { id: 'dashboard', label: 'Panel Principal & Dashboard', icon: LayoutDashboard },
        { id: 'schedule', label: '1. Programación de Auditoría', icon: CalendarDays },
        { id: 'plan', label: '2. Plan de Auditoría', icon: ClipboardList },
      ],
    },
    {
      group: 'EJECUCIÓN & EVALUACIÓN',
      items: [
        { id: 'initiation-minute', label: '3. Acta de Iniciación (GTC 185)', icon: FileSignature },
        { id: 'checklist', label: '4. Lista de Chequeo Interactiva', icon: CheckSquare },
        {
          id: 'findings',
          label: '5. Registro y Análisis de Hallazgos',
          icon: AlertTriangle,
          badge: pendingFindingsCount > 0 ? pendingFindingsCount : undefined,
          badgeColor: 'bg-amber-600 text-white',
        },
        {
          id: 'risks',
          label: '6. Matriz y Calificación del Riesgo',
          icon: Grid3X3,
          badge: criticalRisksCount > 0 ? criticalRisksCount : undefined,
          badgeColor: 'bg-rose-600 text-white',
        },
      ],
    },
    {
      group: 'CIERRE & SEGUIMIENTO',
      items: [
        { id: 'closing-minute', label: '7. Acta de Cierre (GTC 185)', icon: FileCheck2 },
        { id: 'final-report', label: '8. Informe Final (15 Puntos)', icon: FileText },
        { id: 'improvement-plan', label: '9. Plan de Mejoramiento', icon: TrendingUp },
        { id: 'evaluation', label: '10. Calificación de Auditoría', icon: Award },
      ],
    },
    {
      group: 'GESTIÓN DOCUMENTAL GTC-185',
      items: [
        { id: 'file-manager', label: 'Organizador de Archivos', icon: FolderTree },
        { id: 'scanner', label: 'Escáner Documental GTC-185', icon: ScanLine },
        { id: 'manual', label: 'Manual de Usuario & Normas', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 no-print">
      {/* Top Banner inside Sidebar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
          SISTEMA DE GESTIÓN GTC 185
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Auditorías Internas ISO 19011
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {sec.group}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Persistence Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 mb-1">
          Base de Datos & Portabilidad
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportBackup}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            title="Descargar copia de seguridad en JSON con todas las auditorías y actas"
          >
            <Download className="w-3 h-3 text-blue-400" />
            <span>Respaldar</span>
          </button>
          <button
            type="button"
            onClick={onImportBackup}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            title="Restaurar base de datos desde un archivo JSON"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>Restaurar</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
          title="Restablecer datos predeterminados de auditoría de prueba"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Restablecer Datos Demo</span>
        </button>
      </div>
    </aside>
  );
};
