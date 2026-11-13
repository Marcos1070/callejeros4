# Bitácora de Errores Conocidos y Mitigaciones (Gentle-AI)

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## 1. Reinicialización del Contenedor de Leaflet en SPA

### Síntoma
Al navegar entre la vista de mapa y otras secciones de la SPA, volver a entrar al mapa arroja el error: `Error: Map container is already initialized.`

### Causa Raíz
Leaflet asocia una instancia activa al nodo DOM `#map-container`. Si la vista se desmonta y vuelve a montar sin invocar `map.remove()`, el contenedor queda en estado inconsistente.

### Mitigación Mandatoria
Mantener una referencia global a la instancia del mapa (`let mapInstance = null;`). Antes de crear un nuevo mapa, verificar `if (mapInstance) mapInstance.remove();`. Además, disparar `mapInstance.invalidateSize()` tras la transición de vista para asegurar el correcto renderizado de los tiles.

---

## 2. Validación de Contraseña Segura en Tiempo Real

### Requisitos del Negocio
- Longitud mínima de 8 caracteres.
- Al menos 1 letra mayúscula (`/[A-Z]/`).
- Al menos 1 número (`/[0-9]/`).
- Al menos 1 carácter especial `@` o `$` (`/[@$]/`).

### Mitigación Mandatoria
Verificar en el evento `input` cada condición y mostrar feedback visual claro con tildes verdes o indicadores rojos para orientar al usuario antes del envío.

---

## 3. Estado "Dirección no Encontrada" en Reportes

### Síntoma
Si el usuario ingresa una ubicación inexistente o fuera del radio urbano de Río Cuarto, el sistema debe alertar antes de permitir la publicación.

### Mitigación Mandatoria
Validar contra el listado de barrios y calles principales de Río Cuarto. Si no hay coincidencia válida ni selección en mapa, activar mensaje de error explícito: *"Dirección no encontrada"* con borde rojo en el input.

---

## 4. Estado "Contacto no Encontrado" en Mensajería

### Síntoma
Al buscar usuarios en el chat 1 a 1 para iniciar una conversación, una búsqueda vacía o sin coincidencias debe proporcionar retroalimentación comprensible.

### Mitigación Mandatoria
Renderizar una tarjeta de estado vacío con ilustración o ícono y el texto: *"Contacto no encontrado. Verificá el nombre o número ingresado."*

---

## 5. Esc Inmediato al Abrir un Modal Lanzaba `TypeError`

### Síntoma
`Cannot read properties of null (reading 'querySelector')` si se cerraba el modal con `Esc` antes de los 100 ms del `setTimeout` que enfoca el primer control.

### Mitigación Mandatoria
Guard `if (!this.activeModal) return;` al inicio del callback en `modal.js`. Cubierto por la prueba de teclado del reporte de verificación.

---

## 6. Ámbar `#E0A800` como Texto y como Anillo de Foco No Cumple WCAG AA

### Síntoma
Contraste de 2.15:1 sobre blanco (mínimo 4.5:1 para texto, 3:1 para indicadores de foco). También fallaban `gray-400` (2.54:1) y blanco sobre `sky-600` (4.10:1).

### Mitigación Mandatoria
Ver sección 5 de `convenciones.md`. Ámbar solo como fondo con texto negro (9.77:1).

---

## 7. Formulario de Registro sin Retroalimentación al Enviar Vacío

### Síntoma
Los errores se ocultaban cuando el campo estaba vacío, así que enviar el formulario sin completar solo mostraba un toast que mencionaba campos rojos inexistentes. Tampoco había `aria-invalid` ni `aria-describedby`.

### Mitigación Mandatoria
Los validadores reciben `force = true` al enviar. Cada campo debe tener su mensaje de error asociado por `aria-describedby`. Ver ADR-011.

---

## 8. Formularios que Solo Avisaban por Toast, sin Marcar el Campo Faltante

### Síntoma
En Publicar Adopción, al faltar un dato aparecía el cartel "Campos Incompletos" pero ningún campo se marcaba en rojo, por lo que no se sabía cuál completar.

### Mitigación Mandatoria
Todo formulario debe, al enviar con datos inválidos: marcar el campo (`aria-invalid="true"`, que `style.css` pinta con borde y aro rojos en ambos temas), mostrar un mensaje bajo el campo con `role="alert"`, conservar el estado si el formulario se re-renderiza, limpiar el error al corregir y mandar el foco al primer campo faltante. El toast queda como complemento, no como único aviso. Implementado en todos los formularios: Publicar Adopción, reporte de alerta, inicio de sesión, recuperación de contraseña, datos del perfil, cambio de contraseña y baja de cuenta. El helper común es `setFieldError` en `utils.js`.

---

## 9. Revisión de calidad: errores corregidos (sesión, permisos, edición, mensajería)

### Sesión y cuentas
- **Login aceptaba cualquier correo y clave.** `Store.login` no comparaba nada y creaba un perfil nuevo con cualquier correo. Ahora las cuentas se guardan con la contraseña **hasheada (SHA-256 con sal)** y el login valida correo + clave (mensaje genérico "Correo o contraseña incorrectos").
- ~~Cuenta de demostración~~: eliminada (ver ADR-016). Las cuentas se crean desde cero en "Registrate".
- Registro: se guarda la contraseña, exige repetirla y rechaza correos ya registrados.
- Cambiar contraseña, baja de cuenta y recuperación de clave **verifican/guardan la contraseña real** (antes eran solo visuales).
- Cambiar el correo en el perfil mueve la clave al correo nuevo.
- Cerrar sesión deja un estado de visitante limpio. Charlas, contactos y sesiones se guardan **por usuario** (una cuenta nueva ya no hereda las de Marcos).
- La baja de cuenta borra de verdad los reportes, fichas, postulaciones y charlas del usuario.
- Menú móvil: ahora tiene "Iniciar sesión / Crear cuenta / Cerrar sesión". Botón "Cerrar sesión" visible en escritorio.
- La landing ya no ofrece "Explorar como invitado" a quien tiene sesión (lo desconectaba).
- `#/login` y `#/registro` redirigen al perfil si ya hay sesión.

### Edición y permisos
- Editar reportes propios (modal con validaciones y fotos) y editar fichas de adopción propias.
- Marcar mascota como adoptada / reabrir; postulación a adoptar con formulario; panel de solicitudes recibidas/enviadas en el perfil.
- El Store ahora **verifica el autor** en editar/borrar/resolver (antes solo se ocultaban los botones).
- El publicador no ve "Iniciar chat" en su propia publicación.

### Reportes y mapa
- Validación de ubicación con barrios y calles reales (antes rechazaba "Sarmiento 450").
- Fecha por defecto en hora local (antes usaba UTC); no admite fechas futuras.
- El pin del reporte se ubica cerca del barrio indicado; "hace X minutos" se calcula desde la fecha; WhatsApp usa la URL real.
- Los casos resueltos ya no aparecen como alertas activas en el mapa.

### Mensajería
- El buscador de contactos ya no pierde el foco en cada letra; se corrigió la acumulación de listeners.
- "Silenciar" ahora funciona; bloquear impide enviar; eliminar usa un modal propio.
- Las salas nuevas quedaban asociadas siempre a Sofía (bloquear/eliminar afectaba a la persona equivocada): ahora se asocian al contacto real.
- Se marcan como leídas al abrirlas.

### Interfaz
- Modo oscuro real (antes el interruptor no cambiaba nada visible).
- Modales/avisos por encima del mapa y la barra; el mapa ya no se superpone a la navegación.
- Los modales ya no dejan botones invisibles accesibles con Tab ni fallan si se cierran antes del foco inicial.
- Slider de distancia con 3 pasos reales (1, 5 y 10 km); switches con rol y etiqueta accesibles.
- Filtros de adopción por tamaño, edad, género, zona y modalidad.

---

## Verificación de la consigna EFI (2026-11-12)
| Hallazgo | Causa | Corrección |
|----------|-------|------------|
| No existía `.force-text-white` | Nunca se definió | Clase en `style.css` y aplicada en 33 botones de acento (ADR-018) |
| Faltaban `style.css` y `app.js` con esos nombres | Estaban en `src/` como `styles.css` y `app.js` | Movidos a la raíz con imports y `?v=` actualizados (ADR-017) |
| El reporte SDD afirmaba un respaldo global de hover/active que no existía | `style.css` solo traía foco y disabled | Respaldo agregado y verificado con pruebas de estado real |
| Solo la landing tenía `<h1>` | Las demás vistas usaban `<h2>` de arranque | 13 encabezados pasaron a `<h1>`; una vista, un `h1` |
| 3 campos sin etiqueta accesible | Select de urgencia sin `for`; buscador y mensaje del chat solo con `placeholder` | `for` y `aria-label` |
| Header desbordaba a 360-390 px con sesión iniciada | Botón Reportar, tema, avatar y menú no entraban | Reportar como ícono en móvil, logo más chico (ADR-018) |
| Pestañas de filtro de Alertas y Adopciones desbordaban a 360 px | Contenedor `items-start` sin `max-w-full` | `max-w-full`, `overflow-x-auto` y botones compactos |
| Reporte y adopción confirmaban solo con toast o ficha | Solo el registro usaba modal | `openSuccessModal()` en todos los formularios |
| Enlaces de la navbar no eran saltos suaves | Son rutas hash de una SPA | Navegación interna con salto suave en la landing |
| Error de consola: `Cannot read properties of null (reading 'querySelector')` al cerrar un modal antes del foco inicial | El `setTimeout` de foco leía `activeModal` ya anulado | Guard en `modal.js` |

