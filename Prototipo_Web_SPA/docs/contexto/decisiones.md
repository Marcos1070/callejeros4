# Registro de Decisiones de Arquitectura (ADR)

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## ADR-001: Adopción del Sistema Operativo Gentle-AI
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** Definición de la mentalidad Senior Product Engineer, el *Why* antes del *How*, 5 estados obligatorios y centralización estricta en `docs/contexto/`.
- **Decisión:** Mantener `.agents/rules/antigravity_rules.md` permanentemente activo (`trigger: always_on`).

---

## ADR-002: Definición Oficial de la SPA "Callejeros Río IV"
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** Sustitución de la prueba técnica preliminar por el proyecto definitivo de la EFI: la plataforma comunitaria para rescate y adopción de animales en Río Cuarto.
- **Decisión:** Limpiar todo archivo remanente y consolidar la arquitectura de 5 módulos principales (Auth/Perfil, Mapa, Alertas, Adopciones, Mensajería).

---

## ADR-003: Mapa Interactivo de Río Cuarto y Simulación de Rutas
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** Se requiere geolocalizar alertas de mascotas (heridos/perdidos) y POIs (veterinarias, guarderías, refugios) en Río Cuarto con cálculo de distancias y visualización de trayecto.
- **Decisión:** Emplear Leaflet.js con OpenStreetMap centrado en coordenadas de Río Cuarto (`-33.123, -64.349`) con pines semánticos personalizados y simulación de trazado punto a punto culminando en modal de llegada.
- **Consecuencias:** Experiencia geográfica inmersiva, sin costos de APIs externas y con rendimiento instantáneo.

---

## ADR-004: Doble Flujo de Operación: Registrado vs Anónimo ("Reportar sin Cuenta")
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** En emergencias de animales heridos en la vía pública, forzar el registro previo genera fricción que puede costar la vida del animal.
- **Decisión:** Habilitar un botón rojo de emergencia "Reportar sin cuenta" en la Landing que permite publicar alertas con foto, ubicación y contacto de forma inmediata. Alertas anónimas muestran botón "Llamar" en lugar de "Iniciar Chat".
- **Consecuencias:** Reducción del tiempo de respuesta a menos de 60 segundos ante urgencias.

---

## ADR-005: Paleta de Colores y Accesibilidad WCAG AA
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** Necesidad de reflejar la identidad visual de Figma con tokens precisos (`#EBEBEB`, `#E0A800`, `#C50000`, `#0C832A`, `#98D7FF`, `#000000`, `#4A4A4A`) y garantizar legibilidad en exteriores bajo la luz solar.
- **Decisión:** Texto negro `#000000` sobre `#EBEBEB` (ratio 18:1), texto blanco `#FFFFFF` sobre rojo de emergencia `#C50000` (ratio 5.9:1), y texto negro sobre ámbar `#E0A800` (ratio 7.8:1), cumpliendo y superando el ratio WCAG AA de 4.5:1.

---

## ADR-006: Mensajería 1 a 1 y Salas Grupales con Administración de Roles
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** La coordinación de rescates comunitarios requiere comunicación directa entre rescatistas y salas grupales organizadas por barrios de Río Cuarto.
- **Decisión:** Implementar módulo de chat completo con búsqueda de contactos (con feedback de error "Contacto no encontrado"), creación de grupos con selector múltiple y roles explícitos (Admin vs Miembro) con transferencia automática de administración.

---

## ADR-007: Wizard Modular en Pasos y Ficha de Difusión Rápida (Flyer)
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** En momentos de estrés por avistamiento de un animal herido o extraviado, un formulario extenso genera abandono o datos incompletos.
- **Decisión:** Dividir el reporte en un asistente secuencial de 4 pasos (1: Tipo y Urgencia, 2: Fotos y Descripción, 3: Fecha/Hora, Ubicación y Contacto, 4: Revisión). Al publicarse, generar automáticamente una Ficha de Alerta Comunitaria con botones de difusión directa para WhatsApp (`api.whatsapp.com`) y copiado de enlace.

---

## ADR-008: Matriz de Filtrado Multidimensional y Solicitud de Adopción Integrada
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** Las familias interesadas en adoptar o dar tránsito necesitan filtrar con precisión según tamaño, etapa de vida, sexo y zona barrial, y postularse formalmente sin salir de la ficha.
- **Decisión:** Integrar una barra de filtros de 6 criterios y un formulario de postulación habitacional responsable dentro de la ficha de la mascota, registrando la solicitud en el Store reactivo.

---

## ADR-009: Canales Comunitarios Barriales y Panel de Control para Protectoras
- **Fecha:** 2026-11-06
- **Estado:** Aceptado
- **Contexto:** La protección animal en Río Cuarto opera descentralizada por sectores territoriales (Banda Norte, Alberdi, Centro, Castelli/Bimaco), y las protectoras requieren visibilidad de métricas y solicitudes.
- **Decisión:** Preconfigurar canales barriales abiertos en la mensajería y dotar al perfil de un Panel de Control Comunitario con métricas de rescates y bandeja de evaluación de solicitudes de adopción.

