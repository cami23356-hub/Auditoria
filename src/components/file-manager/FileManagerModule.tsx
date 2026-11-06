/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  FolderTree,
  Upload,
  Camera,
  Search,
  Grid,
  List,
  FileText,
  Image,
  Scan,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Folder,
  Tag,
  ExternalLink,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  FilePlus2,
  FileBadge,
  X,
  Maximize2,
  Info,
} from 'lucide-react';
import { DocumentFile, Company, AuditSession } from '../../types/audit';
import { EditableField } from '../common/EditableField';

interface FileManagerModuleProps {
  documents: DocumentFile[];
  currentCompany: Company;
  currentAudit: AuditSession;
  isEditMode: boolean;
  onUploadDocument: (doc: DocumentFile) => void;
  onDeleteDocument: (docId: string) => void;
  onOpenScanner: () => void;
}

export const FileManagerModule: React.FC<FileManagerModuleProps> = ({
  documents,
  currentCompany,
  currentAudit,
  isEditMode,
  onUploadDocument,
  onDeleteDocument,
  onOpenScanner,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'PDF_ONLY'>('ALL');

  // Modal para subir documento ya realizado en PDF
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfUploadCategory, setPdfUploadCategory] = useState<
    '01_Programacion_y_Plan' | '02_Actas_Oficiales_GTC185' | '03_Listas_y_Evidencias' | '04_Documentos_Escaneados' | '05_Informes_y_Mejoramiento'
  >('02_Actas_Oficiales_GTC185');
  const [pdfDocType, setPdfDocType] = useState('Acta de Auditoría Realizada');
  const [pdfProcessArea, setPdfProcessArea] = useState(currentAudit.processArea || 'Operaciones');
  const [pdfRadicado, setPdfRadicado] = useState(`RAD-PDF-${new Date().getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const folders = [
    { id: 'ALL', name: 'Todos los Archivos', count: documents.length },
    {
      id: '01_Programacion_y_Plan',
      name: '01. Programación y Planes',
      count: documents.filter((d) => d.folder === '01_Programacion_y_Plan').length,
    },
    {
      id: '02_Actas_Oficiales_GTC185',
      name: '02. Actas Oficiales GTC 185',
      count: documents.filter((d) => d.folder === '02_Actas_Oficiales_GTC185').length,
    },
    {
      id: '03_Listas_y_Evidencias',
      name: '03. Listas y Evidencias',
      count: documents.filter((d) => d.folder === '03_Listas_y_Evidencias').length,
    },
    {
      id: '04_Documentos_Escaneados',
      name: '04. Documentos Escaneados',
      count: documents.filter((d) => d.folder === '04_Documentos_Escaneados').length,
    },
    {
      id: '05_Informes_y_Mejoramiento',
      name: '05. Informes y Mejoramiento',
      count: documents.filter((d) => d.folder === '05_Informes_y_Mejoramiento').length,
    },
  ];

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesFolder = selectedFolder === 'ALL' || doc.folder === selectedFolder;
    const matchesFormat = formatFilter === 'ALL' || doc.fileType === 'pdf';
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.gtc185Meta.radicadoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.process && doc.process.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFolder && matchesFormat && matchesSearch;
  });

  // Validar y procesar archivo PDF
  const handlePdfFileSelection = (file: File) => {
    setUploadError(null);

    // Validación estricta de formato PDF conforme a la instrucción
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      setUploadError(
        `Formato no permitido: El archivo "${file.name}" no es un PDF válido. Por directriz de la norma GTC 185 e ISO 19011, los documentos ya realizados deben subirse exclusivamente en formato PDF (.pdf).`
      );
      setSelectedPdfFile(null);
      return;
    }

    setSelectedPdfFile(file);
    // Sugerir tipo de documento según el nombre
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('acta') && lowerName.includes('inici')) {
      setPdfUploadCategory('02_Actas_Oficiales_GTC185');
      setPdfDocType('Acta de Iniciación Ya Realizada');
    } else if (lowerName.includes('acta') && (lowerName.includes('cierre') || lowerName.includes('final'))) {
      setPdfUploadCategory('02_Actas_Oficiales_GTC185');
      setPdfDocType('Acta de Cierre Ya Realizada');
    } else if (lowerName.includes('informe')) {
      setPdfUploadCategory('05_Informes_y_Mejoramiento');
      setPdfDocType('Informe Final de Auditoría Previo');
    } else if (lowerName.includes('plan')) {
      setPdfUploadCategory('01_Programacion_y_Plan');
      setPdfDocType('Plan de Auditoría Formalizado');
    }
  };

  const handleSaveUploadedPdf = () => {
    if (!selectedPdfFile) {
      setUploadError('Debe seleccionar un archivo PDF para continuar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDoc: DocumentFile = {
        id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        auditId: currentAudit.id,
        folder: pdfUploadCategory,
        name: selectedPdfFile.name,
        fileType: 'pdf',
        sizeBytes: selectedPdfFile.size,
        uploadedAt: new Date().toISOString(),
        fileData: dataUrl,
        tags: ['Documento Ya Realizado', 'PDF Oficial', 'GTC 185'],
        process: pdfProcessArea,
        gtc185Meta: {
          radicadoNumber: pdfRadicado,
          documentType: pdfDocType,
          isOfficialFormat: true,
        },
      };

      onUploadDocument(newDoc);
      setIsPdfUploadModalOpen(false);
      setSelectedPdfFile(null);
      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 3000);
    };

    reader.onerror = () => {
      setUploadError('Ocurrió un error al leer el archivo PDF. Intente nuevamente.');
    };

    reader.readAsDataURL(selectedPdfFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: DocumentFile['fileType']) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 font-extrabold text-[10px] border border-red-200">
            PDF
          </div>
        );
      case 'image':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
            <Image className="w-4 h-4" />
          </div>
        );
      case 'scan':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Scan className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <FolderTree className="w-3.5 h-3.5" />
            <span>AuditDoc Explorer · Gestor de Expedientes y Documentos</span>
            <span className="text-slate-400">·</span>
            <span>Norma GTC 185</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestor y Organizador de Documentos de Auditoría
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Carga de documentos ya realizados en PDF, estructuración de carpetas GTC 185, actas oficiales y evidencias escaneadas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Botón Principal: Subir Documento Ya Realizado en PDF */}
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setSelectedPdfFile(null);
              setIsPdfUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-all active:scale-95 ring-1 ring-red-800"
            title="Subir documentos ya realizados en formato obligatorio PDF (.pdf)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Documento en PDF</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded font-mono-tabular">.pdf</span>
          </button>

          {/* Botón Escanear */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-blue-700" />
            <span>Escanear con Cámara</span>
          </button>
        </div>
      </div>

      {/* Indicación Obligatoria GTC-185 de Formato PDF */}
      <div className="bg-gradient-to-r from-red-50 via-slate-50 to-blue-50 border border-red-200/90 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-extrabold text-xs">
            PDF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Indicación Normativa: Carga de Documentos Realizados
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                Formato Obligatorio: PDF (.pdf)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Conforme a los lineamientos de la <strong>Guía Técnica Colombiana GTC 185</strong> y la Ley 594 de Gestión Documental,
              todos los documentos formalizados externamente (actas firmadas, informes previos, certificados y expedientes completos)
              <strong> deben adjuntarse obligatoriamente en formato PDF (.pdf)</strong> para preservar su inmutabilidad probatoria y legibilidad técnica.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setSelectedPdfFile(null);
            setIsPdfUploadModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-lg shrink-0 shadow-2xs transition-colors"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          <span>Cargar PDF Ahora</span>
        </button>
      </div>

      {/* Toast de Carga Exitosa */}
      {uploadSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Documento PDF cargado y archivado exitosamente en el expediente GTC 185.</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono-tabular">Archivo Seguro</span>
        </div>
      )}

      {/* Main Explorer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Sidebar: Folder Tree */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Estructura de Carpetas GTC 185
          </div>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolder(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                selectedFolder === f.id
                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder
                  className={`w-4 h-4 shrink-0 ${
                    selectedFolder === f.id ? 'text-blue-700 fill-blue-100' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{f.name}</span>
              </div>
              <span className="text-[10px] font-mono-tabular bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {f.count}
              </span>
            </button>
          ))}

          {/* Quick Filter: Solo PDFs */}
          <div className="pt-3 mt-3 border-t border-slate-100 px-1 space-y-1">
            <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filtro Rápido de Formato
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setFormatFilter('ALL')}
                className={`py-1 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                  formatFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFormatFilter('PDF_ONLY')}
                className={`py-1 px-2 text-xs font-bold rounded-md border text-center transition-colors flex items-center justify-center gap-1 ${
                  formatFilter === 'PDF_ONLY'
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                }`}
              >
                <span>Solo PDFs</span>
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 px-3">
            <div className="text-[11px] font-bold text-slate-800 mb-1">Empresa Auditada</div>
            <div className="text-xs font-semibold text-blue-900 truncate">{currentCompany.name}</div>
            <div className="text-[10px] text-slate-500 font-mono-tabular">NIT: {currentCompany.nit}</div>
          </div>
        </div>

        {/* Right: Files Browser */}
        <div className="md:col-span-9 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Toolbar: Search, Filters & View Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, radicado, proceso o etiqueta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-mono-tabular">
                  {filteredDocs.length} archivo(s)
                </span>
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
                    }`}
                    title="Vista en cuadrícula"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
                    }`}
                    title="Vista en lista"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Content */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FolderTree className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No se encontraron archivos en esta sección</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Suba documentos ya realizados en <strong>formato PDF (.pdf)</strong> o capture documentos físicos con el escáner.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPdfUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Documento en PDF</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top icon and radicado */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <span className="text-[10px] font-mono-tabular font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {doc.gtc185Meta.radicadoNumber}
                        </span>
                      </div>

                      {/* File Name & Type */}
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {doc.gtc185Meta.documentType || 'Evidencia'}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              tag.includes('PDF')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono-tabular">{formatFileSize(doc.sizeBytes)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Visualizar documento"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Eliminar de expediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Formato / Nombre</th>
                      <th className="py-2.5 px-3">Radicado GTC 185</th>
                      <th className="py-2.5 px-3">Carpeta / Proceso</th>
                      <th className="py-2.5 px-3">Tamaño</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 flex items-center gap-2">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <div className="font-semibold text-slate-900 truncate max-w-xs">{doc.name}</div>
                            <div className="text-[10px] text-slate-400">{doc.gtc185Meta.documentType}</div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular text-slate-600">
                          {doc.gtc185Meta.radicadoNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="block truncate max-w-[160px]">{doc.folder}</span>
                          <span className="text-[10px] text-slate-400">{doc.process || 'General'}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular text-slate-500">
                          {formatFileSize(doc.sizeBytes)}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1 text-slate-500 hover:text-blue-600"
                            title="Ver documento"
                          >
                            <Eye className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Eliminar documento"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SUBIR DOCUMENTO YA REALIZADO EN FORMATO PDF OBLIGATORIO */}
      {isPdfUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-black text-[10px]">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm font-bold">Cargar Documento Ya Realizado</h3>
                  <p className="text-[11px] text-red-200">Requisito técnico obligatorio: Archivo en formato PDF (.pdf)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Alerta de Formato Obligatorio */}
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-lg">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>INDICACIÓN OBLIGATORIA: FORMATO PDF EXCLUSIVO (.pdf)</span>
                </div>
                <p className="text-red-800 text-[11px] mt-1 leading-relaxed">
                  Para dar estricto cumplimiento a la <strong>Guía Técnica Colombiana GTC 185</strong> y la ISO 19011,
                  los documentos ya realizados (como actas formalizadas, informes finales, certificaciones o procedimientos)
                  <strong> deben cargarse únicamente en formato PDF</strong>. Cualquier otro formato no garantiza la inmutabilidad documental requerida.
                </p>
              </div>

              {/* Mensaje de error si seleccionó un formato incorrecto */}
              {uploadError && (
                <div className="bg-rose-100 border border-rose-300 text-rose-900 p-3 rounded-lg text-xs font-semibold flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{uploadError}</div>
                </div>
              )}

              {/* Dropzone para PDF */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  selectedPdfFile
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-red-500 bg-slate-50/60 hover:bg-red-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfFileSelection(file);
                  }}
                  className="hidden"
                />

                {selectedPdfFile ? (
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold text-xs border border-emerald-300">
                      ✓ PDF
                    </div>
                    <div className="text-xs font-bold text-slate-900">{selectedPdfFile.name}</div>
                    <div className="text-[11px] text-emerald-700 font-mono-tabular">
                      Archivo PDF verificado · {formatFileSize(selectedPdfFile.size)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPdfFile(null);
                      }}
                      className="text-[10px] text-red-600 hover:underline pt-1 block mx-auto"
                    >
                      Seleccionar otro archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2 font-black text-sm border border-red-200">
                      PDF
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      Haga clic o arrastre aquí su documento ya realizado
                    </div>
                    <p className="text-[11px] text-red-700 font-semibold">
                      Únicamente archivos con extensión .pdf
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Tamaño máximo recomendado: 25 MB por archivo
                    </p>
                  </div>
                )}
              </div>

              {/* Formulario de Metadatos GTC 185 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tipo de Documento Realizado:
                  </label>
                  <select
                    value={pdfDocType}
                    onChange={(e) => setPdfDocType(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Acta de Iniciación Ya Realizada">Acta de Iniciación Ya Realizada</option>
                    <option value="Acta de Cierre Ya Realizada">Acta de Cierre Ya Realizada</option>
                    <option value="Informe Final de Auditoría Previo">Informe Final de Auditoría Previo</option>
                    <option value="Plan de Auditoría Formalizado">Plan de Auditoría Formalizado</option>
                    <option value="Evidencia Documental Certificada">Evidencia Documental Certificada</option>
                    <option value="Procedimiento o Manual de Calidad">Procedimiento o Manual de Calidad</option>
                    <option value="Certificación Legal o SST">Certificación Legal o SST</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Carpeta de Clasificación GTC 185:
                  </label>
                  <select
                    value={pdfUploadCategory}
                    onChange={(e) => setPdfUploadCategory(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="01_Programacion_y_Plan">01. Programación y Planes</option>
                    <option value="02_Actas_Oficiales_GTC185">02. Actas Oficiales GTC 185</option>
                    <option value="03_Listas_y_Evidencias">03. Listas y Evidencias</option>
                    <option value="04_Documentos_Escaneados">04. Documentos Escaneados</option>
                    <option value="05_Informes_y_Mejoramiento">05. Informes y Mejoramiento</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Proceso o Área Asociada:
                  </label>
                  <input
                    type="text"
                    value={pdfProcessArea}
                    onChange={(e) => setPdfProcessArea(e.target.value)}
                    placeholder="Ej. Producción, SST, Talento Humano..."
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Número de Radicado GTC 185:
                  </label>
                  <input
                    type="text"
                    value={pdfRadicado}
                    onChange={(e) => setPdfRadicado(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono-tabular"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Validación de formato GTC 185 activa</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveUploadedPdf}
                  disabled={!selectedPdfFile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Archivar Documento PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISOR DE DOCUMENTO (CON EMBEBIDO REAL PARA PDF) */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                    previewDoc.fileType === 'pdf' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {previewDoc.fileType.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold truncate max-w-md">{previewDoc.name}</h3>
                  <span className="text-[10px] text-blue-300 font-mono-tabular">
                    Radicado: {previewDoc.gtc185Meta.radicadoNumber} · {previewDoc.gtc185Meta.documentType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 flex flex-col items-center justify-center">
              {previewDoc.fileType === 'pdf' && previewDoc.fileData ? (
                <div className="w-full h-full flex flex-col items-center">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.name}
                    className="w-full h-[520px] rounded-lg border border-slate-300 bg-white shadow-inner"
                  />
                  <div className="text-center mt-2 text-[11px] text-slate-500">
                    Visualizador de documento PDF oficial conforme a la norma GTC 185.
                  </div>
                </div>
              ) : previewDoc.fileData && previewDoc.fileData.startsWith('data:image') ? (
                <div className="bg-white p-3 rounded-lg shadow-md border border-slate-300 max-w-full">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.name}
                    className="max-h-[500px] object-contain rounded"
                  />
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md border border-slate-300 w-full max-w-md text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900 pb-2 mb-4">
                    {currentCompany.name}
                    <div className="text-[10px] text-slate-500 font-normal">NIT: {currentCompany.nit}</div>
                  </div>
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">{previewDoc.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Documento administrativo registrado oficialmente bajo norma GTC 185.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-mono-tabular">
                    Identificador de seguridad: {previewDoc.id}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono-tabular">
                Tamaño: {formatFileSize(previewDoc.sizeBytes)} · Fecha: {new Date(previewDoc.uploadedAt).toLocaleDateString('es-CO')}
              </span>
              <div className="flex items-center gap-2">
                {previewDoc.fileData && (
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Descargar PDF</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
