/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Company,
  AuditSession,
  AuditPlan,
  InitiationMinute,
  ClosingMinute,
  FinalReport,
  AuditFinding,
  RiskMatrixItem,
  ImprovementPlanItem,
  ChecklistItem,
  MinuteParticipant,
  AuditEvaluation,
} from '../types/audit';
import { AppDatabaseState } from '../services/storage';

/**
 * Motor de Sincronización Automática e Integridad de Datos (GTC 185 / ISO 19011)
 *
 * Garantiza que cuando cualquier información cambie en cualquier parte de la auditoría
 * (empresa, fechas, nombres de responsables, firmas, objetivos, alcance, hallazgos,
 * listas de chequeo, matriz de riesgos o plan de mejoramiento), se propague y actualice
 * AUTOMÁTICAMENTE en los informes oficiales, actas reglamentarias y módulos vinculados.
 */

/**
 * Sincroniza exhaustivamente todo el estado de la base de datos
 */
export function synchronizeAllAuditData(state: AppDatabaseState): AppDatabaseState {
  const updatedState = { ...state };
  const updatedPlans = { ...updatedState.auditPlans };
  const updatedInitiationMinutes = { ...updatedState.initiationMinutes };
  const updatedClosingMinutes = { ...updatedState.closingMinutes };
  const updatedFinalReports = { ...updatedState.finalReports };
  const updatedImprovementPlans = { ...updatedState.improvementPlans };

  // Iterar por cada sesión de auditoría registrada
  updatedState.auditSessions = updatedState.auditSessions.map((audit) => {
    const company =
      updatedState.companies.find((c) => c.id === audit.companyId) ||
      updatedState.companies[0] || {
        id: 'comp-01',
        name: 'EMPRESA AUDITADA',
        nit: '900.000.000-1',
        legalRepresentative: 'Representante Legal',
        economicSector: 'General',
        economicActivity: 'Comercial',
        address: 'Dirección Principal',
        phone: '1234567',
        email: 'contacto@empresa.com',
        city: 'Colombia',
      };

    const auditId = audit.id;

    // 1. Sincronizar Plan de Auditoría
    if (updatedPlans[auditId]) {
      const plan = { ...updatedPlans[auditId] };
      plan.objective = audit.objective;
      plan.scope = audit.scope;
      if (!plan.processesToEvaluate.includes(audit.processArea)) {
        plan.processesToEvaluate = [...plan.processesToEvaluate, audit.processArea];
      }
      // Actualizar auditor en cronograma si aplica
      plan.scheduleItems = plan.scheduleItems.map((s) => ({
        ...s,
        auditor: s.auditor || audit.auditorName,
      }));
      updatedPlans[auditId] = plan;
    }

    // 2. Sincronizar Acta de Iniciación (GTC 185)
    if (updatedInitiationMinutes[auditId]) {
      const minute = { ...updatedInitiationMinutes[auditId] };
      minute.companyName = company.name;
      minute.companyNit = company.nit;
      minute.auditorName = audit.auditorName;
      minute.date = audit.executionDate;
      minute.objective = audit.objective;
      minute.scope = audit.scope;
      if (!minute.auditedProcesses.includes(audit.processArea)) {
        minute.auditedProcesses = [...minute.auditedProcesses, audit.processArea];
      }
      minute.auditorSignature = {
        ...minute.auditorSignature,
        name: audit.auditorName,
        title: audit.auditorRole || 'Auditor Líder Certificado',
      };
      minute.representativeSignature = {
        ...minute.representativeSignature,
        name: company.legalRepresentative,
        title: minute.representativeSignature.title || 'Representante Legal / Auditado',
      };
      // Sincronizar participantes
      minute.participants = syncInitiationParticipants(
        minute.participants,
        audit.auditorName,
        company.legalRepresentative,
        audit.processArea
      );
      updatedInitiationMinutes[auditId] = minute;
    }

    // 3. Sincronizar Acta de Cierre (GTC 185)
    if (updatedClosingMinutes[auditId]) {
      const minute = { ...updatedClosingMinutes[auditId] };
      minute.date = audit.executionDate;
      minute.auditorSignature = {
        ...minute.auditorSignature,
        name: audit.auditorName,
        title: audit.auditorRole || 'Auditor Líder Certificado',
      };
      minute.representativeSignature = {
        ...minute.representativeSignature,
        name: company.legalRepresentative,
        title: minute.representativeSignature.title || 'Representante Legal / Auditado',
      };
      if (!minute.auditedProcesses.includes(audit.processArea)) {
        minute.auditedProcesses = [...minute.auditedProcesses, audit.processArea];
      }
      minute.participants = syncClosingParticipants(
        minute.participants,
        audit.auditorName,
        company.legalRepresentative,
        audit.processArea
      );

      // Sincronizar conteo en vivo de hallazgos
      const findings = updatedState.findings[auditId] || [];
      minute.findingsSummary = {
        total: findings.length,
        ncMajor: findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MAYOR').length,
        ncMinor: findings.filter((f) => f.classification === 'NO_CONFORMIDAD_MENOR').length,
        observations: findings.filter((f) => f.classification === 'OBSERVACION').length,
        opportunities: findings.filter((f) => f.classification === 'OPORTUNIDAD_MEJORA').length,
      };

      // Sincronizar debilidades principales con los hallazgos reales
      if (findings.length > 0) {
        const ncWeaknesses = findings
          .filter((f) => f.questionA_weakness?.trim())
          .map((f) => `${f.code}: ${f.questionA_weakness.trim()}`);
        if (ncWeaknesses.length > 0) {
          minute.mainWeaknesses = ncWeaknesses;
        }
      }

      // Sincronizar resumen de riesgos evaluados
      const risks = updatedState.risks[auditId] || [];
      if (risks.length > 0) {
        const critCount = risks.filter((r) => r.riskLevel === 'CRITICO').length;
        const highCount = risks.filter((r) => r.riskLevel === 'ALTO').length;
        const medCount = risks.filter((r) => r.riskLevel === 'MEDIO').length;
        const lowCount = risks.filter((r) => r.riskLevel === 'BAJO').length;
        minute.identifiedRisksSummary = `Se evaluaron ${risks.length} riesgos mediante Matriz 5x5: ${critCount} Críticos, ${highCount} Altos, ${medCount} Medios y ${lowCount} Bajos. Prioridad de mitigación en proceso de ${audit.processArea}.`;
      }

      // Sincronizar compromisos de la empresa con el plan de mejora
      const currentPlanItems = updatedImprovementPlans[auditId] || [];
      if (currentPlanItems.length > 0) {
        minute.companyCommitments = currentPlanItems.map((p) => ({
          commitment: p.correctiveAction || p.plannedActivities || p.identifiedProblem,
          responsible: p.responsiblePerson || company.legalRepresentative,
          dueDate: p.dueDate || audit.executionDate,
        }));
      }

      updatedClosingMinutes[auditId] = minute;
    }

    // 4. Sincronizar Informe Final de Auditoría (GTC 185)
    if (updatedFinalReports[auditId]) {
      const report = { ...updatedFinalReports[auditId] };
      report.reportCode = report.reportCode || `INF-${audit.code}`;
      report.issueDate = audit.executionDate;
      report.objective = audit.objective;
      report.scope = audit.scope;

      // Resumen de criterios normativos actualizado
      const planCriteria = updatedPlans[auditId]?.criteria || [];
      if (planCriteria.length > 0) {
        report.criteriaSummary = planCriteria
          .map((c) => `${c.identificationCode} (${c.name}) [Vigencia: ${c.effectiveDate}]`)
          .join('; ');
      }

      updatedFinalReports[auditId] = report;
    }

    // 5. Sincronizar Hallazgos con Plan de Mejoramiento
    const findings = updatedState.findings[auditId] || [];
    let currentImprovement = updatedImprovementPlans[auditId] || [];
    const nonConformities = findings.filter(
      (f) => f.classification === 'NO_CONFORMIDAD_MAYOR' || f.classification === 'NO_CONFORMIDAD_MENOR'
    );

    // Actualizar o crear ítem en el plan de mejora por cada No Conformidad
    nonConformities.forEach((f) => {
      const existingIdx = currentImprovement.findIndex(
        (p) => p.findingId === f.id || p.code === `PM-${f.code.replace('HAL-', '').replace('NC-', '')}`
      );

      const problemTitle = `${f.code} - ${f.title}`;
      const rootCause = f.questionB_processStage
        ? `${f.questionB_processStage}: ${f.questionA_weakness}`
        : f.questionA_weakness;
      const corrective = f.questionE_solution;
      const responsible = f.responsiblePerson || company.legalRepresentative;

      if (existingIdx >= 0) {
        currentImprovement[existingIdx] = {
          ...currentImprovement[existingIdx],
          identifiedProblem: problemTitle,
          rootCause: rootCause,
          correctiveAction: corrective,
          responsiblePerson: responsible,
        };
      } else {
        currentImprovement.push({
          id: `pm-${Date.now()}-${f.id}`,
          auditId: audit.id,
          findingId: f.id,
          code: `PM-${f.code.replace('HAL-', '')}`,
          identifiedProblem: problemTitle,
          rootCause: rootCause,
          correctiveAction: corrective,
          preventiveAction: `Actualizar la documentación operativa, socializar los requisitos de la GTC 185 e implementar control preventivo.`,
          plannedActivities: `Revisión interna, formulación de acciones y verificación de cumplimiento en sitio.`,
          responsiblePerson: responsible,
          requiredResources: 'Recursos técnicos, tiempo del equipo de auditoría y soporte documental.',
          startDate: audit.executionDate,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          complianceIndicator: '% de eficacia de la acción correctiva',
          targetGoal: '100% implementado y verificado',
          executionStatus: 'PENDIENTE',
          followUpNotes: 'Acción preventiva derivada automáticamente del hallazgo oficial.',
        });
      }
    });

    updatedImprovementPlans[auditId] = currentImprovement;

    // 6. Sincronizar Evaluación Cruzada de Auditoría (Auditores y Auditados)
    if (updatedState.evaluations && updatedState.evaluations[auditId]) {
      const evaluation = { ...updatedState.evaluations[auditId] };
      const auditorAspects = evaluation.aspects.filter((a) => a.target === 'AUDITOR' || a.target === 'AUDITORES');
      const auditeeAspects = evaluation.aspects.filter((a) => a.target === 'AUDITADO' || a.target === 'AUDITADOS');
      const auditorAvg = auditorAspects.length > 0 
        ? Number((auditorAspects.reduce((sum, a) => sum + (a.score || 0), 0) / auditorAspects.length).toFixed(2))
        : 5;
      const auditeeAvg = auditeeAspects.length > 0
        ? Number((auditeeAspects.reduce((sum, a) => sum + (a.score || 0), 0) / auditeeAspects.length).toFixed(2))
        : 5;
      evaluation.auditorScoreAverage = auditorAvg;
      evaluation.auditeeScoreAverage = auditeeAvg;
      evaluation.finalAuditRating = Number(((auditorAvg + auditeeAvg) / 2).toFixed(2));
      updatedState.evaluations[auditId] = evaluation;
    }

    return audit;
  });

  return {
    ...updatedState,
    auditPlans: updatedPlans,
    initiationMinutes: updatedInitiationMinutes,
    closingMinutes: updatedClosingMinutes,
    finalReports: updatedFinalReports,
    improvementPlans: updatedImprovementPlans,
  };
}

/**
 * Propaga un cambio de Empresa hacia toda la base de datos
 */
export function cascadeUpdateCompany(state: AppDatabaseState, updatedCompany: Company): AppDatabaseState {
  const updatedCompanies = state.companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c));
  const intermediateState = {
    ...state,
    companies: updatedCompanies,
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio de Auditoría hacia actas, planes, informes y firmas
 */
export function cascadeUpdateAuditSession(state: AppDatabaseState, updatedAudit: AuditSession): AppDatabaseState {
  const updatedSessions = state.auditSessions.map((a) => (a.id === updatedAudit.id ? updatedAudit : a));
  const intermediateState = {
    ...state,
    auditSessions: updatedSessions,
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio en el Acta de Iniciación
 */
export function cascadeUpdateInitiationMinute(
  state: AppDatabaseState,
  auditId: string,
  updatedMinute: InitiationMinute
): AppDatabaseState {
  const currentAudit = state.auditSessions.find((a) => a.id === auditId);
  const currentCompany = currentAudit
    ? state.companies.find((c) => c.id === currentAudit.companyId)
    : state.companies[0];

  let nextState = {
    ...state,
    initiationMinutes: {
      ...state.initiationMinutes,
      [auditId]: updatedMinute,
    },
  };

  // Si se modificó el nombre del auditor o cargo en la firma de iniciación
  if (
    currentAudit &&
    (updatedMinute.auditorSignature.name !== currentAudit.auditorName ||
      updatedMinute.auditorSignature.title !== currentAudit.auditorRole)
  ) {
    nextState.auditSessions = nextState.auditSessions.map((a) =>
      a.id === auditId
        ? {
            ...a,
            auditorName: updatedMinute.auditorSignature.name,
            auditorRole: updatedMinute.auditorSignature.title || a.auditorRole,
          }
        : a
    );
  }

  // Si se modificó el nombre del representante legal en la firma de iniciación
  if (
    currentCompany &&
    updatedMinute.representativeSignature.name &&
    updatedMinute.representativeSignature.name !== currentCompany.legalRepresentative
  ) {
    nextState.companies = nextState.companies.map((c) =>
      c.id === currentCompany.id
        ? { ...c, legalRepresentative: updatedMinute.representativeSignature.name }
        : c
    );
  }

  // Si se modificó el objetivo, alcance o fecha
  if (
    currentAudit &&
    (updatedMinute.objective !== currentAudit.objective ||
      updatedMinute.scope !== currentAudit.scope ||
      updatedMinute.date !== currentAudit.executionDate)
  ) {
    nextState.auditSessions = nextState.auditSessions.map((a) =>
      a.id === auditId
        ? {
            ...a,
            objective: updatedMinute.objective,
            scope: updatedMinute.scope,
            executionDate: updatedMinute.date,
          }
        : a
    );
  }

  return synchronizeAllAuditData(nextState);
}

/**
 * Propaga un cambio en el Acta de Cierre
 */
export function cascadeUpdateClosingMinute(
  state: AppDatabaseState,
  auditId: string,
  updatedMinute: ClosingMinute
): AppDatabaseState {
  const currentAudit = state.auditSessions.find((a) => a.id === auditId);
  const currentCompany = currentAudit
    ? state.companies.find((c) => c.id === currentAudit.companyId)
    : state.companies[0];

  let nextState = {
    ...state,
    closingMinutes: {
      ...state.closingMinutes,
      [auditId]: updatedMinute,
    },
  };

  // Si se modificó el nombre del auditor en la firma de cierre
  if (
    currentAudit &&
    (updatedMinute.auditorSignature.name !== currentAudit.auditorName ||
      updatedMinute.auditorSignature.title !== currentAudit.auditorRole)
  ) {
    nextState.auditSessions = nextState.auditSessions.map((a) =>
      a.id === auditId
        ? {
            ...a,
            auditorName: updatedMinute.auditorSignature.name,
            auditorRole: updatedMinute.auditorSignature.title || a.auditorRole,
          }
        : a
    );
  }

  // Si se modificó el nombre del representante legal en la firma de cierre
  if (
    currentCompany &&
    updatedMinute.representativeSignature.name &&
    updatedMinute.representativeSignature.name !== currentCompany.legalRepresentative
  ) {
    nextState.companies = nextState.companies.map((c) =>
      c.id === currentCompany.id
        ? { ...c, legalRepresentative: updatedMinute.representativeSignature.name }
        : c
    );
  }

  return synchronizeAllAuditData(nextState);
}

/**
 * Propaga un cambio en el Plan de Auditoría
 */
export function cascadeUpdateAuditPlan(
  state: AppDatabaseState,
  auditId: string,
  updatedPlan: AuditPlan
): AppDatabaseState {
  let nextState = {
    ...state,
    auditPlans: {
      ...state.auditPlans,
      [auditId]: updatedPlan,
    },
  };

  // Si se modificó objetivo o alcance en el plan
  const currentAudit = state.auditSessions.find((a) => a.id === auditId);
  if (
    currentAudit &&
    (updatedPlan.objective !== currentAudit.objective || updatedPlan.scope !== currentAudit.scope)
  ) {
    nextState.auditSessions = nextState.auditSessions.map((a) =>
      a.id === auditId
        ? {
            ...a,
            objective: updatedPlan.objective,
            scope: updatedPlan.scope,
          }
        : a
    );
  }

  return synchronizeAllAuditData(nextState);
}

/**
 * Propaga un cambio en los Hallazgos
 */
export function cascadeUpdateFindings(
  state: AppDatabaseState,
  auditId: string,
  updatedFindings: AuditFinding[]
): AppDatabaseState {
  const intermediateState = {
    ...state,
    findings: {
      ...state.findings,
      [auditId]: updatedFindings,
    },
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio en la Matriz de Riesgos
 */
export function cascadeUpdateRisks(
  state: AppDatabaseState,
  auditId: string,
  updatedRisks: RiskMatrixItem[]
): AppDatabaseState {
  const intermediateState = {
    ...state,
    risks: {
      ...state.risks,
      [auditId]: updatedRisks,
    },
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio en el Plan de Mejoramiento
 */
export function cascadeUpdateImprovementPlan(
  state: AppDatabaseState,
  auditId: string,
  updatedItems: ImprovementPlanItem[]
): AppDatabaseState {
  const intermediateState = {
    ...state,
    improvementPlans: {
      ...state.improvementPlans,
      [auditId]: updatedItems,
    },
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio en las Listas de Chequeo
 */
export function cascadeUpdateChecklist(
  state: AppDatabaseState,
  auditId: string,
  updatedList: ChecklistItem[]
): AppDatabaseState {
  const intermediateState = {
    ...state,
    checklists: {
      ...state.checklists,
      [auditId]: updatedList,
    },
  };
  return synchronizeAllAuditData(intermediateState);
}

/**
 * Propaga un cambio en el Informe Final
 */
export function cascadeUpdateFinalReport(
  state: AppDatabaseState,
  auditId: string,
  updatedReport: FinalReport
): AppDatabaseState {
  let nextState = {
    ...state,
    finalReports: {
      ...state.finalReports,
      [auditId]: updatedReport,
    },
  };

  const currentAudit = state.auditSessions.find((a) => a.id === auditId);
  if (
    currentAudit &&
    (updatedReport.objective !== currentAudit.objective ||
      updatedReport.scope !== currentAudit.scope ||
      updatedReport.issueDate !== currentAudit.executionDate)
  ) {
    nextState.auditSessions = nextState.auditSessions.map((a) =>
      a.id === auditId
        ? {
            ...a,
            objective: updatedReport.objective,
            scope: updatedReport.scope,
            executionDate: updatedReport.issueDate,
          }
        : a
    );
  }

  return synchronizeAllAuditData(nextState);
}

/**
 * Utilidad para sincronizar nombres en la lista de participantes del Acta de Iniciación
 */
function syncInitiationParticipants(
  participants: MinuteParticipant[],
  auditorName: string,
  legalRepName: string,
  processArea: string
): MinuteParticipant[] {
  let hasAuditor = false;
  let hasRep = false;

  const updated: MinuteParticipant[] = (participants || []).map((p) => {
    const roleLower = (p.role || '').toLowerCase();
    const isAud = p.party === 'AUDITOR' || roleLower.includes('auditor') || roleLower.includes('líder') || roleLower.includes('lider');
    const isRep = p.party === 'AUDITADO' && (roleLower.includes('representante') || roleLower.includes('gerente') || roleLower.includes('director'));

    if (isAud && (roleLower.includes('líder') || roleLower.includes('lider') || !hasAuditor)) {
      hasAuditor = true;
      return { ...p, name: auditorName, party: 'AUDITOR', attended: p.attended ?? true };
    }
    if (isRep && !hasRep) {
      hasRep = true;
      return { ...p, name: legalRepName, party: 'AUDITADO', attended: p.attended ?? true };
    }
    return {
      ...p,
      party: p.party || (isAud ? 'AUDITOR' : 'AUDITADO'),
      attended: p.attended ?? true,
    };
  });

  if (!hasAuditor && auditorName) {
    updated.unshift({
      id: `part-ini-aud-${Date.now()}`,
      name: auditorName,
      role: 'Auditor Líder Certificado',
      area: 'Equipo Evaluador de Auditoría',
      party: 'AUDITOR',
      attended: true,
    });
  }

  if (!hasRep && legalRepName) {
    updated.push({
      id: `part-ini-rep-${Date.now()}`,
      name: legalRepName,
      role: 'Representante Legal / Gerencia General',
      area: processArea || 'Dirección General',
      party: 'AUDITADO',
      attended: true,
    });
  }

  return updated;
}

/**
 * Utilidad para sincronizar nombres en la lista de participantes del Acta de Cierre
 */
function syncClosingParticipants(
  participants: MinuteParticipant[],
  auditorName: string,
  legalRepName: string,
  processArea: string
): MinuteParticipant[] {
  let hasAuditor = false;
  let hasRep = false;

  const updated: MinuteParticipant[] = (participants || []).map((p) => {
    const roleLower = (p.role || '').toLowerCase();
    const isAud = p.party === 'AUDITOR' || roleLower.includes('auditor') || roleLower.includes('líder') || roleLower.includes('lider');
    const isRep = p.party === 'AUDITADO' && (roleLower.includes('representante') || roleLower.includes('gerente') || roleLower.includes('director'));

    if (isAud && (roleLower.includes('líder') || roleLower.includes('lider') || !hasAuditor)) {
      hasAuditor = true;
      return { ...p, name: auditorName, party: 'AUDITOR', attended: p.attended ?? true };
    }
    if (isRep && !hasRep) {
      hasRep = true;
      return { ...p, name: legalRepName, party: 'AUDITADO', attended: p.attended ?? true };
    }
    return {
      ...p,
      party: p.party || (isAud ? 'AUDITOR' : 'AUDITADO'),
      attended: p.attended ?? true,
    };
  });

  if (!hasAuditor && auditorName) {
    updated.unshift({
      id: `part-cie-aud-${Date.now()}`,
      name: auditorName,
      role: 'Auditor Líder Certificado',
      area: 'Equipo Evaluador de Auditoría',
      party: 'AUDITOR',
      attended: true,
    });
  }

  if (!hasRep && legalRepName) {
    updated.push({
      id: `part-cie-rep-${Date.now()}`,
      name: legalRepName,
      role: 'Representante Legal / Gerencia General',
      area: processArea || 'Dirección General',
      party: 'AUDITADO',
      attended: true,
    });
  }

  return updated;
}
