/**
 * Utilidades compartidas - Callejeros Río IV
 * - escapeHTML: evita XSS al inyectar texto de usuario en innerHTML
 * - fileToDataURL: lee, recorta/reduce y comprime imágenes elegidas por el usuario
 * - avatares y placeholders generados (sin depender de URLs externas)
 */

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

/**
 * Escapa un valor para usarlo de forma segura dentro de HTML o de un atributo.
 * Acepta cualquier tipo (null/undefined => cadena vacía).
 */
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"'`]/g, ch => HTML_ESCAPES[ch]);
}

export const esc = escapeHTML;

/* ----------------------------------------------------------
 * Imágenes
 * -------------------------------------------------------- */

export const MAX_IMAGE_FILE_BYTES = 15 * 1024 * 1024; // 15 MB de archivo original

/**
 * Convierte un archivo de imagen en un data URL JPEG reducido.
 * Reducir es obligatorio: todo se guarda en localStorage (~5 MB en total).
 *
 * @param {File} file
 * @param {Object} [opts]
 * @param {number} [opts.maxSize=800]   Lado máximo en px (o lado del cuadrado si square)
 * @param {number} [opts.quality=0.78]  Calidad JPEG 0..1
 * @param {boolean} [opts.square=false] Recorte cuadrado centrado (avatares)
 * @returns {Promise<string>} data URL (image/jpeg)
 */
export function fileToDataURL(file, { maxSize = 800, quality = 0.78, square = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('El archivo elegido no es una imagen (usá JPG, PNG o WEBP).'));
      return;
    }
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      reject(new Error('La imagen es demasiado pesada (máximo 15 MB).'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        let dw, dh;

        if (square) {
          const min = Math.min(img.width, img.height);
          sx = (img.width - min) / 2;
          sy = (img.height - min) / 2;
          sw = sh = min;
          dw = dh = Math.min(maxSize, min);
        } else {
          const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
          dw = Math.max(1, Math.round(img.width * ratio));
          dh = Math.max(1, Math.round(img.height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = dw;
        canvas.height = dh;
        const ctx = canvas.getContext('2d');
        // Fondo blanco: los PNG/WEBP con transparencia saldrían negros en JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, dw, dh);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(new Error('No se pudo procesar la imagen.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('La imagen está dañada o su formato no es compatible (probá con JPG o PNG).'));
    };

    img.src = objectUrl;
  });
}

/**
 * Procesa varios archivos en orden. Devuelve { images, errors } para poder
 * informar cuáles fallaron sin perder las que sí se pudieron leer.
 */
export async function filesToDataURLs(fileList, opts = {}, limit = Infinity) {
  const images = [];
  const errors = [];
  for (const file of Array.from(fileList)) {
    if (images.length >= limit) {
      errors.push(`Se alcanzó el máximo de ${opts.maxPhotos ?? limit} fotos.`);
      break;
    }
    try {
      images.push(await fileToDataURL(file, opts));
    } catch (err) {
      errors.push(`${file.name}: ${err.message}`);
    }
  }
  return { images, errors };
}

/* ----------------------------------------------------------
 * Imágenes generadas (placeholders)
 * -------------------------------------------------------- */

const svgToDataURL = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

/** Avatar con iniciales para usuarios sin foto. */
export function initialsAvatar(name = '') {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || '🐾';
  return svgToDataURL(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="#E0A800"/>` +
    `<text x="100" y="125" font-family="Arial, sans-serif" font-size="80" font-weight="700" ` +
    `text-anchor="middle" fill="#000">${escapeHTML(initials)}</text></svg>`
  );
}

/** Imagen neutra para publicaciones sin foto. */
export const PLACEHOLDER_ANIMAL = svgToDataURL(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">` +
  `<rect width="600" height="450" fill="#EBEBEB"/>` +
  `<text x="300" y="250" font-size="120" text-anchor="middle">🐾</text>` +
  `<text x="300" y="320" font-family="Arial, sans-serif" font-size="26" fill="#4A4A4A" ` +
  `text-anchor="middle">Sin foto</text></svg>`
);

/* ----------------------------------------------------------
 * Validadores compartidos (registro y perfil usan las mismas reglas)
 * -------------------------------------------------------- */

/** Nombres con tildes, ü, ñ, apóstrofes, guiones y puntos (ej. "María-José", "D'Angelo"). */
export const isValidName = (v) => /^\p{L}[\p{L}\s'.-]{2,59}$/u.test(String(v ?? '').trim());

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim());

/** Teléfono argentino: 8 a 13 dígitos (admite 0358 154-998877, +54 358 ..., etc.). */
export const isValidPhone = (v) => {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 13;
};

export const isStrongPassword = (p) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[@$]/.test(p);

/* ----------------------------------------------------------
 * Textos, fechas y comparaciones
 * -------------------------------------------------------- */

/** Minúsculas y sin tildes, para comparar ("Constitución" == "constitucion"). */
export function normalizeText(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function formatDateTime(value) {
  const d = new Date(value);
  if (isNaN(d)) return String(value ?? '');
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "Hace 25 minutos", "Hace 2 horas", "Ayer"... calculado desde la fecha (el texto fijo guardado envejecía). */
export function timeAgo(value, fallback = 'Reciente') {
  const d = new Date(value);
  if (!value || isNaN(d)) return fallback;
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'Recién publicado';
  if (min < 60) return `Hace ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;
  return d.toLocaleDateString('es-AR');
}

/** Valor para <input type="datetime-local"> en hora LOCAL (toISOString usa UTC y corre la hora). */
export function toLocalInputValue(date = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

/** Imágenes que fallan (URL caída/sin internet) muestran el reemplazo en vez del ícono roto. */
export function wireImageFallbacks(root) {
  root.querySelectorAll('img[data-fallback]').forEach(img => {
    const apply = () => { img.onerror = null; img.src = PLACEHOLDER_ANIMAL; };
    img.addEventListener('error', apply, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.src) apply();
  });
}

/* ----------------------------------------------------------
 * Contraseñas: SHA-256 síncrono (JS puro, no depende de crypto.subtle,
 * que no existe en páginas http:// que no sean localhost).
 * Prototipo SIN backend: protege la clave de quedar en texto plano en el
 * navegador, pero no reemplaza a un servidor de autenticación real.
 * -------------------------------------------------------- */

const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

export function sha256(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text)));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);

  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const w = new Array(64);

  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA_K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

/** Hash de contraseña con sal propia de la app. */
export const hashPassword = (password) => sha256(`callejeros-rio-iv:${password}`);

/**
 * Marca o limpia un campo inválido: aria-invalid (style.css lo pinta con borde y aro rojos) y un
 * mensaje con role="alert" asociado por aria-describedby. `msg` vacío = campo válido.
 */
export function setFieldError(input, errEl, msg) {
  if (!input || !errEl) return;
  errEl.textContent = msg ? `⚠️ ${msg}` : '';
  errEl.classList.toggle('hidden', !msg);
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

