# Convenciones y Tokens de Diseño: Callejeros Río IV

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## 1. Tokens de Color Oficiales

| Token | Código HEX | Utilidad Tailwind Sugerida | Propósito de Uso |
| :--- | :--- | :--- | :--- |
| **Superficie / Fondo** | `#EBEBEB` | `bg-[#EBEBEB]` / `bg-surface` | Fondo general de la aplicación y tarjetas neutrales |
| **Ámbar Principal** | `#E0A800` | `bg-[#E0A800]` / `text-[#E0A800]` | Color identitario primario, botones de acción, destacados |
| **Rojo Alerta** | `#C50000` | `bg-[#C50000]` / `text-[#C50000]` | Botón "Reportar sin cuenta", alertas de peligro, heridos, estado cerrado |
| **Verde Éxito** | `#0C832A` | `bg-[#0C832A]` / `text-[#0C832A]` | Mensajes de éxito, tilde verde, estado abierto, rescatado |
| **Celeste Chat** | `#98D7FF` | `bg-[#98D7FF]` / `text-[#98D7FF]` | Burbujas de mensajes propios, badges de veterinarias |
| **Texto Principal** | `#000000` | `text-[#000000]` / `text-black` | Títulos, textos primarios, contraste máximo (18:1 sobre `#EBEBEB`) |
| **Texto Secundario** | `#4A4A4A` | `text-[#4A4A4A]` | Subtítulos, descripciones secundarias, metadatos accesibles (5.2:1) |
| **Blanco Nieve** | `#FFFFFF` | `bg-white` / `text-white` | Fondos de tarjetas principales, inputs y contraste sobre colores vivos |

---

## 2. Tipografía y Radios de Borde
- **Fuente Principal:** `Inter`, sans-serif (pesos: Medium 500, Bold 700, Black 900).
- **Estilo de Botones y Chips:** Formato Píldora (`rounded-full`), cápsulas completas con padding equilibrado (`px-6 py-3`).
- **Tarjetas y Contenedores:** Radios redondeados suaves de `rounded-xl` (12px) a `rounded-2xl` (16px) sobre fondos `#FFFFFF` o `#EBEBEB`.

---

## 3. Los 5 Estados Obligatorios en Tailwind CSS

Todo componente interactivo debe implementar y verificar empíricamente los siguientes 5 estados:

### A. Botón Primario Ámbar (`#E0A800`)
- **Default:** `bg-[#E0A800] text-black font-bold px-6 py-3 rounded-full shadow-md`
- **Hover:** `hover:bg-[#c99700] hover:shadow-lg hover:-translate-y-0.5 transition-all`
- **Active:** `active:bg-[#b38600] active:translate-y-0 active:scale-[0.98]`
- **Focus-Visible:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2`
- **Disabled:** `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`

### B. Botón Rojo de Emergencia ("Reportar sin Cuenta" / Peligro)
- **Default:** `bg-[#C50000] text-white font-black px-6 py-3 rounded-full shadow-md`
- **Hover:** `hover:bg-[#a80000] hover:shadow-lg hover:-translate-y-0.5 transition-all`
- **Active:** `active:bg-[#8f0000] active:scale-[0.98]`
- **Focus-Visible:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2`
- **Disabled:** `disabled:opacity-40 disabled:cursor-not-allowed`

### C. Chips / Selectores de Píldora (Edad, Sexo, Categorías)
- **Default Inactivo:** `bg-white text-[#4A4A4A] border border-gray-300 rounded-full px-4 py-2 font-medium`
- **Hover:** `hover:border-[#E0A800] hover:text-black`
- **Active / Seleccionado:** `bg-[#E0A800] text-black font-bold border-[#E0A800] shadow-sm`
- **Focus-Visible:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black`
- **Disabled:** `disabled:opacity-40 disabled:cursor-not-allowed`

### D. Inputs y Selects del Formulario
- **Default:** `bg-white border border-gray-300 text-black px-4 py-3 rounded-xl placeholder:text-gray-400`
- **Hover:** `hover:border-gray-400`
- **Active:** `active:border-[#E0A800]`
- **Focus-Visible:** `focus-visible:outline-none focus-visible:border-[#E0A800] focus-visible:ring-2 focus-visible:ring-[#E0A800]/40`
- **Disabled:** `disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed`

---

## 4. Validaciones de Formulario y Retroalimentación
- **Nombre:** Mínimo 3 caracteres, exclusivamente letras y espacios (`/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/`).
- **Correo Electrónico:** Formato estándar RFC con regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- **Teléfono con Código de Área:** 8 a 10 dígitos numéricos limpios.
- **Contraseña Segura:** Mínimo 8 caracteres, al menos 1 letra mayúscula, al menos 1 número y al menos 1 carácter especial (`@` o `$`).
- **Ubicación:** Si no se encuentra en el mapa o catálogo de barrios de Río Cuarto, mostrar error: *"Dirección no encontrada"*.
- **Buscador de Contactos:** Si la búsqueda no arroja coincidencias, mostrar: *"Contacto no encontrado"*.
