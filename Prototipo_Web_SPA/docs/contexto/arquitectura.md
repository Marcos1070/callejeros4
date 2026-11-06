# Arquitectura del Sistema: Callejeros Río IV

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## 1. Visión General del Proyecto
**Callejeros Río IV** es una Single Page Application (SPA) comunitaria y colaborativa para la protección, rescate, adopción responsable y auxilio de animales en situación de calle en la ciudad de Río Cuarto (Córdoba, Argentina). La aplicación centraliza reportes de emergencia, un mapa interactivo con puntos de interés veterinarios y de asistencia, un catálogo de adopciones y un sistema integral de mensajería directa y salas grupales de rescate.

---

## 2. Stack Tecnológico Base
- **Frontend Core:** HTML5 Semántico estructurado (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
- **Lógica e Interacción:** JavaScript moderno (ESModules), arquitectura basada en componentes modulares desacoplados (KISS/YAGNI).
- **Estilos & Diseño:** Tailwind CSS configurado con los tokens de diseño oficiales de Callejeros Río IV:
  - Fondo/Superficie: `#EBEBEB` (Gris claro)
  - Ámbar Principal: `#E0A800` (Identidad y destacados)
  - Rojo Alerta: `#C50000` (Emergencias y reportes urgentes)
  - Verde Éxito: `#0C832A` (Confirmaciones, estado abierto, rescatado)
  - Celeste Chat: `#98D7FF` (Burbujas de mensajería y acentos)
  - Texto Principal: `#000000` (Negro de alto contraste)
  - Texto Secundario: `#4A4A4A` (Gris oscuro accesible)
- **Tipografía:** Inter (Black, Bold, Medium) con legibilidad óptima WCAG AA.
- **Cartografía:** Leaflet.js con OpenStreetMap centrado en Río Cuarto (`-33.123, -64.349`) para pines geolocalizados y trazado de rutas.
- **Persistencia:** `LocalStorage` del navegador administrado con el wrapper defensivo `StorageManager`.

---

## 3. Arquitectura de Navegación y Rutas SPA
La navegación cliente se opera mediante hash routing (`window.location.hash`), garantizando cero recargas de página y retención del estado en memoria:

```
Ruta Hash               Módulo / Vista               Propósito
-----------------------------------------------------------------------------------------------------------------
#/                      Landing / Inicio             Acceso a login, registro y botón destacado "Reportar sin cuenta"
#/login                 Autenticación                Inicio de sesión tradicional
#/registro              Registro de Cuenta           Creación de cuenta con validaciones estrictas
#/recuperar-password    Recuperación de Clave        Flujo en 3 pasos con validación y confirmación
#/mapa                  Mapa de Río Cuarto           Mapa interactivo con alertas, POIs (veterinarias, refugios) y rutas
#/alertas               Feed de Alertas              Listado y filtrado de reportes (Todos, Perdidos, Heridos)
#/reportar              Nuevo Reporte                Formulario con fotos, selector de peligro, ubicación y contacto
#/adopciones            Catálogo de Adopciones       Perritos y gatitos en adopción con fichas y carrusel
#/publicar-adopcion     Publicar Adopción            Formulario para dar en adopción con chips y fotos
#/chats                 Mensajería y Grupos          Salas 1 a 1 y grupales con administración de roles
#/perfil                Perfil de Usuario            Edición de datos, seguridad (2FA, biometría, sesiones) y ajustes
```

---

## 4. Módulos Funcionales Principales (Los 6 Módulos SPA)

### Módulo 1: Autenticación y Acceso (Auth)
- Pantallas accesibles de Login, Registro de Usuario y Recuperación de Contraseña en 3 pasos.
- Modo "Invitado": Permite navegar fluidamente por el mapa, consultar el feed de alertas e iniciar un reporte exprés de emergencia sin necesidad de iniciar sesión obligatoria.

### Módulo 2: Alertas y Reportes en Vía Pública (Perdido / Herido)
- Formulario modular en pasos (Wizard 4 pasos) para reportar animales perdidos o heridos en Río Cuarto.
- Campos: Fotos (con preview y descarte), descripción detallada, estado de salud/urgencia, fecha/hora y selección de ubicación con validación estricta de barrios de Río Cuarto.
- Generación automática de Ficha de Alerta Comunitaria (Flyer Digital) con botones de difusión rápida (WhatsApp con texto preformateado y copia de enlace/ficha).

### Módulo 3: Adopciones y Tránsitos
- Listado tipo grid/cards de animales disponibles para adopción responsable o acogida en hogar de tránsito.
- Matriz completa de filtros: especie (perro/gato), tamaño (pequeño/mediano/grande), edad (cachorro/adulto/anciano), sexo (hembra/macho), zona de Río Cuarto y modalidad (adopción definitiva vs tránsito).
- Ficha detallada de la mascota con carrusel fotográfico, estado de salud y Formulario de Solicitud de Adopción Integrado.

### Módulo 4: Mapa Interactivo Comunitario (Río Cuarto)
- Integración de Leaflet.js centrado en Río Cuarto (`-33.1235, -64.3490`).
- Pines codificados por color según la taxonomía oficial:
  - **Rojo (`#C50000`):** Alertas urgentes de animales heridos o perdidos.
  - **Ámbar (`#E0A800`):** Animales en tránsito o avistados en la vía pública.
  - **Verde (`#0C832A`):** Mascotas adoptables.
  - **Azul (`#0284C7`):** Clínicas veterinarias y guardias 24h.
  - **Naranja (`#EA580C`):** Refugios y protectoras aliadas.
- Popups informativos al hacer clic en un pin con resumen, enlace a la ficha completa y trazado de ruta punto a punto.

### Módulo 5: Centro de Chats y Grupos de Rescate
- Mensajería directa entre usuarios (dueño, informante, rescatista).
- Canales Barriales Comunitarios preconfigurados por sectores urbanos de Río Cuarto (Banda Norte, Alberdi, Centro, Castelli/Bimaco).
- Gestión de roles de grupo (Admin vs Miembro) con transferencia automática.

### Módulo 6: Perfil de Usuario, Grupos y Configuración (Settings)
- Gestión de perfil personal, seguridad (2FA, biometría, sesiones activas) y preferencias.
- Pestaña "Mis Publicaciones": Gestión de reportes y adopciones propias, con opción de marcar como "Resuelto / Rescatado" o "Adoptado".
- Panel de Control para administradores y protectoras de animales: visualización de métricas comunitarias y evaluación de solicitudes de adopción pendientes.

