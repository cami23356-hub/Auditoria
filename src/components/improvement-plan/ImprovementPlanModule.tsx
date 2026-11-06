/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Save,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import { ImprovementPlanItem, AuditFinding, Company, AuditSession } from '../../types/audit';
import { exportToExcel } from '../../utils/exportUtils';
import { EditableField } from '../common/EditableField';

interface ImprovementPlanModuleProps {
  planItems: ImprovementPlanItem[];
  findings: AuditFinding[];
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdatePlanItems: (updatedItems: ImprovementPlanItem[]) => void;
}

const EXECUTION_STATUS_LABELS: Record<ImprovementPlanItem['executionStatus'], string> = {
  PENDIENTE: 'Pendiente',
  EN_EJECUCION: 'En Ejecución',
  IMPLEMENTADA: 'Implementada',
  VERIFICADA_EFICAZ: 'Verificada y Eficaz',
  NO_EFICAZ: 'No Eficaz (Requiere Re-análisis)',
};

export const ImprovementPlanModule: React.FC<ImprovementPlanModuleProps> = ({
  planItems,
  findings,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdatePlanItems,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState(false);

  const filteredItems = planItems.filter((item) => {
    return selectedStatusFilter === 'ALL' || item.executionStatus === selectedStatusFilter;
  });

  const handleStatusChange = (id: string, newStatus: ImprovementPlanItem['executionStatus']) => {
    const updated = planItems.map((item) =>
      item.id === id ? { ...item, executionStatus: newStatus } : item
    );
    onUpdatePlanItems(updated);
  };

  const handleUpdateItemField = (id: string, field: keyof ImprovementPlanItem, value: any) => {
    const updated = planItems.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onUpdatePlanItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = planItems.filter((i) => i.id !== id);
    onUpdatePlanItems(updated);
  };

  const handleAddNewAction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newItem: ImprovementPlanItem = {
      id: `pm-${Date.now()}`,
      auditId: currentAudit.id,
      findingId: elements.findingId.value || 'manual',
      code: `PM-${String(planItems.length + 1).padStart(3, '0')}`,
      identifiedProblem: elements.identifiedProblem.value,
      rootCause: elements.rootCause.value,
      correctiveAction: elements.correctiveAction.value,
      preventiveAction: elements.preventiveAction.value,
      plannedActivities: elements.plannedActivities.value,
      responsiblePerson: elements.responsiblePerson.value,
      requiredResources: elements.requiredResources.value,
      startDate: elements.startDate.value,
      dueDate: elements.dueDate.value,
      complianceIndicator: elements.complianceIndicator.value,
      targetGoal: elements.targetGoal.value,
      executionStatus: 'EN_EJECUCION',
      followUpNotes: elements.followUpNotes.value || 'Iniciando implementación de actividades.',
    };

    const updated = [newItem, ...planItems];
    onUpdatePlanItems(updated);
    setIsNewActionModalOpen(false);
  };

  const handleExportExcel = () => {
    const headers = [
      'Código',
      'Problema Identificado',
      'Causa Raíz (Análisis)',
      'Acción Correctiva',
      'Acción Preventiva',
      'Actividades a Desarrollar',
      'Responsable',
      'Recursos',
      'Fecha Inicio',
      'Fecha Límite',
      'Indicador de Cumplimiento',
      'Meta',
      'Estado de Ejecución',
      'Notas de Seguimiento',
    ];

    const rows = planItems.map((item) => [
      item.code,
      item.identifiedProblem,
      item.rootCause,
      item.correctiveAction,
      item.preventiveAction,
      item.plannedActivities,
      item.responsiblePerson,
      item.requiredResources,
      item.startDate,
      item.dueDate,
      item.complianceIndicator,
      item.targetGoal,
      item.executionStatus,
      item.followUpNotes,
    ]);

    exportToExcel(`Plan_Mejoramiento_${currentAudit.code}`, headers, rows);
  };

  const getStatusBadge = (status: ImprovementPlanItem['executionStatus']) => {
    switch (status) {
      case 'VERIFICADA_EFICAZ':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Verificada y Eficaz
          </span>
        );
      case 'IMPLEMENTADA':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Check className="w-3 h-3 text-blue-700" />
            Implementada
          </span>
        );
      case 'EN_EJECUCION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            En Ejecución
          </span>
        );
      case 'PENDIENTE':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
            Pendiente
          </span>
        );
      case 'NO_EFICAZ':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-700" />
            No Eficaz
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Módulo 9 · Plan de Mejoramiento Continuo</span>
            <span className="text-slate-400">·</span>
            <span>Edición Total de Responsables, Causas y Metas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Plan de Mejoramiento y Seguimiento de Eficacia ({currentAudit.code})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tratamiento de causas raíz, compromisos con metas e indicadores y verificación del cierre de no conformidades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar en Excel (.csv)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewActionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Formular Nueva Acción de Mejora</span>
          </button>
        </div>
      </div>

      {/* Filter by Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            selectedStatusFilter === 'ALL'
              ? 'bg-white text-blue-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todas las Acciones ({planItems.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('EN_EJECUCION')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            selectedStatusFilter === 'EN_EJECUCION'
              ? 'bg-white text-amber-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          En Ejecución ({planItems.filter((i) => i.executionStatus === 'EN_EJECUCION').length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('IMPLEMENTADA')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            selectedStatusFilter === 'IMPLEMENTADA'
              ? 'bg-white text-blue-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Implementadas ({planItems.filter((i) => i.executionStatus === 'IMPLEMENTADA').length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatusFilter('VERIFICADA_EFICAZ')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            selectedStatusFilter === 'VERIFICADA_EFICAZ'
              ? 'bg-white text-emerald-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verificadas y Eficaces ({planItems.filter((i) => i.executionStatus === 'VERIFICADA_EFICAZ').length})
        </button>
      </div>

      {/* Plan Items List - Fully Editable In-Place */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all space-y-3.5"
          >
            {/* Header: Code, Problem & Status Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono-tabular font-extrabold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {item.code}
                </span>
                <EditableField
                  value={item.identifiedProblem}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'identifiedProblem', newVal)}
                  isEditMode={isEditMode}
                  className="text-sm font-bold text-slate-900"
                  label="Problema Identificado"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Estado:</span>
                <select
                  value={item.executionStatus}
                  onChange={(e) =>
                    handleStatusChange(item.id, e.target.value as ImprovementPlanItem['executionStatus'])
                  }
                  className="text-xs font-bold p-1 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                >
                  {Object.entries(EXECUTION_STATUS_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                  title="Eliminar acción"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Causa Raíz, Acción Correctiva & Preventiva - In-Place Editable */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 text-[10px] uppercase block mb-0.5">
                  Análisis de Causa Raíz (5 Porqués):
                </span>
                <EditableField
                  value={item.rootCause}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'rootCause', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  label="Causa Raíz"
                />
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900 text-[10px] uppercase block mb-0.5">
                  Acción Correctiva (Elimina el efecto):
                </span>
                <EditableField
                  value={item.correctiveAction}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'correctiveAction', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  label="Acción Correctiva"
                />
              </div>
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                <span className="font-bold text-emerald-900 text-[10px] uppercase block mb-0.5">
                  Acción Preventiva (Elimina la causa):
                </span>
                <EditableField
                  value={item.preventiveAction}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'preventiveAction', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  label="Acción Preventiva"
                />
              </div>
            </div>

            {/* Actividades e Indicadores - Editable */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div>
                <strong className="text-slate-900 text-[11px] block">Actividades por Desarrollar:</strong>
                <EditableField
                  value={item.plannedActivities}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'plannedActivities', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  label="Actividades Planificadas"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-slate-600 font-mono-tabular">
                <div>
                  <span className="text-[10px] block text-slate-400">Responsable de Ejecución:</span>
                  <EditableField
                    value={item.responsiblePerson}
                    onSave={(newVal) => handleUpdateItemField(item.id, 'responsiblePerson', newVal)}
                    isEditMode={isEditMode}
                    className="text-slate-900 font-bold font-sans"
                    label="Nombre del Responsable"
                  />
                </div>
                <div>
                  <span className="text-[10px] block text-slate-400">Plazo Límite:</span>
                  <EditableField
                    value={item.dueDate}
                    onSave={(newVal) => handleUpdateItemField(item.id, 'dueDate', newVal)}
                    isEditMode={isEditMode}
                    className="text-slate-900 font-bold"
                    label="Fecha Límite"
                  />
                </div>
                <div>
                  <span className="text-[10px] block text-slate-400">Indicador de Cumplimiento:</span>
                  <EditableField
                    value={item.complianceIndicator}
                    onSave={(newVal) => handleUpdateItemField(item.id, 'complianceIndicator', newVal)}
                    isEditMode={isEditMode}
                    className="text-blue-900 font-bold font-sans"
                    label="Indicador"
                  />
                </div>
                <div>
                  <span className="text-[10px] block text-slate-400">Meta:</span>
                  <EditableField
                    value={item.targetGoal}
                    onSave={(newVal) => handleUpdateItemField(item.id, 'targetGoal', newVal)}
                    isEditMode={isEditMode}
                    className="text-emerald-700 font-bold font-sans"
                    label="Meta Cuantitativa"
                  />
                </div>
              </div>
            </div>

            {/* Seguimiento de Eficacia */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-[11px]">Seguimiento:</span>
                <EditableField
                  value={item.followUpNotes}
                  onSave={(newVal) => handleUpdateItemField(item.id, 'followUpNotes', newVal)}
                  isEditMode={isEditMode}
                  className="italic text-slate-700"
                  label="Notas de Seguimiento"
                />
              </div>
              {getStatusBadge(item.executionStatus)}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Acción de Mejora */}
      {isNewActionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleAddNewAction}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Formular Propuesta de Plan de Mejoramiento</h3>
                <button
                  type="button"
                  onClick={() => setIsNewActionModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Vincular a Hallazgo / No Conformidad:
                  </label>
                  <select name="findingId" className="w-full p-2 border border-slate-300 rounded-lg">
                    {findings.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} - {f.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Problema Identificado:</label>
                  <input
                    name="identifiedProblem"
                    placeholder="Descripción resumida de la no conformidad..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Causa Raíz:</label>
                  <textarea
                    name="rootCause"
                    rows={2}
                    placeholder="¿Cuál es la causa primaria que originó el problema?"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Acción Correctiva:</label>
                    <textarea
                      name="correctiveAction"
                      rows={2}
                      placeholder="Solución inmediata..."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Acción Preventiva:</label>
                    <textarea
                      name="preventiveAction"
                      rows={2}
                      placeholder="Medida para evitar repetición..."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Actividades por Desarrollar:</label>
                  <input
                    name="plannedActivities"
                    placeholder="1. Readecuar formatos, 2. Capacitar equipo..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre del Responsable:</label>
                    <input
                      name="responsiblePerson"
                      defaultValue={currentCompany.legalRepresentative}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Recursos Necesarios:</label>
                    <input
                      name="requiredResources"
                      placeholder="Ej. Tiempo laboral, software, presupuesto"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha de Inicio:</label>
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha Límite:</label>
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Indicador de Cumplimiento:</label>
                    <input
                      name="complianceIndicator"
                      placeholder="% de actas bajo GTC 185"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Meta Cuantitativa:</label>
                    <input
                      name="targetGoal"
                      placeholder="100% de eficacia"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notas Iniciales de Seguimiento:</label>
                  <input
                    name="followUpNotes"
                    placeholder="Plan registrado en fecha de auditoría."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewActionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Guardar Acción de Mejora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
