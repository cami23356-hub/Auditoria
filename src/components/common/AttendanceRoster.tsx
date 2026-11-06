/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  UserX,
  ShieldCheck,
  Building2,
  Filter,
} from 'lucide-react';
import { MinuteParticipant, ParticipantParty } from '../../types/audit';
import { EditableField } from './EditableField';

interface AttendanceRosterProps {
  title?: string;
  participants: MinuteParticipant[];
  isEditMode: boolean;
  onUpdateParticipants: (updated: MinuteParticipant[]) => void;
}

export const AttendanceRoster: React.FC<AttendanceRosterProps> = ({
  title = 'Registro y Control de Asistencia Oficial (GTC 185)',
  participants,
  isEditMode,
  onUpdateParticipants,
}) => {
  const [filterParty, setFilterParty] = useState<'ALL' | 'AUDITOR' | 'AUDITADO'>('ALL');
  const [filterAttendance, setFilterAttendance] = useState<'ALL' | 'ATTENDED' | 'ABSENT'>('ALL');

  // Form for adding a new participant
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newParty, setNewParty] = useState<ParticipantParty>('AUDITADO');
  const [newAttended, setNewAttended] = useState(true);
  const [newAbsenceReason, setNewAbsenceReason] = useState('');

  // Editing state for full participant modal or inline
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Statistics calculation
  const total = participants.length;
  const attendedCount = participants.filter((p) => p.attended).length;
  const absentCount = total - attendedCount;
  const attendanceRate = total > 0 ? Math.round((attendedCount / total) * 100) : 0;

  const auditors = participants.filter((p) => p.party === 'AUDITOR');
  const auditorsAttended = auditors.filter((p) => p.attended).length;
  const auditorsAbsent = auditors.length - auditorsAttended;

  const auditees = participants.filter((p) => p.party === 'AUDITADO');
  const auditeesAttended = auditees.filter((p) => p.attended).length;
  const auditeesAbsent = auditees.length - auditeesAttended;

  const handleUpdate = (index: number, field: keyof MinuteParticipant, value: any) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateParticipants(updated);
  };

  const handleToggleAttendance = (index: number) => {
    const updated = [...participants];
    const newAttendedVal = !updated[index].attended;
    updated[index] = {
      ...updated[index],
      attended: newAttendedVal,
      absenceReason: newAttendedVal ? undefined : (updated[index].absenceReason || 'Justificación pendiente de registrar'),
    };
    onUpdateParticipants(updated);
  };

  const handleToggleParty = (index: number) => {
    const updated = [...participants];
    const newPartyVal: ParticipantParty = updated[index].party === 'AUDITOR' ? 'AUDITADO' : 'AUDITOR';
    updated[index] = {
      ...updated[index],
      party: newPartyVal,
    };
    onUpdateParticipants(updated);
  };

  const handleRemove = (index: number) => {
    if (window.confirm('¿Desea retirar a este participante del acta?')) {
      const updated = participants.filter((_, idx) => idx !== index);
      onUpdateParticipants(updated);
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newParticipant: MinuteParticipant = {
      id: `part-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Participante Institucional',
      area: newArea.trim() || (newParty === 'AUDITOR' ? 'Equipo Auditor' : 'Área Operativa'),
      party: newParty,
      attended: newAttended,
      absenceReason: !newAttended ? (newAbsenceReason.trim() || 'Inasistencia con justificación laboral') : undefined,
    };

    onUpdateParticipants([...participants, newParticipant]);

    // Reset inputs
    setNewName('');
    setNewRole('');
    setNewArea('');
    setNewAbsenceReason('');
  };

  // Filter list
  const filteredParticipantsWithIndex = participants
    .map((p, idx) => ({ ...p, originalIndex: idx }))
    .filter((p) => {
      const matchParty = filterParty === 'ALL' || p.party === filterParty;
      const matchAtt =
        filterAttendance === 'ALL' ||
        (filterAttendance === 'ATTENDED' && p.attended) ||
        (filterAttendance === 'ABSENT' && !p.attended);
      return matchParty && matchAtt;
    });

  return (
    <div className="space-y-4">
      {/* Title & Quorum Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-700" />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Distingue obligatoriamente entre Auditores y Auditados, clasificando quiénes asistieron y quiénes no.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
            Quórum: {attendanceRate}%
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {attendedCount} Asistieron
          </span>
          {absentCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
              {absentCount} Inasistencias
            </span>
          )}
        </div>
      </div>

      {/* Quorum Statistics Box (4 KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-blue-900">
            <span>Auditores Convocados</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="text-base font-extrabold text-blue-950 mt-1">
            {auditors.length} <span className="text-[10px] font-normal text-slate-500">totales</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            ✓ {auditorsAttended} Asistieron {auditorsAbsent > 0 ? `· ✗ ${auditorsAbsent} No` : ''}
          </div>
        </div>

        <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-indigo-900">
            <span>Auditados Convocados</span>
            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
          </div>
          <div className="text-base font-extrabold text-indigo-950 mt-1">
            {auditees.length} <span className="text-[10px] font-normal text-slate-500">totales</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            ✓ {auditeesAttended} Asistieron {auditeesAbsent > 0 ? `· ✗ ${auditeesAbsent} No` : ''}
          </div>
        </div>

        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-900">
            <span>Asistieron Efectivamente</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-base font-extrabold text-emerald-900 mt-1">
            {attendedCount} <span className="text-[10px] font-normal text-emerald-700">({attendanceRate}%)</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Participación activa validada</div>
        </div>

        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-red-900">
            <span>No Asistieron (Ausentes)</span>
            <UserX className="w-3.5 h-3.5 text-red-700" />
          </div>
          <div className="text-base font-extrabold text-red-900 mt-1">
            {absentCount} <span className="text-[10px] font-normal text-red-700">({100 - attendanceRate}%)</span>
          </div>
          <div className="text-[10px] text-red-700 mt-0.5">Con justificación requerida</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs no-print">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Parte:</span>
          {(['ALL', 'AUDITOR', 'AUDITADO'] as const).map((party) => (
            <button
              key={party}
              type="button"
              onClick={() => setFilterParty(party)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                filterParty === party
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              {party === 'ALL' ? `Todos (${participants.length})` : party === 'AUDITOR' ? `Auditores (${auditors.length})` : `Auditados (${auditees.length})`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Estado:</span>
          {(['ALL', 'ATTENDED', 'ABSENT'] as const).map((att) => (
            <button
              key={att}
              type="button"
              onClick={() => setFilterAttendance(att)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                filterAttendance === att
                  ? att === 'ATTENDED'
                    ? 'bg-emerald-700 text-white'
                    : att === 'ABSENT'
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-800 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              {att === 'ALL' ? 'Todos' : att === 'ATTENDED' ? `Asistieron (${attendedCount})` : `No Asistieron (${absentCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Participants Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Estamento / Parte</th>
              <th className="py-2.5 px-3">Nombre del Responsable</th>
              <th className="py-2.5 px-3">Cargo Institucional</th>
              <th className="py-2.5 px-3">Área o Proceso</th>
              <th className="py-2.5 px-3 text-center">Asistencia</th>
              <th className="py-2.5 px-3">Observación / Motivo de Inasistencia</th>
              <th className="py-2.5 px-3 text-right no-print">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredParticipantsWithIndex.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No hay participantes que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredParticipantsWithIndex.map((p) => {
                const idx = p.originalIndex;
                const isAud = p.party === 'AUDITOR';

                return (
                  <tr
                    key={p.id || idx}
                    className={`hover:bg-slate-50 transition-colors ${
                      !p.attended ? 'bg-red-50/30' : ''
                    }`}
                  >
                    {/* Estamento (Auditor vs Auditado) with switch button */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                            isAud
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {isAud ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-blue-700" />
                              Auditor
                            </>
                          ) : (
                            <>
                              <Building2 className="w-3 h-3 text-slate-600" />
                              Auditado
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleParty(idx)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline no-print cursor-pointer"
                          title="Cambiar estamento (Auditor / Auditado)"
                        >
                          Cambiar
                        </button>
                      </div>
                    </td>

                    {/* Nombre - Editable */}
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <EditableField
                        value={p.name}
                        onSave={(newVal) => handleUpdate(idx, 'name', newVal)}
                        isEditMode={isEditMode}
                        label="Nombre Completo"
                        className="font-bold text-slate-900"
                      />
                    </td>

                    {/* Cargo - Editable */}
                    <td className="py-2.5 px-3 text-slate-700">
                      <EditableField
                        value={p.role}
                        onSave={(newVal) => handleUpdate(idx, 'role', newVal)}
                        isEditMode={isEditMode}
                        label="Cargo Institucional"
                      />
                    </td>

                    {/* Área - Editable */}
                    <td className="py-2.5 px-3 text-slate-600">
                      <EditableField
                        value={p.area}
                        onSave={(newVal) => handleUpdate(idx, 'area', newVal)}
                        isEditMode={isEditMode}
                        label="Área o Dependencia"
                      />
                    </td>

                    {/* Botón de Asistió / No Asistió */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(idx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          p.attended
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                        }`}
                        title="Haga clic para alternar entre Asistió y No Asistió"
                      >
                        {p.attended ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>✓ Asistió</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-700" />
                            <span>✗ No Asistió</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Motivo de Inasistencia / Justificación - Editable */}
                    <td className="py-2.5 px-3">
                      {!p.attended ? (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-red-700 uppercase block">
                            Motivo de Inasistencia:
                          </span>
                          <EditableField
                            value={p.absenceReason || 'Justificación pendiente'}
                            onSave={(newVal) => handleUpdate(idx, 'absenceReason', newVal)}
                            isEditMode={isEditMode}
                            label="Motivo de Inasistencia"
                            className="text-red-900 font-medium italic"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Presente durante toda la sesión
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap no-print">
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                        title="Eliminar este participante de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Form para Agregar Nuevo Participante con selección completa */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 no-print">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-700" />
            <span>Agregar Nuevo Convocado a la Lista de Asistencia</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">
            Todos los aspectos son editables posteriormente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
              Estamento:
            </label>
            <select
              value={newParty}
              onChange={(e) => setNewParty(e.target.value as ParticipantParty)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold text-xs"
            >
              <option value="AUDITADO">Auditado (Empresa)</option>
              <option value="AUDITOR">Auditor (Evaluador)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
              Nombre Completo *:
            </label>
            <input
              type="text"
              placeholder="Ej: Lic. Carlos Andrés Mora"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
              Cargo *:
            </label>
            <input
              type="text"
              placeholder="Ej: Supervisor de Almacén"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
              Área / Dependencia:
            </label>
            <input
              type="text"
              placeholder="Ej: Logística"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
              ¿Asistió?
            </label>
            <select
              value={newAttended ? 'YES' : 'NO'}
              onChange={(e) => setNewAttended(e.target.value === 'YES')}
              className={`w-full p-1.5 border rounded font-bold text-xs ${
                newAttended ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              <option value="YES">✓ Asistió</option>
              <option value="NO">✗ No Asistió</option>
            </select>
          </div>
        </div>

        {!newAttended && (
          <div>
            <label className="block text-[10px] font-bold text-red-700 uppercase mb-0.5">
              Motivo o Justificación de Inasistencia:
            </label>
            <input
              type="text"
              placeholder="Ej: Diligencia prioritaria en ministerio, incapacidad médica, turno nocturno..."
              value={newAbsenceReason}
              onChange={(e) => setNewAbsenceReason(e.target.value)}
              className="w-full p-1.5 bg-white border border-red-300 rounded text-xs text-red-900"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 text-white rounded-lg font-bold text-xs hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Convocado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
