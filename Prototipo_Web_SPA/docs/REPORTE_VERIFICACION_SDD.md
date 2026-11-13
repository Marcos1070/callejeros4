# Reporte de Verificación SDD: Callejeros Río IV

- **Fecha:** 2026-11-12 (ciclos anteriores: 2026-11-09 a 2026-11-11)
- **Ciclo verificado:** tema claro/oscuro, contraste WCAG AA, foco visible, catálogo de adopciones, formulario de registro con modal de éxito y navegación por teclado.
- **Flujo aplicado:** Explore ➔ Propose ➔ Tasks ➔ Apply ➔ Verify (ver `.agents/rules/antigravity_rules.md`, sección 6.B).
- **Último ciclo (2026-11-12):** auditoría de cumplimiento de la consigna EFI y corrección de lo faltante (sección 3.5).
- **Decisiones asociadas:** ADR-010 a ADR-018 en `contexto/decisiones.md` (las nuevas: ADR-017 y ADR-018).

> Convención de este reporte: **Verificado** = comprobado con una prueba o un cálculo descritos abajo. **Pendiente manual** = no se ejecutó en este ciclo y debe confirmarse en el navegador antes de la entrega.

---

## 1. Explore: hallazgos iniciales

| # | Hallazgo | Impacto |
|---|----------|---------|
| 1 | El `Store` ya guardaba `darkMode`, pero el único switch estaba en Perfil (ruta protegida) y los componentes no respondían a la clase `dark` | Requisito de navbar y de contraste en modo oscuro |
| 2 | Texto ámbar `#E0A800` sobre blanco: 2.15:1 | Falla AA (texto) |
| 3 | `text-gray-400` (2.54:1) y `text-gray-500` sobre `#EBEBEB` (~4.2:1) | Falla AA |
| 4 | Blanco sobre `bg-sky-600`: 4.10:1 | Falla AA |
| 5 | Anillos de foco `ring-[#E0A800]` (30 usos): 2.15:1 | Foco no cumple alto contraste |
| 6 | `*:focus-visible { outline: none }` sin respaldo global | Controles sin ring quedaban sin indicador |
| 7 | Tarjetas de adopción sin fecha ni badge de categoría | Requisito del catálogo |
| 8 | `setTimeout` del modal fallaba si se cerraba con `Esc` en los primeros 100 ms | Error de consola real |
| 9 | Ningún formulario disparaba un modal de confirmación de éxito (el registro y la adopción usaban toast; el reporte, una ficha en página) | Requisito del formulario interactivo |
| 10 | Registro: al enviar vacío no se marcaba ningún campo; sin `aria-invalid` ni `aria-describedby` | Validación inaccesible |

## 2. Apply: cambios

| Archivo | Cambio |
|---------|--------|
| `src/js/components/navbar.js` | Botón `#theme-toggle` en el `<header>` (`aria-pressed`, `aria-label` dinámico, 5 estados) y foco devuelto tras el re-render |
| `src/js/components/profile.js` | Switch de Perfil con `role="switch"`, `aria-label`, estados hover/active/focus/disabled y foco devuelto |
| `style.css` | Bloque `MODO OSCURO`, foco global de respaldo, `disabled`/`hover`/`active` de respaldo, borde de inputs >= 3:1, `prefers-reduced-motion` |
| `src/js/components/*.js`, `index.html`, `data.js` | Ámbar de texto ➔ `#7A5900`; `gray-400/500` ➔ `gray-600`; `sky-600` ➔ `sky-700`; `ring-[#E0A800]` ➔ `ring-black` |
| `src/js/components/adoptions.js`, `data.js`, `store.js` | Badge de categoría (Perro/Gato) y fecha `<time>` en cada tarjeta; campo `publishedAt` (las 4 fichas semilla tienen fechas de demostración) |
| `src/js/components/modal.js` | Guard en el `setTimeout` de foco inicial y callback `onClose` |
| `src/js/components/auth.js` | Registro: validación visible al enviar, `aria-invalid`/`aria-describedby`/`role="alert"`, foco al primer error y modal de éxito accesible (ADR-011) |
| `docs/contexto/*.md` | ADR-010 y ADR-011, convenciones §5, errores-conocidos §5, §6 y §7 |

## 3. Verify

### 3.1 Contraste (verificado: cálculo WCAG 2.x de luminancia relativa)

| Par | Antes | Ahora | Mínimo |
|-----|-------|-------|--------|
| Texto ámbar sobre blanco | 2.15 | **6.45** (`#7A5900`) | 4.5 |
| Texto ámbar sobre `#EBEBEB` | n/d | **5.41** | 4.5 |
| `gray-400` sobre blanco | 2.54 | **7.56** (`gray-600`) | 4.5 |
| `gray-600` sobre `#EBEBEB` | ~4.2 (gray-500) | **6.34** | 4.5 |
| Blanco sobre `sky` | 4.10 | **5.93** (`sky-700`) | 4.5 |
| Foco en modo oscuro `#FFD54A` sobre `#1E1E1E` | n/d | **11.80** | 3.0 |
| Foco en modo claro negro sobre blanco | n/d | **21.00** | 3.0 |

Pares del modo oscuro (todos >= 4.5:1): blanco sobre `#1E1E1E` 16.67 · blanco sobre `#2A2A2A` 14.35 · `#C8C8C8` sobre `#2A2A2A` 8.58 · `#C8C8C8` sobre `#3A3A3A` 6.80 · ámbar `#E0A800` sobre `#2A2A2A` 6.68 · rojo `#FF8A80` sobre `#2A2A2A` 6.29 · verde `#4ADE80` sobre `#2A2A2A` 8.24 · placeholder `#A8A8A8` sobre `#333333` 5.31.
Pares que ya cumplían y no se tocaron: negro sobre ámbar 9.77 · blanco sobre rojo `#C50000` 6.22 · `#4A4A4A` sobre `#EBEBEB` 7.43 · verde `#0C832A` sobre blanco 4.89.

### 3.2 Pruebas automáticas en Chromium (verificado: 17 de 17)

Servidor local + Playwright (Chromium headless). Las librerías por CDN no se cargaron en ese entorno, por lo que estas pruebas cubren **lógica, DOM, foco y teclado**, no la apariencia.

| Prueba | Resultado |
|--------|-----------|
| Botón de tema dentro de `<header>` | Cumple |
| Estado inicial claro (`aria-pressed=false`, sin clase `dark`) | Cumple |
| Se llega al conmutador solo con `Tab` | Cumple |
| `Enter` activa oscuro; `Space` vuelve a claro | Cumple |
| `aria-pressed` y `aria-label` cambian con el estado | Cumple |
| El foco no se pierde tras re-renderizar el navbar | Cumple |
| Preferencia guardada en `localStorage` y vigente tras recargar | Cumple |
| Catálogo con 4 tarjetas (rango 4 a 6) | Cumple |
| Cada tarjeta: imagen con `alt`, fecha `<time>`, badge y botón | Cumple |
| Modal: `role="dialog"` y `aria-modal="true"`, abre con `Enter` | Cumple |
| Focus trap: 25 `Tab` seguidos no sacan el foco del modal | Cumple |
| `Esc` cierra el modal y el foco vuelve al botón que lo abrió | Cumple |
| `Esc` inmediato al abrir y cero errores JS en consola | Cumple |

### 3.2.b Formulario de registro, solo con teclado (verificado: 20 de 20, en dos recorridos)

| Prueba | Resultado |
|--------|-----------|
| Enviar vacío marca los 4 errores (nombre, correo, teléfono, contraseña) | Cumple |
| `aria-invalid="true"` y `aria-describedby` hacia el mensaje de cada campo | Cumple |
| El foco pasa al primer campo inválido | Cumple |
| Correo inválido bloquea el envío y queda marcado | Cumple |
| Datos válidos abren el modal "¡Cuenta creada con éxito!" con el nombre ingresado | Cumple |
| Foco inicial en "Continuar" y focus trap dentro del modal | Cumple |
| `Enter` en "Continuar" o `Esc` cierran el modal y continúan a `#/mapa` con la sesión iniciada | Cumple |
| Sin errores JS propios (Leaflet no se cargó en el entorno de prueba) | Cumple |

### 3.3 Estado frente a la rúbrica

| Requisito | Estado |
|-----------|--------|
| Navbar fija con logo, enlaces y conmutador de tema | Verificado (DOM y teclado). Los enlaces de la navbar son rutas hash (cambian de vista); el salto suave a secciones está en la navegación interna de la landing (3.5, ADR-018) |
| Hero con `h1`, propuesta de valor y CTA | Revisado en código; apariencia pendiente manual |
| Catálogo de 4 a 6 tarjetas con imagen, badge, fecha y botón | Verificado |
| Formulario con 3+ campos validados y modal de éxito | Verificado en registro (4 campos), reporte, publicar adopción y postulación: todos abren `openSuccessModal()` (3.5) |
| 5 estados en botones y controles | Verificado con estados reales (3.5): Default, Hover, Active, Focus-visible y Disabled. **Corrección:** hasta el 2026-11-11 este reporte afirmaba un respaldo global de hover/active que en realidad no existía (solo había foco y disabled); se agregó en este ciclo. Capturas pendientes (manual) |
| Navegación 100% por teclado | Verificado en navbar, toggle, catálogo, modal y registro; reporte, adopción, chat y mapa pendientes manual |
| Contraste AA en claro y oscuro | Verificado por cálculo para la paleta; barrido real con axe o Lighthouse pendiente manual |
| HTML5 semántico y `alt` | `header`, `nav`, `main`, `footer` presentes; `alt` verificado; **un `<h1>` por vista** y todos los campos con etiqueta (3.5) |
| Clase `.force-text-white` en botones de acento | Verificado (3.5): 33 botones, blanco puro y >= 4.5:1 en claro y oscuro |
| Entregables `index.html`, `style.css`, `app.js` | Con esos nombres en la raíz (ADR-017); la lógica está en módulos ES de `src/js/` |
| Tailwind CDN + estructura modular + `localStorage` | Cumple |

### 3.2.c Ruta por calles reales (verificado con Leaflet y servicio simulados)

18 de 18 comprobaciones: 11 unitarias de `routing.js` (orden lng/lat, conversión, fallas, timeout) y 7 de integración sobre `map.js` con Leaflet y OSRM simulados (línea de 42 puntos con extremos exactos, distancia y tiempo del servicio, respaldo de 3 puntos con "(aprox.)", cancelación durante el cálculo, doble clic y modal de llegada).
**Limitación:** no se vio el trazado sobre el mapa real; confirmar a mano que la línea siga las calles (ver ADR-014).

### 3.2.d Publicar Adopción: campos faltantes marcados en rojo (verificado: 17 de 17)

Enviar vacío marca nombre, barrio, historia y la zona de fotos (borde rojo, mensaje por campo con `role="alert"`, cartel "Campos Incompletos" y foco al primer error). Los errores persisten al re-renderizar (por ejemplo al elegir una píldora), se limpian al escribir, "solo espacios" cuenta como vacío, el formulario completo publica y el borde rojo se ve también en modo oscuro (`#FF8A80`).
El mismo patrón se completó en el perfil (ver 3.2.h).

### 3.2.e Reporte de alerta: campos faltantes marcados en rojo (verificado: 19 de 19)

Paso 2 (título y descripción) y paso 3 (fecha, ubicación y teléfono) validan todos los campos a la vez al presionar "Siguiente": cada uno se marca con borde rojo y mensaje propio, se muestra el cartel, el foco va al primer error, cada error se limpia al corregir ese campo, y al volver o avanzar de paso no se arrastran errores y se conserva lo escrito. Cubre también el borde rojo en modo oscuro. Se agregó la validación de fecha vacía, que antes no existía.

### 3.2.f Inicio de sesión y recuperación de contraseña: campos en rojo, mensaje y cartel (verificado: 26 de 26)

Login: correo o contraseña vacíos, correo mal escrito y clave incorrecta marcan el campo con borde rojo, mensaje y cartel, y llevan el foco al primer error; los errores se limpian al escribir. Recuperación, paso 1 (correo vacío, inválido o sin cuenta) y paso 3 (ambos campos vacíos, contraseña débil, confirmación distinta): cada campo se marca por separado, con su mensaje y el cartel correspondiente. Se agregó `novalidate` a esos formularios para que no aparezca la burbuja nativa del navegador en lugar del aviso propio. La prueba completa el cambio de clave y confirma que el login acepta la clave nueva. El rojo se ve también en modo oscuro.

### 3.2.g Sin cuenta de demostración: todo se crea desde cero (verificado: 13 de 13)

El login ya no muestra la cuenta demo, y su correo y clave dejan de funcionar (también en "Olvidé mi contraseña"). Se registró una cuenta nueva con el formulario y se comprobó: modal de éxito, perfil con los datos propios y sin rastros de la demo, cerrar sesión e ingresar de nuevo, recuperar la clave (la vieja deja de servir y la nueva funciona) y registrar el correo que antes era de la demo (ADR-016).

### 3.2.h Perfil: datos personales, cambio de contraseña y baja de cuenta (verificado: 23 de 23)

Los tres formularios usan `novalidate` (sin burbuja nativa del navegador) y marcan cada campo inválido con borde rojo, mensaje debajo y cartel, con el foco en el primer error. Datos personales: nombre, teléfono y correo vacíos o inválidos. Cambio de contraseña (modal): los tres campos vacíos, clave débil, confirmación distinta y contraseña actual incorrecta (se marca ese campo con el motivo). Baja de cuenta: contraseña vacía o incorrecta. Los errores se limpian al corregir, el rojo se ve en modo oscuro y los flujos exitosos siguen funcionando (guardar perfil, cambiar la clave, eliminar la cuenta). El helper común quedó en `utils.js` (`setFieldError`).

### 3.5 Verificación de la consigna EFI (2026-11-12): verificado, 29 de 29

**Explore.** Se auditó el zip contra cada punto de la consigna y la rúbrica. Faltantes encontrados: clase `.force-text-white`; entregables con otro nombre (`src/styles.css`, `src/app.js`); respaldo de hover/active inexistente (el reporte lo daba por hecho); un solo `h1` en toda la app; 3 campos sin etiqueta; desborde horizontal del header a 360-390 px; modal de éxito solo en el registro; sin salto suave a secciones; memoria Engram desactualizada.

**Apply.**

| Archivo | Cambio |
|---------|--------|
| `style.css`, `app.js`, `index.html` | Movidos a la raíz con los nombres de la consigna; imports y `?v=` actualizados (ADR-017) |
| `style.css` | `.force-text-white`; respaldo global de hover y active (claro y oscuro); `prefers-reduced-motion` y `scroll-padding-top` (ADR-018) |
| `src/js/components/*.js` | 33 botones de acento con `.force-text-white`; 13 encabezados a `<h1>`; `for` en el select de urgencia; `aria-label` en buscador y mensaje del chat |
| `src/js/components/modal.js` | `openSuccessModal()` reutilizable |
| `alerts.js`, `adoptions.js` | Modal de éxito al publicar un reporte, publicar o editar una adopción y enviar una postulación; pestañas de filtro con `max-w-full` y `overflow-x-auto` |
| `auth.js` | Navegación interna con salto suave y sección "Cómo funciona" en la landing |
| `navbar.js` | Header móvil: Reportar como ícono bajo `sm`, logo más chico, subtítulo oculto |
| `docs/contexto/*`, `.agents/*` | ADR-017/018, convenciones §6, glosario §5, errores conocidos, reglas always-on y Engram (7 entradas `mem_save`) |

**Verify.** Chromium automatizado (Playwright) con una compilación local de Tailwind para renderizar con estilos:

| Prueba | Resultado |
|--------|-----------|
| `style.css` y `app.js` cargan con los nombres de la consigna | Cumple |
| Un `<h1>` en cada una de las 8 vistas; ningún campo sin etiqueta | Cumple |
| `.force-text-white`: 15 botones por tema, color `#FFFFFF`, contraste >= 4.5:1 en claro y en oscuro | Cumple |
| Contraste de todo el texto visible en 8 vistas x 2 temas (16 medidas) | 0 pares por debajo de 4,5:1 (3:1 en texto grande) |
| Sin scroll horizontal a 360, 375, 390 y 414 px, sin sesión y con sesión, en 6 vistas | Cumple |
| Salto suave: el enlace interno hace scroll, mueve el foco a la sección, no cambia el hash y se opera con Tab y Enter | Cumple |
| Hover, Active, Focus-visible (anillo de 3 px) y Disabled (opacidad 0,5, `not-allowed`) sobre un control sin clases propias | Cumple |
| Conmutador de tema con Enter y con Espacio | Cumple |
| Modal de éxito en reporte y adopción: `aria-modal`, Esc cierra, Enter en "Ver catálogo" navega, 20 Tab seguidos no salen del modal | Cumple |
| Sesión: login inventado y clave equivocada rechazados, clave correcta entra; buscador del chat acepta varias letras | Cumple |
| Consola de JavaScript durante toda la corrida | 0 errores |

*Alcance de esta verificación:* el render usó una compilación local de Tailwind (v4), no el CDN real, y sin imágenes externas ni mapa Leaflet; no se corrió axe ni Lighthouse. Ver pendientes.

## 4. Pendientes manuales antes de entregar

1. Recorrer las vistas en modo claro y oscuro **con el CDN real de Tailwind** (el render de 3.5 usó una compilación local) y buscar texto ilegible o fondos claros residuales.
2. Capturas de los 5 estados (default, hover, active, focus, disabled) de un botón y un input (a cargo del equipo).
3. Correr Lighthouse (Accesibilidad) y axe DevTools en ambos temas (no se ejecutaron).
4. Revisar consola con red real (Leaflet, Tailwind, fuentes e imágenes) y en un celular físico.
5. Confirmar si el mapa Leaflet y sus popups se leen bien en oscuro (los tiles quedan claros).
6. Entregables fuera del código, a cargo del equipo: wireframe o enlace de Figma y video demo de 2 a 3 minutos (navegación SPA, modal, prueba por teclado y cambio de tema).

## 5. Limitaciones conocidas

- Las imágenes de adopciones y del hero vienen de URLs externas; sin internet no se muestran.
- Los overrides oscuros dependen de las clases de Tailwind usadas hoy; colores nuevos requieren su par en `style.css` (ver `convenciones.md` §5).
- Las fechas de las fichas semilla son datos de demostración.
- El `index.html` es una carcasa semántica: el contenido de cada vista lo inyecta su módulo JS (ADR-017). Sin JavaScript no hay contenido.
- Las contraseñas se guardan como hash en el navegador (ADR-015); no equivale a autenticación real con servidor.
