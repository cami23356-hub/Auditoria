/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, Pencil, CheckCircle2, Type, Sparkles, X } from 'lucide-react';

interface SignatureCanvasProps {
  signerName: string;
  signerTitle: string;
  isSigned: boolean;
  signatureDate: string;
  existingSignatureData?: string;
  onSaveSignature: (signatureData: string) => void;
  onClearSignature: () => void;
  onUpdateSignerName?: (newName: string) => void;
  onUpdateSignerTitle?: (newTitle: string) => void;
  isEditMode?: boolean;
  disabled?: boolean;
  label?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  signerName,
  signerTitle,
  isSigned,
  signatureDate,
  existingSignatureData,
  onSaveSignature,
  onClearSignature,
  onUpdateSignerName,
  onUpdateSignerTitle,
  isEditMode = false,
  disabled = false,
  label = 'Bloque de Firma Oficial',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signMethod, setSignMethod] = useState<'draw' | 'type'>('draw');

  // Inline editing of signer details
  const [isEditingSigner, setIsEditingSigner] = useState(false);
  const [tempName, setTempName] = useState(signerName);
  const [tempTitle, setTempTitle] = useState(signerTitle);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setTempName(signerName);
  }, [signerName]);

  useEffect(() => {
    setTempTitle(signerTitle);
  }, [signerTitle]);

  useEffect(() => {
    if (isModalOpen && canvasRef.current && signMethod === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isModalOpen, signMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (signMethod === 'type') {
      // Generate stylized calligraphic signature stamp on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'italic bold 28px "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tempName || signerName, canvas.width / 2, canvas.height / 2 - 10);

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, canvas.height / 2 + 15);
        ctx.bezierCurveTo(canvas.width / 3, canvas.height / 2 + 25, (canvas.width * 2) / 3, canvas.height / 2 + 5, canvas.width - 40, canvas.height / 2 + 18);
        ctx.stroke();

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`CERTIFICADO GTC-185 · ${new Date().toISOString().split('T')[0]}`, canvas.width / 2, canvas.height - 15);
      }
    }

    const dataUrl = canvas.toDataURL('image/png', 0.85);
    onSaveSignature(dataUrl);

    // If the name was edited inside modal, propagate it as well
    if (onUpdateSignerName && tempName !== signerName) {
      onUpdateSignerName(tempName);
    }
    if (onUpdateSignerTitle && tempTitle !== signerTitle) {
      onUpdateSignerTitle(tempTitle);
    }

    setIsModalOpen(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleSaveInlineSigner = () => {
    if (onUpdateSignerName && tempName.trim()) {
      onUpdateSignerName(tempName.trim());
    }
    if (onUpdateSignerTitle && tempTitle.trim()) {
      onUpdateSignerTitle(tempTitle.trim());
    }
    setIsEditingSigner(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-center text-center p-4 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs group">
      {/* Toast de Guardado Exitoso */}
      {showSavedToast && (
        <div className="absolute -top-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-20 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>¡Firma y Datos Guardados!</span>
        </div>
      )}

      {/* Recuadro de Trazo de Firma */}
      <div className="w-full h-24 flex items-center justify-center border-b-2 border-slate-800 mb-2.5 relative bg-white rounded-t-lg overflow-hidden">
        {isSigned ? (
          existingSignatureData && existingSignatureData.startsWith('data:image') ? (
            <img src={existingSignatureData} alt="Firma digital" className="max-h-20 max-w-full object-contain p-1" />
          ) : (
            <div className="text-center p-2">
              <span className="font-serif italic text-lg text-blue-900 tracking-wider font-bold">
                {signerName}
              </span>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Firma Electrónica Certificada (GTC 185)</span>
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <span className="text-xs italic font-medium">Espacio reglamentario para rúbrica o firma</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Norma GTC 185 (ICONTEC)</span>
          </div>
        )}
      </div>

      {/* Bloque de Nombres y Cargos Directamente Editables */}
      {isEditingSigner ? (
        <div className="w-full bg-blue-50/90 border border-blue-300 p-2.5 rounded-lg space-y-2 text-left mb-2 shadow-xs">
          <div>
            <label className="text-[10px] font-bold text-blue-900 uppercase block mb-0.5">
              Nombre Completo del Responsable:
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-blue-900 uppercase block mb-0.5">
              Cargo Institucional / Rol:
            </label>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
          </div>
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setTempName(signerName);
                setTempTitle(signerTitle);
                setIsEditingSigner(false);
              }}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveInlineSigner}
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs"
            >
              <Check className="w-3 h-3" />
              Guardar Nombre
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full group/info relative py-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              {signerName}
            </span>
            {(onUpdateSignerName || isEditMode) && !disabled && (
              <button
                type="button"
                onClick={() => setIsEditingSigner(true)}
                title="Editar nombre y cargo de este responsable firmante"
                className="opacity-70 group-hover:opacity-100 transition-opacity p-1 text-blue-700 hover:text-blue-900 hover:bg-blue-100/70 rounded"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-0.5">{signerTitle}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono-tabular">
            Fecha de Firma: <strong className="text-slate-600">{signatureDate || 'Pendiente de emisión'}</strong>
          </div>
        </div>
      )}

      {/* Botones de Acción de Firma */}
      {!disabled && (
        <div className="mt-2.5 flex items-center justify-center gap-2 pt-1 border-t border-slate-200/80 w-full no-print">
          {isSigned ? (
            <button
              type="button"
              onClick={() => {
                onClearSignature();
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 2000);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline py-1"
            >
              Borrar y cambiar firma
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-blue-900 transition-colors shadow-xs active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5 text-blue-400" />
              <span>Estampar Firma Oficial</span>
            </button>
          )}

          {!isEditingSigner && (onUpdateSignerName || isEditMode) && (
            <button
              type="button"
              onClick={() => setIsEditingSigner(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-2xs"
            >
              <Pencil className="w-3 h-3 text-slate-500" />
              <span>Editar Nombre</span>
            </button>
          )}
        </div>
      )}

      {/* Modal para trazar o certificar firma */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Estampado de Firma Oficial GTC 185</h3>
                <p className="text-xs text-slate-500">Documento vinculante de auditoría interna</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Método de Firma */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSignMethod('draw')}
                className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  signMethod === 'draw'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Dibujar Trazo a Mano</span>
              </button>
              <button
                type="button"
                onClick={() => setSignMethod('type')}
                className={`py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  signMethod === 'type'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Firma Tipográfica</span>
              </button>
            </div>

            {/* Nombre del Firmante Editable en el Modal */}
            <div className="mb-3 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-left">
              <label className="text-[10px] font-bold text-blue-900 uppercase block mb-1">
                Responsable que Firma:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Cargo / Título"
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded text-slate-800"
                />
              </div>
            </div>

            {/* Canvas o Vista Previa */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1 flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`bg-white rounded-lg shadow-inner ${
                  signMethod === 'draw' ? 'cursor-crosshair touch-none' : 'hidden'
                }`}
              />

              {signMethod === 'type' && (
                <div className="w-[360px] h-[150px] bg-white rounded-lg flex flex-col items-center justify-center p-4 border border-slate-200">
                  <span className="font-serif italic text-2xl text-blue-950 font-bold tracking-wider">
                    {tempName || signerName}
                  </span>
                  <div className="w-48 h-0.5 bg-blue-600 mt-2 mb-1" />
                  <p className="text-[10px] text-slate-500 font-mono-tabular">
                    Firma Electrónica Auténtica · GTC 185
                  </p>
                  <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                    Fecha: {new Date().toLocaleDateString('es-CO')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              {signMethod === 'draw' ? (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  Se generará el sello caligráfico formal
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignature}
                  disabled={signMethod === 'draw' && !hasDrawn}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Estampar y Guardar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
