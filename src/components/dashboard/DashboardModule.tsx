/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppDatabaseState } from '../../services/storage';
import { EditableField } from '../common/EditableField';

interface DashboardModuleProps {
  state: AppDatabaseState;
  onNavigate: (tab: any) => void;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateSubtitle: (newSub: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  state,
  onNavigate,
  onUpdateTitle,
  onUpdateSubtitle,
}) => {
  const currentCompany = state.companies.find((c) => c.id === state.currentCompanyId) || state.companies[0];
  const currentAudit = state.auditSessions.find((a) => a.id === state.currentAuditId) || state.auditSessions[0];

  // Stats calculation
  const totalAudits = state.auditSessions.length;
  const scheduledAudits = state.auditSessions.filter((a) => a.status === 'PROGRAMADA').length;
  const inProgressAudits = state.auditSessions.filter((a) => a.status === 'EN_EJECUCION').length;
  const completedAudits = state.auditSessions.filter((a) => a.status === 'FINALIZADA').length;

  const currentChecklist = (currentAudit ? state.checklists[currentAudit.id] : []) || [];
  const compliantCount = currentChecklist.filter((c) => c.compliance === 'CUMPLE').length;
  const partialCount = currentChecklist.filter((c) => c.compliance === 'CUMPLE_PARCIALMENTE').length;
  const nonCompliantCount = currentChecklist.filter((c) => c.compliance === 'NO_CUMPLE').length;
  const naCount = currentChecklist.filter((c) => c.compliance === 'NO_APLICA').length;
  const applicableTotal = currentChecklist.length - naCount;
  const compliancePercentage =
    applicableTotal > 0 ? Math.round(((compliantCount + partialCount * 0.5) / applicableTotal) * 100) : 0;

  const currentFindings = (currentAudit ? state.findings[currentAudit.id] : []) || [];
  const ncMajorCount = currentFindings.filter((f) => f.classification === 'NO_CONFORMIDAD_MAYOR').length;
  const ncMinorCount = currentFindings.filter((f) => f.classification === 'NO_CONFORMIDAD_MENOR').length;
  const observationCount = currentFindings.filter((f) => f.classification === 'OBSERVACION').length;
  const opportunityCount = currentFindings.filter((f) => f.classification === 'OPORTUNIDAD_MEJORA').length;

  const currentRisks = (currentAudit ? state.risks[currentAudit.id] : []) || [];
  const criticalRisks = currentRisks.filter((r) => r.riskLevel === 'CRITICO').length;
  const highRisks = currentRisks.filter((r) => r.riskLevel === 'ALTO').length;
  const mediumRisks = currentRisks.filter((r) => r.riskLevel === 'MEDIO').length;
  const lowRisks = currentRisks.filter((r) => r.riskLevel === 'BAJO').length;

  const currentImprovementItems = (currentAudit ? state.improvementPlans[currentAudit.id] : []) || [];
  const executedActions = currentImprovementItems.filter(
    (i) => i.executionStatus === 'IMPLEMENTADA' || i.executionStatus === 'VERIFICADA_EFICAZ'
  ).length;
  const improvementExecutionPercentage =
    currentImprovementItems.length > 0 ? Math.round((executedActions / currentImprovementItems.length) * 100) : 0;

  // Semáforo color
  const getComplianceColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Executive Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5" />
              <span>{currentCompany?.name}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono-tabular">NIT: {currentCompany?.nit}</span>
            </div>
            <div className="mt-1">
              <EditableField
                value={state.customizations.institutionHeaderTitle}
                onSave={onUpdateTitle}
                isEditMode={state.isEditMode}
                asHeading="h1"
                className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
                label="Título del Sistema"
              />
            </div>
            <div className="mt-0.5">
              <EditableField
                value={state.customizations.institutionSubtitle}
                onSave={onUpdateSubtitle}
                isEditMode={state.isEditMode}
                asHeading="p"
                className="text-xs text-slate-500 font-medium"
                label="Subtítulo institucional"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Auditoría Activa</span>
              <span className="text-sm font-bold text-slate-900 font-mono-tabular">
                {currentAudit?.code || 'N/A'}
              </span>
              <span className="text-[11px] text-blue-700 font-medium block">
                {currentAudit?.auditType.replace('AUDITORIA_', '')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('checklist')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Continuar Evaluación</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Automatic Indicators (Exigidos en Numeral 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Auditorías */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Auditorías Totales
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono-tabular">{totalAudits}</span>
            <span className="text-[10px] text-slate-500">en sistema</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Prog: {scheduledAudits}</span>
            <span>Ejec: {inProgressAudits}</span>
            <span>Fin: {completedAudits}</span>
          </div>
        </div>

        {/* Total Hallazgos */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Hallazgos Totales
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 font-mono-tabular">
              {currentFindings.length}
            </span>
            <span className="text-[10px] text-slate-500">detectados</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>NC Mayor: {ncMajorCount}</span>
            <span>NC Menor: {ncMinorCount}</span>
          </div>
        </div>

        {/* NC Mayores & Menores */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            No Conformidades
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 font-mono-tabular">
              {ncMajorCount + ncMinorCount}
            </span>
            <span className="text-[10px] text-rose-500 font-medium">críticas</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            <span>Obs: {observationCount} · Oportunidades: {opportunityCount}</span>
          </div>
        </div>

        {/* Riesgos Altos & Críticos */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Riesgos Críticos
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-700 font-mono-tabular">
              {criticalRisks + highRisks}
            </span>
            <span className="text-[10px] text-red-500">alto impacto</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            <span>Críticos: {criticalRisks} · Altos: {highRisks}</span>
          </div>
        </div>

        {/* % Cumplimiento General */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Cumplimiento
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700 font-mono-tabular">
              {compliancePercentage}%
            </span>
            <span className="text-[10px] text-slate-500">checklist</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                compliancePercentage >= 80 ? 'bg-emerald-600' : compliancePercentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>

        {/* % Acciones Correctivas Ejecutadas */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
            Plan Mejora
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono-tabular">
              {improvementExecutionPercentage}%
            </span>
            <span className="text-[10px] text-slate-500">ejecutado</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${improvementExecutionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gráficos Estadísticos y Semáforo de Cumplimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico 1: Desglose de Lista de Chequeo y Semáforo */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Semáforo de Cumplimiento Técnico</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getComplianceColor(compliancePercentage)}`}>
                {compliancePercentage >= 80 ? 'Aceptable' : compliancePercentage >= 60 ? 'Alerta' : 'Crítico'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Donut Chart */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Compliant segment */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${(compliantCount / (currentChecklist.length || 1)) * 100}, 100`}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Partial segment */}
                  <path
                    className="text-amber-500"
                    strokeDasharray={`${(partialCount / (currentChecklist.length || 1)) * 100}, 100`}
                    strokeDashoffset={`-${(compliantCount / (currentChecklist.length || 1)) * 100}`}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Non-compliant segment */}
                  <path
                    className="text-rose-500"
                    strokeDasharray={`${(nonCompliantCount / (currentChecklist.length || 1)) * 100}, 100`}
                    strokeDashoffset={`-${((compliantCount + partialCount) / (currentChecklist.length || 1)) * 100}`}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono-tabular">
                    {compliancePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Conformidad</span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Cumple
                </span>
                <span className="font-bold font-mono-tabular text-slate-900">{compliantCount} ítems</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Cumple Parcialmente
                </span>
                <span className="font-bold font-mono-tabular text-slate-900">{partialCount} ítems</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  No Cumple
                </span>
                <span className="font-bold font-mono-tabular text-slate-900">{nonCompliantCount} ítems</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  No Aplica
                </span>
                <span className="font-bold font-mono-tabular text-slate-900">{naCount} ítems</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('checklist')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Ver Lista de Chequeo Completa →
            </button>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Hallazgos por Clasificación */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Clasificación de Hallazgos (ISO 19011)</h2>
              <span className="text-xs text-slate-500 font-mono-tabular">{currentFindings.length} totales</span>
            </div>

            <div className="mt-4 space-y-3">
              {/* NC Mayor */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-red-700 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> No Conformidad Mayor
                  </span>
                  <span className="font-bold font-mono-tabular text-slate-900">{ncMajorCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all"
                    style={{ width: `${currentFindings.length ? (ncMajorCount / currentFindings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* NC Menor */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" /> No Conformidad Menor
                  </span>
                  <span className="font-bold font-mono-tabular text-slate-900">{ncMinorCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${currentFindings.length ? (ncMinorCount / currentFindings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Observación */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-blue-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Observación
                  </span>
                  <span className="font-bold font-mono-tabular text-slate-900">{observationCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${currentFindings.length ? (observationCount / currentFindings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Oportunidad de Mejora */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Oportunidad de Mejora
                  </span>
                  <span className="font-bold font-mono-tabular text-slate-900">{opportunityCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${currentFindings.length ? (opportunityCount / currentFindings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('findings')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Gestionar Hallazgos y Causa Raíz →
            </button>
          </div>
        </div>

        {/* Gráfico 3: Matriz de Calor de Riesgos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Mapa Térmico de Riesgos (ISO 31000)</h2>
              <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                {criticalRisks} Críticos
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-red-600 block">Crítico (15-25)</span>
                <span className="text-xl font-extrabold text-red-700 font-mono-tabular">{criticalRisks}</span>
                <span className="text-[10px] text-red-500 block">Intervención inmediata</span>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-orange-600 block">Alto (10-14)</span>
                <span className="text-xl font-extrabold text-orange-700 font-mono-tabular">{highRisks}</span>
                <span className="text-[10px] text-orange-500 block">Control prioritario</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Medio (5-9)</span>
                <span className="text-xl font-extrabold text-amber-700 font-mono-tabular">{mediumRisks}</span>
                <span className="text-[10px] text-amber-500 block">Monitoreo periódico</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Bajo (1-4)</span>
                <span className="text-xl font-extrabold text-emerald-700 font-mono-tabular">{lowRisks}</span>
                <span className="text-[10px] text-emerald-500 block">Riesgo tolerable</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('risks')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Ver Matriz Completa Probabilidad x Impacto →
            </button>
          </div>
        </div>
      </div>

      {/* Trazabilidad del Ciclo de Auditoría (1 al 9) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Trazabilidad del Ciclo de Auditoría Integral (GTC 185)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('schedule')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 1</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Programación</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Registrada</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('plan')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 2</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Plan de Auditoría</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Aprobado</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('initiation-minute')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 3</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Acta Apertura</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">✓ Firmada GTC 185</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className="p-3 rounded-lg border border-blue-400 bg-blue-50/40 text-left transition-colors shadow-xs"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 4</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">Listas de Chequeo</span>
            <span className="text-[10px] text-blue-800 font-bold mt-1 block">En Evaluación ({compliancePercentage}%)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('closing-minute')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 5</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Acta de Cierre</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Con compromisos</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('final-report')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 6</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Informe Final</span>
            <span className="text-[10px] text-blue-700 font-medium mt-1 block">15 Capítulos GTC 185</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('improvement-plan')}
            className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-colors"
          >
            <span className="text-[10px] font-bold text-blue-700 block">Fase 7</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">Plan de Mejora</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">{improvementExecutionPercentage}% ejecutado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
