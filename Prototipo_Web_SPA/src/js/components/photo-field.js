/**
 * PhotoField - Selector de fotos reutilizable (edición de reportes y fichas)
 * Lee archivos reales, los reduce/comprime y los agrega al arreglo `images` (mutable).
 * El <input type="file"> es accesible por teclado.
 */

import { esc, filesToDataURLs } from '../utils.js';

export function mountPhotoField(host, images, { max = 3, inputId = 'photo-field-input', onChange = null } = {}) {
  if (!host) return;
  let busy = false;
  let errorMsg = '';

  const paint = () => {
    host.innerHTML = `
      <div class="flex flex-wrap items-center gap-3">
        ${images.map((src, idx) => `
          <div class="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
            <img src="${esc(src)}" alt="Foto ${idx + 1} adjunta" class="w-full h-full object-cover" />
            <button type="button" data-remove-photo="${idx}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white force-text-white flex items-center justify-center text-xs hover:bg-[#C50000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Quitar foto ${idx + 1}">✕</button>
          </div>
        `).join('')}
        ${images.length < max ? `
          <label for="${inputId}" class="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-400 flex flex-col items-center justify-center cursor-pointer hover:border-[#E0A800] text-[#4A4A4A] hover:text-black focus-within:ring-2 focus-within:ring-black ${busy ? 'opacity-50 pointer-events-none' : ''}">
            <span class="text-2xl" aria-hidden="true">${busy ? '⏳' : '📷'}</span>
            <span class="text-[10px] font-bold mt-1">${busy ? 'Subiendo…' : '+ Foto'}</span>
            <input type="file" accept="image/*" multiple id="${inputId}" class="sr-only" ${busy ? 'disabled' : ''} />
          </label>` : ''}
      </div>
      <p class="text-[11px] text-[#4A4A4A] mt-2">Hasta ${max} fotos (JPG, PNG o WEBP). Se reducen automáticamente.</p>
      <p role="alert" class="${errorMsg ? '' : 'hidden'} text-xs text-[#C50000] font-bold mt-1">${esc(errorMsg)}</p>
    `;

    host.querySelectorAll('[data-remove-photo]').forEach(btn => {
      btn.addEventListener('click', () => {
        images.splice(parseInt(btn.getAttribute('data-remove-photo'), 10), 1);
        errorMsg = '';
        paint();
        if (onChange) onChange(images);
      });
    });

    const input = host.querySelector(`#${inputId}`);
    if (input) {
      input.addEventListener('change', async () => {
        const files = Array.from(input.files || []);
        if (!files.length) return;
        errorMsg = '';
        busy = true;
        paint();
        const room = max - images.length;
        const result = await filesToDataURLs(files.slice(0, room), { maxSize: 800, quality: 0.75, maxPhotos: max }, room);
        images.push(...result.images);
        const errors = [...result.errors];
        if (files.length > room) errors.push(`Solo se admiten ${max} fotos; se ignoraron las demás.`);
        errorMsg = errors.join(' ');
        busy = false;
        paint();
        if (onChange) onChange(images);
        host.querySelector(`#${inputId}`)?.focus();
      });
    }
  };

  paint();
}
