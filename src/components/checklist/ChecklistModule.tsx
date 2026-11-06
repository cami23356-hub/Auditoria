/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  AlertTriangle,
  Camera,
  FileText,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ChecklistItem, ComplianceStatus, AuditFinding, Company, AuditSession } from '../../types/audit';
import { exportToExcel } from '../../utils/exportUtils';
import { EditableField } from '../common/EditableField';

interface ChecklistModuleProps {
  checklist: ChecklistItem[];
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdateChecklist: (updatedList: ChecklistItem[]) => void;
  onOpenFindingFormForNonCompliance: (item: ChecklistItem) => void;
}

export const ChecklistModule: React.FC<ChecklistModuleProps> = ({
  checklist,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdateChecklist,
  onOpenFindingFormForNonCompliance,
}) => {
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('ALL');
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [globalResponsibleModalOpen, setGlobalResponsibleModalOpen] = useState(false);
  const [batchResponsibleName, setBatchResponsibleName] = useState('');

  // Unique processes list
  const processes = Array.from(new Set(checklist.map((c) => c.processName)));

  const filteredItems = checklist.filter((item) => {
    return selectedProcessFilter === 'ALL' || item.processName === selectedProcessFilter;
  });

  const handleStatusChange = (item: ChecklistItem, newStatus: ComplianceStatus) => {
    const updated = checklist.map((c) => (c.id === item.id ? { ...c, compliance: newStatus } : c));
    onUpdateChecklist(updated);

    // TRIGGER AUTOMÁTICO EXIGIDO:
    if (newStatus === 'NO_CUMPLE' || newStatus === 'CUMPLE_PARCIALMENTE') {
      onOpenFindingFormForNonCompliance({
        ...item,
        compliance: newStatus,
      });
    }
  };

  const handleFieldChange = (itemId: string, field: keyof ChecklistItem, value: any) => {
    const updated = checklist.map((c) => (c.id === itemId ? { ...c, [field]: value } : c));
    onUpdateChecklist(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = checklist.filter((c) => c.id !== id);
    onUpdateChecklist(updated);
  };

  const handleBatchUpdateResponsible = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchResponsibleName.trim()) return;
    const updated = checklist.map((c) => {
      if (selectedProcessFilter === 'ALL' || c.processName === selectedProcessFilter) {
        return { ...c, responsiblePerson: batchResponsibleName.trim() };
      }
      return c;
    });
    onUpdateChecklist(updated);
    setGlobalResponsibleModalOpen(false);
    setBatchResponsibleName('');
  };

  const handleAddNewQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      auditId: currentAudit.id,
      processName: elements.processName.value,
      questionNumber: checklist.length + 1,
      question: elements.question.value,
      criterionReference: elements.criterionReference.value,
      compliance: 'PENDIENTE',
      observations: '',
      evidenceFound: '',
      reviewedDocuments: '',
      attachedPhotos: [],
      responsiblePerson: elements.responsiblePerson.value || currentAudit.auditorName,
      verificationDate: currentAudit.executionDate,
    };

    const updated = [...checklist, newItem];
    onUpdateChecklist(updated);
    setIsNewQuestionModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const targetItem = checklist.find((c) => c.id === itemId);
      if (targetItem) {
        const updatedPhotos = [...(targetItem.attachedPhotos || []), dataUrl];
        handleFieldChange(itemId, 'attachedPhotos', updatedPhotos);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportExcel = () => {
    const headers = [
      'No.',
      'Proceso',
      'Pregunta de Verificación',
      'Criterio / Norma GTC 185 / ISO',
      'Estado de Conformidad',
      'Observaciones',
      'Evidencias Objetivas',
      'Documentos Revisados',
      'Responsable',
      'Fecha',
    ];

    const rows = checklist.map((c) => [
      c.questionNumber,
      c.processName,
      c.question,
      c.criterionReference,
      c.compliance,
      c.observations,
      c.evidenceFound,
      c.reviewedDocuments,
      c.responsiblePerson,
      c.verificationDate,
    ]);

    exportToExcel(`Lista_Chequeo_${currentAudit.code}`, headers, rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Módulo 4 · Lista de Chequeo Interactiva</span>
            <span className="text-slate-400">·</span>
            <span>Edición Total de Preguntas, Criterios y Responsables</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Lista de Verificación de Procesos ({currentAudit.code})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Califique cada requisito. Cualquier nombre de responsable, pregunta o norma es editable directamente en la página.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setGlobalResponsibleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="Asignar un responsable a varios ítems al mismo tiempo"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Asignar Responsable en Lote</span>
          </button>
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
            onClick={() => setIsNewQuestionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Pregunta Personalizada</span>
          </button>
        </div>
      </div>

      {/* Filter by Process */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
        <span className="text-slate-500 font-semibold px-2 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar Proceso:
        </span>
        <button
          type="button"
          onClick={() => setSelectedProcessFilter('ALL')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            selectedProcessFilter === 'ALL'
              ? 'bg-white text-blue-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todos los Procesos ({checklist.length})
        </button>
        {processes.map((proc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedProcessFilter(proc)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedProcessFilter === proc
                ? 'bg-white text-blue-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {proc} ({checklist.filter((c) => c.processName === proc).length})
          </button>
        ))}
      </div>

      {/* Checklist Items Cards */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all bg-white shadow-xs ${
                item.compliance === 'NO_CUMPLE'
                  ? 'border-red-300 ring-1 ring-red-200'
                  : item.compliance === 'CUMPLE_PARCIALMENTE'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : item.compliance === 'CUMPLE'
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header: Process, Criterion & Actions - All Editable */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono-tabular font-bold text-xs flex items-center justify-center shrink-0">
                    {item.questionNumber}
                  </span>
                  <EditableField
                    value={item.processName}
                    onSave={(newVal) => handleFieldChange(item.id, 'processName', newVal)}
                    isEditMode={isEditMode}
                    className="text-xs font-bold text-blue-900"
                    label="Nombre del Proceso"
                  />
                  <span className="text-slate-400">·</span>
                  <EditableField
                    value={item.criterionReference}
                    onSave={(newVal) => handleFieldChange(item.id, 'criterionReference', newVal)}
                    isEditMode={isEditMode}
                    className="text-xs text-slate-500 font-mono-tabular font-medium"
                    label="Criterio / Norma Técnica"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {item.findingId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Hallazgo Vinculado
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text - Editable */}
              <div className="mt-3">
                <EditableField
                  value={item.question}
                  onSave={(newQ) => handleFieldChange(item.id, 'question', newQ)}
                  isEditMode={isEditMode}
                  className="text-sm font-semibold text-slate-900 leading-snug"
                  label="Texto de la Pregunta"
                  multiline
                />
              </div>

              {/* Compliance Options Bar (4 Opciones Obligatorias) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 mr-2">Calificación:</span>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item, 'CUMPLE')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                    item.compliance === 'CUMPLE'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cumple</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item, 'CUMPLE_PARCIALMENTE')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                    item.compliance === 'CUMPLE_PARCIALMENTE'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cumple Parcialmente</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item, 'NO_CUMPLE')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                    item.compliance === 'NO_CUMPLE'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>No Cumple</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(item, 'NO_APLICA')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                    item.compliance === 'NO_APLICA'
                      ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>No Aplica</span>
                </button>
              </div>

              {/* Observations, Evidence, Reviewed Docs Form */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Observaciones In Situ:</label>
                  <textarea
                    rows={2}
                    value={item.observations}
                    onChange={(e) => handleFieldChange(item.id, 'observations', e.target.value)}
                    placeholder="Detalles de la comprobación ocular o técnica..."
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Evidencias Encontradas:</label>
                  <textarea
                    rows={2}
                    value={item.evidenceFound}
                    onChange={(e) => handleFieldChange(item.id, 'evidenceFound', e.target.value)}
                    placeholder="Registros, lotes, condiciones físicas verificadas..."
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Documentos Revisados:</label>
                  <textarea
                    rows={2}
                    value={item.reviewedDocuments}
                    onChange={(e) => handleFieldChange(item.id, 'reviewedDocuments', e.target.value)}
                    placeholder="Actas GTC 185, certificados, procedimientos..."
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Footer: Responsable EDITABLE, Date EDITABLE and Photos */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-600 font-mono-tabular">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Responsable:</span>
                    <EditableField
                      value={item.responsiblePerson}
                      onSave={(newResp) => handleFieldChange(item.id, 'responsiblePerson', newResp)}
                      isEditMode={isEditMode}
                      className="font-bold text-slate-900 font-sans"
                      label="Nombre del Responsable"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Fecha Verificación:</span>
                    <EditableField
                      value={item.verificationDate}
                      onSave={(newDate) => handleFieldChange(item.id, 'verificationDate', newDate)}
                      isEditMode={isEditMode}
                      className="font-bold text-slate-800"
                      label="Fecha de Verificación"
                    />
                  </div>
                </div>

                {/* Photo Attachments */}
                <div className="flex items-center gap-2">
                  {item.attachedPhotos && item.attachedPhotos.length > 0 && (
                    <div className="flex items-center gap-1">
                      {item.attachedPhotos.map((photo, pIdx) => (
                        <img
                          key={pIdx}
                          src={photo}
                          alt="Evidencia"
                          className="w-7 h-7 object-cover rounded border border-slate-300"
                        />
                      ))}
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-blue-700" />
                    <span>Adjuntar Foto Evidencia</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, item.id)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Asignar Responsable en Lote */}
      {globalResponsibleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleBatchUpdateResponsible}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Asignar Responsable a Preguntas</h3>
                <button
                  type="button"
                  onClick={() => setGlobalResponsibleModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <p className="text-slate-600">
                  Esta acción actualizará el nombre del responsable en todas las preguntas{' '}
                  {selectedProcessFilter === 'ALL'
                    ? 'de la lista de chequeo.'
                    : `del proceso "${selectedProcessFilter}".`}
                </p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre y Cargo del Responsable:</label>
                  <input
                    type="text"
                    value={batchResponsibleName}
                    onChange={(e) => setBatchResponsibleName(e.target.value)}
                    placeholder="Ej. Ing. Roberto Samper (Líder de Producción)"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGlobalResponsibleModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Aplicar a Todos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Pregunta Personalizada */}
      {isNewQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleAddNewQuestion}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Crear Pregunta de Verificación Personalizada</h3>
                <button
                  type="button"
                  onClick={() => setIsNewQuestionModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Área o Proceso a Evaluar:</label>
                  <input
                    name="processName"
                    defaultValue={selectedProcessFilter !== 'ALL' ? selectedProcessFilter : 'Gestión de Calidad'}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pregunta / Requisito a Verificar:</label>
                  <textarea
                    name="question"
                    rows={3}
                    placeholder="¿La organización cumple con...?"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Referencia Normativa (GTC 185 / ISO / Decreto):</label>
                  <input
                    name="criterionReference"
                    placeholder="Ej. GTC 185 Numeral 5.2 - Estructura de Actas"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Responsable:</label>
                  <input
                    name="responsiblePerson"
                    defaultValue={currentAudit.auditorName}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuestionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Guardar Pregunta en Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
