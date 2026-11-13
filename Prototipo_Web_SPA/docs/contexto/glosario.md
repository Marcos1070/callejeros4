# Glosario del Dominio: Callejeros Río IV

> **Documento Vivo del Master Context** — Centralizado en `docs/contexto/`. Modificaciones a reglas de negocio requieren aprobación previa.

---

## 1. Entidades Principales

### Callejeros Río IV
Comunidad y plataforma digital para el rescate, auxilio, tránsito y adopción responsable de animales en situación de calle o emergencia en Río Cuarto, Córdoba.

### Alerta de Emergencia
Aviso geolocalizado de alta visibilidad publicado por un vecino o rescatista. Puede clasificarse como:
- **Perdido:** Mascota extraviada identificada con borde ámbar (`#E0A800`).
- **Herido:** Animal con requerimiento urgente de atención médica o rescate, identificado con borde rojo (`#C50000`).
- **Rescatado / En Tránsito:** Mascota que ya fue asistida por un voluntario.

### Publicación de Adopción
Ficha de un animal apto para adopción responsable con datos de especie (Perro/Gato), sexo (Hembra/Macho), edad estimada (Cachorro/Adulto/Anciano), estado sanitario (vacunas, castración) y carrusel de fotos.

### Punto de Interés (POI)
Establecimiento georreferenciado en el mapa urbano de Río Cuarto con información operativa (Abierto/Cerrado) y contacto:
- **Veterinarias:** Centros de atención clínica y urgencias (ej. *Veterinaria Del Sol*, *Clínica San Roque*).
- **Guarderías:** Espacios de cuidado temporal y tránsito (ej. *Guardería Mi Sueño*).
- **Refugios:** Organizaciones protectoras aliadas (ej. *Refugio APARC Río Cuarto*).

---

## 2. Geografía Local (Río Cuarto)
Barrios y sectores urbanos integrados en el mapa interactivo y selector de ubicaciones:
- **Banda Norte:** Sector norte cruzando el Río Chocancharagua (Av. Marcelo T. de Alvear).
- **Alberdi:** Tradicional sector este de la ciudad.
- **Centro / Macrocentro:** Eje cívico, comercial y Plaza Roca.
- **Castelli / Bimaco:** Sectores residenciales del sur y suroeste.
- **Las Delicias / Universidad:** Zona noreste universitaria.

---

## 3. Mensajería y Roles de Grupo
- **Chat 1 a 1:** Conversación directa entre dos usuarios vinculada o no a un rescate.
- **Sala de Rescate Automática:** Conversación creada automáticamente al pulsar "Iniciar Chat" desde una alerta específica (ej. *"Rescate Perro Herido - Roca 123"*).
- **Canal Barrial de Coordinación:** Canal abierto geográfico para rescates y avisos comunitarios inmediatos por sector (Banda Norte, Alberdi, Centro, Castelli/Bimaco).
- **Administrador de Grupo / Protectora:** Creador o voluntario acreditado con facultades de moderación, asignación de tránsitos, revisión de adopciones y gestión de miembros.
- **Miembro Regular:** Integrante con capacidad de chatear, reportar conductas indebidas y postularse a adopciones.

---

## 4. Difusión y Trámites Comunitarios
- **Ficha de Alerta Comunitaria (Flyer Digital):** Volante de emergencia autogenerado con borde cromático semántico, detalles del animal, mapa de ubicación y botones de viralización rápida para WhatsApp y redes sociales.
- **Solicitud de Adopción Responsable:** Formulario estandarizado integrado en la ficha del animal con datos habitacionales, convivencia con otras mascotas y compromiso de cuidado y castración.
- **Hogar de Tránsito:** Alojamiento provisorio brindado por un vecino o voluntario mientras el animal recibe tratamiento veterinario o espera ser adoptado definitivamente.
- **Panel de Control Comunitario:** Módulo administrativo para que gestores de grupos y protectoras supervisen métricas urbanas, alertas resueltas y evalúen solicitudes de adopción.

## 5. Términos de Interfaz y Accesibilidad
- **`.force-text-white`:** Clase de `style.css` que fija el texto en `#FFFFFF` con `!important` en botones de acento (rojo, verde, sky-700, negro) para que ningún override del modo oscuro lo altere.
- **`openSuccessModal()`:** Función de `modal.js` que abre el modal accesible de confirmación de éxito (role=dialog, focus trap, Esc, foco devuelto, `onClose`) tras completar un formulario.
- **Salto suave (`data-scroll-to`):** Enlace interno de una pantalla que hace `scrollIntoView` animado hacia una sección y mueve el foco allí, sin cambiar el hash de la ruta.
- **Respaldo global de estados:** Reglas de `style.css` que dan Hover y Active a controles que no declaran `hover:`/`active:` (junto con el foco visible y el Disabled globales completan los 5 estados).
- **Carcasa semántica:** `index.html` con skip-link, `<header>`, `<main>` y `<footer>`; el contenido de cada vista lo inyecta su módulo de `src/js/components/`.

