/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Save,
  CheckCircle2,
  Users,
  Shield,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ClosingMinute,
  Company,
  AuditSession,
  AuditFinding,
  RiskMatrixItem,
  ImprovementPlanItem,
  DocumentFile,
} from '../../types/audit';
import { SignatureCanvas } from '../common/SignatureCanvas';
import { EditableField } from '../common/EditableField';
import { AttendanceRoster } from '../common/AttendanceRoster';
import { exportToWord, printGtcDocument } from '../../utils/exportUtils';

interface ClosingMinuteModuleProps {
  minute: ClosingMinute;
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  findings?: AuditFinding[];
  risks?: RiskMatrixItem[];
  improvementPlan?: ImprovementPlanItem[];
  onUpdateMinute: (updatedMinute: ClosingMinute) => void;
  onUploadDocument?: (doc: DocumentFile) => void;
  onUpdateAudit?: (audit: AuditSession) => void;
  onUpdateCompany?: (comp: Company) => void;
}

export const ClosingMinuteModule: React.FC<ClosingMinuteModuleProps> = ({
  minute,
  currentCompany,
  currentAudit,
  isEditMode,
  findings,
  risks,
  improvementPlan,
  onUpdateMinute,
  onUploadDocument,
  onUpdateAudit,
  onUpdateCompany,
}) => {
  const [formData, setFormData] = useState<ClosingMinute>(minute);
  const [newCommitmentText, setNewCommitmentText] = useState('');
  const [newCommitmentResp, setNewCommitmentResp] = useState('');
  const [newCommitmentDate, setNewCommitmentDate] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const pdfInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setFormData(minute);
  }, [minute]);

  const handleSave = () => {
    onUpdateMinute(formData);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const handleAuditorSignature = (sigData: string) => {
    const updated = {
      ...formData,
      auditorSignature: {
        ...formData.auditorSignature,
        signed: true,
        signatureData: sigData,
        date: new Date().toISOString().split('T')[0],
      },
    };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handleAuditorClear = () => {
    const updated = {
      ...formData,
      auditorSignature: {
        ...formData.auditorSignature,
        signed: false,
        signatureData: undefined,
      },
    };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handleRepresentativeSignature = (sigData: string) => {
    const updated = {
      ...formData,
      representativeSignature: {
        ...formData.representativeSignature,
        signed: true,
        signatureData: sigData,
        date: new Date().toISOString().split('T')[0],
      },
    };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handleRepresentativeClear = () => {
    const updated = {
      ...formData,
      representativeSignature: {
        ...formData.representativeSignature,
        signed: false,
        signatureData: undefined,
      },
    };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handleAddCommitment = () => {
    if (!newCommitmentText) return;
    const updated = {
      ...formData,
      companyCommitments: [
        ...formData.companyCommitments,
        {
          commitment: newCommitmentText,
          responsible: newCommitmentResp || currentCompany.legalRepresentative,
          dueDate: newCommitmentDate || new Date().toISOString().split('T')[0],
        },
      ],
    };
    setFormData(updated);
    onUpdateMinute(updated);
    setNewCommitmentText('');
    setNewCommitmentResp('');
    setNewCommitmentDate('');
  };

  const handleUpdateCommitment = (index: number, field: string, val: string) => {
    const updatedCommitments = [...formData.companyCommitments];
    updatedCommitments[index] = { ...updatedCommitments[index], [field]: val };
    const updated = { ...formData, companyCommitments: updatedCommitments };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handleRemoveCommitment = (idx: number) => {
    const updated = {
      ...formData,
      companyCommitments: formData.companyCommitments.filter((_, i) => i !== idx),
    };
    setFormData(updated);
    onUpdateMinute(updated);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFormatError(`Formato no permitido: El archivo "${file.name}" no es un PDF válido. Por directriz de la norma GTC 185, los documentos ya realizados deben cargarse estrictamente en formato PDF (.pdf).`);
      return;
    }

    setFormatError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDoc: DocumentFile = {
        id: `acta-cie-pdf-${Date.now()}`,
        auditId: currentAudit.id,
        folder: '02_Actas_Oficiales_GTC185',
        name: file.name,
        fileType: 'pdf',
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        fileData: dataUrl,
        tags: ['Acta Cierre Ya Realizada', 'PDF Oficial', 'GTC 185'],
        process: currentAudit.processArea,
        gtc185Meta: {
          radicadoNumber: formData.minuteCode,
          documentType: 'Acta de Cierre Ya Realizada en PDF',
          isOfficialFormat: true,
        },
      };

      if (onUploadDocument) onUploadDocument(newDoc);
      setUploadedPdfName(file.name);
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleExportWord = () => {
    const commitmentsHtml = formData.companyCommitments
      .map(
        (c) =>
          `<li><strong>${c.commitment}</strong> - Responsable: ${c.responsible} (Plazo: ${c.dueDate})</li>`
      )
      .join('');

    const weaknessesHtml = formData.mainWeaknesses.map((w) => `<li>${w}</li>`).join('');
    const recommendationsHtml = formData.initialRecommendations.map((r) => `<li>${r}</li>`).join('');

    const content = `
      <h1>ACTA DE CIERRE DE AUDITORÍA INTERNA</h1>
      <p><strong>CÓDIGO OFICIAL (GTC 185):</strong> ${formData.minuteCode}</p>
      <p><strong>FECHA Y HORA DE FINALIZACIÓN:</strong> ${formData.date} - ${formData.endTime}</p>
      <p><strong>LUGAR:</strong> ${formData.place}</p>
      <h2>1. RESUMEN CUANTITATIVO DE HALLAZGOS</h2>
      <p>Total de hallazgos detectados: ${formData.findingsSummary.total} (NC Mayores: ${formData.findingsSummary.ncMajor}, NC Menores: ${formData.findingsSummary.ncMinor}, Observaciones: ${formData.findingsSummary.observations}, Oportunidades: ${formData.findingsSummary.opportunities})</p>
      <h2>2. PRINCIPALES DEBILIDADES ENCONTRADAS</h2>
      <ul>${weaknessesHtml}</ul>
      <h2>3. RIESGOS IDENTIFICADOS</h2>
      <p>${formData.identifiedRisksSummary}</p>
      <h2>4. RECOMENDACIONES INICIALES</h2>
      <ul>${recommendationsHtml}</ul>
      <h2>5. COMPROMISOS ADQUIRIDOS POR LA EMPRESA</h2>
      <ul>${commitmentsHtml}</ul>
      <table class="signatures-table">
        <tr>
          <td>
            <div class="sig-line">${formData.auditorSignature.name}</div>
            <div>${formData.auditorSignature.title}</div>
            <div>Auditor Líder Certificado</div>
          </td>
          <td>
            <div class="sig-line">${formData.representativeSignature.name}</div>
            <div>${formData.representativeSignature.title}</div>
            <div>Representante Legal / Auditado</div>
          </td>
        </tr>
      </table>
    `;

    exportToWord('Acta_Cierre_GTC185', content, currentCompany.name, currentCompany.nit, formData.minuteCode);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Módulo 7 · Acta de Cierre</span>
            <span className="text-slate-400">·</span>
            <span>Estructura Oficial GTC 185 con Edición de Todos los Responsables</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Acta de Cierre de Auditoría ({formData.minuteCode})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formalización de hallazgos, compromisos de la alta dirección y bloque de firmas GTC 185 totalmente editable.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Botón Cargar Acta Ya Realizada en PDF */}
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 shadow-xs transition-colors"
            title="Cargar acta de cierre ya formalizada en formato PDF obligatorio"
          >
            <Upload className="w-3.5 h-3.5 text-red-600" />
            <span>Subir Acta en PDF</span>
            <span className="bg-red-600 text-white text-[9px] px-1 py-0.2 rounded font-mono-tabular">.pdf</span>
          </button>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

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
            <span>Imprimir GTC 185</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Acta</span>
          </button>
        </div>
      </div>

      {/* Indicación de Carga de Acta Realizada en PDF */}
      <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">
            PDF
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>¿Dispone ya de un Acta de Cierre formalizada o firmada externamente?</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-200">
                Formato Obligatorio: PDF (.pdf)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Indicación técnica: Conforme a la GTC 185, todo documento ya ejecutado debe incorporarse <strong>exclusivamente en formato PDF (.pdf)</strong> para su conservación formal.
            </p>
            {uploadedPdfName && (
              <p className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acta de cierre PDF archivada en el expediente: {uploadedPdfName}</span>
              </p>
            )}
            {formatError && (
              <p className="text-[11px] text-rose-700 font-bold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{formatError}</span>
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shrink-0 text-xs shadow-xs"
        >
          Subir Acta en PDF
        </button>
      </div>

      {/* Toast de Guardado Exitoso */}
      {isSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 no-print">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Acta de cierre y compromisos guardados con éxito en la base de datos oficial.</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tabular">Norma GTC 185</span>
        </div>
      )}

      {/* DOCUMENTO FORMAL GTC 185 (HOJA OFICIAL) */}
      <div className="gtc-185-page bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6">
        {/* Encabezado Institucional GTC 185 */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-xs font-bold tracking-widest text-blue-900 uppercase">
            <EditableField
              value={currentCompany.name}
              onSave={(newVal) => {
                const updated = { ...formData, place: newVal };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              isEditMode={isEditMode}
              label="Nombre Empresa"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
            NIT: {currentCompany.nit} · {currentCompany.city}
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-3">
            ACTA DE REUNIÓN DE CIERRE Y PRESENTACIÓN DE RESULTADOS
          </h2>
          <div className="text-xs font-bold text-blue-800 font-mono-tabular mt-1">
            CÓDIGO:{' '}
            <EditableField
              value={formData.minuteCode}
              onSave={(newVal) => {
                const updated = { ...formData, minuteCode: newVal };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              isEditMode={isEditMode}
              label="Código de Acta GTC 185"
            />
          </div>
        </div>

        {/* Lugar, Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Lugar de Cierre:</span>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => {
                const updated = { ...formData, place: e.target.value };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              className="w-full bg-white text-xs p-1 border border-slate-300 rounded font-medium"
            />
          </div>
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Fecha de Cierre:</span>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                const updated = { ...formData, date: e.target.value };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              className="w-full bg-white text-xs p-1 border border-slate-300 rounded font-mono-tabular font-medium"
            />
          </div>
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Hora de Finalización:</span>
            <input
              type="text"
              value={formData.endTime}
              onChange={(e) => {
                const updated = { ...formData, endTime: e.target.value };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              className="w-full bg-white text-xs p-1 border border-slate-300 rounded font-mono-tabular font-medium"
            />
          </div>
        </div>

        {/* 1. Registro y Control de Asistencia Oficial de Cierre (GTC 185) */}
        <AttendanceRoster
          title="1. Registro y Control de Asistencia Oficial a Reunión de Cierre (GTC 185)"
          participants={formData.participants || []}
          isEditMode={isEditMode}
          onUpdateParticipants={(updatedParticipants) => {
            const updated = { ...formData, participants: updatedParticipants };
            setFormData(updated);
            onUpdateMinute(updated);
          }}
        />

        {/* 2. Actividades Realizadas & Resumen de Hallazgos */}
        {(() => {
          const activeSummary = findings
            ? {
                total: findings.length,
                ncMajor: findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MAYOR').length,
                ncMinor: findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MENOR').length,
                observations: findings.filter((f) => f.classification === 'OBSERVACION').length,
                opportunities: findings.filter((f) => f.classification === 'OPORTUNIDAD_MEJORA').length,
              }
            : formData.findingsSummary;

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
                  2. Resumen Cuantitativo de Hallazgos Identificados
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                  Sincronizado automáticamente ({activeSummary.total} hallazgos registrados)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-[10px] font-bold text-red-700 block">NC Mayor</span>
                  <span className="text-lg font-black text-red-800 font-mono-tabular">
                    {activeSummary.ncMajor}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-700 block">NC Menor</span>
                  <span className="text-lg font-black text-amber-800 font-mono-tabular">
                    {activeSummary.ncMinor}
                  </span>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-[10px] font-bold text-blue-700 block">Observaciones</span>
                  <span className="text-lg font-black text-blue-800 font-mono-tabular">
                    {activeSummary.observations}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-700 block">Oportunidades</span>
                  <span className="text-lg font-black text-emerald-800 font-mono-tabular">
                    {activeSummary.opportunities}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. Principales Debilidades */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            2. Principales Debilidades Encontradas
          </h3>
          <div className="space-y-1.5">
            {formData.mainWeaknesses.map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-blue-700 font-bold">•</span>
                <EditableField
                  value={w}
                  onSave={(newVal) => {
                    const updatedW = [...formData.mainWeaknesses];
                    updatedW[idx] = newVal;
                    const updated = { ...formData, mainWeaknesses: updatedW };
                    setFormData(updated);
                    onUpdateMinute(updated);
                  }}
                  isEditMode={isEditMode}
                  multiline
                  label={`Debilidad #${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Riesgos Identificados */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            3. Riesgos y Amenazas Operacionales
          </h3>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            <EditableField
              value={formData.identifiedRisksSummary}
              onSave={(newVal) => {
                const updated = { ...formData, identifiedRisksSummary: newVal };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              isEditMode={isEditMode}
              multiline
              label="Resumen de Riesgos"
            />
          </div>
        </div>

        {/* 4. Recomendaciones Iniciales */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            4. Recomendaciones Iniciales del Equipo Auditor
          </h3>
          <div className="space-y-1.5">
            {formData.initialRecommendations.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-blue-700 font-bold">•</span>
                <EditableField
                  value={r}
                  onSave={(newVal) => {
                    const updatedR = [...formData.initialRecommendations];
                    updatedR[idx] = newVal;
                    const updated = { ...formData, initialRecommendations: updatedR };
                    setFormData(updated);
                    onUpdateMinute(updated);
                  }}
                  isEditMode={isEditMode}
                  multiline
                  label={`Recomendación #${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Compromisos de la Empresa - Con Responsables Editables */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            5. Compromisos Oficiales Adquiridos por la Empresa
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Compromiso Adquirido</th>
                  <th className="py-2 px-3">Responsable Designado</th>
                  <th className="py-2 px-3">Fecha Límite</th>
                  <th className="py-2 px-3 text-right no-print">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.companyCommitments.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      <EditableField
                        value={c.commitment}
                        onSave={(newVal) => handleUpdateCommitment(idx, 'commitment', newVal)}
                        isEditMode={isEditMode}
                        multiline
                        label="Texto del Compromiso"
                      />
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      <EditableField
                        value={c.responsible}
                        onSave={(newVal) => handleUpdateCommitment(idx, 'responsible', newVal)}
                        isEditMode={isEditMode}
                        label="Nombre del Responsable"
                      />
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono-tabular">
                      <EditableField
                        value={c.dueDate}
                        onSave={(newVal) => handleUpdateCommitment(idx, 'dueDate', newVal)}
                        isEditMode={isEditMode}
                        label="Fecha Límite"
                      />
                    </td>
                    <td className="py-2 px-3 text-right no-print">
                      <button
                        type="button"
                        onClick={() => handleRemoveCommitment(idx)}
                        className="text-slate-400 hover:text-red-600"
                        title="Eliminar compromiso"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form para agregar nuevo compromiso */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs no-print">
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="Nuevo compromiso de la entidad..."
                value={newCommitmentText}
                onChange={(e) => setNewCommitmentText(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Nombre del Responsable"
                value={newCommitmentResp}
                onChange={(e) => setNewCommitmentResp(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="date"
                value={newCommitmentDate}
                onChange={(e) => setNewCommitmentDate(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono-tabular"
              />
            </div>
            <div className="sm:col-span-1">
              <button
                type="button"
                onClick={handleAddCommitment}
                className="w-full h-full p-1.5 bg-blue-700 text-white rounded font-bold hover:bg-blue-800"
                title="Agregar compromiso"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bloque de Firmas Reglamentario GTC 185 - Editable Nombres y Cargos */}
        <div className="pt-6 border-t border-slate-300 space-y-3">
          <div className="text-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              Bloque de Firmas de Cierre (Norma GTC 185)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Haga clic en "Editar Nombre" o en el lápiz para modificar los datos del responsable directamente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Firma Auditor Líder */}
            <div className="space-y-2">
              <SignatureCanvas
                signerName={formData.auditorSignature.name}
                signerTitle={formData.auditorSignature.title}
                isSigned={formData.auditorSignature.signed}
                signatureDate={formData.auditorSignature.date}
                existingSignatureData={formData.auditorSignature.signatureData}
                onSaveSignature={handleAuditorSignature}
                onClearSignature={handleAuditorClear}
                onUpdateSignerName={(newName) => {
                  const updated = {
                    ...formData,
                    auditorSignature: { ...formData.auditorSignature, name: newName },
                  };
                  setFormData(updated);
                  onUpdateMinute(updated);
                  if (onUpdateAudit) {
                    onUpdateAudit({ ...currentAudit, auditorName: newName });
                  }
                }}
                onUpdateSignerTitle={(newTitle) => {
                  const updated = {
                    ...formData,
                    auditorSignature: { ...formData.auditorSignature, title: newTitle },
                  };
                  setFormData(updated);
                  onUpdateMinute(updated);
                  if (onUpdateAudit) {
                    onUpdateAudit({ ...currentAudit, auditorRole: newTitle });
                  }
                }}
                isEditMode={isEditMode}
                label="Auditor Líder Certificado"
              />
            </div>

            {/* Firma Representante Legal */}
            <div className="space-y-2">
              <SignatureCanvas
                signerName={formData.representativeSignature.name}
                signerTitle={formData.representativeSignature.title}
                isSigned={formData.representativeSignature.signed}
                signatureDate={formData.representativeSignature.date}
                existingSignatureData={formData.representativeSignature.signatureData}
                onSaveSignature={handleRepresentativeSignature}
                onClearSignature={handleRepresentativeClear}
                onUpdateSignerName={(newName) => {
                  const updated = {
                    ...formData,
                    representativeSignature: { ...formData.representativeSignature, name: newName },
                  };
                  setFormData(updated);
                  onUpdateMinute(updated);
                  if (onUpdateCompany) {
                    onUpdateCompany({ ...currentCompany, legalRepresentative: newName });
                  }
                }}
                onUpdateSignerTitle={(newTitle) => {
                  const updated = {
                    ...formData,
                    representativeSignature: { ...formData.representativeSignature, title: newTitle },
                  };
                  setFormData(updated);
                  onUpdateMinute(updated);
                }}
                isEditMode={isEditMode}
                label="Representante Legal / Auditado"
              />
            </div>
          </div>
        </div>

        {/* Pie GTC 185 */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Acta formal de cierre elaborada conforme a los parámetros de la Guía Técnica Colombiana GTC 185. Documento confidencial.
        </div>
      </div>
    </div>
  );
};
