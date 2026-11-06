/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSignature,
  Printer,
  Download,
  Save,
  CheckCircle2,
  Users,
  Building,
  Calendar,
  Clock,
  Shield,
  Check,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { InitiationMinute, Company, AuditSession, MinuteParticipant, ParticipantParty } from '../../types/audit';
import { SignatureCanvas } from '../common/SignatureCanvas';
import { EditableField } from '../common/EditableField';
import { AttendanceRoster } from '../common/AttendanceRoster';
import { exportToWord, printGtcDocument } from '../../utils/exportUtils';
import { DocumentFile } from '../../types/audit';

interface InitiationMinuteModuleProps {
  minute: InitiationMinute;
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdateMinute: (updatedMinute: InitiationMinute) => void;
  onUploadDocument?: (doc: DocumentFile) => void;
  onUpdateAudit?: (audit: AuditSession) => void;
  onUpdateCompany?: (comp: Company) => void;
}

export const InitiationMinuteModule: React.FC<InitiationMinuteModuleProps> = ({
  minute,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdateMinute,
  onUploadDocument,
  onUpdateAudit,
  onUpdateCompany,
}) => {
  const [formData, setFormData] = useState<InitiationMinute>(minute);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const pdfInputRef = React.useRef<HTMLInputElement | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [newPartRole, setNewPartRole] = useState('');
  const [newPartArea, setNewPartArea] = useState('');

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

  const handleUpdateParticipant = (index: number, field: string, value: any) => {
    const updated = [...formData.participants];
    updated[index] = { ...updated[index], [field]: value };
    const newForm = { ...formData, participants: updated };
    setFormData(newForm);
    onUpdateMinute(newForm);
  };

  const handleAddParticipant = () => {
    if (!newPartName.trim()) return;
    const newParticipant: MinuteParticipant = {
      name: newPartName.trim(),
      role: newPartRole.trim() || 'Líder / Participante',
      area: newPartArea.trim() || 'Área Auditada',
      party: 'AUDITADO' as ParticipantParty,
      attended: true,
    };
    const updated: MinuteParticipant[] = [...formData.participants, newParticipant];
    const newForm = { ...formData, participants: updated };
    setFormData(newForm);
    onUpdateMinute(newForm);
    setNewPartName('');
    setNewPartRole('');
    setNewPartArea('');
  };

  const handleRemoveParticipant = (index: number) => {
    const updated = formData.participants.filter((_, i) => i !== index);
    const newForm = { ...formData, participants: updated };
    setFormData(newForm);
    onUpdateMinute(newForm);
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
        id: `acta-ini-pdf-${Date.now()}`,
        auditId: currentAudit.id,
        folder: '02_Actas_Oficiales_GTC185',
        name: file.name,
        fileType: 'pdf',
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        fileData: dataUrl,
        tags: ['Acta Apertura Ya Realizada', 'PDF Oficial', 'GTC 185'],
        process: currentAudit.processArea,
        gtc185Meta: {
          radicadoNumber: formData.minuteCode,
          documentType: 'Acta de Iniciación Ya Realizada en PDF',
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
    const participantsList = formData.participants
      .map(
        (p) =>
          `<li><strong>${p.name}:</strong> ${p.role} - Área: ${p.area} (${
            p.attended ? 'Asistió' : 'Inasistente'
          })</li>`
      )
      .join('');

    const content = `
      <h1>ACTA DE INICIACIÓN Y APERTURA DE AUDITORÍA</h1>
      <p><strong>CÓDIGO OFICIAL (GTC 185):</strong> ${formData.minuteCode}</p>
      <p><strong>FECHA Y HORA:</strong> ${formData.date} - ${formData.startTime}</p>
      <p><strong>LUGAR:</strong> ${formData.place}</p>
      <p><strong>AUDITOR LÍDER:</strong> ${formData.auditorName}</p>
      <h2>1. PARTICIPANTES Y ASISTENCIA</h2>
      <ul>${participantsList}</ul>
      <h2>2. OBJETIVO Y ALCANCE</h2>
      <p><strong>Objetivo:</strong> ${formData.objective}</p>
      <p><strong>Alcance:</strong> ${formData.scope}</p>
      <h2>3. METODOLOGÍA DE TRABAJO (ISO 19011)</h2>
      <p>${formData.workMethodology}</p>
      <h2>4. RESPONSABILIDADES Y COMPROMISOS</h2>
      <p>${formData.participantResponsibilities}</p>
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

    exportToWord('Acta_Iniciacion_GTC185', content, currentCompany.name, currentCompany.nit, formData.minuteCode);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <FileSignature className="w-3.5 h-3.5" />
            <span>Módulo 3 · Acta de Iniciación</span>
            <span className="text-slate-400">·</span>
            <span>Estructura Oficial GTC 185 con Edición Total de Nombres</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Acta de Apertura de Auditoría ({formData.minuteCode})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cualquier participante, nombre de auditor, representante, lugar y textos del acta pueden ser modificados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Botón Cargar Acta Ya Realizada en PDF */}
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 shadow-xs transition-colors"
            title="Cargar acta ya formalizada en formato PDF obligatorio"
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
              <span>¿Dispone ya de un Acta de Apertura física o digitalmente firmada?</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-200">
                Formato Obligatorio: PDF (.pdf)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Indicación técnica: Por directrices de inmutabilidad y autenticidad (GTC 185), los documentos ya formalizados deben adjuntarse <strong>únicamente en formato PDF (.pdf)</strong>.
            </p>
            {uploadedPdfName && (
              <p className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acta PDF vinculada al expediente: {uploadedPdfName}</span>
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
            <span>✓ Acta de iniciación y firmas guardadas con éxito en la base de datos oficial.</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tabular">Norma GTC 185</span>
        </div>
      )}

      {/* DOCUMENTO FORMAL GTC 185 (HOJA OFICIAL) */}
      <div className="gtc-185-page bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6">
        {/* Encabezado Institucional GTC 185 - Editable */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-xs font-bold tracking-widest text-blue-900 uppercase">
            <EditableField
              value={currentCompany.name}
              onSave={(newVal) => onUpdateMinute({ ...formData, companyName: newVal })}
              isEditMode={isEditMode}
              label="Razón Social Empresa"
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
            NIT: {currentCompany.nit} · {currentCompany.city}
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-3">
            ACTA DE REUNIÓN DE INICIACIÓN Y APERTURA DE AUDITORÍA INTERNA
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
              label="Código Oficial GTC 185"
            />
          </div>
        </div>

        {/* Metadatos GTC 185: Lugar, Fecha, Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Lugar de Reunión:</span>
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
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Fecha de Apertura:</span>
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
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Hora de Inicio:</span>
            <input
              type="text"
              value={formData.startTime}
              onChange={(e) => {
                const updated = { ...formData, startTime: e.target.value };
                setFormData(updated);
                onUpdateMinute(updated);
              }}
              className="w-full bg-white text-xs p-1 border border-slate-300 rounded font-mono-tabular font-medium"
            />
          </div>
        </div>

        {/* 1. Registro y Control de Asistencia Oficial (GTC 185) */}
        <AttendanceRoster
          title="1. Registro y Control de Asistencia Oficial (GTC 185)"
          participants={formData.participants}
          isEditMode={isEditMode}
          onUpdateParticipants={(updatedParticipants) => {
            const updated = { ...formData, participants: updatedParticipants };
            setFormData(updated);
            onUpdateMinute(updated);
          }}
        />

        {/* 2. Objetivo y Alcance */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            2. Objetivo y Alcance Ratificados
          </h3>
          <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <strong className="text-slate-900 block mb-0.5">Objetivo:</strong>
              <EditableField
                value={formData.objective}
                onSave={(newVal) => {
                  const updated = { ...formData, objective: newVal };
                  setFormData(updated);
                  onUpdateMinute(updated);
                }}
                isEditMode={isEditMode}
                multiline
                label="Objetivo de Apertura"
              />
            </div>
            <div>
              <strong className="text-slate-900 block mb-0.5">Alcance:</strong>
              <EditableField
                value={formData.scope}
                onSave={(newVal) => {
                  const updated = { ...formData, scope: newVal };
                  setFormData(updated);
                  onUpdateMinute(updated);
                }}
                isEditMode={isEditMode}
                multiline
                label="Alcance Ratificado"
              />
            </div>
          </div>
        </div>

        {/* 3. Metodología de Trabajo */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            3. Metodología de Trabajo (ISO 19011:2018)
          </h3>
          <textarea
            rows={3}
            value={formData.workMethodology}
            onChange={(e) => {
              const updated = { ...formData, workMethodology: e.target.value };
              setFormData(updated);
              onUpdateMinute(updated);
            }}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* 4. Responsabilidades de los Participantes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            4. Responsabilidades de los Participantes y Confidencialidad
          </h3>
          <textarea
            rows={3}
            value={formData.participantResponsibilities}
            onChange={(e) => {
              const updated = { ...formData, participantResponsibilities: e.target.value };
              setFormData(updated);
              onUpdateMinute(updated);
            }}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Bloque de Firmas Reglamentario GTC 185 - Editable Nombres y Cargos */}
        <div className="pt-6 border-t border-slate-300 space-y-3">
          <div className="text-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
              Bloque de Firmas Oficiales (Norma GTC 185)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Haga clic en el botón "Editar Nombre" o lápiz para modificar los datos del responsable directamente
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
                    auditorName: newName,
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
          Acta formal elaborada conforme a los numerales 4 y 5 de la Guía Técnica Colombiana GTC 185. Documento confidencial.
        </div>
      </div>
    </div>
  );
};
