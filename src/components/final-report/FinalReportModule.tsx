/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Save,
  CheckCircle2,
  Building,
  Shield,
  Layers,
  Sparkles,
  AlertTriangle,
  Grid3X3,
  TrendingUp,
  Upload,
} from 'lucide-react';
import {
  FinalReport,
  Company,
  AuditSession,
  AuditPlan,
  ChecklistItem,
  AuditFinding,
  RiskMatrixItem,
  ImprovementPlanItem,
  DocumentFile,
} from '../../types/audit';
import { exportToWord, printGtcDocument } from '../../utils/exportUtils';
import { EditableField } from '../common/EditableField';

interface FinalReportModuleProps {
  report: FinalReport;
  currentCompany: Company;
  currentAudit: AuditSession;
  auditPlan: AuditPlan;
  checklist: ChecklistItem[];
  findings: AuditFinding[];
  risks: RiskMatrixItem[];
  improvementPlan: ImprovementPlanItem[];
  documents: DocumentFile[];
  isEditMode: boolean;
  onUpdateReport: (updatedReport: FinalReport) => void;
  onUpdateAudit?: (updatedAudit: AuditSession) => void;
  onUpdateCompany?: (updatedCompany: Company) => void;
  onUploadDocument?: (doc: DocumentFile) => void;
}

export const FinalReportModule: React.FC<FinalReportModuleProps> = ({
  report,
  currentCompany,
  currentAudit,
  auditPlan,
  checklist,
  findings,
  risks,
  improvementPlan,
  documents,
  isEditMode,
  onUpdateReport,
  onUpdateAudit,
  onUpdateCompany,
  onUploadDocument,
}) => {
  const [formData, setFormData] = useState<FinalReport>(report);
  const [newConclusion, setNewConclusion] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const pdfInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setFormData(report);
  }, [report]);

  const handleSave = () => {
    onUpdateReport(formData);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const handleUpdateConclusion = (index: number, val: string) => {
    const updated = [...formData.conclusions];
    updated[index] = val;
    const newReport = { ...formData, conclusions: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
  };

  const handleAddConclusion = () => {
    if (!newConclusion.trim()) return;
    const updated = [...formData.conclusions, newConclusion.trim()];
    const newReport = { ...formData, conclusions: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
    setNewConclusion('');
  };

  const handleDeleteConclusion = (index: number) => {
    const updated = formData.conclusions.filter((_, idx) => idx !== index);
    const newReport = { ...formData, conclusions: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
  };

  const handleUpdateRecommendation = (index: number, val: string) => {
    const updated = [...formData.recommendations];
    updated[index] = val;
    const newReport = { ...formData, recommendations: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
  };

  const handleAddRecommendation = () => {
    if (!newRecommendation.trim()) return;
    const updated = [...formData.recommendations, newRecommendation.trim()];
    const newReport = { ...formData, recommendations: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
    setNewRecommendation('');
  };

  const handleDeleteRecommendation = (index: number) => {
    const updated = formData.recommendations.filter((_, idx) => idx !== index);
    const newReport = { ...formData, recommendations: updated };
    setFormData(newReport);
    onUpdateReport(newReport);
  };

  const handleExportWord = () => {
    const findingsListHtml = findings
      .map(
        (f) => `
        <div style="margin-bottom: 12pt; border-left: 3pt solid #134074; padding-left: 8pt;">
          <p><strong>${f.code} - ${f.title}</strong> [${f.classification}]</p>
          <p><strong>A. Debilidad:</strong> ${f.questionA_weakness}</p>
          <p><strong>B. Etapa:</strong> ${f.questionB_processStage}</p>
          <p><strong>C. Norma:</strong> ${f.questionC_standardViolated}</p>
          <p><strong>D. Consecuencias:</strong> ${f.questionD_consequences}</p>
          <p><strong>E. Solución:</strong> ${f.questionE_solution}</p>
        </div>
      `
      )
      .join('');

    const conclusionsHtml = formData.conclusions.map((c) => `<li>${c}</li>`).join('');
    const recommendationsHtml = formData.recommendations.map((r) => `<li>${r}</li>`).join('');

    const content = `
      <h1>INFORME FINAL DE AUDITORÍA INTERNA INTEGRAL</h1>
      <p style="text-align: center;"><strong>CÓDIGO OFICIAL GTC 185:</strong> ${formData.reportCode} · VERSIÓN: ${formData.version}</p>
      
      <h2>1. PORTADA E IDENTIFICACIÓN</h2>
      <p><strong>Empresa:</strong> ${currentCompany.name}</p>
      <p><strong>NIT:</strong> ${currentCompany.nit}</p>
      <p><strong>Auditor Líder:</strong> ${currentAudit.auditorName}</p>
      <p><strong>Fecha de Expedición:</strong> ${formData.issueDate}</p>

      <h2>2. INFORMACIÓN GENERAL DE LA EMPRESA</h2>
      <p><strong>Sector:</strong> ${currentCompany.economicSector} · <strong>Actividad:</strong> ${currentCompany.economicActivity}</p>
      <p><strong>Dirección:</strong> ${currentCompany.address} · <strong>Representante Legal:</strong> ${currentCompany.legalRepresentative}</p>

      <h2>3. INTRODUCCIÓN</h2>
      <p>${formData.introduction}</p>

      <h2>4. OBJETIVO DE LA AUDITORÍA</h2>
      <p>${formData.objective}</p>

      <h2>5. ALCANCE</h2>
      <p>${formData.scope}</p>

      <h2>6. METODOLOGÍA (ISO 19011:2018)</h2>
      <p>${formData.methodology}</p>

      <h2>7. CRITERIOS UTILIZADOS</h2>
      <p>${formData.criteriaSummary}</p>

      <h2>8. DESARROLLO DE LA AUDITORÍA</h2>
      <p>${formData.auditDevelopment}</p>

      <h2>9. RESULTADOS DE LA LISTA DE CHEQUEO</h2>
      <p>Total preguntas evaluadas: ${checklist.length}. Cumplimiento global ponderado del proceso.</p>

      <h2>10. HALLAZGOS IDENTIFICADOS (PREGUNTAS A - E)</h2>
      ${findingsListHtml}

      <h2>11. EVIDENCIAS Y EXPEDIENTES</h2>
      <p>Se recolectaron ${documents.length} archivos de soporte, fotografías in situ y documentos escaneados binarizados en el Gestor Documental GTC 185.</p>

      <h2>12. MATRIZ DE RIESGOS</h2>
      <p>Evaluación de ${risks.length} riesgos clasificados en función de probabilidad e impacto.</p>

      <h2>13. CONCLUSIONES</h2>
      <ul>${conclusionsHtml}</ul>

      <h2>14. RECOMENDACIONES</h2>
      <ul>${recommendationsHtml}</ul>

      <h2>15. PROPUESTA DE PLAN DE MEJORAMIENTO</h2>
      <p>Se formularon ${improvementPlan.length} acciones correctivas y preventivas con indicadores y metas trazables.</p>
    `;

    exportToWord('Informe_Final_Auditoria_GTC185', content, currentCompany.name, currentCompany.nit, formData.reportCode);
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
        id: `inf-final-pdf-${Date.now()}`,
        auditId: currentAudit.id,
        folder: '05_Informes_y_Mejoramiento',
        name: file.name,
        fileType: 'pdf',
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        fileData: dataUrl,
        tags: ['Informe Final Ya Realizado', 'PDF Oficial', 'GTC 185'],
        process: currentAudit.processArea,
        gtc185Meta: {
          radicadoNumber: formData.reportCode,
          documentType: 'Informe Final de Auditoría Ya Realizado en PDF',
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Módulo 8 · Informe Final de Auditoría</span>
            <span className="text-slate-400">·</span>
            <span>Estructura de 15 Puntos Oficiales bajo GTC 185</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Informe Técnico Final de Auditoría ({formData.reportCode})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generación automática con portada, desarrollo, hallazgos, matriz de riesgos, conclusiones y plan de mejoramiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Botón Cargar Informe Ya Realizado en PDF */}
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 shadow-xs transition-colors"
            title="Cargar informe final ya elaborado en formato PDF obligatorio"
          >
            <Upload className="w-3.5 h-3.5 text-red-600" />
            <span>Subir Informe en PDF</span>
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
            <span>Descargar en PDF / Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Informe</span>
          </button>
        </div>
      </div>

      {/* Indicación de Carga de Informe Realizado en PDF */}
      <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">
            PDF
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>¿Dispone ya de un Informe Final de Auditoría completo en PDF?</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-200">
                Formato Obligatorio: PDF (.pdf)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Indicación técnica: Conforme a la GTC 185, los informes finales ya realizados deben archivarse <strong>exclusivamente en formato PDF (.pdf)</strong> para su custodia oficial.
            </p>
            {uploadedPdfName && (
              <p className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Informe técnico PDF archivado en el expediente: {uploadedPdfName}</span>
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
          Subir Informe en PDF
        </button>
      </div>

      {/* Toast de Guardado Exitoso */}
      {isSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 no-print">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Informe final y firmas de responsables guardados con éxito en la base de datos oficial.</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tabular">Norma GTC 185</span>
        </div>
      )}

      {/* DOCUMENTO OFICIAL GTC 185 (HOJA FORMAL IMPRIMIBLE) */}
      <div className="gtc-185-page bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 shadow-sm max-w-4xl mx-auto space-y-8">
        {/* 1. PORTADA GTC 185 */}
        <div className="text-center border-b-2 border-slate-900 pb-8 pt-4">
          <div className="text-sm font-extrabold tracking-widest text-blue-900 uppercase">
            {currentCompany.name}
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular mt-1">
            NIT: {currentCompany.nit} · {currentCompany.city}
          </div>

          <div className="my-8 py-4 border-y border-slate-200">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              INFORME FINAL DE AUDITORÍA INTERNA INTEGRAL
            </h1>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mt-1">
              CONFORME A LAS NORMAS TÉCNICAS ICONTEC GTC 185 E ISO 19011:2018
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 font-mono-tabular">
            <div>
              CÓDIGO DE RADICADO: <strong className="text-slate-900">{formData.reportCode}</strong>
            </div>
            <div>
              VERSIÓN: <strong className="text-slate-900">{formData.version}</strong> · FECHA:{' '}
              <strong className="text-slate-900">{formData.issueDate}</strong>
            </div>
            <div>
              AUDITOR LÍDER: <strong className="text-slate-900 font-sans">{currentAudit.auditorName}</strong>
            </div>
          </div>
        </div>

        {/* 2. INFORMACIÓN GENERAL DE LA EMPRESA */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            2. Información General de la Empresa
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <strong>Razón Social:</strong> {currentCompany.name}
            </div>
            <div>
              <strong>NIT:</strong> {currentCompany.nit}
            </div>
            <div>
              <strong>Sector Económico:</strong> {currentCompany.economicSector}
            </div>
            <div>
              <strong>Actividad (CIIU):</strong> {currentCompany.economicActivity}
            </div>
            <div>
              <strong>Dirección:</strong> {currentCompany.address}
            </div>
            <div>
              <strong>Representante Legal:</strong> {currentCompany.legalRepresentative}
            </div>
          </div>
        </div>

        {/* 3. INTRODUCCIÓN */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            3. Introducción
          </h2>
          <textarea
            rows={3}
            value={formData.introduction}
            onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* 4. OBJETIVO & 5. ALCANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              4. Objetivo de la Auditoría
            </h2>
            <textarea
              rows={3}
              value={formData.objective}
              onChange={(e) => {
                const val = e.target.value;
                const updated = { ...formData, objective: val };
                setFormData(updated);
                onUpdateReport(updated);
                if (onUpdateAudit) onUpdateAudit({ ...currentAudit, objective: val });
              }}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              5. Alcance
            </h2>
            <textarea
              rows={3}
              value={formData.scope}
              onChange={(e) => {
                const val = e.target.value;
                const updated = { ...formData, scope: val };
                setFormData(updated);
                onUpdateReport(updated);
                if (onUpdateAudit) onUpdateAudit({ ...currentAudit, scope: val });
              }}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed"
            />
          </div>
        </div>

        {/* 6. METODOLOGÍA & 7. CRITERIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              6. Metodología Aplicada (ISO 19011)
            </h2>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <EditableField
                value={formData.methodology}
                isEditable={isEditMode}
                multiline
                onSave={(val) => {
                  const updated = { ...formData, methodology: val };
                  setFormData(updated);
                  onUpdateReport(updated);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              7. Criterios Utilizados
            </h2>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <EditableField
                value={formData.criteriaSummary}
                isEditable={isEditMode}
                multiline
                onSave={(val) => {
                  const updated = { ...formData, criteriaSummary: val };
                  setFormData(updated);
                  onUpdateReport(updated);
                }}
              />
            </div>
          </div>
        </div>

        {/* 8. DESARROLLO DE LA AUDITORÍA */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            8. Desarrollo de la Auditoría
          </h2>
          <textarea
            rows={3}
            value={formData.auditDevelopment}
            onChange={(e) => setFormData({ ...formData, auditDevelopment: e.target.value })}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* 9. RESULTADOS DE LA LISTA DE CHEQUEO */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            9. Resultados de la Lista de Chequeo
          </h2>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p>
              Se aplicaron <strong>{checklist.length} preguntas de verificación</strong> en los procesos productivos,
              directivos y documentales.
            </p>
            <div className="flex gap-4 pt-1 font-mono-tabular">
              <span className="text-emerald-700 font-bold">
                Cumple: {checklist.filter((c) => c.compliance === 'CUMPLE').length}
              </span>
              <span className="text-amber-700 font-bold">
                Cumple Parcial: {checklist.filter((c) => c.compliance === 'CUMPLE_PARCIALMENTE').length}
              </span>
              <span className="text-rose-700 font-bold">
                No Cumple: {checklist.filter((c) => c.compliance === 'NO_CUMPLE').length}
              </span>
            </div>
          </div>
        </div>

        {/* 10. HALLAZGOS IDENTIFICADOS */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            10. Hallazgos Identificados y Respuestas al Protocolo A-E
          </h2>
          <div className="space-y-3">
            {findings.map((f) => (
              <div key={f.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-blue-900 font-mono-tabular">
                    {f.code} - {f.title}
                  </span>
                  <span className="text-slate-600 font-normal">[{f.classification}]</span>
                </div>
                <div className="text-slate-700 space-y-1 pl-2 border-l-2 border-blue-600">
                  <p>
                    <strong>A. Debilidad:</strong> {f.questionA_weakness}
                  </p>
                  <p>
                    <strong>B. Etapa:</strong> {f.questionB_processStage}
                  </p>
                  <p>
                    <strong>C. Norma Incumplida:</strong> {f.questionC_standardViolated}
                  </p>
                  <p>
                    <strong>D. Consecuencias:</strong> {f.questionD_consequences}
                  </p>
                  <p>
                    <strong>E. Solución:</strong> {f.questionE_solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 11. EVIDENCIAS & 12. MATRIZ DE RIESGOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              11. Evidencias y Registros
            </h2>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Se compilaron {documents.length} archivos de soporte incluyendo documentos escaneados binarizados en
              formato GTC 185 y registros fotográficos in situ.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              12. Matriz de Riesgos
            </h2>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Se priorizaron {risks.filter((r) => r.riskLevel === 'CRITICO' || r.riskLevel === 'ALTO').length} riesgos
              altos y críticos evaluados mediante la matriz institucional 5x5.
            </p>
          </div>
        </div>

        {/* 13. CONCLUSIONES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              13. Conclusiones Técnicas ({formData.conclusions.length})
            </h2>
            <span className="text-[11px] text-slate-500">Editables en línea</span>
          </div>
          <div className="space-y-2">
            {formData.conclusions.map((c, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-blue-700 font-bold text-xs shrink-0 mt-0.5">•</span>
                <div className="flex-1">
                  <EditableField
                    value={c}
                    isEditable={isEditMode}
                    multiline
                    onSave={(val) => handleUpdateConclusion(idx, val)}
                  />
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteConclusion(idx)}
                    className="text-slate-400 hover:text-rose-600 text-xs px-1"
                    title="Eliminar conclusión"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Agregar nueva conclusión técnica..."
                  value={newConclusion}
                  onChange={(e) => setNewConclusion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConclusion()}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddConclusion}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 14. RECOMENDACIONES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              14. Recomendaciones de Mejora ({formData.recommendations.length})
            </h2>
            <span className="text-[11px] text-slate-500">Editables en línea</span>
          </div>
          <div className="space-y-2">
            {formData.recommendations.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-blue-700 font-bold text-xs shrink-0 mt-0.5">•</span>
                <div className="flex-1">
                  <EditableField
                    value={r}
                    isEditable={isEditMode}
                    multiline
                    onSave={(val) => handleUpdateRecommendation(idx, val)}
                  />
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRecommendation(idx)}
                    className="text-slate-400 hover:text-rose-600 text-xs px-1"
                    title="Eliminar recomendación"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Agregar nueva recomendación..."
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRecommendation()}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddRecommendation}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 15. PLAN DE MEJORAMIENTO */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            15. Propuesta de Plan de Mejoramiento
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2">No Conformidad</th>
                  <th className="p-2">Causa Raíz</th>
                  <th className="p-2">Acción Correctiva</th>
                  <th className="p-2">Responsable / Plazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {improvementPlan.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50">
                    <td className="p-2 font-semibold text-slate-900">{pm.identifiedProblem}</td>
                    <td className="p-2 text-slate-600">{pm.rootCause}</td>
                    <td className="p-2 text-slate-700">{pm.correctiveAction}</td>
                    <td className="p-2 font-mono-tabular">
                      <div className="font-semibold text-slate-800">{pm.responsiblePerson}</div>
                      <div className="text-[10px] text-slate-500">{pm.dueDate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloque de Firmas Final GTC 185 con Responsables Editables */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
              Responsable Auditor Líder
            </div>
            <div className="font-bold text-slate-900 uppercase">
              <EditableField
                value={currentAudit.auditorName}
                isEditable={true}
                label="Nombre Auditor Líder"
                onSave={(val) => {
                  if (onUpdateAudit) onUpdateAudit({ ...currentAudit, auditorName: val });
                }}
              />
            </div>
            <div className="text-slate-600">
              <EditableField
                value={currentAudit.auditorRole}
                isEditable={true}
                label="Cargo Auditor"
                onSave={(val) => {
                  if (onUpdateAudit) onUpdateAudit({ ...currentAudit, auditorRole: val });
                }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono-tabular mt-1">
              Registro:{' '}
              <EditableField
                value={currentAudit.auditorCardNumber}
                isEditable={true}
                label="Registro Profesional"
                onSave={(val) => {
                  if (onUpdateAudit) onUpdateAudit({ ...currentAudit, auditorCardNumber: val });
                }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
              Responsable de la Organización
            </div>
            <div className="font-bold text-slate-900 uppercase">
              <EditableField
                value={currentCompany.legalRepresentative}
                isEditable={true}
                label="Representante Legal"
                onSave={(val) => {
                  if (onUpdateCompany) onUpdateCompany({ ...currentCompany, legalRepresentative: val });
                }}
              />
            </div>
            <div className="text-slate-600">Representante Legal / Gerencia</div>
            <div className="text-[10px] text-slate-500 font-mono-tabular mt-1">
              NIT: {currentCompany.nit}
            </div>
          </div>
        </div>

        {/* Pie Oficial GTC 185 */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Documento oficial regido bajo los estándares de la Guía Técnica Colombiana GTC 185 (ICONTEC). Página 1 de 1.
        </div>
      </div>
    </div>
  );
};
