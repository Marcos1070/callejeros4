# Flujo de Trabajo y Protocolo de Desarrollo (Gentle-AI)

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## 1. Bifurcación de Desarrollo Adaptativo
- **Fast-Path (<= 1 archivo):** Ajustes tipográficos puntuales o correcciones de bugs menores aislados.
- **SDD Estructurado (> 2 archivos o cambios estructurales):** Ciclo obligatorio `Explore ➔ Propose ➔ Tasks ➔ Apply ➔ Verify`.

---

## 2. Definition of Done (DoD) para Callejeros Río IV

Toda pantalla o componente desarrollado debe cumplir rigurosamente con los siguientes puntos antes de considerarse terminado:

- [ ] **Justificación Técnica:** Registro claro del *Why* antes del *How*.
- [ ] **Tokens de Diseño Precisos:** Aplicación estricta de `#EBEBEB` (Fondo), `#E0A800` (Ámbar), `#C50000` (Rojo), `#0C832A` (Verde), `#98D7FF` (Celeste), `#000000` (Texto principal) y `#4A4A4A` (Texto secundario).
- [ ] **Contraste WCAG AA:** Ratios superiores a 4.5:1 para texto normal y 3:1 para elementos esenciales.
- [ ] **Verificación de los 5 Estados:** Validación empírica de Default, Hover, Active, Focus-Visible y Disabled en todos los botones, tarjetas, selectores y campos.
- [ ] **Navegación por Teclado y Focus Trap:** Navegación fluida con `Tab` / `Shift+Tab`, cierre accesible con tecla `Escape` y retorno de foco al elemento de origen en todos los modales.
- [ ] **Validaciones Defensivas:** Manejo de errores en formularios (contraseñas seguras, teléfonos, nombres solo letras, error *"Dirección no encontrada"* y *"Contacto no encontrado"*).
- [ ] **Salud de Consola:** Cero excepciones no controladas en tiempo de ejecución.
- [ ] **Un `<h1>` por vista y etiquetas en todos los campos:** comprobado en cada vista tocada.
- [ ] **Sin desborde horizontal a 360 px:** comprobado en las vistas tocadas, con y sin sesión.
- [ ] **Confirmación de éxito en modal accesible** en todo formulario nuevo (`openSuccessModal()`).
- [ ] **Botones de acento con texto blanco** llevan `.force-text-white`.

