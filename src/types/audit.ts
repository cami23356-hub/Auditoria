/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'AUDITOR_LIDER' | 'RESPONSABLE_PROCESO';

export type AuditType =
  | 'AUDITORIA_ADMINISTRATIVA'
  | 'AUDITORIA_CONTABLE_FINANCIERA'
  | 'AUDITORIA_TALENTO_HUMANO'
  | 'AUDITORIA_SST'
  | 'AUDITORIA_CALIDAD'
  | 'AUDITORIA_DOCUMENTAL'
  | 'AUDITORIA_GESTION'
  | 'AUDITORIA_CUMPLIMIENTO_LEGAL'
  | 'AUDITORIA_PROCESOS';

export type AuditStatus = 'PROGRAMADA' | 'EN_EJECUCION' | 'FINALIZADA' | 'CANCELADA';

export type ComplianceStatus = 'CUMPLE' | 'NO_CUMPLE' | 'CUMPLE_PARCIALMENTE' | 'NO_APLICA' | 'PENDIENTE';

export type FindingClassification =
  | 'NO_CONFORMIDAD_MAYOR'
  | 'NO_CONFORMIDAD_MENOR'
  | 'OBSERVACION'
  | 'OPORTUNIDAD_MEJORA';

export type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type CriterionCategory =
  | 'NORMA_TECNICA'
  | 'NORMA_LEGAL'
  | 'CARACTERIZACION_PROCESO'
  | 'PROCEDIMIENTO_INTERNO'
  | 'DOCUMENTOS_PLANES'
  | 'CONDICIONES_ORDEN_LIMPIEZA';

export interface Company {
  id: string;
  name: string;
  nit: string;
  economicSector: string;
  economicActivity: string;
  address: string;
  legalRepresentative: string;
  phone: string;
  email: string;
  city: string;
  logoUrl?: string;
}

export interface AuditCriterion {
  id: string;
  category: CriterionCategory;
  name: string;
  identificationCode: string; // e.g. "GTC 185:2009", "ISO 9001:2015", "Decreto 1072:2015"
  version: string;
  effectiveDate: string; // Fecha de vigencia
  applicableRequirement: string;
  description: string;
}

export interface AuditPlanScheduleItem {
  id: string;
  date: string;
  time: string;
  activity: string;
  process: string;
  auditor: string;
  auditee: string;
  resources: string;
  gatheringTechnique: string;
}

export interface AuditPlan {
  id: string;
  auditId: string;
  objective: string;
  scope: string;
  criteria: AuditCriterion[];
  processesToEvaluate: string[];
  responsibles: string[];
  scheduleItems: AuditPlanScheduleItem[];
  necessaryResources: string[];
  gatheringTechniques: string[];
  approvedDate?: string;
  status: 'BORRADOR' | 'APROBADO';
}

export type ParticipantParty = 'AUDITOR' | 'AUDITADO';

export interface MinuteParticipant {
  id?: string;
  name: string;
  role: string;
  area: string;
  party: ParticipantParty;
  attended: boolean;
  absenceReason?: string;
}

export interface InitiationMinute {
  id: string;
  auditId: string;
  minuteCode: string; // e.g. "ACT-INI-2026-001"
  date: string;
  startTime: string;
  place: string;
  companyName: string;
  companyNit: string;
  auditorName: string;
  participants: MinuteParticipant[];
  objective: string;
  scope: string;
  auditedProcesses: string[];
  workMethodology: string;
  participantResponsibilities: string;
  auditorSignature: {
    signed: boolean;
    name: string;
    title: string;
    date: string;
    signatureData?: string;
  };
  representativeSignature: {
    signed: boolean;
    name: string;
    title: string;
    date: string;
    signatureData?: string;
  };
  notes: string;
}

export interface ChecklistItem {
  id: string;
  auditId: string;
  processName: string;
  questionNumber: number;
  question: string;
  criterionReference: string;
  compliance: ComplianceStatus;
  observations: string;
  evidenceFound: string;
  reviewedDocuments: string;
  attachedPhotos: string[];
  responsiblePerson: string;
  verificationDate: string;
  findingId?: string; // Links to finding if non-compliant
}

export interface FindingEvidencePhoto {
  id: string;
  url: string; // Base64 or Data URL
  caption: string; // Pie de foto / Descripción de la evidencia
  uploadedAt: string;
  fileSizeBytes?: number;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  checklistItemId?: string;
  code: string; // e.g. "HAL-001"
  title: string;
  // Mandatory questions A to E:
  questionA_weakness: string; // ¿Cuál es la debilidad o problema encontrado en la empresa?
  questionB_processStage: string; // ¿En qué momento o etapa del proceso se encontró el problema?
  questionC_standardViolated: string; // ¿Qué norma, requisito o criterio se está incumpliendo?
  questionD_consequences: string; // ¿Cuáles son las consecuencias actuales y futuras de incumplir esta norma?
  questionE_solution: string; // ¿Cómo se puede solucionar el incumplimiento?
  // Complementary records:
  detailedDescription: string;
  objectiveEvidence: string;
  responsibleArea: string;
  responsiblePerson: string;
  classification: FindingClassification;
  identificationDate: string;
  attachedDocuments?: string[];
  attachedPhotos?: FindingEvidencePhoto[];
}

export interface RiskMatrixItem {
  id: string;
  auditId: string;
  code: string; // e.g. "RIE-001"
  process: string;
  identifiedRisk: string;
  riskCause: string;
  consequences: string;
  probability: number; // 1 to 5
  impact: number; // 1 to 5
  riskScore: number; // probability * impact (1 - 25)
  riskLevel: RiskLevel;
  existingControls: string;
  preventiveActions: string;
  findingId?: string;
}

export interface ClosingMinute {
  id: string;
  auditId: string;
  minuteCode: string; // e.g. "ACT-CIE-2026-001"
  date: string;
  endTime: string;
  place: string;
  participants: MinuteParticipant[];
  auditedProcesses: string[];
  activitiesCarriedOut: string;
  findingsSummary: {
    total: number;
    ncMajor: number;
    ncMinor: number;
    observations: number;
    opportunities: number;
  };
  mainWeaknesses: string[];
  identifiedRisksSummary: string;
  initialRecommendations: string[];
  companyCommitments: Array<{
    commitment: string;
    responsible: string;
    dueDate: string;
  }>;
  auditorSignature: {
    signed: boolean;
    name: string;
    title: string;
    date: string;
    signatureData?: string;
  };
  representativeSignature: {
    signed: boolean;
    name: string;
    title: string;
    date: string;
    signatureData?: string;
  };
  closingRemarks: string;
}

export interface ImprovementPlanItem {
  id: string;
  auditId: string;
  findingId: string;
  code: string; // e.g. "PM-001"
  identifiedProblem: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  plannedActivities: string;
  responsiblePerson: string;
  requiredResources: string;
  startDate: string;
  dueDate: string;
  complianceIndicator: string;
  targetGoal: string;
  executionStatus: 'PENDIENTE' | 'EN_EJECUCION' | 'IMPLEMENTADA' | 'VERIFICADA_EFICAZ' | 'NO_EFICAZ';
  followUpNotes: string;
  verificationDate?: string;
}

export interface FinalReport {
  id: string;
  auditId: string;
  reportCode: string; // e.g. "INF-AUD-2026-001"
  issueDate: string;
  version: string;
  introduction: string;
  objective: string;
  scope: string;
  methodology: string; // ISO 19011
  criteriaSummary: string;
  auditDevelopment: string;
  conclusions: string[];
  recommendations: string[];
}

export interface DocumentFile {
  id: string;
  auditId: string;
  folder:
    | '01_Programacion_y_Plan'
    | '02_Actas_Oficiales_GTC185'
    | '03_Listas_y_Evidencias'
    | '04_Documentos_Escaneados'
    | '05_Informes_y_Mejoramiento';
  name: string;
  fileType: 'pdf' | 'doc' | 'image' | 'scan' | 'sheet';
  sizeBytes: number;
  uploadedAt: string;
  fileData?: string; // Data URL / Base64 preview
  tags: string[];
  process?: string;
  gtc185Meta: {
    radicadoNumber: string;
    documentType: string;
    isOfficialFormat: boolean;
  };
}

export interface AuditSession {
  id: string;
  companyId: string;
  code: string; // e.g. "AUD-2026-001"
  auditType: AuditType;
  processArea: string;
  scheduledDate: string;
  executionDate: string;
  auditorName: string;
  auditorRole: string;
  auditorCardNumber: string; // Tarjeta profesional
  objective: string;
  scope: string;
  reason: string;
  status: AuditStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalCustomizations {
  institutionHeaderTitle: string;
  gtc185OfficialCodePrefix: string;
  institutionSubtitle: string;
  customReportDisclaimer: string;
  riskMethodologyExplanation: string;
  autoSaveIntervalMs: number;
}

export type EvaluationTarget = 'AUDITOR' | 'AUDITADO' | 'AUDITORES' | 'AUDITADOS';

export interface EvaluationAspect {
  id: string;
  target: EvaluationTarget;
  category: string;
  name: string;
  description: string;
  score: number; // 1.0 to 5.0
  maxScore: number; // 5.0
  comments: string;
  evidenceNotes?: string;
  categoryName?: string;
  criterionTitle?: string;
  criterionDescription?: string;
  observations?: string;
  improvementSuggestion?: string;
}

export interface AuditEvaluation {
  id: string;
  auditId: string;
  evaluationCode: string; // e.g. "CAL-AUD-2026-001"
  evaluationDate: string;
  evaluatorName: string;
  evaluatorRole: string;
  evaluatorAuditorName?: string;
  evaluatorRepresentativeName?: string;
  aspects: EvaluationAspect[];
  generalObservations: string;
  auditorStrengths: string[];
  auditorOpportunities: string[];
  auditorImprovements?: string[];
  auditeeStrengths: string[];
  auditeeOpportunities: string[];
  auditeeImprovements?: string[];
  overallConclusion: string;
  generalConclusion?: string;
  auditorScoreAverage: number;
  auditeeScoreAverage: number;
  finalAuditRating: number;
  auditorOverallScore?: number;
  auditeeOverallScore?: number;
  consolidatedScore?: number;
  performanceLevel?: 'EXCELENTE' | 'SATISFACTORIO' | 'ACEPTABLE' | 'REQUIERE_MEJORA' | 'DEFICIENTE';
  status: 'BORRADOR' | 'FINALIZADO';
  lastUpdated: string;
  signatures?: {
    auditor: {
      name: string;
      title: string;
      signed: boolean;
      date: string;
      signatureData?: string;
    };
    representative: {
      name: string;
      title: string;
      signed: boolean;
      date: string;
      signatureData?: string;
    };
  };
}
