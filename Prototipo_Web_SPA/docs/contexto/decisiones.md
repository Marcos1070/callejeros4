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


---

## ADR-010: Tema Claro/Oscuro Global con Conmutador en el Navbar y Overrides Centralizados
- **Fecha:** 2026-11-09
- **Estado:** Aceptado
- **Contexto:** El `Store` ya persistía `darkMode` y aplicaba la clase `dark` en `<html>`, pero el único conmutador estaba en Perfil (ruta protegida) y los componentes tenían colores fijos (`bg-white`, `text-black`), por lo que el modo oscuro no se veía de forma consistente. La rúbrica exige conmutador en el header y contraste AA en ambos modos.
- **Decisión:** (1) Agregar un botón `#theme-toggle` en el `<header>` (`aria-pressed`, `aria-label` dinámico, 5 estados, foco devuelto tras el re-render). (2) Resolver la paleta oscura con overrides acotados a `html.dark` en `style.css` en lugar de duplicar clases `dark:` en cientos de plantillas; los pares texto/fondo se verificaron >= 4.5:1. (3) El ámbar `#E0A800` queda reservado a fondos con texto negro; como color de texto sobre fondo claro se usa `#7A5900` (6.45:1 sobre blanco) y en oscuro vuelve a `#E0A800`. (4) Foco: se reemplaza `*:focus-visible { outline: none }` por un contorno de respaldo de 3px (negro en claro, `#FFD54A` en oscuro) y los anillos ámbar (2.15:1) pasan a negro.
- **Consecuencias:** El tema se mantiene en un único lugar (CSS + Store). Costo: si se agrega un color nuevo de Tailwind hay que sumar su equivalente oscuro en `style.css`.

---

## ADR-011: Confirmación de Éxito de Formularios mediante Modal Accesible
- **Fecha:** 2026-11-09
- **Estado:** Aceptado
- **Contexto:** La rúbrica exige que un formulario con 3 o más campos validados en cliente dispare un modal emergente accesible con confirmación de éxito. El registro (4 campos) solo mostraba un toast y, al enviarlo vacío, no marcaba ningún campo aunque el mensaje decía "campos marcados en rojo".
- **Decisión:** (1) Al registrarse con datos válidos se abre un `Modal` (`role="dialog"`, `aria-modal`, focus trap, `Esc`) con el nombre de la persona y un botón "Continuar". (2) `Modal.open` admite `onClose`, que ejecuta la navegación al destino sin importar cómo se cierre (botón, X, `Esc` o clic fuera). (3) Al enviar se validan todos los campos sin cortocircuito, se marcan con `aria-invalid="true"`, se enlazan con `aria-describedby`, los errores se anuncian con `role="alert"` y el foco va al primer campo inválido.


---

## ADR-012: El Tema Claro/Oscuro es una Preferencia del Dispositivo, Persistida Aparte del Perfil
- **Fecha:** 2026-11-09
- **Estado:** Aceptado
- **Contexto:** El tema vivía dentro del perfil de cada cuenta (`user.darkMode`). Eso producía fallos de continuidad: al activarlo con la navbar y entrar con otra cuenta volvía a claro; no había nada que lo aplicara antes de que cargaran los módulos JS (parpadeo blanco y dependencia del arranque); si `localStorage` estaba lleno por las fotos, cambiar de tema mostraba un error de guardado y la preferencia se perdía; y el interruptor del Perfil quedaba desfasado si el tema se cambiaba desde la navbar. Además, una revisión de contraste con Tailwind real encontró 41 textos ilegibles en Alertas, Chats y Perfil: los overrides oscuros no cubrían las variantes con transparencia (`bg-[#EBEBEB]/40`, `bg-red-50/60`...), `hover:bg-white` ni el texto interno de la burbuja de chat.
- **Decisión:** (1) La preferencia se guarda en su propia clave `callejeros_theme` (con respaldo en `sessionStorage` si `localStorage` no acepta escrituras) y no cambia al cerrar sesión ni al cambiar de cuenta; `user.darkMode` queda solo como copia para los componentes. (2) Orden de resolución: elección guardada > `darkMode` heredado del perfil (migración) > `prefers-color-scheme` del sistema. (3) Un script en el `<head>` de `index.html` aplica la clase `dark` antes de pintar con la misma lógica. (4) El Perfil se suscribe a `user:updated` para sincronizar su interruptor. (5) `style.css` suma los pares oscuros de las variantes con transparencia, `hover:bg-white`, `bg-emerald-50`, bordes de apoyo y la burbuja de chat. (6) Se agrega `serve.py`, servidor de desarrollo con `Cache-Control: no-store` que escucha en `127.0.0.1`: el servidor estándar de Python no envía cabeceras de caché y Chrome reutiliza módulos y CSS viejos tras una recarga normal.
- **Consecuencias:** El tema es coherente entre pantallas, cuentas y recargas, y no depende de que haya espacio en `localStorage`. Regla nueva: toda clase de color con sufijo de opacidad (`/NN`) necesita su par oscuro en `style.css` (ver `convenciones.md` §5).

---

## ADR-013: Botón "Río Cuarto" y Límites de Navegación en el Mapa Interactivo
- **Fecha:** 2026-11-10
- **Estado:** Aceptado
- **Contexto:** En el mapa se podía alejar la vista sin límite (hasta ver el mundo entero) y no había forma directa de volver: la persona perdía la referencia de Río Cuarto y solo recuperaba la vista recargando la sección.
- **Decisión:** (1) Control de Leaflet `topleft` con botón "📍 Río Cuarto" (`<a role="button">` con `aria-label`, operable con Enter y barra espaciadora) que vuelve a `RIO_CUARTO_CENTER` con `flyTo`; con `prefers-reduced-motion` usa `setView` sin animación. (2) El botón se resalta en ámbar cuando la vista está a más de 1,5 km del centro o a 2 o más niveles de zoom del inicial, para que se note el camino de vuelta. (3) El mapa se limita a ~130 km alrededor de la ciudad (`maxBounds` con `maxBoundsViscosity: 0.9`) y `minZoom: 10`. (4) El clic usa `preventDefault`: un `href="#"` sin él cambiaría el hash y rompería el router. Estilos en `style.css` (negro sobre blanco o sobre `#E0A800`, igual en claro y oscuro).
- **Consecuencias:** No es posible perderse del área de servicio. Pendiente de verificar a mano con Leaflet real (las pruebas automáticas usaron una simulación de la API).

---

## ADR-014: Ruta por Calles Reales (OSRM) con Respaldo Aproximado
- **Fecha:** 2026-11-10
- **Estado:** Aceptado
- **Contexto:** La navegación del mapa dibujaba una línea de 3 puntos (origen, un punto intermedio inventado y destino), por lo que no seguía las calles, y la distancia era la recta multiplicada por 1.3.
- **Decisión:** (1) Nuevo módulo `src/js/routing.js` con `fetchDrivingRoute`, que consulta el servicio público de OSRM (perfil auto, sin clave) y devuelve puntos `[lat, lng]`, kilómetros y minutos reales, o `null` ante cualquier falla (sin red, HTTP no exitoso, respuesta inválida o timeout de 6 s). (2) `map.js` muestra el banner "Calculando…" de inmediato y permite cancelar; si llega una ruta tardía de un cálculo cancelado o reemplazado, se descarta (`routeRequestId`). (3) Sin respuesta del servicio se usa el trazado aproximado anterior y el banner indica "(aprox.)".
- **Consecuencias:** El recorrido respeta calles y sentidos de circulación. El servidor demo de OSRM no tiene garantía de disponibilidad: para uso real conviene un servidor propio o un proveedor con SLA. La llegada al destino sigue siendo simulada.

---

## ADR-015: Credenciales locales hasheadas y datos por usuario (prototipo sin backend)

**Contexto:** el login aceptaba cualquier correo y clave, y las charlas/contactos eran globales.

**Decisión:** las contraseñas se guardan solo como hash SHA-256 con sal (`callejeros_credentials`, indexado por correo) y los perfiles en `callejeros_accounts`. Charlas, contactos y sesiones se guardan con clave por usuario (`callejeros_chats:<id>`, etc.). El hash es síncrono y de JS puro (no depende de `crypto.subtle`).

**Límites:** al no haber servidor, esto solo evita guardar claves en texto plano y valida el acceso en el propio navegador; **no equivale a autenticación real**. Al integrar un backend, reemplazar `_verifyPassword`/`_setCredential` por llamadas a la API. Las cuentas creadas antes de este cambio no tienen clave: deben definirla con "¿Olvidaste tu contraseña?".

---

## ADR-016: Se Elimina la Cuenta de Demostración
- **Fecha:** 2026-11-12
- **Estado:** Aceptado (reemplaza lo indicado sobre la cuenta demo en ADR-015)
- **Contexto:** El login mostraba una cuenta prefabricada (`marcos@callejerosriocuarto.org` y su clave en pantalla) y el Store la trataba como cuenta existente con clave pública. Se quiere que toda cuenta se cree desde cero con el registro.
- **Decisión:** (1) Se quita el recuadro "Cuenta de demostración" y su botón del login. (2) Se elimina `DEMO_PASSWORD` y los casos especiales del Store (`_accountExists`, `_verifyPassword`, `_hasCredential`, `login`, `_loadScope`): solo existen las cuentas registradas en el navegador. (3) `INITIAL_USER` queda únicamente como autor de las publicaciones de muestra y ya no permite ingresar.
- **Consecuencias:** El correo de la antigua demo puede registrarse como cuenta propia. Un navegador que ya había usado la demo puede conservar datos viejos en `localStorage`; se limpian borrando los datos del sitio. Las cuentas nuevas siguen recibiendo los canales y los dos contactos de ejemplo del Store.

## ADR-017: Entregables con los Nombres de la Consigna y Estructura de Encabezados
- **Estado:** Aceptado
- **Contexto:** La consigna EFI pide `index.html`, `style.css` y `app.js`; el proyecto tenía `src/styles.css` y `src/app.js`. Además solo la landing tenía `<h1>`: el resto de las vistas arrancaba en `<h2>`, y tres campos (select de urgencia del reporte, buscador y mensaje del chat) no tenían etiqueta accesible.
- **Decisión:** (1) `src/styles.css` pasa a `style.css` y `src/app.js` a `app.js`, ambos junto a `index.html`; los módulos siguen en `src/js/` y los imports de `app.js` apuntan a `./src/js/`. (2) Cada vista tiene exactamente un `<h1>` (el título de la pantalla; en el chat es `sr-only`). (3) Todo campo visible tiene `<label for>` o `aria-label`. (4) El `index.html` es la carcasa semántica y cada vista se rellena desde su módulo: se mantiene así a propósito (KISS, un componente por vista) y se declara en `arquitectura.md`.
- **Consecuencias:** Un evaluador encuentra los tres archivos con el nombre pedido. Al cambiar `style.css` o `app.js` se debe actualizar el sufijo `?v=` en `index.html` para vencer la caché.

## ADR-018: Estados, Texto Blanco Garantizado y Confirmación de Éxito en Todos los Formularios
- **Estado:** Aceptado
- **Contexto:** (a) La rúbrica exige la clase `.force-text-white` en botones de acento y no existía. (b) El reporte SDD afirmaba un "respaldo global" de hover/active, pero `style.css` solo tenía respaldo de foco y disabled. (c) Solo el registro abría un modal de éxito. (d) Los "enlaces de salto suave" eran rutas hash, no anclas. (e) A 360-390 px el header y las pestañas de filtro desbordaban.
- **Decisión:** (1) `.force-text-white` (color `#FFFFFF !important`) se aplica a todo botón/enlace con texto blanco sobre rojo `#C50000`, verde `#0C832A`, sky-700 o negro (33 elementos); ningún override oscuro puede cambiarlo. (2) Respaldo global de `:hover` y `:active` con `filter: brightness()` solo para controles que NO declaran sus propias clases `hover:`/`active:` (selector `:where(...):not([class*="hover:"])`), con variante para modo oscuro. (3) `openSuccessModal()` en `modal.js` (role=dialog, focus trap, Esc, foco devuelto, `onClose`) se usa al publicar un reporte, publicar/editar una adopción, enviar una postulación y registrarse. (4) La landing suma una `<nav aria-label>` con enlaces internos (`data-scroll-to`) que hacen `scrollIntoView` suave (auto si hay `prefers-reduced-motion`), mueven el foco a la sección y no tocan el hash para no confundir al router; se agregó la sección "Cómo funciona". (5) Header móvil: "Reportar" queda como ícono bajo `sm` (conserva `aria-label`), el logo oculta el subtítulo y se achica; las pestañas de filtro nunca superan el ancho de pantalla.
- **Consecuencias:** Los 5 estados quedan garantizados incluso en controles nuevos. Costo: el respaldo usa `filter`, que se suma a los `hover:` solo cuando el control no declara el suyo.

