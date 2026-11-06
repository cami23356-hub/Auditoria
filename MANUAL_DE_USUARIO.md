# MANUAL DE USUARIO · AUDITPRO
## Sistema Integral de Auditoría Empresarial bajo Normas ISO 19011:2018 y GTC-185 (ICONTEC)

Bienvenido a **AUDITPRO**, la solución tecnológica empresarial diseñada para planificar, ejecutar, documentar y evaluar auditorías internas en organizaciones de cualquier tamaño o sector económico en Colombia e Iberoamérica.

El presente manual describe las funcionalidades de la plataforma, el flujo del ciclo de auditoría y los lineamientos obligatorios de la **Guía Técnica Colombiana GTC 185** de documentación organizacional.

---

## 1. MARCO NORMATIVO Y DIRECTRICES TÉCNICAS

### 1.1. Guía Técnica Colombiana GTC 185 (ICONTEC)
La plataforma rige todos los documentos emitidos (actas de apertura, actas de cierre, informes administrativos, memorandos y carátulas) conforme a la **GTC 185**:

- **Zonas y Márgenes Reglamentarios:**
  - **Margen Superior:** Entre 3 cm y 4 cm (espacio para encabezado institucional y código de radicación).
  - **Margen Inferior:** Entre 2 cm y 3 cm (pie de página, paginación y advertencias legales).
  - **Margen Izquierdo:** Entre 3 cm y 4 cm (zona de encuadernación, perforación y legajado).
  - **Margen Derecho:** Entre 2 cm y 3 cm.
- **Tipografía y Estilo:** Familia tipográfica limpia y uniforme (Plus Jakarta Sans, Arial o Calibri), tamaño de 10 a 12 puntos en el cuerpo de texto, interlineado sencillo o 1.15. Redacción impersonal en tercera persona.
- **Identificación Oficial:** Cada documento posee número de consecutivo o radicado formal (ejemplo: `ACT-INI-2026-001`, `INF-AUD-2026-001`), razón social, NIT y logotipo de la empresa.
- **Bloque de Firmas:** Nombre completo, cargo del firmante, número de documento de identidad o tarjeta profesional de auditoría, línea de firma superior y estampilla digital.
- **Numeración de Páginas:** Estilo oficial "Página X de Y".

### 1.2. Directrices de Auditoría ISO 19011:2018
- Enfoque basado en procesos y gestión de riesgos.
- Recolección de **evidencia objetiva** verificable (documental, testifical, física, fotográfica o digitalizada).
- Clasificación estandarizada de hallazgos en cuatro niveles: No Conformidad Mayor, No Conformidad Menor, Observación y Oportunidad de Mejora.
- Trazabilidad total desde la programación hasta el seguimiento del plan de mejoramiento.

---

## 2. BARRA SUPERIOR Y CONTROLES GLOBALES

En la barra superior siempre encontrará:
1. **Selector de Empresa:** Permite cambiar la empresa auditada activa o registrar una nueva con su respectivo NIT, actividad económica y representante legal.
2. **Selector de Perfil / Roles:**
   - **Administrador:** Acceso irrestricto, eliminación, configuración global y exportación de respaldos.
   - **Auditor Líder:** Formulación de planes, diligenciamiento de listas de chequeo, registro de hallazgos, actas e informes.
   - **Responsable de Proceso:** Visualización de observaciones, carga de evidencias y seguimiento al plan de mejora.
3. **Interruptor de Guardado Automático:**
   - Botón toggle `[Auto-guardado: ACTIVO / PAUSADO]`. Al estar activo, cada pulsación de tecla, cambio de estado, edición de nombre o firma se guarda de manera instantánea y transparente en la base de datos local persistente con indicación de fecha y hora.
4. **Modo Editor de la Página ("Botones para editar cada aspecto"):**
   - Botón toggle `[Modo Editor: ENCENDIDO / APAGADO]`.
   - Cuando se activa, la interfaz despliega botones de lápiz (`[Editar]`) al lado de títulos, encabezados institucionales, descripciones, preguntas de listas de chequeo y criterios de evaluación. Permite personalizar cualquier texto con guardado inmediato.
5. **Botón Guardar Ahora y Notificaciones en Vivo:**
   - Ubicado permanentemente en la esquina superior derecha de la barra de navegación. Al presionarlo, guarda de manera inmediata todos los datos en memoria hacia el almacenamiento local persistente (`localStorage`), animando el botón en verde con el aviso `¡Cambios Guardados!` y desplegando una tarjeta flotante de confirmación.
   - Cada módulo cuenta además con su botón local de guardado con alertas no bloqueantes.
6. **Bloques de Firmas Oficiales Editables (GTC 185):**
   - Los bloques de firma de las actas de iniciación, actas de cierre e informes finales permiten modificar en cualquier momento el nombre completo y el cargo institucional del responsable firmante (Auditor Líder o Representante Legal).
   - Incluye dos modalidades de rúbrica: trazo manual con ratón/táctil o firma digital caligráfica certificada, garantizando que tanto los nombres como el sello gráfico queden guardados de inmediato.
7. **Sincronización Automática Integral de Datos:**
   - **Propagación en Tiempo Real:** Cualquier dato modificado en cualquier área de la auditoría (nombre de la empresa, NIT, nombre del auditor líder o su cargo en las firmas, representante legal, fechas de ejecución, objetivo, alcance, criterios o hallazgos) se actualiza de manera **instantánea y automática** en las actas de iniciación, actas de cierre, informe final oficial de 15 numerales (GTC 185), matriz de riesgos y plan de mejoramiento.
   - **Conteo Dinámico de Hallazgos y Debilidades:** En el Acta de Cierre y en el Informe Final, los totales cuantitativos de No Conformidades Mayores, Menores, Observaciones y Oportunidades se recalculan en vivo. Las debilidades principales y las acciones correctivas del plan de mejoramiento se vinculan directamente con los compromisos de la organización.
   - **Botón `[Actualizar Todo]`:** Permite verificar y re-sincronizar de manera manual y forzada la integridad de todas las referencias cruzadas del expediente.

---

## 3. MÓDULOS DEL SISTEMA PASO A PASO

### MÓDULO 1: Programación de la Auditoría
- **Propósito:** Registrar los datos formales de la auditoría y de la empresa.
- **Campos registrados:**
  - Nombre de la empresa y NIT con dígito de verificación.
  - Sector económico (Primario, Secundario, Terciario, Cuaternario).
  - Actividad económica y código CIIU.
  - Dirección física y ciudad.
  - Nombre del representante legal y datos de contacto.
  - Nombre del auditor líder y número de tarjeta o registro profesional.
  - Área o proceso objeto de auditoría.
  - Fechas de programación y de ejecución en sitio.
  - Objetivo general, alcance delimitado y motivo de la auditoría.
- **Selección del Tipo de Auditoría:**
  - Auditoría administrativa.
  - Auditoría contable y financiera.
  - Auditoría de talento humano.
  - Auditoría de seguridad y salud en el trabajo (SG-SST / Dec. 1072).
  - Auditoría de calidad (ISO 9001).
  - Auditoría documental (GTC 185 / Ley 594).
  - Auditoría de gestión.
  - Auditoría de cumplimiento legal.
  - Auditoría de procesos.

### MÓDULO 2: Plan de Auditoría
- **Generación Automática:** Estructura automáticamente el objetivo, alcance, procesos a evaluar, responsables, recursos necesarios y técnicas de recolección de información.
- **Criterios de Auditoría Configurables:**
  1. Normas técnicas (ej. NTC-ISO 9001:2015, GTC 185:2009).
  2. Normas legales (ej. Decreto 1072 de 2015, Res. 0312 de 2019).
  3. Caracterización de procesos internos.
  4. Procedimientos internos codificados.
  5. Documentos y planes de la empresa.
  6. Condiciones de orden y limpieza (Metodología 5S).
- Permite agregar, editar y eliminar criterios normativos asignando identificación, versión y fecha de vigencia real.
- **Cronograma de Actividades:** Define horarios específicos, auditores asignados, auditados e instrumentos requeridos.

### MÓDULO 3: Acta de Iniciación (Bajo Norma GTC 185)
- Documento oficial de apertura de la auditoría.
- Contiene: Razón social, NIT, código de acta, fecha y hora de inicio, lugar, objetivo, alcance, procesos, metodología de trabajo y responsabilidades.
- **Registro y Control de Asistencia Oficial y Quórum (GTC 185):**
  - **Separación Obligatoria por Estamentos:** Lista segregada entre **Equipo Evaluador (Auditores)** y **Personal de la Organización (Auditados)**.
  - **Control de Asistencia:** Clasifica quiénes **Asistieron** (presentes) y quiénes **No Asistieron** (ausentes).
  - **Motivo de Inasistencia:** Campo editable para registrar la justificación formal del colaborador ausente (ej. incapacidad, diligencia regulatoria, turno).
  - **Indicadores de Quórum en Tiempo Real:** Total convocados, porcentaje de asistencia efectiva, conteo de inasistencias y validación de quórum reglamentario.
  - **Edición Total:** Botón para alternar asistencia (`[✓ Asistió]` vs `[✗ No Asistió]`), cambio de estamento, edición de nombres, cargos y dependencias, y formulario para agregar nuevos convocados.
- **Firma Digital Interactiva:** Permite al auditor líder y al representante legal plasmar su rúbrica directamente en pantalla (ratón o pantalla táctil) o mediante firma caligráfica con nombres editables.

### MÓDULO 4: Lista de Chequeo Interactiva
- Evaluación item por item de los procesos con 4 opciones obligatorias:
  - **Cumple** (Verde)
  - **No Cumple** (Rojo)
  - **Cumple Parcialmente** (Amarillo)
  - **No Aplica** (Gris)
- **Registro por pregunta:** Observaciones técnicas, evidencias encontradas, documentos revisados, fotografías adjuntas, nombre del responsable y fecha de verificación.
- **Gatillo Automático de Incumplimiento:** Al marcar una pregunta como "No cumple" o "Cumple parcialmente", el sistema abre automáticamente el formulario modal para formular el hallazgo correspondiente.
- Permite crear preguntas personalizadas para cualquier área o departamento.

### MÓDULO 5: Registro y Análisis de Hallazgos con Evidencias Fotográficas y Excel
Por cada hallazgo identificado, la plataforma exige responder obligatoriamente cinco preguntas fundamentales (Protocolo ISO 19011):
- **A. ¿Cuál es la debilidad o problema encontrado en la empresa?**
- **B. ¿En qué momento o etapa del proceso se encontró el problema?**
- **C. ¿Qué norma, requisito o criterio se está incumpliendo?** (con identificación y vigencia).
- **D. ¿Cuáles son las consecuencias actuales y futuras de incumplir esta norma?**
- **E. ¿Cómo se puede solucionar el incumplimiento?**
- **Carga de Fotografías como Evidencia Objetiva:**
  - Botón directo `[+ Subir Foto Evidencia]` en cada hallazgo. Permite capturar o adjuntar imágenes fotográficas directamente desde el dispositivo o disco local.
  - **Visor Lightbox y Zoom:** Permite ampliar las fotos a pantalla completa, editar el pie de foto o descripción técnica y eliminar fotos obsoletas.
  - Almacenamiento local persistente en base64 para garantizar disponibilidad offline sin depender de servidores externos.
- **Guardado y Exportación en Excel con Imágenes Incrustadas (.xls):**
  - Botón oficial `[Guardar en Excel con Fotos (.xls)]`.
  - Genera un archivo de hoja de cálculo enriquecido con encabezados institucionales de la empresa, NIT, radicado GTC 185, desglose pormenorizado de las preguntas A a E, áreas responsables y las **fotografías de evidencia embebidas directamente como miniaturas** junto a su pie de foto.
- **Edición Total de Cualquier Aspecto:** Todos los campos de cada hallazgo (título, código, clasificación, respuestas A-E, área y personas) cuentan con botones de edición directa in situ y formulario modal extendido.

### MÓDULO 6: Evaluación y Calificación del Riesgo (Matriz 5x5)
- **Metodología:** Basada en ISO 31000 y GTC 45.
- Evalúa la **Probabilidad de Ocurrencia** (1 a 5) y el **Impacto** (1 a 5) para determinar el **Nivel de Riesgo**:
  - **Bajo** (1-4, Verde): Riesgo tolerable, seguimiento de rutina.
  - **Medio** (5-9, Amarillo): Control preventivo programado.
  - **Alto** (10-14, Naranja): Intervención prioritaria.
  - **Crítico** (15-25, Rojo): Acción inmediata; paralización o corrección urgente.
- Registra causas, consecuencias potenciales, controles existentes y acciones preventivas.
- Muestra una matriz térmica interactiva de colores y gráficos estadísticos.

### MÓDULO 7: Acta de Cierre (Bajo Norma GTC 185)
- Documento de finalización de la auditoría.
- **Registro Oficial de Asistencia de Cierre (GTC 185):**
  - Mismo estándar riguroso de asistencia categorizado: lista de **Auditores que asistieron y no asistieron**, y lista de **Auditados que asistieron y no asistieron**.
  - Registro de quórum formal, justificaciones de ausencia y edición completa de participantes.
- **Resumen Cuantitativo:** Conteos en vivo de No Conformidades Mayores, Menores, Observaciones y Oportunidades.
- **Debilidades y Compromisos:** Sincronizados en tiempo real con las no conformidades y el plan de mejora.
- Bloque de firmas oficiales según GTC 185 con canvas digital y nombres editables.

### MÓDULO 8: Informe Final de Auditoría (15 Secciones Obligatorias)
Genera el informe profesional completo compuesto por los 15 apartados reglamentarios:
1. Portada formal con logotipo, radicado e identificación.
2. Información general de la empresa.
3. Introducción.
4. Objetivo de la auditoría.
5. Alcance.
6. Metodología aplicada (ISO 19011:2018).
7. Criterios utilizados (normas técnicas y legales con vigencia).
8. Desarrollo de la auditoría.
9. Resultados cuantitativos de la lista de chequeo.
10. Hallazgos identificados (desglose de preguntas A-E).
11. Evidencias recolectadas.
12. Matriz de riesgos y mapa de calor.
13. Conclusiones técnicas.
14. Recomendaciones de mejora.
15. Plan de mejoramiento propuesto.
- **Opciones de Exportación:**
  - Descargar en **Microsoft Word (.doc)** con formato enriquecido y márgenes GTC 185.
  - Descargar en **PDF / Imprimir** con hoja membretada, paginación y distribución oficial.

### MÓDULO 9: Plan de Mejoramiento
- Vincula automáticamente las no conformidades identificadas.
- Registra: Causa raíz (metodología 5 Porqués / Diagrama de Ishikawa), acción correctiva, acción preventiva, actividades a desarrollar, responsable directo, recursos requeridos, fecha de inicio, fecha límite de cumplimiento, indicador medible y meta numérica.
- Permite realizar seguimiento periódico al estado de ejecución (**Pendiente**, **En Ejecución**, **Implementada**, **Verificada y Eficaz**).

### MÓDULO 10: Calificación y Evaluación Integral de la Auditoría (ISO 19011:2018)
- **Evaluación Bipartita Cruzada:** Evalúa formalmente todos los aspectos ocurridos durante la auditoría, calificando tanto a los **Auditores** como a los **Auditados**:
  1. **A los Auditores:**
     - Competencia técnica y normativa (ISO 9001, ISO 19011, GTC-185).
     - Comunicación asertiva, respeto y trato profesional.
     - Puntualidad y cumplimiento del cronograma.
     - Objetividad y sustentación de hallazgos con evidencia verificable.
     - Enfoque constructivo y valor agregado de las recomendaciones.
     - Rigor metodológico en la documentación formal bajo GTC-185.
  2. **A los Auditados (Organización):**
     - Disposición, apertura al diálogo y disponibilidad del personal.
     - Suministro oportuno y ágil de documentos y registros.
     - Transparencia y veracidad en las respuestas.
     - Conocimiento de sus propios procesos y procedimientos.
     - Receptividad constructiva frente a no conformidades detectadas.
     - Condiciones de infraestructura, logística y seguridad suministradas.
- **Sistema de Calificación:** Escala interactiva de 1 a 5 estrellas/puntos, promedios ponderados automáticos y nivel de desempeño (Sobresaliente, Satisfactorio, Aceptable o Crítico).
- **Balance de Fortalezas y Oportunidades de Mejora:** Listas dinámicas con botones para agregar, editar y eliminar puntos destacados de ambas partes.
- **Certificado Oficial GTC 185 de Calificación:** Con cuadro consolidado, conclusión integral, firmas y botón de exportación a Microsoft Word (.doc) e impresión.
- **Edición Total:** Cada aspecto, criterio, nota, fortaleza u observación cuenta con su propio botón de edición.

---

## 4. GESTIÓN Y ORGANIZACIÓN DE ARCHIVOS

### 4.1. Organizador de Archivos GTC-185
La plataforma incluye un gestor intuitivo estructurado en carpetas organizacionales por auditoría:
- `01_Programacion_y_Plan`: Documentos de planeación, convocatorias y cronogramas.
- `02_Actas_Oficiales_GTC185`: Actas de iniciación y cierre debidamente firmadas.
- `03_Listas_y_Evidencias`: Registros fotográficos, listas de chequeo y soportes.
- `04_Documentos_Escaneados`: Expedientes digitalizados mediante el escáner.
- `05_Informes_y_Mejoramiento`: Informes finales y planes de acción aprobados.

**Funcionalidades:**
- Subir archivos mediante selector o arrastrar y soltar con clasificación GTC 185.
- Vista en cuadrícula (tarjetas de previsualización) o en tabla detallada.
- Filtro rápido para aislar exclusivamente archivos en formato PDF ("Solo PDFs").
- Búsqueda en tiempo real por nombre, tipo de archivo o etiqueta.
- Visor modal interactivo con membrete GTC 185, radicado oficial, tamaño de archivo, fecha de subida y descarga individual inmediata.

### 4.2. Subida de Documentos ya Realizados en Formato PDF (.pdf)
El sistema permite anexar al expediente de auditoría **documentos previamente elaborados, firmados o emitidos** (por ejemplo: actas físicas escaneadas en PDF, informes periciales previos, certificaciones de calidad ISO, políticas corporativas y licencias ambientales).

#### ⚠️ Indicación Técnica Obligatoria: Formato Exclusivo PDF (.pdf)
- **Regla Estricta:** Todo documento previamente realizado debe ser cargado exclusivamente en formato **PDF (`.pdf`)**.
- **Justificación Normativa (GTC 185 y Ley 594 de 2000 - Ley General de Archivos):**
  1. **Inalterabilidad e Integridad:** Los documentos ejecutivos y actas oficiales no deben ser modificables por terceros una vez firmados, garantizando su valor probatorio ante entes de control e ICONTEC.
  2. **Preservación de Márgenes y Estructura GTC 185:** El formato PDF asegura que los márgenes legales (3-4 cm superior e izquierdo para encuadernación, 2-3 cm inferior y derecho), las fuentes tipográficas y los bloques de firmas se mantengan idénticos en cualquier pantalla o impresora.
  3. **No Repudio y Validez Jurídica:** Garantiza la inviolabilidad de las firmas digitales o manuscritas estampadas en los acuerdos y actas de auditoría.
- **Validación del Sistema:** Si un usuario intenta cargar un formato editable o incompatible (ej. `.docx`, `.xlsx`, `.txt`, `.exe`), el sistema bloquea la carga e instruye convertir previamente el archivo a `.pdf`.

#### Módulos con Carga Directa de Documentos en PDF:
1. **Gestor de Archivos (AuditDoc Explorer):**
   - Dispone del botón principal `[+ Subir Documento en PDF]` en color carmesí oficial.
   - Abre un asistente que permite asignar el tipo documental GTC 185 (Acta Oficial, Informe de Auditoría, Evidencia Objetiva, Política/Manual o Certificado), la carpeta de destino, el radicado formal y las palabras clave.
2. **Acta de Iniciación (Módulo 3):**
   - Botón superior `[Subir Acta en PDF]` y tarjeta instructiva inferior para cargar el acta de apertura si ya fue firmada físicamente o en otra plataforma.
3. **Acta de Cierre (Módulo 7):**
   - Botón superior `[Subir Acta en PDF]` y tarjeta explicativa para asociar el acta de cierre terminada directamente al expediente oficial.
4. **Informe Final de Auditoría (Módulo 8):**
   - Botón superior `[Subir Informe en PDF]` y panel explicativo para radicar el informe definitivo firmado.

### 4.3. Visor Embebido de PDFs y Descarga Oficial
Al hacer clic en cualquier documento PDF registrado en el sistema:
- Se despliega un visor modal que renderiza el contenido original del PDF en un marco seguro.
- Proporciona encabezado oficial con radicado GTC 185, clasificación, fecha de emisión y tamaño.
- Incluye el botón directo de `[Descargar PDF Oficial]` para exportar el archivo al disco duro local.

### 4.4. Escáner Documental GTC-185
Permite digitalizar soportes físicos utilizando la cámara web de su computador o dispositivo móvil:
- **Cámara en vivo:** Solicita acceso al dispositivo de video con selector de cámara frontal o trasera.
- **Guía de alineación:** Despliega un recuadro de encuadre ajustado a las dimensiones de la hoja según GTC 185.
- **Filtros de Procesamiento de Imagen:**
  - *Color Original:* Para fotos de instalaciones y equipos.
  - *Blanco y Negro / Alto Contraste:* Umbral binarizado ideal para documentos de texto, sellos y firmas legibles.
  - *Escala de Grises:* Para documentos con marcas de agua o sellos tenues.
- **Metadatos del escaneo:** Asigna código de radicado oficial, proceso asociado y carpeta de destino para guardarse automáticamente en el Gestor de Archivos.
- **Escaneo rápido asistido:** Opción para cargar o emular escaneos de muestra para pruebas inmediatas.

---

## 5. COPIAS DE SEGURIDAD Y PORTABILIDAD

En la parte inferior del menú lateral dispone de:
- **Respaldar (Exportar JSON):** Genera un archivo `.json` con todas las empresas, auditorías, actas, checklists, hallazgos, matrices y documentos registrados.
- **Restaurar (Importar JSON):** Permite recuperar o migrar la información completa desde un archivo de respaldo.
- **Restablecer Datos Demo:** Carga los datos de ejemplo iniciales de auditoría en caso de requerir un reinicio limpio.

---

## 6. PREGUNTAS FRECUENTES

**¿Por qué es fundamental la norma GTC 185 en esta aplicación?**  
Porque la Guía Técnica Colombiana GTC 185 de ICONTEC es el estándar por excelencia en Colombia para la comunicación escrita en las organizaciones. Garantiza que las actas e informes tengan validez probatoria, legibilidad, estructura homogénea y respeto por los márgenes de encuadernación oficial.

**¿Cómo funciona el guardado automático?**  
Cada vez que modifica un campo, agrega una pregunta o dibuja una firma, el sistema actualiza la base de datos local en su navegador en milisegundos y muestra el indicador verde "Guardado hh:mm:ss". Si apaga el equipo o refresca la pestaña, nada se pierde.

**¿Cómo activo el modo de edición de textos?**  
Presione el botón "Modo Editor" en la barra superior. Verá pequeños iconos de lápiz en todos los títulos, subtítulos, criterios y párrafos. Haga clic en cualquiera de ellos para personalizar los textos a las necesidades de su entidad.

---
*AUDITPRO · Desarrollado bajo estándares de calidad ICONTEC GTC 185 e ISO 19011:2018.*
