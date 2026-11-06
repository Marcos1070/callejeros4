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
