/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Sparkles, BookOpen, Building2 } from 'lucide-react';
import { Company, UserRole } from '../../types/audit';

interface NavbarProps {
  companies: Company[];
  currentCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isAutoSaveEnabled: boolean;
  onToggleAutoSave: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  lastSavedAt: string | null;
  onManualSave: () => void;
  onOpenUserManual: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companies,
  currentCompanyId,
  onSelectCompany,
  currentRole,
  onSelectRole,
  isAutoSaveEnabled,
  onToggleAutoSave,
  isEditMode,
  onToggleEditMode,
  lastSavedAt,
  onManualSave,
  onOpenUserManual,
}) => {
  const [saveStatusText, setSaveStatusText] = useState<string>('Guardado');
  const [isSavingPulse, setIsSavingPulse] = useState(false);

  useEffect(() => {
    const handleSaved = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: string }>;
      setSaveStatusText(`Guardado ${customEvent.detail.time}`);
      setIsSavingPulse(true);
      const timer = setTimeout(() => setIsSavingPulse(false), 1200);
      return () => clearTimeout(timer);
    };

    window.addEventListener('auditpro:saved', handleSaved);
    return () => window.removeEventListener('auditpro:saved', handleSaved);
  }, []);

  const selectedCompany = companies.find((c) => c.id === currentCompanyId);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm no-print">
      <div className="flex items-center justify-between gap-8 px-4 lg:px-6 py-2.5 max-w-7xl mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            AP
          </div>
          <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
            AUDITPRO
          </span>
          <span className="hidden xl:inline text-[11px] text-slate-400 font-mono-tabular">
            GTC-185 · ISO 19011
          </span>
        </div>

        {/* Zone 2: Navigation controls, selectors & toggles */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {/* Company Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/80 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={currentCompanyId}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[140px] md:max-w-[190px] truncate"
              title="Seleccionar empresa a auditar"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/80 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={currentRole}
              onChange={(e) => onSelectRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              title="Cambiar perfil de usuario y permisos"
            >
              <option value="AUDITOR_LIDER" className="bg-slate-900 text-white">
                Auditor Líder
              </option>
              <option value="ADMIN" className="bg-slate-900 text-white">
                Administrador
              </option>
              <option value="RESPONSABLE_PROCESO" className="bg-slate-900 text-white">
                Resp. de Proceso
              </option>
            </select>
          </div>

          {/* Botón de Guardado Automático */}
          <button
            type="button"
            onClick={onToggleAutoSave}
            title={isAutoSaveEnabled ? 'Desactivar guardado automático' : 'Activar guardado automático continuo'}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shrink-0 ${
              isAutoSaveEnabled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                isAutoSaveEnabled ? 'text-emerald-400' : 'text-slate-500'
              } ${isSavingPulse ? 'scale-110 text-emerald-300' : ''}`}
            />
            <span className="whitespace-nowrap">
              Auto-guardado: <strong className="font-bold">{isAutoSaveEnabled ? 'ACTIVO' : 'PAUSADO'}</strong>
            </span>
          </button>

          {/* Botones para editar cada aspecto de la página */}
          <button
            type="button"
            onClick={onToggleEditMode}
            title="Activar/desactivar botones de edición en vivo para textos, títulos y criterios"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shrink-0 ${
              isEditMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span className="whitespace-nowrap">
              Modo Editor: <strong className="font-bold">{isEditMode ? 'ENCENDIDO' : 'APAGADO'}</strong>
            </span>
          </button>

          {/* Manual de usuario link */}
          <button
            type="button"
            onClick={onOpenUserManual}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors shrink-0"
            title="Abrir Manual de Usuario e instructivo GTC-185"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline whitespace-nowrap">Manual de Usuario</span>
          </button>
        </div>

        {/* Zone 3: 1 Primary action button with live save state */}
        <div className="flex items-center gap-2 shrink-0">
          {lastSavedAt && (
            <span className="text-[10px] text-slate-400 font-mono-tabular hidden lg:inline" title="Hora del último guardado">
              {lastSavedAt}
            </span>
          )}
          <button
            type="button"
            onClick={onManualSave}
            title={`Guardar ahora manualmente. Último: ${lastSavedAt || 'Reciente'}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm whitespace-nowrap active:scale-95 ${
              isSavingPulse
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isSavingPulse ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>¡Cambios Guardados!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Ahora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
