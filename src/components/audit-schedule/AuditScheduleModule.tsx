/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Building,
  Plus,
  Save,
  CheckCircle,
  FileCheck,
  Search,
  Check,
} from 'lucide-react';
import { Company, AuditSession, AuditType, AuditStatus } from '../../types/audit';
import { EditableField } from '../common/EditableField';

interface AuditScheduleModuleProps {
  companies: Company[];
  currentCompany: Company;
  auditSessions: AuditSession[];
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUpdateAudit: (updatedAudit: AuditSession) => void;
  onAddNewAudit: (newAudit: AuditSession) => void;
  onSelectAudit: (auditId: string) => void;
  onUpdateCompany: (updatedCompany: Company) => void;
  onAddNewCompany: (newCompany: Company) => void;
}

const AUDIT_TYPE_LABELS: Record<AuditType, string> = {
  AUDITORIA_ADMINISTRATIVA: 'Auditoría administrativa',
  AUDITORIA_CONTABLE_FINANCIERA: 'Auditoría contable y financiera',
  AUDITORIA_TALENTO_HUMANO: 'Auditoría de talento humano',
  AUDITORIA_SST: 'Auditoría de seguridad y salud en el trabajo',
  AUDITORIA_CALIDAD: 'Auditoría de calidad',
  AUDITORIA_DOCUMENTAL: 'Auditoría documental (GTC 185)',
  AUDITORIA_GESTION: 'Auditoría de gestión',
  AUDITORIA_CUMPLIMIENTO_LEGAL: 'Auditoría de cumplimiento legal',
  AUDITORIA_PROCESOS: 'Auditoría de procesos',
};

export const AuditScheduleModule: React.FC<AuditScheduleModuleProps> = ({
  companies,
  currentCompany,
  auditSessions,
  currentAudit,
  isEditMode,
  onUpdateAudit,
  onAddNewAudit,
  onSelectAudit,
  onUpdateCompany,
  onAddNewCompany,
}) => {
  const [formData, setFormData] = useState<AuditSession>(currentAudit);
  const [companyData, setCompanyData] = useState<Company>(currentCompany);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);

  // Sync when currentAudit changes
  React.useEffect(() => {
    setFormData(currentAudit);
  }, [currentAudit]);

  React.useEffect(() => {
    setCompanyData(currentCompany);
  }, [currentCompany]);

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAudit(formData);
    onUpdateCompany(companyData);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  const handleCreateNewAudit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newCode = `AUD-${new Date().getFullYear()}-${String(auditSessions.length + 1).padStart(3, '0')}`;
    const newAudit: AuditSession = {
      id: `aud-${Date.now()}`,
      companyId: currentCompany.id,
      code: newCode,
      auditType: elements.auditType.value as AuditType,
      processArea: elements.processArea.value,
      scheduledDate: elements.scheduledDate.value,
      executionDate: elements.executionDate.value,
      auditorName: elements.auditorName.value,
      auditorRole: elements.auditorRole.value,
      auditorCardNumber: elements.auditorCardNumber.value || 'AUD-COL-VIGENTE',
      objective: elements.objective.value,
      scope: elements.scope.value,
      reason: elements.reason.value,
      status: 'PROGRAMADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddNewAudit(newAudit);
    setIsNewAuditModalOpen(false);
  };

  const handleCreateNewCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const elements = form.elements as any;

    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name: elements.companyName.value.toUpperCase(),
      nit: elements.nit.value,
      economicSector: elements.economicSector.value,
      economicActivity: elements.economicActivity.value,
      address: elements.address.value,
      legalRepresentative: elements.legalRepresentative.value,
      phone: elements.phone.value,
      email: elements.email.value,
      city: elements.city.value,
    };

    onAddNewCompany(newComp);
    setIsNewCompanyModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Módulo 1 · Programación de la Auditoría</span>
            <span className="text-slate-400">·</span>
            <span>Estándares GTC 185 e ISO 19011</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Programación y Registro de Auditorías Empresariales
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de empresas, equipos auditores, objetivos, alcance, motivos y fechas de ejecución.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewCompanyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Nueva Empresa</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Programar Nueva Auditoría</span>
          </button>
        </div>
      </div>

      {/* Selector de Auditorías Existentes */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <label className="text-xs font-bold text-slate-800 uppercase block mb-2">
          Auditorías Registradas en el Sistema:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {auditSessions.map((aud) => {
            const isSelected = aud.id === currentAudit.id;
            const comp = companies.find((c) => c.id === aud.companyId);
            return (
              <button
                key={aud.id}
                type="button"
                onClick={() => onSelectAudit(aud.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular font-bold text-xs text-blue-900">{aud.code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      aud.status === 'EN_EJECUCION'
                        ? 'bg-blue-100 text-blue-800'
                        : aud.status === 'FINALIZADA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {aud.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate">{comp?.name}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{aud.processArea}</div>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between font-mono-tabular">
                  <span>Prog: {aud.scheduledDate}</span>
                  <span>Ejec: {aud.executionDate}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Audit Form */}
      <form onSubmit={handleSaveAudit} className="space-y-6">
        {/* Section 1: Datos de la Empresa */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              <span>Información General de la Organización Auditada</span>
            </h2>
            <span className="text-[11px] text-slate-400">Campos oficiales GTC 185</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre o Razón Social:</label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 uppercase font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Número de NIT con DV:</label>
              <input
                type="text"
                value={companyData.nit}
                onChange={(e) => setCompanyData({ ...companyData, nit: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono-tabular focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Sector Económico:</label>
              <input
                type="text"
                value={companyData.economicSector}
                onChange={(e) => setCompanyData({ ...companyData, economicSector: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Actividad Económica (CIIU):</label>
              <input
                type="text"
                value={companyData.economicActivity}
                onChange={(e) => setCompanyData({ ...companyData, economicActivity: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Dirección y Ciudad:</label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Representante Legal:</label>
              <input
                type="text"
                value={companyData.legalRepresentative}
                onChange={(e) => setCompanyData({ ...companyData, legalRepresentative: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Datos de la Auditoría */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-700" />
              <span>Parámetros de la Auditoría ({formData.code})</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">Estado:</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AuditStatus })}
                className="text-xs p-1 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
              >
                <option value="PROGRAMADA">PROGRAMADA</option>
                <option value="EN_EJECUCION">EN EJECUCIÓN</option>
                <option value="FINALIZADA">FINALIZADA</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Auditoría:</label>
              <select
                value={formData.auditType}
                onChange={(e) => setFormData({ ...formData, auditType: e.target.value as AuditType })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-medium"
              >
                {Object.entries(AUDIT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Área o Proceso a Auditar:</label>
              <input
                type="text"
                value={formData.processArea}
                onChange={(e) => setFormData({ ...formData, processArea: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Auditor Líder:</label>
              <input
                type="text"
                value={formData.auditorName}
                onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Rol / Registro del Auditor:</label>
              <input
                type="text"
                value={formData.auditorRole}
                onChange={(e) => setFormData({ ...formData, auditorRole: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Fecha de Programación:</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono-tabular"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Fecha de Ejecución:</label>
              <input
                type="date"
                value={formData.executionDate}
                onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono-tabular"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Objetivo de la Auditoría:</label>
              <textarea
                rows={3}
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Alcance de la Auditoría:</label>
              <textarea
                rows={3}
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Motivo de la Auditoría:</label>
              <textarea
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {isSuccessToast && (
                <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                  <Check className="w-4 h-4" /> ¡Cambios de programación guardados exitosamente!
                </span>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de Programación</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal Nueva Auditoría */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleCreateNewAudit}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Programar Nueva Auditoría Interna</h3>
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Auditoría:</label>
                  <select name="auditType" className="w-full p-2 border border-slate-300 rounded-lg font-medium">
                    {Object.entries(AUDIT_TYPE_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Área o Proceso a Auditar:</label>
                  <input
                    name="processArea"
                    defaultValue="Gestión de Operaciones y Calidad"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha de Programación:</label>
                    <input
                      name="scheduledDate"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha de Ejecución:</label>
                    <input
                      name="executionDate"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre del Auditor Líder:</label>
                    <input
                      name="auditorName"
                      defaultValue="Lic. Fernando Javier Castro Parra"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tarjeta o Registro Auditor:</label>
                    <input
                      name="auditorCardNumber"
                      defaultValue="AUD-COL-89241"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rol del Auditor:</label>
                  <input
                    name="auditorRole"
                    defaultValue="Auditor Líder Certificado ISO 19011"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Objetivo de la Auditoría:</label>
                  <textarea
                    name="objective"
                    rows={2}
                    defaultValue="Verificar el grado de conformidad del proceso frente a los requisitos legales, normativos y procedimientos internos."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alcance:</label>
                  <textarea
                    name="scope"
                    rows={2}
                    defaultValue="Instalaciones operativas, personal y registros del periodo en curso."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Motivo:</label>
                  <textarea
                    name="reason"
                    rows={2}
                    defaultValue="Auditoría interna periódica del ciclo de mejora continua."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Crear y Programar Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Empresa */}
      {isNewCompanyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <form onSubmit={handleCreateNewCompany}>
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold">Registrar Nueva Empresa en AUDITPRO</h3>
                <button
                  type="button"
                  onClick={() => setIsNewCompanyModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razón Social Completa:</label>
                  <input
                    name="companyName"
                    placeholder="Ej. SERVICIOS INDUSTRIALES DEL ORIENTE S.A.S."
                    className="w-full p-2 border border-slate-300 rounded-lg uppercase font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">NIT con Dígito de Verificación:</label>
                    <input
                      name="nit"
                      placeholder="Ej. 901.445.890-3"
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sector Económico:</label>
                    <input
                      name="economicSector"
                      placeholder="Ej. Terciario - Servicios"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Actividad Económica (CIIU):</label>
                  <input
                    name="economicActivity"
                    placeholder="Ej. Mantenimiento y reparación de maquinaria industrial"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dirección:</label>
                    <input
                      name="address"
                      placeholder="Ej. Calle 45 # 12-30"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ciudad:</label>
                    <input
                      name="city"
                      placeholder="Ej. Medellín, Antioquia"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Representante Legal:</label>
                  <input
                    name="legalRepresentative"
                    placeholder="Ej. Dr. Mario Fernando Gómez Ruiz"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono:</label>
                    <input
                      name="phone"
                      placeholder="(+57 4) 444-5566"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Correo Electrónico:</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="gerencia@empresa.com.co"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCompanyModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Registrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
