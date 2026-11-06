/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  FileCheck,
  Calendar,
  Clock,
  Printer,
  Download,
  Shield,
  Layers,
  Wrench,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AuditPlan, AuditCriterion, AuditPlanScheduleItem, Company, AuditSession, CriterionCategory } from '../../types/audit';
import { EditableField } from '../common/EditableField';
import { exportToWord, printGtcDocument } from '../../utils/exportUtils';

interface AuditPlanModuleProps {
  plan: AuditPlan;
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdatePlan: (updatedPlan: AuditPlan) => void;
  onUpdateAudit?: (audit: AuditSession) => void;
  onUpdateCompany?: (comp: Company) => void;
}

const CATEGORY_NAMES: Record<CriterionCategory, string> = {
  NORMA_TECNICA: '1. Norma Técnica',
  NORMA_LEGAL: '2. Norma Legal',
  CARACTERIZACION_PROCESO: '3. Caracterización de Procesos',
  PROCEDIMIENTO_INTERNO: '4. Procedimiento Interno',
  DOCUMENTOS_PLANES: '5. Documentos y Planes',
  CONDICIONES_ORDEN_LIMPIEZA: '6. Condiciones de Limpieza y Orden (5S)',
};

export const AuditPlanModule: React.FC<AuditPlanModuleProps> = ({
  plan,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdatePlan,
  onUpdateAudit,
  onUpdateCompany,
}) => {
  const [formData, setFormData] = useState<AuditPlan>(plan);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [isNewCriterionModalOpen, setIsNewCriterionModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);
  const [newResponsibleInput, setNewResponsibleInput] = useState('');

  React.useEffect(() => {
    setFormData(plan);
  }, [plan]);

  const handleSavePlan = () => {
    onUpdatePlan(formData);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const handleRemoveCriterion = (id: string) => {
    const updated = {
      ...formData,
      criteria: formData.criteria.filter((c) => c.id !== id),
    };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleUpdateCriterion = (id: string, field: keyof AuditCriterion, val: string) => {
    const updated = {
      ...formData,
      criteria: formData.criteria.map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleRemoveScheduleItem = (id: string) => {
    const updated = {
      ...formData,
      scheduleItems: formData.scheduleItems.filter((s) => s.id !== id),
    };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleUpdateScheduleItem = (id: string, field: keyof AuditPlanScheduleItem, val: string) => {
    const updated = {
      ...formData,
      scheduleItems: formData.scheduleItems.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleAddResponsible = () => {
    if (!newResponsibleInput.trim()) return;
    const updated = {
      ...formData,
      responsibles: [...formData.responsibles, newResponsibleInput.trim()],
    };
    setFormData(updated);
    onUpdatePlan(updated);
    setNewResponsibleInput('');
  };

  const handleUpdateResponsible = (index: number, newVal: string) => {
    const updatedResp = [...formData.responsibles];
    updatedResp[index] = newVal;
    const updated = { ...formData, responsibles: updatedResp };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleRemoveResponsible = (index: number) => {
    const updated = {
      ...formData,
      responsibles: formData.responsibles.filter((_, i) => i !== index),
    };
    setFormData(updated);
    onUpdatePlan(updated);
  };

  const handleAddCriterion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newCriterion: AuditCriterion = {
      id: `crit-${Date.now()}`,
      category: elements.category.value as CriterionCategory,
      name: elements.name.value,
      identificationCode: elements.identificationCode.value,
      version: elements.version.value,
      effectiveDate: elements.effectiveDate.value,
      applicableRequirement: elements.applicableRequirement.value,
      description: elements.description.value,
    };

    const updated = {
      ...formData,
      criteria: [...formData.criteria, newCriterion],
    };
    setFormData(updated);
    onUpdatePlan(updated);
    setIsNewCriterionModalOpen(false);
  };

  const handleAddActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newItem: AuditPlanScheduleItem = {
      id: `sch-${Date.now()}`,
      date: elements.date.value,
      time: elements.time.value,
      activity: elements.activity.value,
      process: elements.process.value,
      auditor: elements.auditor.value,
      auditee: elements.auditee.value,
      resources: elements.resources.value,
      gatheringTechnique: elements.gatheringTechnique.value,
    };

    const updated = {
      ...formData,
      scheduleItems: [...formData.scheduleItems, newItem],
    };
    setFormData(updated);
    onUpdatePlan(updated);
    setIsNewActivityModalOpen(false);
  };

  const handleExportWord = () => {
    const criteriaHtml = formData.criteria
      .map(
        (c) =>
          `<li><strong>${CATEGORY_NAMES[c.category]}:</strong> ${c.name} (${c.identificationCode} v.${c.version}) - Vigencia: ${c.effectiveDate}. Requisito: ${c.applicableRequirement}</li>`
      )
      .join('');

    const scheduleHtml = formData.scheduleItems
      .map(
        (s) =>
          `<tr><td>${s.time}</td><td>${s.activity}</td><td>${s.process}</td><td>${s.auditor}</td><td>${s.auditee}</td><td>${s.gatheringTechnique}</td></tr>`
      )
      .join('');

    const content = `
      <h1>PLAN DE AUDITORÍA INTERNA INTEGRAL</h1>
      <p><strong>CÓDIGO DE AUDITORÍA:</strong> ${currentAudit.code}</p>
      <p><strong>OBJETIVO:</strong> ${formData.objective}</p>
      <p><strong>ALCANCE:</strong> ${formData.scope}</p>
      <h2>CRITERIOS DE AUDITORÍA APLICABLES</h2>
      <ul>${criteriaHtml}</ul>
      <h2>CRONOGRAMA Y ACTIVIDADES DE AUDITORÍA</h2>
      <table border="1">
        <thead>
          <tr><th>Horario</th><th>Actividad</th><th>Proceso</th><th>Auditor</th><th>Auditado</th><th>Técnica</th></tr>
        </thead>
        <tbody>${scheduleHtml}</tbody>
      </table>
      <h2>RECURSOS Y TÉCNICAS</h2>
      <p><strong>Recursos:</strong> ${formData.necessaryResources.join(', ')}</p>
      <p><strong>Técnicas:</strong> ${formData.gatheringTechniques.join(', ')}</p>
      <p><strong>Responsables Designados:</strong> ${formData.responsibles.join('; ')}</p>
    `;

    exportToWord('Plan_de_Auditoria_GTC185', content, currentCompany.name, currentCompany.nit, currentAudit.code);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Módulo 2 · Plan de Auditoría Automatizado</span>
            <span className="text-slate-400">·</span>
            <span>Edición de Responsables, Criterios y Horarios</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Plan Oficial de Auditoría ({currentAudit.code})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cualquier nombre de responsable, auditor, auditado, norma o actividad puede ser editado in situ.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Descargar en Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={printGtcDocument}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Plan</span>
          </button>
        </div>
      </div>

      {/* Objetivo & Alcance Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-sm font-bold text-slate-900">Objetivo y Alcance del Plan</h2>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Estado: {formData.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Objetivo del Plan de Auditoría:</label>
            <EditableField
              value={formData.objective}
              onSave={(newVal) => {
                const updated = { ...formData, objective: newVal };
                setFormData(updated);
                onUpdatePlan(updated);
                if (onUpdateAudit) onUpdateAudit({ ...currentAudit, objective: newVal });
              }}
              isEditMode={isEditMode}
              multiline
              label="Objetivo del Plan"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Alcance Específico:</label>
            <EditableField
              value={formData.scope}
              onSave={(newVal) => {
                const updated = { ...formData, scope: newVal };
                setFormData(updated);
                onUpdatePlan(updated);
                if (onUpdateAudit) onUpdateAudit({ ...currentAudit, scope: newVal });
              }}
              isEditMode={isEditMode}
              multiline
              label="Alcance Específico"
            />
          </div>
        </div>

        {/* RESPONSABLES DEL PLAN (Totalmente Editables) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Líderes y Responsables del Proceso (Editables):</span>
            </label>
            <span className="text-[10px] text-slate-400">Haga clic sobre cualquier responsable para modificarlo</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {formData.responsibles.map((resp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
              >
                <EditableField
                  value={resp}
                  onSave={(newVal) => handleUpdateResponsible(idx, newVal)}
                  isEditMode={isEditMode}
                  className="font-semibold text-slate-800"
                  label="Nombre del Responsable"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveResponsible(idx)}
                  className="p-0.5 text-slate-400 hover:text-red-600 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Input para agregar responsable */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="Nombre y cargo del nuevo responsable..."
              value={newResponsibleInput}
              onChange={(e) => setNewResponsibleInput(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg flex-1"
            />
            <button
              type="button"
              onClick={handleAddResponsible}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shrink-0"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {/* CRITERIOS DE AUDITORÍA (6 Categorías Exigidas - In-Place Editable) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Criterios de Auditoría Configurables ({formData.criteria.length} Criterios)</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Normas técnicas con identificación, versión y fecha de vigencia oficial.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsNewCriterionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Criterio / Norma</span>
          </button>
        </div>

        {/* Grid de Criterios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {formData.criteria.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {CATEGORY_NAMES[c.category]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar criterio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mb-1">
                  <EditableField
                    value={c.name}
                    onSave={(newVal) => handleUpdateCriterion(c.id, 'name', newVal)}
                    isEditMode={isEditMode}
                    className="text-xs font-bold text-slate-900"
                    label="Nombre de la Norma"
                  />
                </div>

                <div className="text-[11px] font-mono-tabular text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    Código:{' '}
                    <EditableField
                      value={c.identificationCode}
                      onSave={(newVal) => handleUpdateCriterion(c.id, 'identificationCode', newVal)}
                      isEditMode={isEditMode}
                      className="text-slate-900 font-bold"
                      label="Código"
                    />
                  </span>
                  <span>
                    Versión:{' '}
                    <EditableField
                      value={c.version}
                      onSave={(newVal) => handleUpdateCriterion(c.id, 'version', newVal)}
                      isEditMode={isEditMode}
                      className="text-slate-900 font-bold"
                      label="Versión"
                    />
                  </span>
                  <span>
                    Vigencia:{' '}
                    <EditableField
                      value={c.effectiveDate}
                      onSave={(newVal) => handleUpdateCriterion(c.id, 'effectiveDate', newVal)}
                      isEditMode={isEditMode}
                      className="text-slate-900 font-bold"
                      label="Fecha de Vigencia"
                    />
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                  <span className="font-semibold text-slate-800 block text-[10px] uppercase">Requisito Aplicable:</span>
                  <EditableField
                    value={c.applicableRequirement}
                    onSave={(newVal) => handleUpdateCriterion(c.id, 'applicableRequirement', newVal)}
                    isEditMode={isEditMode}
                    multiline
                    label="Requisito Aplicable"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CRONOGRAMA Y ACTIVIDADES DE AUDITORÍA - In-Place Editable */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Cronograma de Actividades (Auditores y Auditados Editables)</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Horarios, procesos, auditores, auditados y técnicas de recolección de información.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsNewActivityModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Sesión de Auditoría</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fecha y Horario</th>
                <th className="py-2.5 px-3">Actividad / Enfoque</th>
                <th className="py-2.5 px-3">Proceso</th>
                <th className="py-2.5 px-3">Auditor Responsable</th>
                <th className="py-2.5 px-3">Auditado(s)</th>
                <th className="py-2.5 px-3">Técnica de Recolección</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.scheduleItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono-tabular font-bold text-blue-900 whitespace-nowrap">
                    <div>
                      <EditableField
                        value={item.date}
                        onSave={(newVal) => handleUpdateScheduleItem(item.id, 'date', newVal)}
                        isEditMode={isEditMode}
                        label="Fecha"
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      <EditableField
                        value={item.time}
                        onSave={(newVal) => handleUpdateScheduleItem(item.id, 'time', newVal)}
                        isEditMode={isEditMode}
                        label="Horario"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs">
                    <EditableField
                      value={item.activity}
                      onSave={(newVal) => handleUpdateScheduleItem(item.id, 'activity', newVal)}
                      isEditMode={isEditMode}
                      multiline
                      label="Actividad"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                    <EditableField
                      value={item.process}
                      onSave={(newVal) => handleUpdateScheduleItem(item.id, 'process', newVal)}
                      isEditMode={isEditMode}
                      label="Proceso"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <EditableField
                      value={item.auditor}
                      onSave={(newVal) => handleUpdateScheduleItem(item.id, 'auditor', newVal)}
                      isEditMode={isEditMode}
                      className="font-bold text-slate-900"
                      label="Auditor"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <EditableField
                      value={item.auditee}
                      onSave={(newVal) => handleUpdateScheduleItem(item.id, 'auditee', newVal)}
                      isEditMode={isEditMode}
                      className="font-medium text-blue-900"
                      label="Auditado(s)"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 italic">
                    <EditableField
                      value={item.gatheringTechnique}
                      onSave={(newVal) => handleUpdateScheduleItem(item.id, 'gatheringTechnique', newVal)}
                      isEditMode={isEditMode}
                      label="Técnica de Recolección"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Criterio */}
      {isNewCriterionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleAddCriterion}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Agregar Criterio de Auditoría</h3>
                <button
                  type="button"
                  onClick={() => setIsNewCriterionModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría del Criterio:</label>
                  <select name="category" className="w-full p-2 border border-slate-300 rounded-lg font-medium">
                    {Object.entries(CATEGORY_NAMES).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Criterio / Norma:</label>
                  <input
                    name="name"
                    placeholder="Ej. NTC-ISO 14001:2015 Sistemas de Gestión Ambiental"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Identificación / Código:</label>
                    <input
                      name="identificationCode"
                      placeholder="ISO 14001:2015"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Versión Oficial:</label>
                    <input
                      name="version"
                      placeholder="Versión 2015"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha de Vigencia:</label>
                    <input
                      name="effectiveDate"
                      type="date"
                      defaultValue="2015-09-15"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Requisito Aplicable:</label>
                  <input
                    name="applicableRequirement"
                    placeholder="Ej. Numeral 6.1 Acciones para abordar aspectos ambientales significativos"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Descripción del Alcance del Criterio:</label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Detalles sobre cómo se verificará en la empresa."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCriterionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Guardar Criterio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Actividad */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleAddActivity}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Agregar Sesión al Cronograma</h3>
                <button
                  type="button"
                  onClick={() => setIsNewActivityModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha:</label>
                    <input
                      name="date"
                      type="date"
                      defaultValue={currentAudit.executionDate}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Horario (Inicio - Fin):</label>
                    <input
                      name="time"
                      placeholder="09:00 - 10:30"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Actividad / Enfoque:</label>
                  <input
                    name="activity"
                    placeholder="Ej. Auditoría a Control de Calidad y Ensayos"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proceso Involucrado:</label>
                  <input
                    name="process"
                    placeholder="Ej. Aseguramiento de Calidad"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Auditor Responsable:</label>
                    <input
                      name="auditor"
                      defaultValue={currentAudit.auditorName}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Auditado(s):</label>
                    <input
                      name="auditee"
                      placeholder="Líder del proceso y analistas"
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Técnica de Recolección:</label>
                  <select name="gatheringTechnique" className="w-full p-2 border border-slate-300 rounded-lg">
                    <option value="Entrevistas directas y muestreo documental">Entrevistas directas y muestreo documental</option>
                    <option value="Inspección física en sitio y verificación metrológica">Inspección física en sitio y verificación metrológica</option>
                    <option value="Revisión documental técnica contra norma GTC 185">Revisión documental técnica contra norma GTC 185</option>
                    <option value="Muestreo estadístico representativo de registros">Muestreo estadístico representativo de registros</option>
                    <option value="Comprobación en software ERP / bases de datos">Comprobación en software ERP / bases de datos</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recursos Necesarios:</label>
                  <input
                    name="resources"
                    placeholder="Ej. Sala de reuniones, acceso a ERP, EPP de planta"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewActivityModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Agregar al Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
