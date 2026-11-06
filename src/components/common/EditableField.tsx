/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditMode?: boolean;
  isEditable?: boolean;
  label?: string;
  multiline?: boolean;
  className?: string;
  asHeading?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p' | 'div';
  compact?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  isEditMode,
  isEditable,
  label,
  multiline = false,
  className = '',
  asHeading = 'span',
  compact = false,
}) => {
  const activeEditMode = isEditMode ?? isEditable ?? false;
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Sync if external value changes
  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <span className="relative inline-flex flex-col min-w-[140px] max-w-full my-0.5 p-1.5 bg-blue-50/95 rounded-md border border-blue-400 shadow-md z-30 text-left">
        {label && <span className="text-[10px] font-bold text-blue-900 mb-0.5 uppercase tracking-wide">{label}</span>}
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            rows={3}
            className="w-full text-xs p-1.5 bg-white text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full text-xs p-1 bg-white text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        )}
        <span className="flex items-center justify-end gap-1.5 mt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
          >
            <X className="w-3 h-3" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-white bg-blue-700 rounded hover:bg-blue-800 shadow-xs"
          >
            <Check className="w-3 h-3" />
            Guardar
          </button>
        </span>
      </span>
    );
  }

  const Tag = asHeading;

  return (
    <span
      className={`group inline-flex items-center gap-1 transition-all ${
        activeEditMode
          ? 'cursor-pointer hover:bg-blue-100/60 rounded px-1.5 py-0.5 ring-1 ring-blue-400/50 bg-blue-50/30'
          : 'hover:bg-slate-100/40 rounded px-0.5'
      }`}
      onClick={(e) => {
        if (activeEditMode) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      title={activeEditMode ? `Haga clic para editar: ${label || 'este campo'}` : undefined}
    >
      <Tag className={className}>
        {value || <span className="text-slate-400 italic font-normal">[Vacío - clic para editar]</span>}
      </Tag>
      {activeEditMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title={`Editar: ${label || 'campo'}`}
          className="opacity-70 group-hover:opacity-100 transition-opacity p-0.5 text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded shadow-2xs shrink-0"
        >
          <Pencil className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
};
