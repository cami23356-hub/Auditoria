/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Trash2,
  Save,
  Download,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RiskMatrixItem, RiskLevel, Company, AuditSession } from '../../types/audit';
import { exportToExcel } from '../../utils/exportUtils';
import { EditableField } from '../common/EditableField';

interface RiskMatrixModuleProps {
  risks: RiskMatrixItem[];
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  riskMethodologyExplanation: string;
  onUpdateRisks: (updatedRisks: RiskMatrixItem[]) => void;
  onUpdateMethodology: (newExplanation: string) => void;
}

export function computeRiskLevel(score: number): RiskLevel {
  if (score >= 15) return 'CRITICO';
  if (score >= 10) return 'ALTO';
  if (score >= 5) return 'MEDIO';
  return 'BAJO';
}

export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'CRITICO':
      return 'bg-red-600 text-white';
    case 'ALTO':
      return 'bg-orange-500 text-white';
    case 'MEDIO':
      return 'bg-amber-400 text-slate-900';
    case 'BAJO':
      return 'bg-emerald-500 text-white';
  }
}

export const RiskMatrixModule: React.FC<RiskMatrixModuleProps> = ({
  risks,
  currentCompany,
  currentAudit,
  isEditMode,
  riskMethodologyExplanation,
  onUpdateRisks,
  onUpdateMethodology,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ prob: number; imp: number } | null>(null);
  const [isNewRiskModalOpen, setIsNewRiskModalOpen] = useState(false);

  const handleAddRisk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const prob = Number(elements.probability.value);
    const imp = Number(elements.impact.value);
    const score = prob * imp;

    const newRisk: RiskMatrixItem = {
      id: `rie-${Date.now()}`,
      auditId: currentAudit.id,
      code: `RIE-${String(risks.length + 1).padStart(2, '0')}`,
      process: elements.process.value,
      identifiedRisk: elements.identifiedRisk.value,
      riskCause: elements.riskCause.value,
      consequences: elements.consequences.value,
      probability: prob,
      impact: imp,
      riskScore: score,
      riskLevel: computeRiskLevel(score),
      existingControls: elements.existingControls.value,
      preventiveActions: elements.preventiveActions.value,
    };

    const updated = [newRisk, ...risks];
    onUpdateRisks(updated);
    setIsNewRiskModalOpen(false);
  };

  const handleRemoveRisk = (id: string) => {
    const updated = risks.filter((r) => r.id !== id);
    onUpdateRisks(updated);
  };

  const handleUpdateRisk = (id: string, updates: Partial<RiskMatrixItem>) => {
    const updated = risks.map((r) => (r.id === id ? { ...r, ...updates } : r));
    onUpdateRisks(updated);
  };

  const handleExportExcel = () => {
    const headers = [
      'Código',
      'Proceso',
      'Riesgo Identificado',
      'Causa del Riesgo',
      'Consecuencias Potenciales',
      'Probabilidad (1-5)',
      'Impacto (1-5)',
      'Puntaje (Prob x Imp)',
      'Nivel de Riesgo',
      'Controles Existentes',
      'Acciones Preventivas',
    ];

    const rows = risks.map((r) => [
      r.code,
      r.process,
      r.identifiedRisk,
      r.riskCause,
      r.consequences,
      r.probability,
      r.impact,
      r.riskScore,
      r.riskLevel,
      r.existingControls,
      r.preventiveActions,
    ]);

    exportToExcel(`Matriz_Riesgos_${currentAudit.code}`, headers, rows);
  };

  // Matrix Heatmap grid (Probabilidad y eje Impacto: 1 a 5)
  // Rows: Probabilidad 5 down to 1
  // Cols: Impacto 1 up to 5
  const probLevels = [5, 4, 3, 2, 1];
  const impactLevels = [1, 2, 3, 4, 5];

  const getCellRisks = (prob: number, imp: number) => {
    return risks.filter((r) => r.probability === prob && r.impact === imp);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Módulo 6 · Evaluación y Calificación del Riesgo</span>
            <span className="text-slate-400">·</span>
            <span>Matriz Térmica 5x5 (ISO 31000 / GTC 45)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Matriz de Riesgos y Evaluación de Probabilidad e Impacto
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeo gráfico de severidad, análisis de controles operacionales y formulación de acciones preventivas.
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
            onClick={() => setIsNewRiskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Riesgo</span>
          </button>
        </div>
      </div>

      {/* Configuración Metodológica Explicada */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 space-y-1">
        <div className="flex items-center gap-2 font-bold text-blue-900 uppercase tracking-wide">
          <Info className="w-4 h-4 text-blue-700" />
          <span>Metodología de Calificación Configurable:</span>
        </div>
        <EditableField
          value={riskMethodologyExplanation}
          onSave={onUpdateMethodology}
          isEditMode={isEditMode}
          className="text-xs text-blue-900 leading-relaxed font-medium"
          label="Explicación Metodológica de Calificación"
          multiline
        />
      </div>

      {/* MATRIZ DE CALOR 5x5 INTERACTIVA */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            Matriz Térmica de Riesgos (Probabilidad vs Impacto)
          </h2>
          <span className="text-xs text-slate-500">
            Haga clic en cualquier celda para filtrar los riesgos ubicados en ese cuadrante
          </span>
        </div>

        <div className="overflow-x-auto flex flex-col items-center py-2">
          <div className="min-w-[620px]">
            {/* Header Column: Impacto */}
            <div className="text-center font-bold text-xs text-slate-700 uppercase mb-2">
              ← NIVEL DE IMPACTO DE LAS CONSECUENCIAS (1 a 5) →
            </div>

            <div className="flex">
              {/* Eje Y: Probabilidad */}
              <div className="w-24 flex items-center justify-center font-bold text-xs text-slate-700 uppercase -rotate-90">
                PROBABILIDAD →
              </div>

              {/* Grid 5x5 */}
              <div className="flex-1">
                {/* Impact headers */}
                <div className="grid grid-cols-5 text-center text-[11px] font-bold text-slate-600 mb-1">
                  <div>1. Insignificante</div>
                  <div>2. Menor</div>
                  <div>3. Moderado</div>
                  <div>4. Mayor</div>
                  <div>5. Catastrófico</div>
                </div>

                {/* Rows */}
                {probLevels.map((prob) => {
                  const probLabels: Record<number, string> = {
                    5: '5. Casi Seguro',
                    4: '4. Probable',
                    3: '3. Posible',
                    2: '2. Improbable',
                    1: '1. Raro',
                  };

                  return (
                    <div key={prob} className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-24 text-[11px] font-semibold text-slate-700 text-right pr-2 shrink-0">
                        {probLabels[prob]}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {impactLevels.map((imp) => {
                          const score = prob * imp;
                          const level = computeRiskLevel(score);
                          const cellRisks = getCellRisks(prob, imp);
                          const isSelected = selectedCell?.prob === prob && selectedCell?.imp === imp;

                          let bgStyle = 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-emerald-300';
                          if (level === 'MEDIO')
                            bgStyle = 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-amber-300';
                          if (level === 'ALTO')
                            bgStyle = 'bg-orange-100 text-orange-900 hover:bg-orange-200 border-orange-300';
                          if (level === 'CRITICO')
                            bgStyle = 'bg-red-200 text-red-950 hover:bg-red-300 border-red-400 font-bold';

                          return (
                            <button
                              key={imp}
                              type="button"
                              onClick={() => {
                                if (isSelected) setSelectedCell(null);
                                else setSelectedCell({ prob, imp });
                              }}
                              className={`h-16 rounded-lg border p-1.5 flex flex-col items-center justify-between transition-all ${bgStyle} ${
                                isSelected ? 'ring-2 ring-slate-900 scale-102 shadow-md' : ''
                              }`}
                            >
                              <div className="w-full flex justify-between items-center text-[10px]">
                                <span className="font-mono-tabular opacity-75">{score} pts</span>
                                <span className="text-[9px] font-bold uppercase">{level}</span>
                              </div>
                              <div className="text-center font-extrabold text-sm font-mono-tabular">
                                {cellRisks.length > 0 ? (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-xs">
                                    {cellRisks.length} {cellRisks.length === 1 ? 'Riesgo' : 'Riesgos'}
                                  </span>
                                ) : (
                                  <span className="opacity-30">-</span>
                                )}
                              </div>
                              <span className="text-[9px] opacity-70">
                                P:{prob} · I:{imp}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Detallada de Riesgos Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Inventario de Riesgos Evaluados ({risks.length} Registros)
            </h2>
            <span className="text-xs text-slate-500">
              {selectedCell
                ? `Filtrado por cuadrante Probabilidad ${selectedCell.prob} e Impacto ${selectedCell.imp}`
                : 'Mostrando todos los riesgos de la auditoría'}
            </span>
          </div>
          {selectedCell && (
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline"
            >
              Quitar filtro de celda
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          {risks
            .filter((r) => {
              if (!selectedCell) return true;
              return r.probability === selectedCell.prob && r.impact === selectedCell.imp;
            })
            .map((risk) => (
              <div
                key={risk.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular font-extrabold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {risk.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      <EditableField
                        value={risk.process}
                        isEditable={isEditMode}
                        onSave={(val) => handleUpdateRisk(risk.id, { process: val })}
                      />
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskColorClass(risk.riskLevel)}`}>
                      Nivel {risk.riskLevel} ({risk.riskScore} pts)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRisk(risk.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Eliminar riesgo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  <h4 className="font-bold text-slate-900">
                    <EditableField
                      value={risk.identifiedRisk}
                      isEditable={isEditMode}
                      multiline
                      onSave={(val) => handleUpdateRisk(risk.id, { identifiedRisk: val })}
                    />
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-slate-700">
                    <div>
                      <strong className="text-slate-900 text-[11px] block">Causa del Riesgo:</strong>
                      <EditableField
                        value={risk.riskCause}
                        isEditable={isEditMode}
                        multiline
                        onSave={(val) => handleUpdateRisk(risk.id, { riskCause: val })}
                      />
                    </div>
                    <div>
                      <strong className="text-slate-900 text-[11px] block">Consecuencias Potenciales:</strong>
                      <EditableField
                        value={risk.consequences}
                        isEditable={isEditMode}
                        multiline
                        onSave={(val) => handleUpdateRisk(risk.id, { consequences: val })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800 text-[10px] uppercase block mb-0.5">
                      Controles Existentes:
                    </span>
                    <EditableField
                      value={risk.existingControls}
                      isEditable={isEditMode}
                      multiline
                      onSave={(val) => handleUpdateRisk(risk.id, { existingControls: val })}
                    />
                  </div>
                  <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200">
                    <span className="font-bold text-emerald-900 text-[10px] uppercase block mb-0.5">
                      Acciones Preventivas:
                    </span>
                    <EditableField
                      value={risk.preventiveActions}
                      isEditable={isEditMode}
                      multiline
                      onSave={(val) => handleUpdateRisk(risk.id, { preventiveActions: val })}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Registrar Nuevo Riesgo */}
      {isNewRiskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleAddRisk}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Registrar y Evaluar Nuevo Riesgo</h3>
                <button
                  type="button"
                  onClick={() => setIsNewRiskModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proceso o Área Asociada:</label>
                  <input
                    name="process"
                    placeholder="Ej. Producción y Soldadura / Gestión Documental"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Riesgo Identificado:</label>
                  <textarea
                    name="identifiedRisk"
                    rows={2}
                    placeholder="Describa el evento o incertidumbre que puede afectar el logro de objetivos..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Probabilidad de Ocurrencia:</label>
                    <select name="probability" className="w-full p-2 border border-slate-300 rounded-lg font-bold">
                      <option value="1">1 - Raro</option>
                      <option value="2">2 - Improbable</option>
                      <option value="3">3 - Posible</option>
                      <option value="4">4 - Probable</option>
                      <option value="5">5 - Casi Seguro</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Impacto de Consecuencias:</label>
                    <select name="impact" className="w-full p-2 border border-slate-300 rounded-lg font-bold">
                      <option value="1">1 - Insignificante</option>
                      <option value="2">2 - Menor</option>
                      <option value="3">3 - Moderado</option>
                      <option value="4">4 - Mayor</option>
                      <option value="5">5 - Catastrófico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Causa Raíz del Riesgo:</label>
                    <textarea
                      name="riskCause"
                      rows={2}
                      placeholder="¿Por qué se originaría este riesgo?"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Consecuencias Esperadas:</label>
                    <textarea
                      name="consequences"
                      rows={2}
                      placeholder="Impacto en costos, calidad, imagen o legalidad..."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Controles Operacionales Existentes:</label>
                  <input
                    name="existingControls"
                    placeholder="Ej. Inspecciones visuales, procedimientos escritos, formatos de control"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Acciones Preventivas Propuestas:</label>
                  <input
                    name="preventiveActions"
                    placeholder="Ej. Capacitación, automatización, bloqueo físico de equipos vencidos"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRiskModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Guardar y Calificar Riesgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
