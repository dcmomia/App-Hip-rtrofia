# HYPERTROPHY-X: MASTER CONTEXT DOCUMENT

> [!IMPORTANT]
> **INSTRUCCIÓN PARA EL AGENTE:** Al leer este documento, asume inmediatamente el rol de **NEXUS-ARCHITECT** y **TRAINING-EXPERT**. Este es el único archivo de contexto necesario para entender el pasado, presente y futuro del proyecto.

---

## 1. Identidad y Filosofía
- **Misión:** Reconstrucción física de élite (Hipertrofia Máxima) en 26 semanas.
- **Perfil:** Hombre, 32 años, nivel medio-avanzado.
- **Restricciones:** 
    - **KNEE SHIELD (Escudo de Rodilla):** Exclusión total de SBD (Squat, Bench, Deadlift) para protección patelar. No movimientos explosivos de rodilla.
    - **Enfoque SFR (Stimulus-to-Fatigue Ratio):** Priorización de intensidad (RIR bajo) y selección de ejercicios S-Tier (Máquinas/Poleas).
    - **Tempo:** Control excéntrico estricto (3 segundos).

---

## 2. Estructura del Macro-Ciclo (26 Semanas)
Bloques de entrenamiento basados en los principios científicos de **Mike Israetel (RP)**:

| Fase | Semanas | Enfoque | RIR | Estado |
| :--- | :---: | :--- | :---: | :---: |
| **Meso 1** | 1-5 | Adaptación y Técnica | 3 -> 2 | 🟢 EN CURSO |
| **Meso 2** | 6-10 | Acumulación I | 2 -> 1 | 🔒 BLOQUEADO |
| **Meso 3** | 11-15 | Acumulación II | 1 -> 0 | 🔒 BLOQUEADO |
| **Meso 4** | 16-20 | Intensificación | 0-1 | 🔒 BLOQUEADO |
| **Meso 5** | 21-25 | Realización (Peak) | 0 | 🔒 BLOQUEADO |
| **Meso 6** | 26 | Deload Final | - | 🔒 BLOQUEADO |

---

## 3. Ecosistema de Datos e Infraestructura (v2.0)

### A. La Aplicación (PWA + Cloud)
- **URL Producción:** [https://dcmomia.github.io/App-Hip-rtrofia/](https://dcmomia.github.io/App-Hip-rtrofia/)
- **Repository:** [https://github.com/dcmomia/App-Hip-rtrofia](https://github.com/dcmomia/App-Hip-rtrofia)
- **Tecnología:** React + Vite + PWA + React Router + GitHub Pages.
- **Backend:** Supabase (PostgreSQL + Auth).
- **Seguridad:** Acceso protegido por Login/Password. Sesiones de usuario privadas.
- **Analítica Avanzada (`Recharts`):**
    - **Volumen Total:** Seguimiento gráfico de tonelaje por sesión.
    - **Diagnóstico de Recuperación:** Comparativa visual de *Pump* (Bombeo) vs *Soreness* (Agujetas).

### B. Lógica de Persistencia e Inteligencia
1. **Cloud Sync:** Las sesiones finalizadas se guardan en Supabase (`sessions` y `sets`).
2. **Local Drafts:** Guardado automático en `localStorage` durante la sesión activa. Los borradores persisten 24h e incluyen pesos, reps, RIR, SFR y estado del Tempo.
3. **Israetel Engine (Recomendaciones Dinámicas):** 
    *   **Ajuste de Carga:** +2.5kg si se cumple el rango superior con RIR objetivo (Recomendación visual inmediata por set).
    *   **Alertas de Volumen:** Al iniciar una sesión, la app consulta el historial y muestra una alerta: *"+1 Serie"* (Recuperación Excelente) o *"-1 Serie"* (Fatiga Acumulada).
    *   **Historial de Ejercicio:** Muestra el rendimiento del último set registrado para cada ejercicio específico (`getLastExercisePerformance`).
    *   **Metodología de Feedback:** 
        *   *Soreness (Agujetas):* Valoración de la recuperación **antes** de empezar hoy.
        *   *Pump (Bombeo):* Valoración de la congestión **justo al terminar** hoy.
        *   *SFR & Tempo:* Control estricto del tempo excéntrico (3s) y valoración subjetiva SFR por cada ejercicio individual.

### C. Mapa de Archivos
- `/app/src/lib/supabase.js`: Configuración del cliente cloud.
- `/app/src/logic/SupabaseService.js`: Lógica de sincronización y consultas históricas por ejercicio.
- `/app/src/components/ProgressDashboard.jsx`: Visualización de analíticas.
- `/app/src/logic/IsraetelEngine.js`: Algoritmos de ajuste de carga y volumen (RIR/SFR).

---

## 4. Guía de Operación para la IA
Cuando el usuario abra una nueva conversación:
1. **Sincronización:** Consulta los logs de Supabase para entender la progresión real.
2. **Análisis Táctico:** Evalúa las tendencias de Volumen vs Soreness y las puntuaciones SFR para proponer ajustes de volumen o cambios de ejercicio.
3. **Auditoría de Seguridad:** Prioriza el "Escudo de Rodilla" y el control del tempo (3s ecc) sobre cualquier incremento de carga.

---
## 5. Historial de Versiones (Patch Notes)

### [v2.1.0] - 01 de Febrero de 2026
**Mejoras de Navegación y Persistencia (UX Elite)**
- **Navigation Flux:** Botón "Cancelar" renombrado y refactorizado a **"Atrás"**. Ahora permite salir de la sesión sin anular el progreso.
- **Atomic Multi-Draft System:** Implementación de persistencia independiente por sesión. El usuario puede mantener múltiples borradores (ej. Torso A y Pierna B) en pausa simultáneamente sin conflicto de datos.
- **Persistence Guard:** Motor de autoguardado blindado que previene la sobreescritura de borradores válidos con estados vacíos durante la inicialización de componentes.
- **Metadata Integrity:** Corrección en la lógica de restauración que evitaba la pérdida de valores SFR y Tempo al navegar.
- **Deployment Build:** Despliegue exitoso en Netlify con actualización automática del Service Worker para PWA.

### [v2.2.0] - 01 de Febrero de 2026
**Macro-Cycle Control Panel**
- **Full Program Visibility:** Implementación de la vista `MacroCycleView` que despliega las 104 sesiones del programa de 26 semanas.
- **Meso-Clustering:** Organización visual por mesociclos con nombres y metadatos descriptivos.
- **Direct Navigation & Editing:** Sistema de acceso directo mediante `sessionId` en URL, permitiendo saltar a cualquier sesión (pasada o futura) para su visualización o edición inmediata.
- **Visual Status Indicators:** Marcadores visuales para identificar sesiones con borradores locales pendientes.
- **UX Layout:** Nueva pestaña "Calendario" en la navegación principal con diseño de panel responsivo.

### [v2.3.0] - 01 de Febrero de 2026
**Parche de Integridad y Migración a GitHub Pages**
- **Hosting Migration:** Preparación para GitHub Pages mediante `HashRouter` y `base: './'` en Vite.
- **Error Shielding:** Implementación de un `ErrorBoundary` global y bloques `try/catch` robustos en `SupabaseService`.
- **Atomic-ish Sync:** Validación de datos antes de subir a la nube y rollback local en caso de fallo de red.
- **UX Feedback:** Mensajes de error detallados y alertas obligatorias de validación (Soreness/Pump).

### [v2.4.0] - 01 de Febrero de 2026
**GitHub Migration & CI/CD Deployment**
- **Repository Launch:** Proyecto conectado exitosamente a GitHub (`App-Hip-rtrofia`).
- **DevOps Pipeline:** Configuración de GitHub Actions para despliegue automático mediante `JamesIves/github-pages-deploy-action`.
- **Infrastructure:** Configuración de `.gitignore` optimizado para excluir `node_modules` y binarios.
- **Access Control:** Reparación de permisos de escritura en el flujo de trabajo de despliegue.

### [v2.6.0] - 01 de Febrero de 2026
**Robustez Técnica e Inteligencia Adaptativa (Elite Audit)**
- **Sync Reliability:** Implementación de `LocalSyncQueue` en `SupabaseService` para gestión de fallos de red y reintentos automáticos.
- **Israetel Engine v2:** Lógica avanzada de volumen basada en tendencias de 3 sesiones y detección proactiva de semanas de descarga (deload).
- **Dynamic Identity:** Sistema de personalización visual por mesociclo mediante atributos `data-meso`, permitiendo una identidad visual única para cada fase.
- **UX Polish (Mega-Premium UI):** Rediseño total de la interfaz con gradientes dinámicos, fuentes 'Outfit', efectos aurora de fondo y animaciones de entrada. Glassmorphism avanzado para un look táctico y moderno.
- **Deployment:** Cambios subidos y desplegados exitosamente en GitHub (`main`).

---
*Documento actualizado con Rediseño Mega-Premium (v2.6.0). Última revisión: 01 de Febrero de 2026 (10:10).*


