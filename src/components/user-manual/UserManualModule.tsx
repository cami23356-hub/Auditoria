/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Search, FileText, CheckCircle2, ShieldCheck, Grid3X3, HelpCircle, Download, Award } from 'lucide-react';
import { exportToWord } from '../../utils/exportUtils';

export const UserManualModule: React.FC = () => {
  const [activeManualTab, setActiveManualTab] = useState<
    'gtc185' | 'flow' | 'iso19011' | 'findings' | 'evaluation' | 'risks' | 'scanner' | 'faq'
  >('gtc185');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownloadManual = () => {
    const content = `
      <h1>MANUAL DE USUARIO OFICIAL - AUDITPRO</h1>
      <p>Este manual describe la operatividad de AUDITPRO bajo las directrices de la Norma Técnica Colombiana GTC 185 e ISO 19011:2018.</p>
      <h2>1. Regulación GTC 185</h2>
      <p>Márgenes: Superior 3-4 cm, Izquierdo 3-4 cm, Derecho 2-3 cm, Inferior 2-3 cm. Redacción impersonal, codificación de actas y radicados.</p>
      <h2>2. Metodología de Hallazgos A-E, Fotos y Excel</h2>
      <p>Obligatoriedad de responder: debilidad, etapa, norma incumplida con vigencia, consecuencias y solución viable. Carga de evidencias fotográficas y exportación con imágenes a Excel.</p>
      <h2>3. Registro de Asistencia y Calificación de la Auditoría</h2>
      <p>Control de quórum y asistencia categorizada (Auditores y Auditados). Calificación integral bipartita con escala de 1 a 5 según ISO 19011 Numeral 7.</p>
    `;
    exportToWord('Manual_de_Usuario_AUDITPRO_GTC185', content, 'AUDITPRO SOFTWARE COLOMBIA', '900.000.000-1', 'MAN-GTC185-001');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentación Oficial del Sistema</span>
            <span className="text-slate-400">·</span>
            <span>Ubicado en /MANUAL_DE_USUARIO.md en la raíz del proyecto</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Manual de Usuario e Instructivo GTC-185 & ISO 19011
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Guía completa de operación, estándares icontec para actas e informes, formulación de hallazgos con fotos, asistencia y calificación integral.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadManual}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar Manual en Word (.doc)</span>
        </button>
      </div>

      {/* Manual Navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-medium border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveManualTab('gtc185')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'gtc185' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Norma GTC 185 (Estructura de Documentos)
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('flow')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'flow' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Ciclo de Auditoría Paso a Paso
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('findings')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'findings' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Hallazgos (Fotos & Excel .xls)
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('evaluation')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'evaluation' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Calificación & Asistencia
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('risks')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'risks' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          5. Matriz de Riesgos (5x5)
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('scanner')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'scanner' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          6. Escáner y Gestor Documental
        </button>
        <button
          type="button"
          onClick={() => setActiveManualTab('faq')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeManualTab === 'faq' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          7. Preguntas Frecuentes
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs leading-relaxed text-sm text-slate-700">
        {activeManualTab === 'gtc185' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <FileText className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                Guía Técnica Colombiana GTC 185 – Documentación Organizacional
              </h2>
            </div>

            <p>
              La norma **GTC 185** fue elaborada por el Instituto Colombiano de Normas Técnicas y Certificación (**ICONTEC**) con el propósito de brindar pautas claras para la simplificación, unificación y formalización de la documentación en las organizaciones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-blue-800">
                  Zonas y Márgenes Reglamentarios
                </h3>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-600">
                  <li><strong>Margen Superior:</strong> Entre 3 cm y 4 cm (espacio para encabezado institucional y radicación).</li>
                  <li><strong>Margen Inferior:</strong> Entre 2 cm y 3 cm (para pie de página, número de página y línea especial).</li>
                  <li><strong>Margen Izquierdo:</strong> Entre 3 cm y 4 cm (reserva indispensable para encuadernación y archivo).</li>
                  <li><strong>Margen Derecho:</strong> Entre 2 cm y 3 cm.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-blue-800">
                  Estructura de Actas (Numeral 5 GTC 185)
                </h3>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-600">
                  <li><strong>Título y Carácter:</strong> ACTA No. y nombre del comité u ocasión.</li>
                  <li><strong>Lugar y Fecha:</strong> Ciudad, lugar exacto, hora de inicio y hora de finalización.</li>
                  <li><strong>Asistentes:</strong> Lista con nombres completos y cargos de los participantes.</li>
                  <li><strong>Orden del Día / Objetivos:</strong> Enumeración de los asuntos acordados.</li>
                  <li><strong>Desarrollo y Conclusiones:</strong> Redacción impersonal en tiempo pretérito o presente.</li>
                  <li><strong>Firmas Reglamentarias:</strong> Rúbrica, nombre claro y cargo formal.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Estructura del Informe Administrativo de Auditoría (Numeral 7 GTC 185)
              </h3>
              <p className="text-xs text-blue-950">
                Los informes generados por AUDITPRO cumplen con los 15 puntos ordenados de la norma: Portada, Información general, Introducción, Objetivo, Alcance, Metodología, Criterios, Desarrollo, Resultados de lista de chequeo, Hallazgos, Evidencias, Matriz de riesgos, Conclusiones, Recomendaciones y Plan de Mejoramiento.
              </p>
            </div>
          </div>
        )}

        {activeManualTab === 'flow' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Ciclo de Auditoría Paso a Paso (ISO 19011:2018)
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Programación de la Auditoría</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Registre la empresa, NIT, sector económico, fechas estimadas, objetivo, alcance y tipo de auditoría en el Módulo 1.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Plan de Auditoría & Criterios</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Genere el plan en el Módulo 2. Configure los criterios normativos (Normas técnicas, legales con vigencia real, caracterización de procesos, 5S) y el cronograma de entrevistas.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Acta de Apertura (Iniciación GTC 185)</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Convoque a la reunión de apertura en el Módulo 3. Lea las responsabilidades y reciba las firmas digitales del auditor líder y el representante de la empresa.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Evaluación con Lista de Chequeo</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Califique cada ítem (Cumple, No Cumple, Cumple Parcialmente, No Aplica). Al marcar incumplimiento, el sistema desplegará automáticamente la ventana de hallazgo.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">5</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Registro de Hallazgos & Calificación de Riesgos</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Responda obligatoriamente las preguntas A-E para cada hallazgo y evalúe la matriz de riesgos en los Módulos 5 y 6.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">6</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Acta de Cierre & Informe Final</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Formalice los compromisos en el Acta de Cierre (Módulo 7) y descargue el Informe Final de 15 puntos en PDF o Word (Módulo 8).</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">7</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Plan de Mejoramiento y Seguimiento de Eficacia</h3>
                  <p className="text-xs text-slate-600 mt-0.5">En el Módulo 9 registre causas raíz, acciones correctivas y preventivas, y monitoree su estado hasta que la no conformidad quede solucionada.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeManualTab === 'findings' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                Protocolo Obligatorio para Análisis de Hallazgos (Preguntas A a E)
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              Para garantizar que ningún hallazgo carezca de fundamentación técnica o jurídica, el sistema exige contestar las siguientes cinco interrogantes en cada registro:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-extrabold text-blue-900 block">Pregunta A: ¿Cuál es la debilidad o problema encontrado en la empresa?</span>
                <span className="text-xs text-slate-600 block mt-0.5">Describa el hecho fáctico observado sin ambigüedades. Ejemplo: "Uso de micrómetro digital con calibración vencida en el área de mecanizado".</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-extrabold text-blue-900 block">Pregunta B: ¿En qué momento o etapa del proceso se encontró el problema?</span>
                <span className="text-xs text-slate-600 block mt-0.5">Identifique la etapa exacta del flujo operacional. Ejemplo: "En la inspección y ensayo final previo al despacho del recipiente".</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-extrabold text-blue-900 block">Pregunta C: ¿Qué norma, requisito o criterio se está incumpliendo?</span>
                <span className="text-xs text-slate-600 block mt-0.5">Cite la norma con código, versión y vigencia oficial. Ejemplo: "NTC-ISO 9001:2015 Numeral 7.1.5.2 (Trazabilidad de mediciones)".</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-extrabold text-blue-900 block">Pregunta D: ¿Cuáles son las consecuencias actuales y futuras de incumplir esta norma?</span>
                <span className="text-xs text-slate-600 block mt-0.5">Valore el impacto en la calidad, seguridad, legalidad o finanzas de la empresa. Ejemplo: "Riesgo de falla de recipientes en operación del cliente y demandas por responsabilidad civil".</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-extrabold text-blue-900 block">Pregunta E: ¿Cómo se puede solucionar el incumplimiento?</span>
                <span className="text-xs text-slate-600 block mt-0.5">Proponga la acción correctiva inmediata y la acción preventiva de fondo. Ejemplo: "Cuarentena inmediata del equipo, envío a laboratorio acreditado ONAC y remuestreo de lotes recientes".</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs mt-3">
              <span className="font-bold text-blue-900 block mb-1">📸 Evidencias Fotográficas y Exportación a Excel (.xls)</span>
              <p className="text-slate-700">
                Cada hallazgo dispone del botón <strong>[+ Subir Foto Evidencia]</strong>. Las fotos se almacenan de forma segura e inalterable, y al pulsar <strong>[Guardar en Excel con Fotos (.xls)]</strong> se exporta una hoja de cálculo estructurada con encabezados GTC 185, las respuestas A a E y las fotografías incrustadas directamente como evidencia objetiva.
              </p>
            </div>
          </div>
        )}

        {activeManualTab === 'evaluation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Calificación Integral de la Auditoría y Control de Asistencia Oficial (ISO 19011:2018)
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              De acuerdo con las directrices de la norma internacional <strong>ISO 19011:2018 (Numeral 7: Competencia y evaluación de auditores)</strong> y la <strong>GTC-185 (Actas y Quórum)</strong>, la evaluación de una auditoría no es unidireccional: califica de forma cruzada tanto el desempeño de los auditores como el de la organización auditada.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-blue-900 uppercase block">1. Aspectos Evaluados a los Auditores</span>
                <ul className="text-xs space-y-1 text-slate-700 list-disc pl-4">
                  <li><strong>Competencia Técnica y Normativa:</strong> Dominio de ISO 9001, ISO 19011 y GTC-185.</li>
                  <li><strong>Comunicación Asertiva y Trato:</strong> Respeto, cordialidad y formulación clara de preguntas.</li>
                  <li><strong>Gestión de Tiempos:</strong> Puntualidad y cumplimiento del cronograma de auditoría.</li>
                  <li><strong>Objetividad e Imparcialidad:</strong> Sustentación con hechos y evidencia fotográfica/documental.</li>
                  <li><strong>Enfoque Constructivo:</strong> Recomendaciones viables que agreguen valor real.</li>
                  <li><strong>Rigor GTC 185:</strong> Aplicación estricta de márgenes, zonas y estilo formal.</li>
                </ul>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-indigo-900 uppercase block">2. Aspectos Evaluados a los Auditados</span>
                <ul className="text-xs space-y-1 text-slate-700 list-disc pl-4">
                  <li><strong>Disposición y Disponibilidad:</strong> Presencia activa de los líderes en las citas.</li>
                  <li><strong>Suministro de Evidencias:</strong> Acceso oportuno y ágil a expedientes y sistemas.</li>
                  <li><strong>Transparencia y Veracidad:</strong> Honestidad al declarar el estado real de los procesos.</li>
                  <li><strong>Dominio Operativo:</strong> Conocimiento de sus propios manuales y estándares.</li>
                  <li><strong>Receptividad ante Hallazgos:</strong> Asimilación constructiva de No Conformidades.</li>
                  <li><strong>Condiciones e Infraestructura:</strong> Sala, conectividad y seguridad física en planta.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
              <span className="font-bold text-slate-900 block">👥 Control de Asistencia y Quórum en Actas (Módulos 3 y 7):</span>
              <p className="text-slate-600">
                Las Actas de Iniciación y de Cierre separan obligatoriamente la lista de asistentes en dos estamentos: <strong>Equipo Auditor</strong> y <strong>Organización Auditada</strong>, calculando en tiempo real el porcentaje de quórum, los asistentes y los ausentes con su respectivo motivo justificado de inasistencia.
              </p>
            </div>
          </div>
        )}

        {activeManualTab === 'risks' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Grid3X3 className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Metodología de Calificación del Riesgo (Matriz 5x5)
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              La calificación del riesgo se calcula mediante la fórmula institucional:
              <br />
              <strong className="text-slate-900 font-mono-tabular">Nivel de Riesgo = Probabilidad de Ocurrencia (1 a 5) × Impacto de las Consecuencias (1 a 5)</strong>
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs my-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="font-bold text-emerald-800 block uppercase">Bajo (1 - 4)</span>
                <span className="text-slate-600 block mt-0.5">Riesgo aceptable con controles operacionales existentes.</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="font-bold text-amber-800 block uppercase">Medio (5 - 9)</span>
                <span className="text-slate-600 block mt-0.5">Riesgo moderado que requiere seguimiento programado.</span>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <span className="font-bold text-orange-800 block uppercase">Alto (10 - 14)</span>
                <span className="text-slate-600 block mt-0.5">Intervención prioritaria con asignación de recursos.</span>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="font-bold text-red-800 block uppercase">Crítico (15 - 25)</span>
                <span className="text-slate-600 block mt-0.5">Acción inmediata; amenaza la continuidad operativa o legal.</span>
              </div>
            </div>
          </div>
        )}

        {activeManualTab === 'scanner' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                Gestión Documental, Carga de Documentos en PDF y Escáner
              </h2>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-rose-800">
                ⚠️ Indicación Técnica Obligatoria: Formato Exclusivo PDF (.pdf)
              </span>
              <p className="leading-relaxed">
                Todo documento previamente realizado (actas físicas firmadas, certificaciones externas, políticas empresariales o informes periciales) debe subirse <strong>exclusivamente en formato PDF (.pdf)</strong>. Según la norma técnica <strong>GTC 185 (ICONTEC)</strong> y la Ley 594 de 2000, los documentos concluidos deben ser inalterables, asegurar la fidelidad visual de los márgenes reglamentarios (3 a 4 cm superior e izquierdo) y preservar la autenticidad probatoria de las rúbricas y sellos.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900">¿Dónde se pueden subir documentos ya realizados en PDF?</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Gestor de Archivos (AuditDoc Explorer):</strong> Botón destacado <em>"Subir Documento en PDF"</em> con asistente de clasificación documental GTC 185, radicado oficial y selector de carpeta.</li>
                <li><strong>Acta de Iniciación:</strong> Botón <em>"Subir Acta en PDF"</em> para adjuntar actas de apertura firmadas fuera del sistema.</li>
                <li><strong>Acta de Cierre:</strong> Botón <em>"Subir Acta en PDF"</em> para consolidar el acta final de compromisos en el expediente.</li>
                <li><strong>Informe Final de Auditoría:</strong> Botón <em>"Subir Informe en PDF"</em> para archivar informes dictaminados previos.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600">
              AUDITPRO cuenta además con un escáner integrado que utiliza la cámara web de su equipo o teléfono inteligente para convertir documentos físicos en soporte digital clasificado:
            </p>

            <ul className="text-xs space-y-2 list-disc pl-5 text-slate-600">
              <li><strong>Guía de Encuadre GTC 185:</strong> Oriente la hoja dentro del marco visible respetando los 3 cm de encabezado y margen izquierdo.</li>
              <li><strong>Filtro Blanco y Negro / Alto Contraste:</strong> Binariza la imagen eliminando sombras, realzando sellos y garantizando legibilidad tipográfica.</li>
              <li><strong>Filtro Escala de Grises:</strong> Adecuado para hojas con marcas de agua o firmas con tinta suave.</li>
              <li><strong>Asignación Automática de Radicado:</strong> Todo escaneo se archiva en la carpeta correspondiente de la auditoría activa con su código correlativo (ej. <code>EVI-SCAN-2026-001</code>).</li>
            </ul>
          </div>
        )}

        {activeManualTab === 'faq' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <HelpCircle className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">
                Preguntas Frecuentes y Soporte Rápido
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg">
                <strong className="text-blue-900 block mb-1">¿Cómo funciona la actualización automática de información entre módulos?</strong>
                <p className="text-slate-700">AUDITPRO cuenta con un motor reactivo de sincronización continua. Si modifica cualquier dato (el nombre de la empresa, el representante legal, el auditor líder en las firmas, las fechas, el objetivo, o si agrega o reclasifica hallazgos en listas de chequeo), el cambio se propaga inmediatamente a las Actas de Apertura y Cierre, al Informe Final (15 numerales GTC 185) y al Plan de Mejoramiento sin necesidad de reescribir nada. También puede pulsar el botón "Actualizar Todo" para verificar el expediente.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">¿Por qué el sistema exige que los documentos ya elaborados se suban en PDF?</strong>
                <p className="text-slate-600">Bajo la Guía Técnica Colombiana GTC 185 de ICONTEC y la normativa archivística nacional, el formato PDF (.pdf) es el único que garantiza inmutabilidad, fijación tipográfica de los márgenes reglamentarios (3-4 cm) y no repudio de las firmas institucionales.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">¿Dónde se guardan mis auditorías e imágenes?</strong>
                <p className="text-slate-600">Toda la información se almacena localmente en la base de datos persistente de su navegador. Para respaldarla en un archivo externo, utilice el botón "Respaldar" en el menú lateral.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">¿Cómo edito los nombres de los responsables y firmantes oficiales?</strong>
                <p className="text-slate-600">En las actas e informes finales, haga clic en el campo de texto del nombre o cargo del firmante en el bloque de firmas, o active el "Modo Editor" en la barra superior para editar cualquier encabezado o elemento de la pantalla.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">¿Puedo exportar a Word para enviar a la gerencia?</strong>
                <p className="text-slate-600">Sí. En el Módulo 8 (Informe Final) y en este Manual dispone del botón "Descargar en Word (.doc)", el cual genera un archivo compatible con Microsoft Word y Google Docs con los membretes oficiales.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
