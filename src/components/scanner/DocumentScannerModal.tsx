/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  Sliders,
  Check,
  X,
  RefreshCw,
  FolderPlus,
  FileCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { DocumentFile } from '../../types/audit';

interface DocumentScannerModalProps {
  auditId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveScannedDocument: (doc: DocumentFile) => void;
  defaultProcess?: string;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  auditId,
  isOpen,
  onClose,
  onSaveScannedDocument,
  defaultProcess = 'Gestión Documental y Archivo según GTC 185',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Filters & Processing
  const [filterMode, setFilterMode] = useState<'original' | 'grayscale' | 'high_contrast'>('high_contrast');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [contrastThreshold, setContrastThreshold] = useState<number>(128);

  // Metadata according to GTC 185
  const [docName, setDocName] = useState<string>('Documento_Fisico_Escaneado_GTC185');
  const [radicadoCode, setRadicadoCode] = useState<string>(`EVI-SCAN-${Date.now().toString().slice(-4)}`);
  const [processName, setProcessName] = useState<string>(defaultProcess);
  const [targetFolder, setTargetFolder] = useState<DocumentFile['folder']>('04_Documentos_Escaneados');

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment',
          },
        });
        setStream(mediaStream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Su navegador no soporta captura de video directa. Puede utilizar la simulación de escáner plano.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('No se pudo acceder a la cámara física (o permiso denegado). Puede utilizar el modo de escáner simulado de alta fidelidad.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Capture Frame from Camera
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Pre-loaded realistic sample document for quick test
  const handleLoadSampleDocument = (type: 'acta' | 'certificado' | 'factura') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw document background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // GTC 185 Margins boundary
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, 1000, 1400);

    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';

    if (type === 'acta') {
      ctx.fillText('ACTA DE REUNIÓN EXTRAORDINARIA No. 04', 600, 200);
      ctx.font = '22px sans-serif';
      ctx.fillText('INDUSTRIAS METÁLICAS Y DE SERVICIOS DEL ANDE S.A.S. - NIT 900.548.712-4', 600, 250);
      ctx.fillText('DOCUMENTO FÍSICO DIGITALIZADO BAJO NORMA GTC 185', 600, 290);

      ctx.textAlign = 'left';
      ctx.font = '20px sans-serif';
      ctx.fillText('LUGAR: Sede Principal Bogotá D.C.', 150, 380);
      ctx.fillText('FECHA Y HORA: 12 de Noviembre de 2026, 08:30 AM', 150, 420);
      ctx.fillText('ASISTENTES: Gerencia General, Calidad y Producción', 150, 460);

      ctx.fillText('1. ORDEN DEL DÍA:', 150, 540);
      ctx.fillText('1.1. Verificación del quórum reglamentario y lectura de objetivos de auditoría.', 180, 580);
      ctx.fillText('1.2. Revisión de márgenes y zonas de archivo documental según norma GTC 185.', 180, 620);
      ctx.fillText('1.3. Aprobación unánime de los compromisos institucionales.', 180, 660);

      // Sello y firmas
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 4;
      ctx.strokeRect(700, 1100, 350, 180);
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('SELLO OFICIAL DE RECIBIDO', 720, 1150);
      ctx.font = '18px sans-serif';
      ctx.fillText('RADICADO: GTC185-ARCH-2026', 720, 1190);
      ctx.fillText('FIRMA: H. Restrepo G.', 720, 1230);
    } else {
      ctx.fillText('CERTIFICADO DE CALIBRACIÓN METROLÓGICA', 600, 200);
      ctx.font = '22px sans-serif';
      ctx.fillText('LABORATORIO NACIONAL DE METROLOGÍA ACREDITADO ONAC', 600, 250);
      ctx.fillText('EQUIPO: Micrómetro Digital de Exteriores 0-25mm (MIC-04)', 600, 320);

      ctx.textAlign = 'left';
      ctx.font = '20px sans-serif';
      ctx.fillText('ESTADO: VENCIDO - REQUERIDO PARA AUDITORÍA ISO 9001:2015', 150, 450);
      ctx.fillText('FECHA DE CALIBRACIÓN: 15 de Agosto de 2025', 150, 500);
      ctx.fillText('FECHA DE VENCIMIENTO: 15 de Agosto de 2026', 150, 550);
      ctx.fillText('TRAZABILIDAD: Patrón Primario CENAM-INM Colombia', 150, 600);

      // Sello rojo
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 5;
      ctx.strokeRect(400, 850, 400, 150);
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CALIBRACIÓN VENCIDA', 600, 920);
      ctx.font = '18px sans-serif';
      ctx.fillText('EQUIPO NO APTO PARA LIBERACIÓN FINAL', 600, 960);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    setDocName(type === 'acta' ? 'Escaneo_Acta_Fisica_GTC185' : 'Escaneo_Certificado_Calibracion_MIC04');
    setRadicadoCode(`EVI-SCAN-${type.toUpperCase()}-001`);
    stopCamera();
  };

  // Apply filters to canvas preview
  useEffect(() => {
    if (!capturedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Handle rotation
      if (rotationAngle % 180 !== 0) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Apply pixel filter
      if (filterMode !== 'original') {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          // Luminance calculation
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

          if (filterMode === 'grayscale') {
            d[i] = gray;
            d[i + 1] = gray;
            d[i + 2] = gray;
          } else if (filterMode === 'high_contrast') {
            // Binarization threshold for crisp text
            const binary = gray > contrastThreshold ? 255 : 0;
            d[i] = binary;
            d[i + 1] = binary;
            d[i + 2] = binary;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
    img.src = capturedImage;
  }, [capturedImage, filterMode, rotationAngle, contrastThreshold]);

  // Save Scanned Document to File Manager
  const handleSaveDocument = () => {
    if (!canvasRef.current) return;
    const finalDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.88);

    const newDoc: DocumentFile = {
      id: `doc-scan-${Date.now()}`,
      auditId,
      folder: targetFolder,
      name: `${docName.trim().replace(/\s+/g, '_')}.scan`,
      fileType: 'scan',
      sizeBytes: Math.round(finalDataUrl.length * 0.75),
      uploadedAt: new Date().toISOString(),
      fileData: finalDataUrl,
      tags: ['Escáner GTC 185', filterMode, radicadoCode],
      process: processName,
      gtc185Meta: {
        radicadoNumber: radicadoCode,
        documentType: 'Documento Físico Escaneado Digitalmente',
        isOfficialFormat: true,
      },
    };

    onSaveScannedDocument(newDoc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Escáner Documental GTC-185 (Digitalización con Cámara)
              </h2>
              <span className="text-[11px] text-slate-400">
                Captura de evidencias, actas firmadas y soportes metrológicos
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Viewport (Camera or Canvas Result) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-3 relative min-h-[340px] overflow-hidden">
            {!capturedImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-[360px] w-auto rounded object-contain shadow-md"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-xs text-slate-300 font-medium">Iniciando dispositivo de captura...</p>
                    {cameraError && (
                      <p className="text-[11px] text-amber-400 mt-2 max-w-sm mx-auto">
                        {cameraError}
                      </p>
                    )}
                  </div>
                )}

                {/* GTC 185 Document Alignment Overlay */}
                <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-blue-400/70 rounded-lg flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center text-[10px] text-blue-300 font-mono-tabular bg-slate-900/80 px-2 py-0.5 rounded">
                    <span>MARGEN SUP. 3 - 4 cm</span>
                    <span>RADICACIÓN GTC 185</span>
                  </div>
                  <div className="text-center text-[11px] font-bold text-white/70 tracking-widest uppercase">
                    Alinee el documento físico en este marco
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-blue-300 font-mono-tabular bg-slate-900/80 px-2 py-0.5 rounded">
                    <span>MARGEN IZQ. 4 cm</span>
                    <span>MARGEN DER. 2 cm</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-h-[380px] max-w-full rounded shadow-lg object-contain bg-white"
                />
              </div>
            )}
          </div>

          {/* Right: Controls, Filters & GTC 185 Metadata */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            {!capturedImage ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <strong className="block font-bold mb-0.5">Directriz GTC 185 para escaneo:</strong>
                  Coloque la hoja sobre superficie plana y bien iluminada asegurando que el membrete y las firmas queden legibles.
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={!isCameraActive}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Documento con Cámara</span>
                  </button>

                  <div className="text-center text-[10px] uppercase font-bold text-slate-400 my-1">o utilizar muestra de prueba</div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSampleDocument('acta')}
                      className="p-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors text-center"
                    >
                      Acta Física con Sello
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleDocument('certificado')}
                      className="p-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors text-center"
                    >
                      Certificado Calibración
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Image Processing Filters */}
                <div>
                  <label className="text-[11px] font-bold text-slate-800 uppercase block mb-1.5 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Filtros de Procesamiento GTC 185</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setFilterMode('high_contrast')}
                      className={`py-1.5 rounded transition-colors ${
                        filterMode === 'high_contrast' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      B/N Contraste
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('grayscale')}
                      className={`py-1.5 rounded transition-colors ${
                        filterMode === 'grayscale' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Escala Grises
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('original')}
                      className={`py-1.5 rounded transition-colors ${
                        filterMode === 'original' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Original
                    </button>
                  </div>

                  {filterMode === 'high_contrast' && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                      <span className="text-[10px]">Umbral de tinta:</span>
                      <input
                        type="range"
                        min="70"
                        max="200"
                        value={contrastThreshold}
                        onChange={(e) => setContrastThreshold(Number(e.target.value))}
                        className="w-32 accent-blue-600"
                      />
                      <span className="font-mono-tabular text-[10px] w-6">{contrastThreshold}</span>
                    </div>
                  )}
                </div>

                {/* Rotate & Retake */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                    className="flex-1 py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Girar 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tomar de nuevo</span>
                  </button>
                </div>

                {/* Metadata Form */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Nombre del Archivo Digitalizado:
                    </label>
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Código de Radicación GTC 185:
                    </label>
                    <input
                      type="text"
                      value={radicadoCode}
                      onChange={(e) => setRadicadoCode(e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded font-mono-tabular uppercase focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Carpeta de Destino:
                    </label>
                    <select
                      value={targetFolder}
                      onChange={(e) => setTargetFolder(e.target.value as any)}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="04_Documentos_Escaneados">04_Documentos_Escaneados</option>
                      <option value="02_Actas_Oficiales_GTC185">02_Actas_Oficiales_GTC185</option>
                      <option value="03_Listas_y_Evidencias">03_Listas_y_Evidencias</option>
                      <option value="01_Programacion_y_Plan">01_Programacion_y_Plan</option>
                      <option value="05_Informes_y_Mejoramiento">05_Informes_y_Mejoramiento</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cerrar
              </button>
              {capturedImage && (
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Guardar en Organizador</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
