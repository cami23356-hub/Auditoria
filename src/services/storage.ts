/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Company,
  AuditSession,
  AuditPlan,
  InitiationMinute,
  ChecklistItem,
  AuditFinding,
  RiskMatrixItem,
  ClosingMinute,
  ImprovementPlanItem,
  FinalReport,
  DocumentFile,
  GlobalCustomizations,
  UserRole,
  AuditEvaluation,
} from '../types/audit';
import {
  INITIAL_COMPANIES,
  INITIAL_AUDIT_SESSIONS,
  INITIAL_AUDIT_PLAN,
  INITIAL_INITIATION_MINUTE,
  INITIAL_CHECKLIST,
  INITIAL_FINDINGS,
  INITIAL_RISKS,
  INITIAL_CLOSING_MINUTE,
  INITIAL_IMPROVEMENT_PLAN,
  INITIAL_FINAL_REPORT,
  INITIAL_DOCUMENTS,
  INITIAL_CUSTOMIZATIONS,
  INITIAL_AUDIT_EVALUATION,
} from '../data/initialData';

const STORAGE_KEY = 'auditpro_database_v2';
const AUTOSAVE_SETTING_KEY = 'auditpro_autosave_setting';

export interface AppDatabaseState {
  currentRole: UserRole;
  currentCompanyId: string;
  currentAuditId: string;
  isEditMode: boolean;
  isAutoSaveEnabled: boolean;
  lastSavedAt: string | null;
  companies: Company[];
  auditSessions: AuditSession[];
  auditPlans: Record<string, AuditPlan>; // keyed by auditId
  initiationMinutes: Record<string, InitiationMinute>;
  checklists: Record<string, ChecklistItem[]>;
  findings: Record<string, AuditFinding[]>;
  risks: Record<string, RiskMatrixItem[]>;
  closingMinutes: Record<string, ClosingMinute>;
  improvementPlans: Record<string, ImprovementPlanItem[]>;
  finalReports: Record<string, FinalReport>;
  documents: Record<string, DocumentFile[]>;
  evaluations: Record<string, AuditEvaluation>;
  customizations: GlobalCustomizations;
}

export function getInitialDatabaseState(): AppDatabaseState {
  return {
    currentRole: 'AUDITOR_LIDER',
    currentCompanyId: 'comp-01',
    currentAuditId: 'aud-01',
    isEditMode: false,
    isAutoSaveEnabled: true,
    lastSavedAt: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    companies: INITIAL_COMPANIES,
    auditSessions: INITIAL_AUDIT_SESSIONS,
    auditPlans: {
      'aud-01': INITIAL_AUDIT_PLAN,
    },
    initiationMinutes: {
      'aud-01': INITIAL_INITIATION_MINUTE,
    },
    checklists: {
      'aud-01': INITIAL_CHECKLIST,
    },
    findings: {
      'aud-01': INITIAL_FINDINGS,
    },
    risks: {
      'aud-01': INITIAL_RISKS,
    },
    closingMinutes: {
      'aud-01': INITIAL_CLOSING_MINUTE,
    },
    improvementPlans: {
      'aud-01': INITIAL_IMPROVEMENT_PLAN,
    },
    finalReports: {
      'aud-01': INITIAL_FINAL_REPORT,
    },
    documents: {
      'aud-01': INITIAL_DOCUMENTS,
    },
    evaluations: {
      'aud-01': INITIAL_AUDIT_EVALUATION,
    },
    customizations: INITIAL_CUSTOMIZATIONS,
  };
}

export function loadDatabase(): AppDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDatabaseState();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<AppDatabaseState>;
    // Merge with defaults to prevent missing keys on schema upgrades
    const defaults = getInitialDatabaseState();
    return {
      ...defaults,
      ...parsed,
      companies: parsed.companies?.length ? parsed.companies : defaults.companies,
      auditSessions: parsed.auditSessions?.length ? parsed.auditSessions : defaults.auditSessions,
      auditPlans: parsed.auditPlans || defaults.auditPlans,
      initiationMinutes: parsed.initiationMinutes || defaults.initiationMinutes,
      checklists: parsed.checklists || defaults.checklists,
      findings: parsed.findings || defaults.findings,
      risks: parsed.risks || defaults.risks,
      closingMinutes: parsed.closingMinutes || defaults.closingMinutes,
      improvementPlans: parsed.improvementPlans || defaults.improvementPlans,
      finalReports: parsed.finalReports || defaults.finalReports,
      documents: parsed.documents || defaults.documents,
      evaluations: parsed.evaluations || defaults.evaluations,
      customizations: {
        ...defaults.customizations,
        ...(parsed.customizations || {}),
      },
    };
  } catch (err) {
    console.error('Error loading database from localStorage:', err);
    return getInitialDatabaseState();
  }
}

export function saveDatabase(state: AppDatabaseState): { success: boolean; time: string; error?: string } {
  try {
    const timeString = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const toSave: AppDatabaseState = {
      ...state,
      lastSavedAt: timeString,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent('auditpro:saved', { detail: { time: timeString } }));
    return { success: true, time: timeString };
  } catch (err: any) {
    console.error('Error saving database to localStorage:', err);
    return { success: false, time: '', error: err?.message || 'Error de almacenamiento' };
  }
}

export function exportBackup(state: AppDatabaseState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AUDITPRO_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackup(file: File, onSuccess: (state: AppDatabaseState) => void, onError: (msg: string) => void): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as AppDatabaseState;
      if (!parsed.auditSessions || !parsed.companies) {
        throw new Error('El archivo no posee el formato válido de respaldo de AUDITPRO.');
      }
      saveDatabase(parsed);
      onSuccess(parsed);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al procesar el archivo JSON');
    }
  };
  reader.readAsText(file);
}

export function resetDatabase(): AppDatabaseState {
  const initial = getInitialDatabaseState();
  saveDatabase(initial);
  return initial;
}
