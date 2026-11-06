/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  loadDatabase,
  saveDatabase,
  exportBackup,
  importBackup,
  resetDatabase,
  AppDatabaseState,
} from './services/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { AuditScheduleModule } from './components/audit-schedule/AuditScheduleModule';
import { AuditPlanModule } from './components/audit-plan/AuditPlanModule';
import { InitiationMinuteModule } from './components/initiation-minute/InitiationMinuteModule';
import { ChecklistModule } from './components/checklist/ChecklistModule';
import { FindingsModule } from './components/findings/FindingsModule';
import { RiskMatrixModule } from './components/risk-matrix/RiskMatrixModule';
import { ClosingMinuteModule } from './components/closing-minute/ClosingMinuteModule';
import { FinalReportModule } from './components/final-report/FinalReportModule';
import { ImprovementPlanModule } from './components/improvement-plan/ImprovementPlanModule';
import { AuditEvaluationModule } from './components/audit-evaluation/AuditEvaluationModule';
import { FileManagerModule } from './components/file-manager/FileManagerModule';
import { DocumentScannerModal } from './components/scanner/DocumentScannerModal';
import { UserManualModule } from './components/user-manual/UserManualModule';
import { RefreshCw } from 'lucide-react';
import { INITIAL_AUDIT_EVALUATION } from './data/initialData';
import {
  synchronizeAllAuditData,
  cascadeUpdateCompany,
  cascadeUpdateAuditSession,
  cascadeUpdateInitiationMinute,
  cascadeUpdateClosingMinute,
  cascadeUpdateAuditPlan,
  cascadeUpdateFindings,
  cascadeUpdateRisks,
  cascadeUpdateImprovementPlan,
  cascadeUpdateChecklist,
  cascadeUpdateFinalReport,
} from './utils/syncEngine';
import {
  Company,
  AuditSession,
  AuditPlan,
  InitiationMinute,
  ChecklistItem,
  ComplianceStatus,
  AuditFinding,
  RiskMatrixItem,
  ClosingMinute,
  ImprovementPlanItem,
  FinalReport,
  DocumentFile,
  UserRole,
  AuditEvaluation,
} from './types/audit';

export default function App() {
  const [dbState, setDbState] = useState<AppDatabaseState>(() => synchronizeAllAuditData(loadDatabase()));
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [findingModalPreloadItem, setFindingModalPreloadItem] = useState<AuditFinding | null>(null);
  const [globalToast, setGlobalToast] = useState<{ message: string; submessage?: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save synchronization effect:
  // Whenever dbState changes, if auto-save is enabled, persist to localStorage
  useEffect(() => {
    if (dbState.isAutoSaveEnabled) {
      saveDatabase(dbState);
    }
  }, [dbState]);

  // Current selected entities
  const currentCompany =
    dbState.companies.find((c) => c.id === dbState.currentCompanyId) || dbState.companies[0];
  const currentAudit =
    dbState.auditSessions.find((a) => a.id === dbState.currentAuditId) || dbState.auditSessions[0];

  const currentPlan =
    (currentAudit && dbState.auditPlans[currentAudit.id]) ||
    dbState.auditPlans['aud-01'] || {
      id: 'plan-default',
      auditId: currentAudit?.id || 'aud-01',
      objective: currentAudit?.objective || '',
      scope: currentAudit?.scope || '',
      criteria: [],
      processesToEvaluate: [currentAudit?.processArea || 'Operaciones'],
      responsibles: [currentAudit?.auditorName || 'Auditor Líder'],
      scheduleItems: [],
      necessaryResources: ['Acceso a instalaciones'],
      gatheringTechniques: ['Entrevistas', 'Muestreo'],
      status: 'BORRADOR',
    };

  const currentInitiationMinute =
    (currentAudit && dbState.initiationMinutes[currentAudit.id]) ||
    dbState.initiationMinutes['aud-01'];

  const currentChecklist =
    (currentAudit && dbState.checklists[currentAudit.id]) ||
    dbState.checklists['aud-01'] ||
    [];

  const currentFindings =
    (currentAudit && dbState.findings[currentAudit.id]) ||
    dbState.findings['aud-01'] ||
    [];

  const currentRisks =
    (currentAudit && dbState.risks[currentAudit.id]) ||
    dbState.risks['aud-01'] ||
    [];

  const currentClosingMinute =
    (currentAudit && dbState.closingMinutes[currentAudit.id]) ||
    dbState.closingMinutes['aud-01'];

  const currentImprovementPlan =
    (currentAudit && dbState.improvementPlans[currentAudit.id]) ||
    dbState.improvementPlans['aud-01'] ||
    [];

  const currentFinalReport =
    (currentAudit && dbState.finalReports[currentAudit.id]) ||
    dbState.finalReports['aud-01'];

  const currentDocuments =
    (currentAudit && dbState.documents[currentAudit.id]) ||
    dbState.documents['aud-01'] ||
    [];

  const currentEvaluation =
    (currentAudit && dbState.evaluations && dbState.evaluations[currentAudit.id]) ||
    dbState.evaluations?.['aud-01'] ||
    INITIAL_AUDIT_EVALUATION;

  // Mutadores con sincronización y propagación automática de datos
  const updateAuditSession = (updated: AuditSession) => {
    setDbState((prev) => cascadeUpdateAuditSession(prev, updated));
  };

  const addNewAuditSession = (newAudit: AuditSession) => {
    setDbState((prev) => {
      const intermediateState = {
        ...prev,
        auditSessions: [newAudit, ...prev.auditSessions],
        currentAuditId: newAudit.id,
        auditPlans: {
          ...prev.auditPlans,
          [newAudit.id]: {
            ...prev.auditPlans['aud-01'],
            id: `plan-${newAudit.id}`,
            auditId: newAudit.id,
            objective: newAudit.objective,
            scope: newAudit.scope,
            processesToEvaluate: [newAudit.processArea],
          },
        },
        initiationMinutes: {
          ...prev.initiationMinutes,
          [newAudit.id]: {
            ...prev.initiationMinutes['aud-01'],
            id: `acta-ini-${newAudit.id}`,
            auditId: newAudit.id,
            minuteCode: `ACT-INI-${newAudit.code}`,
            date: newAudit.executionDate,
            companyName: currentCompany.name,
            companyNit: currentCompany.nit,
            auditorName: newAudit.auditorName,
          },
        },
        checklists: {
          ...prev.checklists,
          [newAudit.id]: (prev.checklists['aud-01'] || []).map((c, i) => ({
            ...c,
            id: `chk-${newAudit.id}-${i}`,
            auditId: newAudit.id,
            compliance: 'PENDIENTE' as ComplianceStatus,
            findingId: undefined,
          })),
        },
        findings: {
          ...prev.findings,
          [newAudit.id]: [],
        },
        risks: {
          ...prev.risks,
          [newAudit.id]: [],
        },
        closingMinutes: {
          ...prev.closingMinutes,
          [newAudit.id]: {
            ...prev.closingMinutes['aud-01'],
            id: `acta-cie-${newAudit.id}`,
            auditId: newAudit.id,
            minuteCode: `ACT-CIE-${newAudit.code}`,
            date: newAudit.executionDate,
          },
        },
        improvementPlans: {
          ...prev.improvementPlans,
          [newAudit.id]: [],
        },
        finalReports: {
          ...prev.finalReports,
          [newAudit.id]: {
            ...prev.finalReports['aud-01'],
            id: `rep-${newAudit.id}`,
            auditId: newAudit.id,
            reportCode: `INF-${newAudit.code}`,
            issueDate: newAudit.executionDate,
          },
        },
        documents: {
          ...prev.documents,
          [newAudit.id]: [],
        },
      };
      return synchronizeAllAuditData(intermediateState);
    });
  };

  const updateCompany = (updatedComp: Company) => {
    setDbState((prev) => cascadeUpdateCompany(prev, updatedComp));
  };

  const addNewCompany = (newComp: Company) => {
    setDbState((prev) => {
      const intermediate = {
        ...prev,
        companies: [...prev.companies, newComp],
        currentCompanyId: newComp.id,
      };
      return cascadeUpdateCompany(intermediate, newComp);
    });
  };

  const updateAuditPlan = (updatedPlan: AuditPlan) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateAuditPlan(prev, currentAudit.id, updatedPlan));
  };

  const updateInitiationMinute = (updatedMinute: InitiationMinute) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateInitiationMinute(prev, currentAudit.id, updatedMinute));
  };

  const updateChecklist = (updatedList: ChecklistItem[]) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateChecklist(prev, currentAudit.id, updatedList));
  };

  const updateFindings = (updatedFindings: AuditFinding[]) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateFindings(prev, currentAudit.id, updatedFindings));
  };

  const updateRisks = (updatedRisks: RiskMatrixItem[]) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateRisks(prev, currentAudit.id, updatedRisks));
  };

  const updateClosingMinute = (updatedMinute: ClosingMinute) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateClosingMinute(prev, currentAudit.id, updatedMinute));
  };

  const updateFinalReport = (updatedReport: FinalReport) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateFinalReport(prev, currentAudit.id, updatedReport));
  };

  const updateImprovementPlan = (updatedItems: ImprovementPlanItem[]) => {
    if (!currentAudit) return;
    setDbState((prev) => cascadeUpdateImprovementPlan(prev, currentAudit.id, updatedItems));
  };

  const handleForceFullSync = () => {
    setDbState((prev) => {
      const synced = synchronizeAllAuditData(prev);
      saveDatabase(synced);
      return synced;
    });
    setGlobalToast({
      message: '¡Sincronización Total Completada!',
      submessage: 'Toda la información ha sido actualizada automáticamente en los informes oficiales, actas reglamentarias GTC 185 y matrices.',
      type: 'success',
    });
    setTimeout(() => setGlobalToast(null), 4000);
  };

  const handleUploadDocument = (doc: DocumentFile) => {
    if (!currentAudit) return;
    setDbState((prev) => {
      const existing = prev.documents[currentAudit.id] || [];
      return {
        ...prev,
        documents: {
          ...prev.documents,
          [currentAudit.id]: [doc, ...existing],
        },
      };
    });
  };

  const handleDeleteDocument = (docId: string) => {
    if (!currentAudit) return;
    setDbState((prev) => {
      const existing = prev.documents[currentAudit.id] || [];
      return {
        ...prev,
        documents: {
          ...prev.documents,
          [currentAudit.id]: existing.filter((d) => d.id !== docId),
        },
      };
    });
  };

  const updateEvaluation = (updated: AuditEvaluation) => {
    if (!currentAudit) return;
    setDbState((prev) => {
      const intermediateState: AppDatabaseState = {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [currentAudit.id]: updated,
        },
      };
      return synchronizeAllAuditData(intermediateState);
    });
  };

  // Automatic trigger: Non-compliance opens finding form modal
  const handleOpenFindingFormForNonCompliance = (item: ChecklistItem) => {
    const codePrefix = 'NC-MAY';
    const newCode = `${codePrefix}-${String(currentFindings.length + 1).padStart(3, '0')}`;
    const newFinding: AuditFinding = {
      id: `hal-${Date.now()}`,
      auditId: currentAudit.id,
      checklistItemId: item.id,
      code: newCode,
      title: `Incumplimiento detectado en: ${item.processName}`,
      questionA_weakness: `Durante la verificación de "${item.question}", se constató que no se cumple el requisito establecido. ${item.observations || ''}`.trim(),
      questionB_processStage: `En la etapa operativa del proceso de ${item.processName}`,
      questionC_standardViolated: item.criterionReference || 'Norma técnica aplicable GTC 185 / ISO 9001',
      questionD_consequences: 'Riesgo de no conformidad formal en auditoría de certificación y pérdida de control operacional.',
      questionE_solution: 'Revisar de inmediato los registros, actualizar la documentación técnica y capacitar al responsable del área.',
      detailedDescription: item.observations || 'Observación registrada durante la lista de chequeo.',
      objectiveEvidence: item.evidenceFound || item.reviewedDocuments || 'Inspección física y documental.',
      responsibleArea: item.processName,
      responsiblePerson: item.responsiblePerson || currentCompany.legalRepresentative,
      classification: item.compliance === 'NO_CUMPLE' ? 'NO_CONFORMIDAD_MAYOR' : 'NO_CONFORMIDAD_MENOR',
      identificationDate: currentAudit.executionDate,
    };

    setFindingModalPreloadItem(newFinding);
    setActiveTab('findings');
  };

  // Backup & Restore
  const handleExportBackup = () => {
    exportBackup(dbState);
  };

  const handleImportBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importBackup(
      file,
      (newState) => {
        setDbState(newState);
        setGlobalToast({
          message: 'Respaldo restaurado',
          submessage: 'Se cargaron todas las empresas, auditorías y firmas correctamente.',
          type: 'success',
        });
        setTimeout(() => setGlobalToast(null), 3000);
      },
      (errorMsg) => {
        setGlobalToast({
          message: 'Error al importar',
          submessage: errorMsg,
          type: 'error',
        });
        setTimeout(() => setGlobalToast(null), 4000);
      }
    );
  };

  const handleResetData = () => {
    const reset = resetDatabase();
    setDbState(reset);
    setGlobalToast({
      message: 'Demostración restablecida',
      submessage: 'Se cargaron los datos iniciales predeterminados de AUDITPRO.',
      type: 'success',
    });
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const handleManualSave = () => {
    const res = saveDatabase(dbState);
    if (res.success) {
      setDbState((prev) => ({ ...prev, lastSavedAt: res.time }));
      setGlobalToast({
        message: '¡Cambios guardados con éxito!',
        submessage: `Todos los datos, actas, checklists, riesgos y firmas han sido guardados (${res.time}).`,
        type: 'success',
      });
    } else {
      setGlobalToast({
        message: 'Aviso de almacenamiento',
        submessage: res.error || 'Error al persistir en el navegador.',
        type: 'error',
      });
    }
    setTimeout(() => {
      setGlobalToast(null);
    }, 3500);
  };

  // Counters for sidebar badges
  const pendingFindingsCount = currentFindings.length;
  const criticalRisksCount = currentRisks.filter((r) => r.riskLevel === 'CRITICO').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Hidden file input for backup restoration */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <Navbar
        companies={dbState.companies}
        currentCompanyId={dbState.currentCompanyId}
        onSelectCompany={(comp) => setDbState((prev) => ({ ...prev, currentCompanyId: comp }))}
        currentRole={dbState.currentRole}
        onSelectRole={(role) => setDbState((prev) => ({ ...prev, currentRole: role }))}
        isAutoSaveEnabled={dbState.isAutoSaveEnabled}
        onToggleAutoSave={() =>
          setDbState((prev) => ({ ...prev, isAutoSaveEnabled: !prev.isAutoSaveEnabled }))
        }
        isEditMode={dbState.isEditMode}
        onToggleEditMode={() => setDbState((prev) => ({ ...prev, isEditMode: !prev.isEditMode }))}
        lastSavedAt={dbState.lastSavedAt}
        onManualSave={handleManualSave}
        onOpenUserManual={() => setActiveTab('manual')}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'scanner') {
              setIsScannerOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onResetData={handleResetData}
          pendingFindingsCount={pendingFindingsCount}
          criticalRisksCount={criticalRisksCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Barra de Notificación de Sincronización Automática Integral */}
          <div className="mb-5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 border border-blue-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-800 font-medium min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 truncate">
                    Sincronización Automática Integral Activa
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En tiempo real
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate sm:whitespace-normal">
                  Cualquier dato modificado en la empresa, fechas, responsables, firmas, objetivos o hallazgos se actualiza automáticamente en los informes oficiales y actas (GTC 185).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleForceFullSync}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 shadow-2xs transition-all active:scale-95"
                title="Verificar y forzar la propagación de todos los datos en actas e informes"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Actualizar Todo</span>
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <DashboardModule
              state={dbState}
              onNavigate={(tab) => {
                if (tab === 'scanner') setIsScannerOpen(true);
                else setActiveTab(tab);
              }}
              onUpdateTitle={(title) =>
                setDbState((prev) => ({
                  ...prev,
                  customizations: { ...prev.customizations, institutionHeaderTitle: title },
                }))
              }
              onUpdateSubtitle={(sub) =>
                setDbState((prev) => ({
                  ...prev,
                  customizations: { ...prev.customizations, institutionSubtitle: sub },
                }))
              }
            />
          )}

          {activeTab === 'schedule' && (
            <AuditScheduleModule
              companies={dbState.companies}
              currentCompany={currentCompany}
              auditSessions={dbState.auditSessions}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdateAudit={updateAuditSession}
              onAddNewAudit={addNewAuditSession}
              onSelectAudit={(id) => setDbState((prev) => ({ ...prev, currentAuditId: id }))}
              onUpdateCompany={updateCompany}
              onAddNewCompany={addNewCompany}
            />
          )}

          {activeTab === 'plan' && (
            <AuditPlanModule
              plan={currentPlan}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdatePlan={updateAuditPlan}
              onUpdateAudit={updateAuditSession}
              onUpdateCompany={updateCompany}
            />
          )}

          {activeTab === 'initiation-minute' && currentInitiationMinute && (
            <InitiationMinuteModule
              minute={currentInitiationMinute}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdateMinute={updateInitiationMinute}
              onUploadDocument={handleUploadDocument}
              onUpdateAudit={updateAuditSession}
              onUpdateCompany={updateCompany}
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistModule
              checklist={currentChecklist}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdateChecklist={updateChecklist}
              onOpenFindingFormForNonCompliance={handleOpenFindingFormForNonCompliance}
            />
          )}

          {activeTab === 'findings' && (
            <FindingsModule
              findings={currentFindings}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdateFindings={updateFindings}
              initialOpenModalWithItem={findingModalPreloadItem}
              onCloseInitialModal={() => setFindingModalPreloadItem(null)}
            />
          )}

          {activeTab === 'risks' && (
            <RiskMatrixModule
              risks={currentRisks}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              riskMethodologyExplanation={dbState.customizations.riskMethodologyExplanation}
              onUpdateRisks={updateRisks}
              onUpdateMethodology={(newExpl) =>
                setDbState((prev) => ({
                  ...prev,
                  customizations: { ...prev.customizations, riskMethodologyExplanation: newExpl },
                }))
              }
            />
          )}

          {activeTab === 'closing-minute' && currentClosingMinute && (
            <ClosingMinuteModule
              minute={currentClosingMinute}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              findings={currentFindings}
              risks={currentRisks}
              improvementPlan={currentImprovementPlan}
              onUpdateMinute={updateClosingMinute}
              onUploadDocument={handleUploadDocument}
              onUpdateAudit={updateAuditSession}
              onUpdateCompany={updateCompany}
            />
          )}

          {activeTab === 'final-report' && currentFinalReport && (
            <FinalReportModule
              report={currentFinalReport}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              auditPlan={currentPlan}
              checklist={currentChecklist}
              findings={currentFindings}
              risks={currentRisks}
              improvementPlan={currentImprovementPlan}
              documents={currentDocuments}
              isEditMode={dbState.isEditMode}
              onUpdateReport={updateFinalReport}
              onUpdateAudit={updateAuditSession}
              onUpdateCompany={updateCompany}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeTab === 'improvement-plan' && (
            <ImprovementPlanModule
              planItems={currentImprovementPlan}
              findings={currentFindings}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdatePlanItems={updateImprovementPlan}
            />
          )}

          {activeTab === 'evaluation' && currentEvaluation && (
            <AuditEvaluationModule
              evaluation={currentEvaluation}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUpdateEvaluation={updateEvaluation}
            />
          )}

          {activeTab === 'file-manager' && (
            <FileManagerModule
              documents={currentDocuments}
              currentCompany={currentCompany}
              currentAudit={currentAudit}
              isEditMode={dbState.isEditMode}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'manual' && <UserManualModule />}
        </main>
      </div>

      {/* Escáner Documental GTC 185 Modal */}
      {isScannerOpen && (
        <DocumentScannerModal
          auditId={currentAudit.id}
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onSaveScannedDocument={(newDoc) => {
            handleUploadDocument(newDoc);
            setActiveTab('file-manager');
          }}
          defaultProcess={currentAudit.processArea}
        />
      )}

      {/* Floating Global Toast Notification */}
      {globalToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 ${
              globalToast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/80 text-white'
                : 'bg-rose-950 border-rose-500 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  globalToast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold">{globalToast.message}</h4>
                {globalToast.submessage && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{globalToast.submessage}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGlobalToast(null)}
              className="text-slate-400 hover:text-white p-0.5 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
