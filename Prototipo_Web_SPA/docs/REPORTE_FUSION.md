# Reporte de fusión: `EFI-Callejeros4_corregido` + `EFI-Callejeros4-Version_Actual`

Ambas versiones partían del mismo commit (`5b49ce1`) y cada una tenía cambios sin confirmar encima.
Se hizo una fusión de tres vías con ese commit como ancestro común. **17 archivos** habían sido
modificados por los dos lados de forma distinta (94 bloques en conflicto); cada bloque se resolvió a mano.

## Qué aporta cada versión (y quedó en el resultado)

| De `corregido` | De `Version_Actual` |
|---|---|
| Login con contraseña real (hash), cuentas por correo, registro con "repetir contraseña" | Tema claro/oscuro como preferencia del dispositivo, botón en la navbar, paleta oscura completa |
| Datos por usuario (chats, contactos, sesiones); baja de cuenta que borra de verdad | Marcado en rojo de cada campo incompleto (registro, adopciones, reportes) además del cartel |
| Editar y borrar solo lo propio, **verificado en el Store** (no solo ocultando botones) | Modal accesible de "Cuenta creada" |
| Postulaciones a adopciones y panel de solicitudes en el perfil | Botón "Río Cuarto" en el mapa, límites de navegación y ruta por calles (OSRM) |
| Marcar fichas como adoptadas, editar fichas y reportes, `photo-field.js` | Mejoras de contraste WCAG AA (grises, anillos de foco, ámbar) |
| Validación de direcciones reales (barrios y calles), fechas locales sin futuros | `serve.py` sin caché, sello de versión, reportes de verificación |
| Menú móvil con sesión, redirecciones de login/registro | Escape de HTML (anti-XSS), insignia Perro/Gato, fecha de publicación |

## Decisiones donde las dos versiones hacían lo mismo de forma distinta

- **Cuentas y contraseñas (`store.js`, `auth.js`):** ganó `corregido` (más completo: datos por usuario, permisos).
- **Tema:** ganó `Version_Actual` (preferencia del dispositivo, no del perfil). Se trasplantó sobre el `store.js` de `corregido`.
- **CSS oscuro:** `corregido` traía una primera versión; ganó la de `Version_Actual`, que es más completa.
- **Mapa:** `corregido` conservaba la simulación de ruta con temporizador; ganó el botón de centrado + OSRM.
- **Validación de reportes:** se usa el marco de campos en rojo de `Version_Actual` **alimentado con las reglas de `corregido`**
  (barrio o calle real, sin fechas futuras).
- **Formulario de adopciones:** modo edición de `corregido` + validación en rojo de `Version_Actual`.
- **Documentación:** el ADR de credenciales de `corregido` pasó a **ADR-015** (chocaba con el ADR-010 del tema);
  su sección de errores quedó como sección 9.

## Correcciones hechas durante la fusión

- `publishedAt` se asigna al publicar una adopción (lo usaba el catálogo del lado actual).
- El texto de apertura del chat de rescate **no** se escapa antes de guardarlo (se escapa al mostrarlo; escaparlo dos veces mostraba `&amp;`).
- Mapa: un reporte sin coordenadas ya no rompe todo el mapa.
- Contraste: botón "Editar" en modo oscuro (1,5:1), etiqueta "+ Foto" (2,54:1) y distintivo verde del pie (4,31:1).

## Pendiente o a tener en cuenta

- **Contraseñas:** `corregido` usa SHA-256 síncrono con un prefijo de sal **fijo** (no una sal por usuario), y la contraseña de la
  cuenta demo está escrita en `data.js` y se muestra en el login. Es aceptable para un prototipo sin backend, pero no equivale a
  autenticación real. Mejora posible: PBKDF2 con sal aleatoria por usuario y demo sin clave visible en el código.
- El formulario de **postulación a adopción** muestra el error como texto, sin marcar el campo en rojo.
- El mapa se probó con una simulación de Leaflet y la ruta OSRM solo en su camino de respaldo (sin internet).
