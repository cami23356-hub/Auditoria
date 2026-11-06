/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Exports formatted HTML content to a downloadable Word (.doc) document
 * with official GTC-185 headers and typography.
 */
export function exportToWord(title: string, htmlContent: string, companyName: string, nit: string, code: string): void {
  const headerHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          size: 21.59cm 27.94cm; /* Carta */
          margin: 3.5cm 2.5cm 2.5cm 3.5cm; /* GTC 185: Sup 3-4cm, Der 2-3cm, Inf 2-3cm, Izq 3-4cm */
          mso-page-orientation: portrait;
        }
        body {
          font-family: Arial, Calibri, 'Plus Jakarta Sans', sans-serif;
          font-size: 11pt;
          line-height: 1.25;
          color: #1a1a1a;
        }
        h1 { font-size: 16pt; font-weight: bold; color: #0b2545; text-align: center; margin-bottom: 4pt; }
        h2 { font-size: 13pt; font-weight: bold; color: #134074; margin-top: 14pt; border-bottom: 1.5pt solid #134074; padding-bottom: 2pt; }
        h3 { font-size: 11pt; font-weight: bold; color: #0b2545; margin-top: 10pt; }
        p { margin-bottom: 8pt; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin-top: 8pt; margin-bottom: 12pt; }
        th, td { border: 1pt solid #cbd5e1; padding: 6pt; font-size: 10pt; vertical-align: top; }
        th { background-color: #f1f5f9; color: #0b2545; font-weight: bold; text-align: left; }
        .gtc-header { text-align: center; border-bottom: 2pt solid #0b2545; padding-bottom: 10pt; margin-bottom: 16pt; }
        .gtc-company { font-size: 13pt; font-weight: bold; text-transform: uppercase; color: #0b2545; }
        .gtc-nit { font-size: 10pt; color: #475569; margin-top: 2pt; }
        .gtc-radicado { font-size: 10pt; font-weight: bold; color: #1e3a8a; text-align: right; margin-bottom: 8pt; }
        .signatures-table { border: none !important; margin-top: 30pt; width: 100%; }
        .signatures-table td { border: none !important; width: 50%; text-align: center; padding: 12pt; }
        .sig-line { border-top: 1.5pt solid #334155; margin-top: 40pt; padding-top: 4pt; font-weight: bold; font-size: 10pt; }
      </style>
    </head>
    <body>
      <div class="gtc-header">
        <div class="gtc-company">${companyName}</div>
        <div class="gtc-nit">NIT: ${nit} · DOCUMENTACIÓN ORGANIZACIONAL (GTC 185)</div>
      </div>
      <div class="gtc-radicado">CÓDIGO OFICIAL: ${code}</div>
      ${htmlContent}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', headerHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports data to a clean CSV file compatible with Excel
 */
export function exportToExcel(filename: string, headers: string[], rows: (string | number)[][]): void {
  // Add UTF-8 BOM so Excel opens accents and special characters without encoding errors
  const csvContent =
    '\uFEFF' +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const val = cell !== undefined && cell !== null ? String(cell) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(';')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports findings registry with embedded photographic evidence and metadata to Excel (.xls)
 */
export function exportFindingsToExcel(
  companyName: string,
  nit: string,
  auditCode: string,
  findings: any[]
): void {
  const rowsHtml = findings
    .map((f, idx) => {
      const photosHtml =
        f.attachedPhotos && f.attachedPhotos.length > 0
          ? f.attachedPhotos
              .map(
                (p: any, pIdx: number) => `
                <div style="margin-bottom: 6px; padding: 4px; border: 1px solid #cbd5e1; background: #f8fafc; text-align: center;">
                  <img src="${p.url}" alt="Evidencia ${pIdx + 1}" style="max-height: 90px; max-width: 130px; object-fit: contain; border-radius: 4px;" /><br/>
                  <small style="font-size: 8pt; color: #475569; font-weight: bold;">Foto ${pIdx + 1}: ${p.caption || 'Evidencia visual'}</small>
                </div>
              `
              )
              .join('')
          : '<em style="color: #94a3b8; font-size: 9pt;">Sin fotos adjuntas</em>';

      const bgClass = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const badgeColor =
        f.classification === 'NO_CONFORMIDAD_MAYOR'
          ? '#dc2626; color: #ffffff;'
          : f.classification === 'NO_CONFORMIDAD_MENOR'
          ? '#d97706; color: #ffffff;'
          : f.classification === 'OBSERVACION'
          ? '#2563eb; color: #ffffff;'
          : '#059669; color: #ffffff;';

      return `
        <tr style="background-color: ${bgClass};">
          <td style="font-weight: bold; text-align: center; font-family: monospace;">${f.code}</td>
          <td style="font-weight: bold; color: #0f172a;">${f.title}</td>
          <td style="text-align: center;"><span style="padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; background-color: ${badgeColor}">${f.classification}</span></td>
          <td>${f.questionA_weakness || ''}</td>
          <td>${f.questionB_processStage || ''}</td>
          <td style="color: #1e3a8a; font-weight: 500;">${f.questionC_standardViolated || ''}</td>
          <td>${f.questionD_consequences || ''}</td>
          <td style="color: #047857;">${f.questionE_solution || ''}</td>
          <td>${f.responsibleArea || ''}</td>
          <td style="font-weight: bold;">${f.responsiblePerson || ''}</td>
          <td style="text-align: center; font-family: monospace;">${f.identificationDate || ''}</td>
          <td style="vertical-align: middle; text-align: center; min-width: 140px;">${photosHtml}</td>
        </tr>
      `;
    })
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; color: #1e293b; }
        .header-title { font-size: 16pt; font-weight: bold; color: #0f2d59; text-align: center; }
        .header-sub { font-size: 11pt; color: #475569; text-align: center; margin-bottom: 12pt; }
        .meta-box { border: 1pt solid #cbd5e1; background-color: #f1f5f9; padding: 8pt; margin-bottom: 12pt; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #0f2d59; color: #ffffff; font-weight: bold; padding: 8pt 6pt; border: 1pt solid #0f2d59; text-align: left; }
        td { border: 1pt solid #cbd5e1; padding: 6pt; vertical-align: top; font-size: 9.5pt; }
      </style>
    </head>
    <body>
      <div class="header-title">${companyName}</div>
      <div class="header-sub">NIT: ${nit} · SISTEMA DE GESTIÓN DE AUDITORÍA INTEGRAL (GTC-185 / ISO 19011)</div>
      <div class="meta-box">
        <strong>REGISTRO OFICIAL DE HALLAZGOS Y EVIDENCIAS FOTOGRÁFICAS</strong><br/>
        <strong>Auditoría:</strong> ${auditCode} | <strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString('es-CO')} | <strong>Total Hallazgos:</strong> ${findings.length}
      </div>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Título del Hallazgo</th>
            <th>Clasificación</th>
            <th>A. Debilidad o Problema Encontrado</th>
            <th>B. Etapa del Proceso</th>
            <th>C. Norma Incumplida (Criterio)</th>
            <th>D. Consecuencias Actuales y Futuras</th>
            <th>E. Solución Propuesta (Acción Correctiva)</th>
            <th>Área Responsable</th>
            <th>Responsable Directo</th>
            <th>Fecha</th>
            <th>Evidencias Fotográficas</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div style="margin-top: 16pt; font-size: 8.5pt; color: #64748b; text-align: center;">
        Documento oficial de control de auditoría generado bajo lineamientos de la Guía Técnica Colombiana GTC 185.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Registro_Hallazgos_y_Evidencias_${auditCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers the browser's native print dialog
 */
export function printGtcDocument(): void {
  window.print();
}
