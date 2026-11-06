/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Star,
  Printer,
  Download,
  Save,
  CheckCircle2,
  Users,
  Building,
  Shield,
  Plus,
  Trash2,
  Edit2,
  FileCheck,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  AuditEvaluation,
  EvaluationAspect,
  EvaluationTarget,
  Company,
  AuditSession,
} from '../../types/audit';
import { EditableField } from '../common/EditableField';
import { exportToWord, printGtcDocument } from '../../utils/exportUtils';

interface AuditEvaluationModuleProps {
  evaluation: AuditEvaluation;
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdateEvaluation: (updated: AuditEvaluation) => void;
}

export const AuditEvaluationModule: React.FC<AuditEvaluationModuleProps> = ({
  evaluation,
  currentCompany,
  currentAudit,
  isEditMode,
  onUpdateEvaluation,
}) => {
  const [formData, setFormData] = useState<AuditEvaluation>(evaluation);
  const [selectedTargetTab, setSelectedTargetTab] = useState<'ALL' | 'AUDITOR' | 'AUDITADO'>('ALL');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Modal to edit/add an aspect
  const [editingAspect, setEditingAspect] = useState<EvaluationAspect | null>(null);
  const [isNewAspect, setIsNewAspect] = useState(false);

  // New list item drafts
  const [newAuditorStrength, setNewAuditorStrength] = useState('');
  const [newAuditorOpportunity, setNewAuditorOpportunity] = useState('');
  const [newAuditeeStrength, setNewAuditeeStrength] = useState('');
  const [newAuditeeOpportunity, setNewAuditeeOpportunity] = useState('');

  React.useEffect(() => {
    setFormData(evaluation);
  }, [evaluation]);

  // Recalculate consolidated averages
  const calculateScores = (aspects: EvaluationAspect[]) => {
    const auditorAspects = aspects.filter((a) => a.target === 'AUDITOR');
    const auditeeAspects = aspects.filter((a) => a.target === 'AUDITADO');

    const auditorAvg =
      auditorAspects.length > 0
        ? Number((auditorAspects.reduce((sum, a) => sum + (a.score || 0), 0) / auditorAspects.length).toFixed(2))
        : 5;

    const auditeeAvg =
      auditeeAspects.length > 0
        ? Number((auditeeAspects.reduce((sum, a) => sum + (a.score || 0), 0) / auditeeAspects.length).toFixed(2))
        : 5;

    const finalRating = Number(((auditorAvg + auditeeAvg) / 2).toFixed(2));

    return { auditorAvg, auditeeAvg, finalRating };
  };

  const handleSave = () => {
    onUpdateEvaluation(formData);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const handleAspectScoreChange = (aspectId: string, newScore: number) => {
    const updatedAspects = formData.aspects.map((a) =>
      a.id === aspectId ? { ...a, score: newScore } : a
    );
    const { auditorAvg, auditeeAvg, finalRating } = calculateScores(updatedAspects);
    const updated = {
      ...formData,
      aspects: updatedAspects,
      auditorScoreAverage: auditorAvg,
      auditeeScoreAverage: auditeeAvg,
      finalAuditRating: finalRating,
      lastUpdated: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  const handleUpdateAspectField = (aspectId: string, field: keyof EvaluationAspect, value: any) => {
    const updatedAspects = formData.aspects.map((a) =>
      a.id === aspectId ? { ...a, [field]: value } : a
    );
    const { auditorAvg, auditeeAvg, finalRating } = calculateScores(updatedAspects);
    const updated = {
      ...formData,
      aspects: updatedAspects,
      auditorScoreAverage: auditorAvg,
      auditeeScoreAverage: auditeeAvg,
      finalAuditRating: finalRating,
      lastUpdated: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  const handleSaveModalAspect = (aspectToSave: EvaluationAspect) => {
    let updatedAspects: EvaluationAspect[];
    if (isNewAspect) {
      updatedAspects = [...formData.aspects, aspectToSave];
    } else {
      updatedAspects = formData.aspects.map((a) => (a.id === aspectToSave.id ? aspectToSave : a));
    }

    const { auditorAvg, auditeeAvg, finalRating } = calculateScores(updatedAspects);
    const updated = {
      ...formData,
      aspects: updatedAspects,
      auditorScoreAverage: auditorAvg,
      auditeeScoreAverage: auditeeAvg,
      finalAuditRating: finalRating,
      lastUpdated: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
    setEditingAspect(null);
  };

  const handleDeleteAspect = (aspectId: string) => {
    if (window.confirm('¿Desea eliminar este aspecto de la evaluación?')) {
      const updatedAspects = formData.aspects.filter((a) => a.id !== aspectId);
      const { auditorAvg, auditeeAvg, finalRating } = calculateScores(updatedAspects);
      const updated = {
        ...formData,
        aspects: updatedAspects,
        auditorScoreAverage: auditorAvg,
        auditeeScoreAverage: auditeeAvg,
        finalAuditRating: finalRating,
        lastUpdated: new Date().toISOString(),
      };
      setFormData(updated);
      onUpdateEvaluation(updated);
    }
  };

  // Strengths / Opportunities management
  const handleAddAuditorStrength = () => {
    if (!newAuditorStrength.trim()) return;
    const updated = {
      ...formData,
      auditorStrengths: [...formData.auditorStrengths, newAuditorStrength.trim()],
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
    setNewAuditorStrength('');
  };

  const handleRemoveAuditorStrength = (index: number) => {
    const updated = {
      ...formData,
      auditorStrengths: formData.auditorStrengths.filter((_, idx) => idx !== index),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  const handleAddAuditorOpportunity = () => {
    if (!newAuditorOpportunity.trim()) return;
    const updated = {
      ...formData,
      auditorOpportunities: [...formData.auditorOpportunities, newAuditorOpportunity.trim()],
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
    setNewAuditorOpportunity('');
  };

  const handleRemoveAuditorOpportunity = (index: number) => {
    const updated = {
      ...formData,
      auditorOpportunities: formData.auditorOpportunities.filter((_, idx) => idx !== index),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  const handleAddAuditeeStrength = () => {
    if (!newAuditeeStrength.trim()) return;
    const updated = {
      ...formData,
      auditeeStrengths: [...formData.auditeeStrengths, newAuditeeStrength.trim()],
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
    setNewAuditeeStrength('');
  };

  const handleRemoveAuditeeStrength = (index: number) => {
    const updated = {
      ...formData,
      auditeeStrengths: formData.auditeeStrengths.filter((_, idx) => idx !== index),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  const handleAddAuditeeOpportunity = () => {
    if (!newAuditeeOpportunity.trim()) return;
    const updated = {
      ...formData,
      auditeeOpportunities: [...formData.auditeeOpportunities, newAuditeeOpportunity.trim()],
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
    setNewAuditeeOpportunity('');
  };

  const handleRemoveAuditeeOpportunity = (index: number) => {
    const updated = {
      ...formData,
      auditeeOpportunities: formData.auditeeOpportunities.filter((_, idx) => idx !== index),
    };
    setFormData(updated);
    onUpdateEvaluation(updated);
  };

  // Export to Word
  const handleExportWord = () => {
    const auditorAspects = formData.aspects.filter((a) => a.target === 'AUDITOR');
    const auditeeAspects = formData.aspects.filter((a) => a.target === 'AUDITADO');

    const htmlContent = `
      <h2>1. INFORMACIÓN GENERAL DE LA EVALUACIÓN</h2>
      <p><strong>Código Oficial:</strong> ${formData.evaluationCode} | <strong>Fecha:</strong> ${formData.evaluationDate}</p>
      <p><strong>Entidad Evaluadora:</strong> ${formData.evaluatorName} (${formData.evaluatorRole})</p>
      <p><strong>Auditoría Vinculada:</strong> ${currentAudit.code} - ${currentAudit.processArea}</p>

      <h2>2. CALIFICACIÓN GLOBAL CONSOLIDADA</h2>
      <table>
        <tr>
          <th>Puntaje Equipo Auditor</th>
          <th>Puntaje Organización Auditada</th>
          <th>Calificación Integral Ponderada</th>
        </tr>
        <tr>
          <td style="font-size: 14pt; font-weight: bold; text-align: center; color: #1e3a8a;">${formData.auditorScoreAverage} / 5.0</td>
          <td style="font-size: 14pt; font-weight: bold; text-align: center; color: #047857;">${formData.auditeeScoreAverage} / 5.0</td>
          <td style="font-size: 16pt; font-weight: bold; text-align: center; color: #0b2545;">${formData.finalAuditRating} / 5.0 (Sobresaliente)</td>
        </tr>
      </table>

      <h2>3. EVALUACIÓN DETALLADA AL EQUIPO AUDITOR</h2>
      <table>
        <thead>
          <tr>
            <th>Aspecto Evaluado</th>
            <th>Criterio / Descripción</th>
            <th>Calificación (1-5)</th>
            <th>Observaciones y Sustentación</th>
          </tr>
        </thead>
        <tbody>
          ${auditorAspects
            .map(
              (a) => `
            <tr>
              <td><strong>${a.name}</strong><br/><small>${a.category}</small></td>
              <td>${a.description}</td>
              <td style="text-align: center; font-weight: bold;">${a.score} / 5.0</td>
              <td>${a.comments}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>4. EVALUACIÓN DETALLADA A LA ORGANIZACIÓN AUDITADA</h2>
      <table>
        <thead>
          <tr>
            <th>Aspecto Evaluado</th>
            <th>Criterio / Descripción</th>
            <th>Calificación (1-5)</th>
            <th>Observaciones y Sustentación</th>
          </tr>
        </thead>
        <tbody>
          ${auditeeAspects
            .map(
              (a) => `
            <tr>
              <td><strong>${a.name}</strong><br/><small>${a.category}</small></td>
              <td>${a.description}</td>
              <td style="text-align: center; font-weight: bold;">${a.score} / 5.0</td>
              <td>${a.comments}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h2>5. CONCLUSIÓN GENERAL DE LA AUDITORÍA</h2>
      <p>${formData.overallConclusion}</p>
      <p><strong>Observaciones Generales:</strong> ${formData.generalObservations}</p>
    `;

    exportToWord(
      'Certificado_Calificacion_Auditoria',
      htmlContent,
      currentCompany.name,
      currentCompany.nit,
      formData.evaluationCode
    );
  };

  const filteredAspects = formData.aspects.filter(
    (a) => selectedTargetTab === 'ALL' || a.target === selectedTargetTab
  );

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 4.5) {
      return (
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Nivel Sobresaliente ({rating} / 5.0)
        </span>
      );
    }
    if (rating >= 3.8) {
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Nivel Satisfactorio ({rating} / 5.0)
        </span>
      );
    }
    if (rating >= 3.0) {
      return (
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Nivel Aceptable con Mejoras ({rating} / 5.0)
        </span>
      );
    }
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        Nivel Crítico ({rating} / 5.0)
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Módulo 11 · Calificación y Evaluación Integral de la Auditoría</span>
            <span className="text-slate-400">·</span>
            <span>ISO 19011:2018 Numeral 7</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Evaluación Bipartita: Auditores y Auditados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calificación formal de todos los aspectos de la auditoría. Cada criterio, nota, fortaleza y aspecto cuenta con botón de edición directa.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0 no-print">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Evaluación</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Certificado Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={printGtcDocument}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-medium text-emerald-900 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Calificación de auditoría y ponderaciones actualizadas exitosamente.</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tabular">ISO 19011</span>
        </div>
      )}

      {/* KPI Cards: Consolidated Ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Auditor Average */}
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-700" />
              Equipo Evaluador (Auditores)
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              6 Aspectos
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-950 font-mono-tabular">
              {formData.auditorScoreAverage}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Competencia técnica, imparcialidad, puntualidad y sustentación de hallazgos.
          </p>
          <div className="mt-3 flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(formData.auditorScoreAverage)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Auditee Average */}
        <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-indigo-900">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-700" />
              Organización (Auditados)
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
              6 Aspectos
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-950 font-mono-tabular">
              {formData.auditeeScoreAverage}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Colaboración, entrega oportuna de evidencias, veracidad y asimilación de NC.
          </p>
          <div className="mt-3 flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(formData.auditeeScoreAverage)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card 3: Final Consolidated Score */}
        <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Calificación Global Consolidada
              </span>
              <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-mono">
                {formData.evaluationCode}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono-tabular">
                {formData.finalAuditRating}
              </span>
              <span className="text-sm text-blue-300">/ 5.0</span>
            </div>
            <div className="mt-2">{getPerformanceBadge(formData.finalAuditRating)}</div>
          </div>
          <div className="text-[10px] text-blue-300 mt-3 pt-2 border-t border-blue-800/60">
            Auditoría {currentAudit.code} · Conforme a GTC-185 e ISO 19011:2018
          </div>
        </div>
      </div>

      {/* Filter Tabs and Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-100 rounded-lg border border-slate-200 no-print">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-600 px-2 uppercase">Ver Aspectos:</span>
          {(['ALL', 'AUDITOR', 'AUDITADO'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTargetTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                selectedTargetTab === tab
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL'
                ? `Todos (${formData.aspects.length})`
                : tab === 'AUDITOR'
                ? `Auditores (${formData.aspects.filter((a) => a.target === 'AUDITOR').length})`
                : `Auditados (${formData.aspects.filter((a) => a.target === 'AUDITADO').length})`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsNewAspect(true);
            setEditingAspect({
              id: `asp-${Date.now()}`,
              target: selectedTargetTab === 'AUDITADO' ? 'AUDITADO' : 'AUDITOR',
              category: 'Criterio Institucional',
              name: '',
              description: '',
              score: 5,
              maxScore: 5,
              comments: '',
              evidenceNotes: '',
            });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Aspecto Personalizado</span>
        </button>
      </div>

      {/* Aspects List */}
      <div className="space-y-4">
        {filteredAspects.map((aspect) => {
          const isAuditor = aspect.target === 'AUDITOR';

          return (
            <div
              key={aspect.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-colors ${
                isAuditor ? 'border-slate-200 hover:border-blue-300' : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                      isAuditor
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    }`}
                  >
                    {isAuditor ? <Shield className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                    {isAuditor ? 'Evaluación a Auditor' : 'Evaluación a Auditado'}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-500 uppercase px-1">
                    · {aspect.category}
                  </span>

                  <EditableField
                    value={aspect.name}
                    onSave={(newVal) => handleUpdateAspectField(aspect.id, 'name', newVal)}
                    isEditMode={isEditMode}
                    className="font-bold text-slate-900 text-sm"
                    label="Nombre del Aspecto"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Interactive Score Selector 1-5 */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Nota:</span>
                    {[1, 2, 3, 4, 5].map((scoreValue) => (
                      <button
                        key={scoreValue}
                        type="button"
                        onClick={() => handleAspectScoreChange(aspect.id, scoreValue)}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                          aspect.score === scoreValue
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                        title={`Asignar calificación ${scoreValue} de 5`}
                      >
                        {scoreValue}
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-blue-900 px-1 font-mono-tabular">
                      ({aspect.score}/5)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewAspect(false);
                      setEditingAspect(aspect);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                    title="Editar aspecto completo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAspect(aspect.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Eliminar aspecto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-3 text-xs text-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Criterio / Descripción del Aspecto:
                </span>
                <EditableField
                  value={aspect.description}
                  onSave={(newVal) => handleUpdateAspectField(aspect.id, 'description', newVal)}
                  isEditMode={isEditMode}
                  multiline
                  label="Descripción del Aspecto"
                />
              </div>

              {/* Comments & Evidence */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1">
                    Comentarios y Observaciones del Evaluador:
                  </span>
                  <EditableField
                    value={aspect.comments}
                    onSave={(newVal) => handleUpdateAspectField(aspect.id, 'comments', newVal)}
                    isEditMode={isEditMode}
                    multiline
                    label="Comentarios del Evaluador"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Evidencias y Notas de Soporte:
                  </span>
                  <EditableField
                    value={aspect.evidenceNotes || 'Sin notas adicionales'}
                    onSave={(newVal) => handleUpdateAspectField(aspect.id, 'evidenceNotes', newVal)}
                    isEditMode={isEditMode}
                    label="Evidencias y Notas"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvement Opportunities Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Section: Auditor Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-900 border-b border-slate-200 pb-2">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>Balance del Equipo Evaluador (Auditores)</span>
          </div>

          {/* Fortalezas Auditor */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                Fortalezas Destacadas de los Auditores:
              </span>
            </div>
            <ul className="space-y-1.5">
              {formData.auditorStrengths.map((str, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950"
                >
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-bold text-emerald-700">•</span>
                    <EditableField
                      value={str}
                      onSave={(newVal) => {
                        const updated = [...formData.auditorStrengths];
                        updated[idx] = newVal;
                        setFormData({ ...formData, auditorStrengths: updated });
                        onUpdateEvaluation({ ...formData, auditorStrengths: updated });
                      }}
                      isEditMode={isEditMode}
                      label="Fortaleza del Auditor"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuditorStrength(idx)}
                    className="text-slate-400 hover:text-red-600 no-print cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-1 no-print">
              <input
                type="text"
                placeholder="Añadir nueva fortaleza del auditor..."
                value={newAuditorStrength}
                onChange={(e) => setNewAuditorStrength(e.target.value)}
                className="flex-1 p-1.5 text-xs bg-white border border-slate-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddAuditorStrength}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Oportunidades Auditor */}
          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Oportunidades de Mejora para los Auditores:
              </span>
            </div>
            <ul className="space-y-1.5">
              {formData.auditorOpportunities.map((opp, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950"
                >
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-bold text-amber-700">•</span>
                    <EditableField
                      value={opp}
                      onSave={(newVal) => {
                        const updated = [...formData.auditorOpportunities];
                        updated[idx] = newVal;
                        setFormData({ ...formData, auditorOpportunities: updated });
                        onUpdateEvaluation({ ...formData, auditorOpportunities: updated });
                      }}
                      isEditMode={isEditMode}
                      label="Oportunidad de Mejora del Auditor"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuditorOpportunity(idx)}
                    className="text-slate-400 hover:text-red-600 no-print cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-1 no-print">
              <input
                type="text"
                placeholder="Añadir nueva oportunidad para el auditor..."
                value={newAuditorOpportunity}
                onChange={(e) => setNewAuditorOpportunity(e.target.value)}
                className="flex-1 p-1.5 text-xs bg-white border border-slate-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddAuditorOpportunity}
                className="px-3 py-1.5 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Section: Auditee Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-900 border-b border-slate-200 pb-2">
            <Building className="w-4 h-4 text-indigo-700" />
            <span>Balance de la Organización (Auditados)</span>
          </div>

          {/* Fortalezas Auditado */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                Fortalezas Destacadas de los Auditados:
              </span>
            </div>
            <ul className="space-y-1.5">
              {formData.auditeeStrengths.map((str, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950"
                >
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-bold text-emerald-700">•</span>
                    <EditableField
                      value={str}
                      onSave={(newVal) => {
                        const updated = [...formData.auditeeStrengths];
                        updated[idx] = newVal;
                        setFormData({ ...formData, auditeeStrengths: updated });
                        onUpdateEvaluation({ ...formData, auditeeStrengths: updated });
                      }}
                      isEditMode={isEditMode}
                      label="Fortaleza del Auditado"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuditeeStrength(idx)}
                    className="text-slate-400 hover:text-red-600 no-print cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-1 no-print">
              <input
                type="text"
                placeholder="Añadir nueva fortaleza del auditado..."
                value={newAuditeeStrength}
                onChange={(e) => setNewAuditeeStrength(e.target.value)}
                className="flex-1 p-1.5 text-xs bg-white border border-slate-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddAuditeeStrength}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Oportunidades Auditado */}
          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Oportunidades de Mejora para los Auditados:
              </span>
            </div>
            <ul className="space-y-1.5">
              {formData.auditeeOpportunities.map((opp, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950"
                >
                  <div className="flex items-start gap-1.5 flex-1">
                    <span className="font-bold text-amber-700">•</span>
                    <EditableField
                      value={opp}
                      onSave={(newVal) => {
                        const updated = [...formData.auditeeOpportunities];
                        updated[idx] = newVal;
                        setFormData({ ...formData, auditeeOpportunities: updated });
                        onUpdateEvaluation({ ...formData, auditeeOpportunities: updated });
                      }}
                      isEditMode={isEditMode}
                      label="Oportunidad de Mejora del Auditado"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAuditeeOpportunity(idx)}
                    className="text-slate-400 hover:text-red-600 no-print cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-1 no-print">
              <input
                type="text"
                placeholder="Añadir nueva oportunidad para el auditado..."
                value={newAuditeeOpportunity}
                onChange={(e) => setNewAuditeeOpportunity(e.target.value)}
                className="flex-1 p-1.5 text-xs bg-white border border-slate-300 rounded"
              />
              <button
                type="button"
                onClick={handleAddAuditeeOpportunity}
                className="px-3 py-1.5 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* General Observations & Overall Conclusion */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
        <div>
          <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
            Conclusión Integral de la Calificación de la Auditoría:
          </span>
          <EditableField
            value={formData.overallConclusion}
            onSave={(newVal) => {
              const updated = { ...formData, overallConclusion: newVal };
              setFormData(updated);
              onUpdateEvaluation(updated);
            }}
            isEditMode={isEditMode}
            multiline
            className="text-slate-800 font-medium"
            label="Conclusión Integral"
          />
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
            Observaciones Generales y Recomendaciones Metodológicas:
          </span>
          <EditableField
            value={formData.generalObservations}
            onSave={(newVal) => {
              const updated = { ...formData, generalObservations: newVal };
              setFormData(updated);
              onUpdateEvaluation(updated);
            }}
            isEditMode={isEditMode}
            multiline
            className="text-slate-700"
            label="Observaciones Generales"
          />
        </div>
      </div>

      {/* DOCUMENTO FORMAL GTC 185 (HOJA OFICIAL DE EVALUACIÓN) */}
      <div className="gtc-185-page bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-6">
        {/* Encabezado Institucional GTC 185 */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-xs font-bold tracking-widest text-blue-900 uppercase">
            {currentCompany.name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
            NIT: {currentCompany.nit} · {currentCompany.city}
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-3">
            CERTIFICADO OFICIAL DE EVALUACIÓN Y CALIFICACIÓN DE AUDITORÍA
          </h2>
          <div className="text-xs font-bold text-blue-800 font-mono-tabular mt-1">
            CÓDIGO DE EVALUACIÓN: {formData.evaluationCode}
          </div>
        </div>

        {/* Metadatos GTC 185 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">
              Auditoría Evaluada:
            </span>
            <span className="font-bold text-slate-900">{currentAudit.code}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">
              Fecha de Calificación:
            </span>
            <span className="font-mono font-medium text-slate-800">{formData.evaluationDate}</span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block text-[10px] uppercase">
              Comité Evaluador:
            </span>
            <span className="text-slate-900">{formData.evaluatorName}</span>
          </div>
        </div>

        {/* Tabla Resumen de Calificación */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-blue-900">
            Cuadro Consolidado de Calificación Integral
          </h3>
          <table className="w-full text-xs text-left border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3">Estamento Evaluado</th>
                <th className="py-2 px-3">Criterios Evaluados</th>
                <th className="py-2 px-3 text-center">Puntaje Ponderado</th>
                <th className="py-2 px-3 text-center">Nivel de Desempeño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-900">Equipo Auditor (Evaluadores)</td>
                <td className="py-2.5 px-3 text-slate-600">6 aspectos técnicos y conductuales ISO 19011</td>
                <td className="py-2.5 px-3 text-center font-mono font-black text-blue-950 text-sm">
                  {formData.auditorScoreAverage} / 5.0
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Sobresaliente
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-900">Organización (Auditados)</td>
                <td className="py-2.5 px-3 text-slate-600">6 aspectos de apertura, evidencia y liderazgo</td>
                <td className="py-2.5 px-3 text-center font-mono font-black text-indigo-950 text-sm">
                  {formData.auditeeScoreAverage} / 5.0
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Sobresaliente
                  </span>
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-slate-700">
                  Calificación Global de la Auditoría:
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-black text-base text-blue-900">
                  {formData.finalAuditRating} / 5.0
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2.5 py-1 rounded bg-blue-900 text-white font-black text-[10px]">
                    Nivel Superior
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Firmas de Ratificación GTC 185 */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-14 flex items-end justify-center pb-2">
              <span className="font-signature text-blue-900 text-xl font-bold italic">
                {currentAudit.auditorName}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900">
              {currentAudit.auditorName}
            </div>
            <div className="text-[10px] text-slate-500">
              {currentAudit.auditorRole || 'Auditor Líder Certificado ISO 19011'}
            </div>
          </div>

          <div>
            <div className="h-14 flex items-end justify-center pb-2">
              <span className="font-signature text-blue-900 text-xl font-bold italic">
                {currentCompany.legalRepresentative}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900">
              {currentCompany.legalRepresentative}
            </div>
            <div className="text-[10px] text-slate-500">
              Representante Legal / Gerente General (Auditado)
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
          Certificado expedido con base en las directrices de evaluación de auditores y eficacia de auditorías de la norma ISO 19011:2018 y la GTC 185.
        </div>
      </div>

      {/* Modal para Crear / Editar Aspecto de Evaluación */}
      {editingAspect && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {isNewAspect ? 'Nuevo Aspecto de Evaluación' : 'Editar Aspecto de Evaluación'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Calificación técnica bajo ISO 19011:2018
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingAspect(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModalAspect(editingAspect);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Estamento a Evaluar *
                  </label>
                  <select
                    value={editingAspect.target}
                    onChange={(e) =>
                      setEditingAspect({
                        ...editingAspect,
                        target: e.target.value as EvaluationTarget,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="AUDITOR">Auditor (Equipo Evaluador)</option>
                    <option value="AUDITADO">Auditado (Organización)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Calificación (1 a 5) *
                  </label>
                  <select
                    value={editingAspect.score}
                    onChange={(e) =>
                      setEditingAspect({ ...editingAspect, score: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-blue-900"
                  >
                    <option value={5}>5 - Sobresaliente / Excelente</option>
                    <option value={4}>4 - Muy Bueno / Favorable</option>
                    <option value={3}>3 - Aceptable / Regular</option>
                    <option value={2}>2 - Deficiente / Con Dificultades</option>
                    <option value={1}>1 - Crítico / No Cumple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Categoría del Aspecto *
                </label>
                <input
                  type="text"
                  required
                  value={editingAspect.category}
                  onChange={(e) =>
                    setEditingAspect({ ...editingAspect, category: e.target.value })
                  }
                  placeholder="Ej: Competencia Técnica, Comunicación, Logística..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Nombre del Aspecto *
                </label>
                <input
                  type="text"
                  required
                  value={editingAspect.name}
                  onChange={(e) => setEditingAspect({ ...editingAspect, name: e.target.value })}
                  placeholder="Ej: Dominio de la norma GTC 185 en redacción de actas"
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Descripción / Criterio de Verificación *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingAspect.description}
                  onChange={(e) =>
                    setEditingAspect({ ...editingAspect, description: e.target.value })
                  }
                  placeholder="Explique qué se evalúa exactamente..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">
                  Comentarios y Observaciones del Evaluador
                </label>
                <textarea
                  rows={2}
                  value={editingAspect.comments}
                  onChange={(e) =>
                    setEditingAspect({ ...editingAspect, comments: e.target.value })
                  }
                  placeholder="Observaciones cualitativas sobre el desempeño observado..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Notas de Evidencias o Soportes
                </label>
                <input
                  type="text"
                  value={editingAspect.evidenceNotes || ''}
                  onChange={(e) =>
                    setEditingAspect({ ...editingAspect, evidenceNotes: e.target.value })
                  }
                  placeholder="Ej: Muestreo de actas, entrevistas, lista de asistencia..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAspect(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Aspecto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
