/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Download,
  ShieldAlert,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  X,
  Edit2,
  FileSpreadsheet,
  Check,
  Search,
} from 'lucide-react';
import {
  AuditFinding,
  FindingClassification,
  Company,
  AuditSession,
  FindingEvidencePhoto,
} from '../../types/audit';
import { exportFindingsToExcel } from '../../utils/exportUtils';
import { EditableField } from '../common/EditableField';

interface FindingsModuleProps {
  findings: AuditFinding[];
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdateFindings: (updatedFindings: AuditFinding[]) => void;
  initialOpenModalWithItem?: AuditFinding | null;
  onCloseInitialModal?: () => void;
}

const CLASSIFICATION_LABELS: Record<FindingClassification, string> = {
  NO_CONFORMIDAD_MAYOR: 'No Conformidad Mayor',
  NO_CONFORMIDAD_MENOR: 'No Conformidad Menor',
  OBSERVACION: 'Observación',
  OPORTUNIDAD_MEJORA: 'Oportunidad de Mejora',
};

export const FindingsModule: React.FC<FindingsModuleProps> = ({
  findings,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdateFindings,
  initialOpenModalWithItem,
  onCloseInitialModal,
}) => {
  const [selectedClassificationFilter, setSelectedClassificationFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingFinding, setEditingFinding] = useState<AuditFinding | null>(
    initialOpenModalWithItem || null
  );

  // Lightbox modal for full-size photo preview
  const [activePhotoModal, setActivePhotoModal] = useState<{
    photo: FindingEvidencePhoto;
    findingId: string;
  } | null>(null);

  // Hidden file input refs for card-level photo upload
  const fileInputRefMap = useRef<Record<string, HTMLInputElement | null>>({});

  React.useEffect(() => {
    if (initialOpenModalWithItem) {
      setEditingFinding(initialOpenModalWithItem);
    }
  }, [initialOpenModalWithItem]);

  const filteredFindings = findings.filter((f) => {
    const matchesFilter =
      selectedClassificationFilter === 'ALL' || f.classification === selectedClassificationFilter;
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.questionA_weakness.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.responsibleArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateFindingField = (id: string, field: keyof AuditFinding, value: any) => {
    const updated = findings.map((f) => (f.id === id ? { ...f, [field]: value } : f));
    onUpdateFindings(updated);
  };

  const handleSaveFinding = (findingToSave: AuditFinding) => {
    const exists = findings.some((f) => f.id === findingToSave.id);
    let updated: AuditFinding[];
    if (exists) {
      updated = findings.map((f) => (f.id === findingToSave.id ? findingToSave : f));
    } else {
      updated = [findingToSave, ...findings];
    }
    onUpdateFindings(updated);
    setEditingFinding(null);
    if (onCloseInitialModal) onCloseInitialModal();
  };

  const handleRemoveFinding = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este hallazgo y sus evidencias fotográficas?')) {
      const updated = findings.filter((f) => f.id !== id);
      onUpdateFindings(updated);
    }
  };

  // Add photo to a specific finding via File input
  const handleUploadPhoto = (findingId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newPhoto: FindingEvidencePhoto = {
        id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: dataUrl,
        caption: `Evidencia fotográfica: ${file.name.replace(/\.[^/.]+$/, '')}`,
        uploadedAt: new Date().toISOString(),
        fileSizeBytes: file.size,
      };

      const updated = findings.map((f) => {
        if (f.id === findingId) {
          const existingPhotos = f.attachedPhotos || [];
          return {
            ...f,
            attachedPhotos: [...existingPhotos, newPhoto],
          };
        }
        return f;
      });

      onUpdateFindings(updated);

      // Also update in editing modal state if currently open
      if (editingFinding && editingFinding.id === findingId) {
        setEditingFinding({
          ...editingFinding,
          attachedPhotos: [...(editingFinding.attachedPhotos || []), newPhoto],
        });
      }
    };

    reader.readAsDataURL(file);
    // Reset file input value so same file can be uploaded again if needed
    event.target.value = '';
  };

  const handleDeletePhoto = (findingId: string, photoId: string) => {
    if (window.confirm('¿Desea eliminar esta fotografía de evidencia?')) {
      const updated = findings.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            attachedPhotos: (f.attachedPhotos || []).filter((p) => p.id !== photoId),
          };
        }
        return f;
      });
      onUpdateFindings(updated);

      if (editingFinding && editingFinding.id === findingId) {
        setEditingFinding({
          ...editingFinding,
          attachedPhotos: (editingFinding.attachedPhotos || []).filter((p) => p.id !== photoId),
        });
      }

      if (activePhotoModal?.photo.id === photoId) {
        setActivePhotoModal(null);
      }
    }
  };

  const handleUpdatePhotoCaption = (findingId: string, photoId: string, newCaption: string) => {
    const updated = findings.map((f) => {
      if (f.id === findingId) {
        return {
          ...f,
          attachedPhotos: (f.attachedPhotos || []).map((p) =>
            p.id === photoId ? { ...p, caption: newCaption } : p
          ),
        };
      }
      return f;
    });
    onUpdateFindings(updated);

    if (activePhotoModal && activePhotoModal.photo.id === photoId) {
      setActivePhotoModal({
        ...activePhotoModal,
        photo: { ...activePhotoModal.photo, caption: newCaption },
      });
    }
  };

  const handleExportExcelWithPhotos = () => {
    exportFindingsToExcel(currentCompany.name, currentCompany.nit, currentAudit.code, findings);
  };

  const getClassificationBadge = (cls: FindingClassification) => {
    switch (cls) {
      case 'NO_CONFORMIDAD_MAYOR':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-700" />
            No Conformidad Mayor
          </span>
        );
      case 'NO_CONFORMIDAD_MENOR':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-amber-700" />
            No Conformidad Menor
          </span>
        );
      case 'OBSERVACION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-700" />
            Observación
          </span>
        );
      case 'OPORTUNIDAD_MEJORA':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Oportunidad de Mejora
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
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Módulo 5 · Registro y Análisis de Hallazgos</span>
            <span className="text-slate-400">·</span>
            <span>Evidencia Fotográfica + Exportación a Excel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestión Integral de Hallazgos ({currentAudit.code})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Protocolo de 5 preguntas (A a E), carga de fotografías como evidencia objetiva y exportación con imágenes incrustadas a Excel (.xls).
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcelWithPhotos}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Genera un archivo Excel (.xls) enriquecido con encabezados GTC 185, columnas A-E e imágenes incrustadas"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Guardar en Excel con Fotos (.xls)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const codePrefix = 'HAL';
              const newCode = `${codePrefix}-${String(findings.length + 1).padStart(3, '0')}`;
              setEditingFinding({
                id: `hal-${Date.now()}`,
                auditId: currentAudit.id,
                code: newCode,
                title: '',
                questionA_weakness: '',
                questionB_processStage: '',
                questionC_standardViolated: 'GTC 185:2009 / ISO 9001:2015',
                questionD_consequences: '',
                questionE_solution: '',
                detailedDescription: '',
                objectiveEvidence: '',
                responsibleArea: 'Operaciones y Producción',
                responsiblePerson: currentCompany.legalRepresentative,
                classification: 'NO_CONFORMIDAD_MENOR',
                identificationDate: currentAudit.executionDate,
                attachedPhotos: [],
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Hallazgo Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-100 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-600 px-2 uppercase">Filtrar:</span>
          {(['ALL', 'NO_CONFORMIDAD_MAYOR', 'NO_CONFORMIDAD_MENOR', 'OBSERVACION', 'OPORTUNIDAD_MEJORA'] as const).map(
            (cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassificationFilter(cls)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  selectedClassificationFilter === cls
                    ? 'bg-blue-700 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cls === 'ALL' ? `Todos (${findings.length})` : CLASSIFICATION_LABELS[cls]}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, debilidad, área..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Findings Count Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-red-800">No Conformidades Mayores</div>
            <div className="text-xl font-extrabold text-red-900 mt-0.5">
              {findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MAYOR').length}
            </div>
          </div>
          <ShieldAlert className="w-6 h-6 text-red-600 opacity-80" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-amber-800">No Conformidades Menores</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MENOR').length}
            </div>
          </div>
          <AlertOctagon className="w-6 h-6 text-amber-600 opacity-80" />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-blue-800">Observaciones</div>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">
              {findings.filter((f) => f.classification === 'OBSERVACION').length}
            </div>
          </div>
          <Clock className="w-6 h-6 text-blue-600 opacity-80" />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-800">Oportunidades de Mejora</div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
              {findings.filter((f) => f.classification === 'OPORTUNIDAD_MEJORA').length}
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600 opacity-80" />
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-5">
        {filteredFindings.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No se encontraron hallazgos con los filtros seleccionados.</p>
            <p className="text-xs text-slate-400 mt-1">Cree un nuevo hallazgo o modifique la búsqueda.</p>
          </div>
        )}

        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-colors"
          >
            {/* Header: Code, Title, Classification & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                  {finding.code}
                </span>
                {getClassificationBadge(finding.classification)}
                <EditableField
                  value={finding.title}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'title', newVal)}
                  isEditMode={isEditMode}
                  className="font-bold text-slate-900 text-sm sm:text-base"
                  label="Título del Hallazgo"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Upload Photo Button */}
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputRefMap.current[finding.id] = el;
                  }}
                  onChange={(e) => handleUploadPhoto(finding.id, e)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefMap.current[finding.id]?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Subir fotografía de evidencia in situ para este hallazgo"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subir Foto Evidencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingFinding(finding)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Editar todos los campos de este hallazgo en ventana completa"
                >
                  <Edit2 className="w-3 h-3 text-slate-600" />
                  <span>Editar Hallazgo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveFinding(finding.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar hallazgo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Questions A to E Matrix (Protocolo ISO 19011) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 uppercase text-[10px]">
                    A. ¿Cuál es la debilidad o problema encontrado?
                  </span>
                </div>
                <EditableField
                  value={finding.questionA_weakness}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'questionA_weakness', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  className="text-slate-800"
                  label="Debilidad o Problema Encontrado"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block uppercase text-[10px]">
                  B. ¿En qué parte del proceso ocurre o se identificó?
                </span>
                <EditableField
                  value={finding.questionB_processStage}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'questionB_processStage', newVal)}
                  isEditMode={isEditMode}
                  className="text-slate-800 font-medium"
                  label="Etapa o Parte del Proceso"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block uppercase text-[10px]">
                  C. Norma, Requisito o Criterio Incumplido:
                </span>
                <EditableField
                  value={finding.questionC_standardViolated}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'questionC_standardViolated', newVal)}
                  isEditMode={isEditMode}
                  className="text-blue-900 font-semibold"
                  label="Norma o Criterio Incumplido"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block uppercase text-[10px]">
                  D. Consecuencias Actuales y Futuras (Impacto):
                </span>
                <EditableField
                  value={finding.questionD_consequences}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'questionD_consequences', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  className="text-slate-800"
                  label="Consecuencias"
                />
              </div>
            </div>

            {/* Question E (Solution) */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-emerald-900 block uppercase text-[10px]">
                E. Solución Propuesta para Subsanar el Incumplimiento (Acción Correctiva):
              </span>
              <EditableField
                value={finding.questionE_solution}
                onSave={(newVal) => handleUpdateFindingField(finding.id, 'questionE_solution', newVal)}
                isEditMode={isEditMode}
                multiline
                className="text-emerald-950 font-medium"
                label="Solución Propuesta"
              />
            </div>

            {/* SECTION: Photographic Evidences Attached */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Evidencias Fotográficas de Campo ({finding.attachedPhotos?.length || 0})</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    · Se guardan e incrustan en el Excel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRefMap.current[finding.id]?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir otra foto</span>
                </button>
              </div>

              {(!finding.attachedPhotos || finding.attachedPhotos.length === 0) ? (
                <div className="py-3 px-4 bg-white rounded-md border border-dashed border-slate-300 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4 text-slate-300" />
                  <span>Sin fotografías de evidencia adjuntas aún.</span>
                  <button
                    type="button"
                    onClick={() => fileInputRefMap.current[finding.id]?.click()}
                    className="text-blue-700 font-bold underline hover:text-blue-800 cursor-pointer ml-1"
                  >
                    Subir fotografía ahora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                  {finding.attachedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePhotoModal({ photo, findingId: finding.id })}
                            className="p-1.5 bg-white text-slate-900 rounded-md hover:bg-slate-100 shadow-xs cursor-pointer"
                            title="Ampliar fotografía"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(finding.id, photo.id)}
                            className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-xs cursor-pointer"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <div className="text-[11px] font-medium text-slate-800 truncate" title={photo.caption}>
                          {photo.caption}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{new Date(photo.uploadedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newCap = window.prompt('Editar pie de foto:', photo.caption);
                              if (newCap !== null) {
                                handleUpdatePhotoCaption(finding.id, photo.id, newCap);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: Responsables Totalmente Editables */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-700">Área Responsable:</span>
                <EditableField
                  value={finding.responsibleArea}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'responsibleArea', newVal)}
                  isEditMode={isEditMode}
                  className="font-bold text-slate-900"
                  label="Área Responsable"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-700">Responsable de Solucionar:</span>
                <EditableField
                  value={finding.responsiblePerson}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'responsiblePerson', newVal)}
                  isEditMode={isEditMode}
                  className="font-bold text-blue-900"
                  label="Nombre del Responsable de Solucionar"
                />
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 font-mono-tabular">
                <span className="text-[11px]">Fecha:</span>
                <EditableField
                  value={finding.identificationDate}
                  onSave={(newVal) => handleUpdateFindingField(finding.id, 'identificationDate', newVal)}
                  isEditMode={isEditMode}
                  label="Fecha Identificación"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Full Photo Preview Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Visor de Evidencia Fotográfica Oficial
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={activePhotoModal.photo.url}
                alt={activePhotoModal.photo.caption}
                className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descripción / Pie de Foto de la Evidencia:
                </label>
                <input
                  type="text"
                  value={activePhotoModal.photo.caption}
                  onChange={(e) =>
                    handleUpdatePhotoCaption(
                      activePhotoModal.findingId,
                      activePhotoModal.photo.id,
                      e.target.value
                    )
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Registrado:{' '}
                  {new Date(activePhotoModal.photo.uploadedAt).toLocaleString('es-CO')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDeletePhoto(activePhotoModal.findingId, activePhotoModal.photo.id)
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoModal(null)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aceptar y Cerrar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Hallazgo Completo */}
      {editingFinding && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingFinding.id ? 'Formulario de Análisis de Hallazgo' : 'Nuevo Hallazgo'} ({editingFinding.code})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Respuesta estricta a las preguntas A a E bajo ISO 19011 y GTC-185
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingFinding(null);
                  if (onCloseInitialModal) onCloseInitialModal();
                }}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveFinding(editingFinding);
              }}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Código de Hallazgo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFinding.code}
                    onChange={(e) => setEditingFinding({ ...editingFinding, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Clasificación del Hallazgo *
                  </label>
                  <select
                    value={editingFinding.classification}
                    onChange={(e) =>
                      setEditingFinding({
                        ...editingFinding,
                        classification: e.target.value as FindingClassification,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white"
                  >
                    <option value="NO_CONFORMIDAD_MAYOR">No Conformidad Mayor (Grave)</option>
                    <option value="NO_CONFORMIDAD_MENOR">No Conformidad Menor (Puntual)</option>
                    <option value="OBSERVACION">Observación (Preventiva)</option>
                    <option value="OPORTUNIDAD_MEJORA">Oportunidad de Mejora</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Título Breve del Hallazgo *
                </label>
                <input
                  type="text"
                  required
                  value={editingFinding.title}
                  onChange={(e) => setEditingFinding({ ...editingFinding, title: e.target.value })}
                  placeholder="Ej: Uso de instrumentos con calibración vencida en liberación de soldadura"
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              {/* Questions A to E */}
              <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">
                    A. ¿Cuál es la debilidad o problema encontrado? *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={findingQuestion(editingFinding.questionA_weakness)}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, questionA_weakness: e.target.value })
                    }
                    placeholder="Describa el hecho o desviación objetiva observada..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">
                    B. ¿En qué parte del proceso ocurre o se identificó? *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFinding.questionB_processStage}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, questionB_processStage: e.target.value })
                    }
                    placeholder="Ej: En la fase de inspección final en el proceso de Ensamble y Soldadura..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">
                    C. Norma, Requisito Legal o Criterio Incumplido (con versión o vigencia) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFinding.questionC_standardViolated}
                    onChange={(e) =>
                      setEditingFinding({
                        ...editingFinding,
                        questionC_standardViolated: e.target.value,
                      })
                    }
                    placeholder="Ej: NTC-ISO 9001:2015 Numeral 7.1.5.2 / GTC 185 Numeral 4.2"
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">
                    D. Consecuencias Actuales y Futuras (Riesgos si no se soluciona) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingFinding.questionD_consequences}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, questionD_consequences: e.target.value })
                    }
                    placeholder="Impacto en calidad, clientes, riesgos de demandas o pérdida de certificación..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">
                    E. ¿Cómo se soluciona el problema? (Propuesta de Acción Correctiva) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingFinding.questionE_solution}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, questionE_solution: e.target.value })
                    }
                    placeholder="Acción inmediata y de fondo para eliminar la causa raíz..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Responsibles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Área Responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFinding.responsibleArea}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, responsibleArea: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Responsable de Solucionar *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFinding.responsiblePerson}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, responsiblePerson: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Fecha Identificación *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingFinding.identificationDate}
                    onChange={(e) =>
                      setEditingFinding({ ...editingFinding, identificationDate: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFinding(null);
                    if (onCloseInitialModal) onCloseInitialModal();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Hallazgo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to ensure string fallback
function findingQuestion(val: string | undefined): string {
  return val || '';
}
