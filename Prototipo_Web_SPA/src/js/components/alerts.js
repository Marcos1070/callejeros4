/**
 * Alerts Component - Módulo de Reportes y Alertas en Vía Pública
 * Implementa Wizard en 4 pasos, Ficha de Difusión Comunitaria (Flyer) con WhatsApp y Feed
 */

import { Store } from '../store.js';
import { BARRIOS_RIO_CUARTO, BARRIO_COORDS, CALLES_RIO_CUARTO, RIO_CUARTO_CENTER } from '../data.js';
import { Modal, openSuccessModal } from './modal.js';
import { mountPhotoField } from './photo-field.js';
import {
  esc, filesToDataURLs, isValidPhone, PLACEHOLDER_ANIMAL,
  normalizeText, timeAgo, formatDateTime, toLocalInputValue, wireImageFallbacks
} from '../utils.js';

const MAX_REPORT_PHOTOS = 3;

/** Todas las fotos de un reporte (compatible con reportes viejos que solo tenían `image`). */
const alertPhotos = (a) => (a.images && a.images.length ? a.images : [a.image]).filter(Boolean);

/** Tira de miniaturas con las fotos adicionales (la principal se muestra arriba). */
const extraPhotosStrip = (a) => {
  const extra = alertPhotos(a).slice(1);
  if (!extra.length) return '';
  return `
    <div class="flex gap-2 overflow-x-auto py-2" aria-label="Más fotos del reporte">
      ${extra.map((src, i) => `<img src="${esc(src)}" alt="Foto adicional ${i + 2} de ${esc(a.title)}" class="w-20 h-20 object-cover rounded-xl border border-gray-200 shrink-0" />`).join('')}
    </div>`;
};

/** URL de la app sin el hash (también sirve al abrir el archivo localmente, donde origin vale "null"). */
const appUrl = (hash = '#/mapa') => `${window.location.href.split('#')[0]}${hash}`;

/** ¿El texto menciona un barrio o calle conocida de Río Cuarto? (sin importar tildes ni mayúsculas) */
export function isRecognizedLocation(location) {
  const loc = normalizeText(location);
  if (loc.length < 4) return false;
  const known = [...BARRIOS_RIO_CUARTO, ...CALLES_RIO_CUARTO].map(normalizeText);
  if (known.some(k => loc.includes(k))) return true;
  return /\b(calle|av\.?|avenida|bv\.?|boulevard|pasaje|pje\.?|ruta)\b/.test(loc);
}

/** Pin aproximado: cerca del barrio mencionado (si lo conocemos) o del centro de Río Cuarto. */
function coordsForLocation(location) {
  const loc = normalizeText(location);
  const barrio = Object.keys(BARRIO_COORDS).find(b => loc.includes(normalizeText(b)));
  const base = barrio ? BARRIO_COORDS[barrio] : [RIO_CUARTO_CENTER.lat, RIO_CUARTO_CENTER.lng];
  const jitter = () => (Math.random() - 0.5) * 0.003;
  return [base[0] + jitter(), base[1] + jitter()];
}

function fieldError(inputEl, errEl, message) {
  if (errEl) {
    errEl.textContent = message || '';
    errEl.classList.toggle('hidden', !message);
  }
  if (inputEl) {
    inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    inputEl.classList.toggle('border-[#C50000]', !!message);
  }
}

/** Texto para compartir por WhatsApp, correctamente codificado para URL. */
const buildShareText = (a) => encodeURIComponent(
  `🚨 *ALERTA CALLEJEROS RÍO CUARTO* 🚨\n\n` +
  `*${a.type}:* ${a.title}\n` +
  `*Ubicación:* ${a.location}\n` +
  `*Contacto:* ${a.publisher?.phone || 'No disponible'}\n\n` +
  `👉 Ver alerta en mapa: ${appUrl('#/mapa')}`
);

export function renderAlertsFeed(containerId = 'view-alertas') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentFilter = Store.state.activeAlertFilter;
  const user = Store.state.user;

  const alerts = Store.state.alerts.filter(a => {
    if (currentFilter === 'TODOS') return true;
    if (currentFilter === 'PERDIDOS') return a.type === 'PERDIDO';
    if (currentFilter === 'HERIDOS') return a.type === 'HERIDO';
    if (currentFilter === 'RESCATADOS') return a.status === 'rescued';
    return a.type === currentFilter;
  });

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" aria-labelledby="alerts-feed-heading">
      
      <!-- Cabecera y Pestañas de Filtrado -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#C50000] text-xs font-black uppercase mb-2">
            <span>Red Comunitaria Río Cuarto</span>
          </div>
          <h1 id="alerts-feed-heading" class="text-3xl font-black text-black tracking-tight">
            🚨 Alertas en Vía Pública
          </h1>
          <p class="text-xs text-[#4A4A4A] mt-1">Avisos urgentes de mascotas perdidas, heridas o avistadas en Río Cuarto</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 max-w-full">
          <!-- Pestañas de Filtro Semánticas -->
          <div class="bg-gray-200 p-1 rounded-full flex items-center gap-1 max-w-full overflow-x-auto" role="tablist">
            <button type="button" data-alert-filter="TODOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'TODOS' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              TODOS
            </button>
            <button type="button" data-alert-filter="PERDIDOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'PERDIDOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              PERDIDOS
            </button>
            <button type="button" data-alert-filter="HERIDOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'HERIDOS' ? 'bg-[#C50000] text-white force-text-white shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              HERIDOS
            </button>
            <button type="button" data-alert-filter="RESCATADOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'RESCATADOS' ? 'bg-[#0C832A] text-white force-text-white shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              ✓ RESUELTOS
            </button>
          </div>

          <a href="#/reportar" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black text-white force-text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-md transition-all">
            <span>+ Publicar Alerta</span>
            <span>🚨</span>
          </a>
        </div>
      </div>

      <!-- Feed Grid de Alertas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${alerts.length === 0 ? `
          <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
            <span class="text-4xl block mb-2">🐾</span>
            <h3 class="text-lg font-black text-black">No hay alertas en esta categoría</h3>
            <p class="text-xs text-[#4A4A4A] mt-1">Actualmente no se registran reportes activos con este filtro en Río Cuarto.</p>
          </div>
        ` : alerts.map(alert => {
          const isHerido = alert.type === 'HERIDO';
          const isRescued = alert.status === 'rescued';
          let borderColor = isHerido ? 'border-2 border-[#C50000]' : 'border-2 border-[#E0A800]';
          let badgeBg = isHerido ? 'bg-[#C50000] text-white' : 'bg-[#E0A800] text-black';
          if (isRescued) {
            borderColor = 'border-2 border-[#0C832A]';
            badgeBg = 'bg-[#0C832A] text-white';
          }
          const isOwner = Store.canEditAlert(alert);
          const recipientId = Store.resolveContactId(alert.publisher?.id) || '';

          return `
            <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${borderColor}">
              
              <div>
                <!-- Imagen con Badge de Peligro y Fecha/Hora -->
                <div class="relative h-48 w-full bg-gray-100 overflow-hidden cursor-pointer" data-open-flyer="${esc(alert.id)}">
                  <img src="${esc(alert.image || PLACEHOLDER_ANIMAL)}" alt="${esc(alert.title)}" class="w-full h-full object-cover pet-img-cover hover:scale-105 transition-transform duration-300" />
                  <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeBg} shadow">
                    ${isRescued ? '✓ CASO RESUELTO' : alert.type}
                  </span>
                  <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/75 text-white backdrop-blur-sm">
                    🕒 ${esc(timeAgo(alert.date, alert.timestamp))}
                  </span>
                </div>

                <!-- Contenido Informativo -->
                <div class="p-5 space-y-3">
                  <h3 class="font-black text-lg text-black leading-snug cursor-pointer hover:text-[#7A5900] transition-colors" data-open-flyer="${esc(alert.id)}">
                    ${esc(alert.title)}
                  </h3>
                  
                  <div class="flex items-center gap-1.5 text-xs text-[#4A4A4A] font-semibold">
                    <span>📍</span>
                    <span class="truncate">${esc(alert.location)}</span>
                  </div>

                  <p class="text-xs text-[#4A4A4A] leading-relaxed line-clamp-3">
                    ${esc(alert.description)}
                  </p>
                </div>
              </div>

              <!-- Pie de Tarjeta: Perfil del Publicador y Acciones -->
              <div class="p-5 pt-3 border-t border-gray-100 bg-gray-50/70 space-y-3">
                
                <div class="flex items-center justify-between text-xs">
                  ${alert.publisher?.isAnonymous ? `
                    <div class="flex items-center gap-2 text-gray-600">
                      <span class="text-lg">👤</span>
                      <div>
                        <span class="font-bold text-black block">Usuario Anónimo</span>
                        <span class="text-[10px] text-gray-600">Emergencia en vía pública</span>
                      </div>
                    </div>
                  ` : `
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-[#E0A800] text-black font-bold flex items-center justify-center text-xs">
                        ${esc((alert.publisher?.name || 'V').charAt(0))}
                      </div>
                      <div>
                        <span class="font-bold text-black block">${esc(alert.publisher?.name || 'Vecino')}</span>
                        <span class="text-[10px] text-[#0C832A] font-semibold">✓ Rescatista Verificado</span>
                      </div>
                    </div>
                  `}

                  <button type="button" data-open-flyer="${esc(alert.id)}" class="text-xs font-bold text-[#7A5900] hover:underline flex items-center gap-1">
                    <span>Ver Flyer</span> ↗
                  </button>
                </div>

                <!-- Botones Contextuales: INICIAR CHAT vs LLAMAR -->
                <div class="flex items-center gap-2">
                  ${(!alert.publisher?.isAnonymous && isOwner) ? '' : !alert.publisher?.isAnonymous ? `
                    <button type="button" data-start-rescue-chat="${esc(alert.id)}" data-alert-title="${esc(alert.title)}" data-recipient="${esc(recipientId)}" class="
                      flex-1 py-2.5 px-4 rounded-full font-black text-xs text-black uppercase tracking-wider
                      bg-[#98D7FF] hover:bg-sky-300 active:scale-95 shadow-sm transition-all flex items-center justify-center gap-1.5
                    ">
                      <span>💬 Iniciar Chat</span>
                    </button>
                  ` : `
                    <a href="tel:${esc(alert.publisher?.phone || '0358154123456')}" class="
                      flex-1 py-2.5 px-4 rounded-full font-black text-xs text-white force-text-white uppercase tracking-wider
                      bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-sm transition-all text-center
                    ">
                      📞 Llamar al Reportante
                    </a>
                  `}

                  ${isOwner ? `
                    <button type="button" data-toggle-resolved="${esc(alert.id)}" class="p-2 rounded-full ${isRescued ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#0C832A]'} hover:opacity-80" title="${isRescued ? 'Reactivar Alerta' : 'Marcar como Rescatado'}">
                      ${isRescued ? '🔄' : '✓'}
                    </button>
                    <button type="button" data-edit-alert="${esc(alert.id)}" class="p-2 rounded-full bg-sky-100 text-sky-900 hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" title="Editar mi reporte" aria-label="Editar mi reporte">✏️</button>
                    <button type="button" data-delete-alert="${esc(alert.id)}" class="p-2 rounded-full bg-red-100 text-[#C50000] hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" title="Eliminar mi reporte" aria-label="Eliminar mi reporte">🗑️</button>
                  ` : ''}
                </div>

              </div>

            </article>
          `;
        }).join('')}
      </div>

    </section>
  `;

  // Listeners de filtros
  container.querySelectorAll('[data-alert-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.setAlertFilter(btn.getAttribute('data-alert-filter'));
      renderAlertsFeed(containerId);
    });
  });

  // Abrir Ficha Flyer
  container.querySelectorAll('[data-open-flyer]').forEach(el => {
    el.addEventListener('click', () => {
      const alertId = el.getAttribute('data-open-flyer');
      const alert = Store.state.alerts.find(a => a.id === alertId);
      if (alert) openAlertDetailModal(alert);
    });
  });

  wireImageFallbacks(container);

  // Iniciar Chat de Rescate (la sala queda asociada al contacto real del publicador)
  container.querySelectorAll('[data-start-rescue-chat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const alertTitle = btn.getAttribute('data-alert-title');
      Store.createOrOpenRescueChat(
        `Rescate: ${alertTitle}`,
        `Hola, me comunico sobre la alerta: "${alertTitle}". Puedo colaborar.`,
        btn.getAttribute('data-recipient') || null
      );
    });
  });

  // Editar reporte propio (antes no existía ninguna pantalla para editar)
  container.querySelectorAll('[data-edit-alert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const alert = Store.state.alerts.find(a => a.id === btn.getAttribute('data-edit-alert'));
      if (alert) openAlertEditModal(alert, { trigger: btn, onSaved: () => renderAlertsFeed(containerId) });
    });
  });

  // Marcar como resuelto
  container.querySelectorAll('[data-toggle-resolved]').forEach(btn => {
    btn.addEventListener('click', () => {
      const alertId = btn.getAttribute('data-toggle-resolved');
      Store.markAlertResolved(alertId);
      renderAlertsFeed(containerId);
    });
  });

  // Eliminar alerta
  container.querySelectorAll('[data-delete-alert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const alertId = btn.getAttribute('data-delete-alert');
      Modal.open({
        title: '¿Eliminar este reporte?',
        content: `
          <div class="space-y-4">
            <p class="text-xs text-[#4A4A4A]">¿Estás seguro de que deseas retirar este reporte del feed público?</p>
            <div class="flex items-center justify-end gap-2">
              <button id="btn-cancel-del-alert" type="button" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button id="btn-confirm-del-alert" type="button" class="px-5 py-2 rounded-full text-xs font-bold text-white force-text-white bg-[#C50000] hover:bg-red-800">Eliminar</button>
            </div>
          </div>
        `,
        onMount: (panel) => {
          panel.querySelector('#btn-cancel-del-alert').onclick = () => Modal.close();
          panel.querySelector('#btn-confirm-del-alert').onclick = () => {
            Modal.close();
            Store.deleteAlert(alertId);
            renderAlertsFeed(containerId);
          };
        }
      });
    });
  });
}

/**
 * Formulario Modular en Pasos (Wizard) para Reportar Animal Perdido o Herido
 */
export function renderReportForm(containerId = 'view-reportar') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = Store.state.user;

  // Estado del Wizard
  let currentStep = 1; // 1: Tipo & Urgencia, 2: Fotos & Descripción, 3: Fecha/Hora, Ubicación & Contacto, 4: Revisión / Flyer
  let reportData = {
    type: 'HERIDO', // HERIDO | PERDIDO | AVISTADO
    urgencyLevel: 'Urgencia Vital (Atropellado / Hemorragia)',
    animalType: 'Perro',
    title: '',
    description: '',
    attachedImages: [], // fotos reales elegidas por el usuario (data URLs reducidas)
    dateTime: toLocalInputValue(), // hora local (toISOString usa UTC y adelantaba/atrasaba la hora)
    location: '',
    phone: user.isAuthenticated ? user.phone : ''
  };

  let publishedAlert = null;

  // Campos inválidos del paso actual (se llenan al intentar avanzar y se vacían al cambiar de paso)
  let invalid = new Set();
  const FIELD_RULES = {
    title:    { id: 'step-title-input',    ok: () => reportData.title.trim().length > 0 },
    description: { id: 'step-desc-input',  ok: () => reportData.description.trim().length > 0 },
    // Fecha válida y no futura (con 5 min de margen por el reloj del dispositivo)
    dateTime: { id: 'step-datetime-input', ok: () => {
      const when = new Date(reportData.dateTime);
      return !!reportData.dateTime && !isNaN(when) && when.getTime() <= Date.now() + 5 * 60000;
    } },
    // Barrios Y calles reales de Río Cuarto (antes rechazaba direcciones como "Sarmiento 450")
    location: { id: 'step-loc-input',      ok: () => isRecognizedLocation(reportData.location.trim()) },
    phone:    { id: 'step-phone-input',    ok: () => isValidPhone(reportData.phone.trim()) }
  };
  const STEP_FIELDS = { 2: ['title', 'description'], 3: ['dateTime', 'location', 'phone'] };
  const FIELD_TOASTS = {
    title: { title: 'Campos requeridos', message: 'Completá el título y la descripción del reporte.' },
    description: { title: 'Campos requeridos', message: 'Completá el título y la descripción del reporte.' },
    dateTime: { title: 'Fecha inválida', message: 'Indicá una fecha y hora válidas (no pueden ser futuras).' },
    location: { title: 'Ubicación no encontrada', message: 'Indicá un barrio o calle reconocida de Río Cuarto.' },
    phone: { title: 'Teléfono inválido', message: 'Ingresá un teléfono de contacto válido (8 a 13 dígitos) para coordinar el auxilio.' }
  };
  const errAttrs = (key, errId) => `aria-invalid="${invalid.has(key)}" aria-describedby="${errId}"`;
  const errMsg = (key, errId, text) =>
    `<p id="${errId}" role="alert" class="${invalid.has(key) ? '' : 'hidden'} text-xs text-[#C50000] font-black mt-1">⚠️ ${text}</p>`;

  const renderWizard = () => {
    // Si ya fue publicado, mostrar la FICHA DE DIFUSIÓN COMUNITARIA (FLYER)
    if (publishedAlert) {
      renderPublishedFlyer();
      return;
    }

    container.innerHTML = `
      <section class="max-w-2xl mx-auto px-4 py-10" aria-labelledby="wizard-report-h">
        <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 space-y-6">
          
          <!-- Cabecera del Asistente -->
          <div class="space-y-2 border-b border-gray-100 pb-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#C50000] text-xs font-black uppercase">
              <span>ALERTA COMUNITARIA RÍO CUARTO</span>
            </div>
            <h1 id="wizard-report-h" class="text-2xl sm:text-3xl font-black text-black">
              ${user.isAuthenticated ? 'Nuevo Reporte en Vía Pública' : 'Reportar sin Cuenta (Emergencia)'}
            </h1>
            <p class="text-xs text-[#4A4A4A]">Asistente guiado en 4 pasos para alertar a la red y veterinarias de Río Cuarto</p>
          </div>

          <!-- Barra de Progreso de 4 Pasos -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-[#4A4A4A]">
              <span class="${currentStep >= 1 ? 'text-[#C50000]' : ''}">1. Situación</span>
              <span class="${currentStep >= 2 ? 'text-[#C50000]' : ''}">2. Fotos & Detalle</span>
              <span class="${currentStep >= 3 ? 'text-[#C50000]' : ''}">3. Ubicación & Hora</span>
              <span class="${currentStep >= 4 ? 'text-[#C50000]' : ''}">4. Revisión</span>
            </div>
            <div class="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div class="bg-[#C50000] h-full transition-all duration-300" style="width: ${(currentStep / 4) * 100}%"></div>
            </div>
          </div>

          <!-- CONTENIDO DINÁMICO SEGÚN EL PASO -->
          <div id="wizard-step-content" class="pt-2">
            ${renderStepBody()}
          </div>

        </div>
      </section>
    `;

    attachWizardListeners();
  };

  const renderStepBody = () => {
    switch (currentStep) {
      case 1:
        return `
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Tipo de Situación en la Vía Pública *</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                <button type="button" data-select-type="HERIDO" class="py-4 px-4 rounded-2xl font-black text-sm text-center border-2 transition-all ${reportData.type === 'HERIDO' ? 'border-[#C50000] bg-red-50 text-[#C50000] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400'}">
                  🚨 ANIMAL HERIDO
                  <span class="block text-[11px] font-normal mt-1">Atropellado, herido o en riesgo vital</span>
                </button>
                <button type="button" data-select-type="PERDIDO" class="py-4 px-4 rounded-2xl font-black text-sm text-center border-2 transition-all ${reportData.type === 'PERDIDO' ? 'border-[#E0A800] bg-amber-50 text-black shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400'}">
                  ⚠️ ANIMAL PERDIDO / EXTRAVIADO
                  <span class="block text-[11px] font-normal mt-1">Mascota con collar o desorientada</span>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label for="wizard-urgency" class="block text-xs font-bold text-[#4A4A4A]">Nivel de Urgencia / Estado de Salud *</label>
              <select id="wizard-urgency" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black">
                <option value="Urgencia Vital (Atropellado / Hemorragia)" ${reportData.urgencyLevel.includes('Vital') ? 'selected' : ''}>🚨 Urgencia Vital (Atropellado / Hemorragia / No camina)</option>
                <option value="Atención Médica Necesaria (Renguera / Desnutrición)" ${reportData.urgencyLevel.includes('Médica') ? 'selected' : ''}>⚠️ Atención Médica Necesaria (Renguea / Desnutrido / Enfermo)</option>
                <option value="Desorientado / Sin Heridas Visibles" ${reportData.urgencyLevel.includes('Desorientado') ? 'selected' : ''}>🟡 Desorientado / Sin Heridas Visibles</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Especie *</label>
              <div class="flex items-center gap-3">
                <button type="button" data-select-specie="Perro" class="flex-1 py-3 px-4 rounded-xl font-bold text-xs border transition-all ${reportData.animalType === 'Perro' ? 'bg-[#E0A800] text-black border-[#E0A800]' : 'border-gray-300 hover:border-gray-400'}">
                  🐕 Perro
                </button>
                <button type="button" data-select-specie="Gato" class="flex-1 py-3 px-4 rounded-xl font-bold text-xs border transition-all ${reportData.animalType === 'Gato' ? 'bg-[#E0A800] text-black border-[#E0A800]' : 'border-gray-300 hover:border-gray-400'}">
                  🐈 Gato
                </button>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button type="button" id="btn-next-step" class="py-3.5 px-8 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] active:scale-95 shadow-md">
                Siguiente Paso ➔
              </button>
            </div>
          </div>
        `;

      case 2:
        return `
          <div class="space-y-6">
            <div class="space-y-1">
              <label for="step-title-input" class="block text-xs font-bold text-[#4A4A4A]">Título Breve del Aviso *</label>
              <input type="text" id="step-title-input" ${errAttrs('title','err-step-title')} value="${esc(reportData.title)}" required placeholder="Ej. Perro atropellado cerca del Puente Colgante" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              ${errMsg('title','err-step-title','Ingresá un título breve para el aviso.')}
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Fotografías del Animal (para difusión rápida)</label>
              <div class="flex flex-wrap items-center gap-3">
                ${reportData.attachedImages.map((imgUrl, idx) => `
                  <div class="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-300 shadow-sm group">
                    <img src="${imgUrl}" alt="Adjunto ${idx + 1}" class="w-full h-full object-cover" />
                    <button type="button" data-remove-img="${idx}" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white force-text-white flex items-center justify-center text-xs hover:bg-[#C50000]" title="Eliminar foto">
                      ✕
                    </button>
                  </div>
                `).join('')}

                <label class="${reportData.attachedImages.length >= MAX_REPORT_PHOTOS ? 'hidden' : ''} w-20 h-20 rounded-2xl border-2 border-dashed focus-within:ring-2 focus-within:ring-black border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E0A800] text-gray-600 hover:text-black">
                  <span class="text-2xl">📷</span>
                  <span class="text-[10px] font-bold mt-1">+ Foto</span>
                  <input type="file" accept="image/*" multiple id="wizard-file-input" class="sr-only" />
                </label>
              </div>
            </div>

            <div class="space-y-1">
              <label for="step-desc-input" class="block text-xs font-bold text-[#4A4A4A]">Descripción del Estado y Señas Particulares *</label>
              <textarea id="step-desc-input" ${errAttrs('description','err-step-desc')} rows="4" required placeholder="Color de pelaje, si tiene collar, si renguea, si está al resguardo de algún vecino..." class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black">${esc(reportData.description)}</textarea>
              ${errMsg('description','err-step-desc','Describí el estado del animal y sus señas.')}
            </div>

            <div class="pt-4 flex items-center justify-between">
              <button type="button" id="btn-prev-step" class="py-3 px-6 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-black">
                ⬅ Anterior
              </button>
              <button type="button" id="btn-next-step" class="py-3.5 px-8 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] active:scale-95 shadow-md">
                Siguiente Paso ➔
              </button>
            </div>
          </div>
        `;

      case 3:
        return `
          <div class="space-y-6">
            <div class="space-y-1">
              <label for="step-datetime-input" class="block text-xs font-bold text-[#4A4A4A]">Fecha y Hora del Avistamiento *</label>
              <input type="datetime-local" id="step-datetime-input" ${errAttrs('dateTime','err-step-datetime')} value="${esc(reportData.dateTime)}" max="${esc(toLocalInputValue())}" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              ${errMsg('dateTime','err-step-datetime','Indicá una fecha y hora válidas (no pueden ser futuras).')}
            </div>

            <div class="space-y-1">
              <label for="step-loc-input" class="block text-xs font-bold text-[#4A4A4A]">Ubicación en Río Cuarto (Barrio y Calle) *</label>
              <div class="relative">
                <input
                  type="text"
                  id="step-loc-input"
                  ${errAttrs('location','err-step-loc')}
                  list="barrios-wizard-list"
                  value="${esc(reportData.location)}"
                  placeholder="Ej. Banda Norte, calle Marcelo T. de Alvear al 500"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black"
                />
                <datalist id="barrios-wizard-list">
                  ${BARRIOS_RIO_CUARTO.map(b => `<option value="${b}">`).join('')}
                </datalist>
              </div>
              ${errMsg('location','err-step-loc','Ingresá un barrio o calle reconocida de Río Cuarto.')}
            </div>

            <div class="space-y-1">
              <label for="step-phone-input" class="block text-xs font-bold text-[#4A4A4A]">Teléfono de Contacto de Emergencia *</label>
              <input type="tel" id="step-phone-input" ${errAttrs('phone','err-step-phone')} value="${esc(reportData.phone)}" required placeholder="Ej. 0358 154-123456" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              ${errMsg('phone','err-step-phone','Ingresá un teléfono válido (8 a 13 dígitos).')}
            </div>

            <div class="pt-4 flex items-center justify-between">
              <button type="button" id="btn-prev-step" class="py-3 px-6 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-black">
                ⬅ Anterior
              </button>
              <button type="button" id="btn-next-step" class="py-3.5 px-8 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] active:scale-95 shadow-md">
                Revisar Alerta ➔
              </button>
            </div>
          </div>
        `;

      case 4:
        return `
          <div class="space-y-6">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              ℹ️ Verificá los datos antes de publicar. Al confirmar, se creará el flyer oficial para WhatsApp y se ubicará el pin en el mapa de Río Cuarto.
            </div>

            <div class="p-5 rounded-3xl border-2 ${reportData.type === 'HERIDO' ? 'border-[#C50000] bg-red-50/30' : 'border-[#E0A800] bg-amber-50/30'} space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase text-white force-text-white ${reportData.type === 'HERIDO' ? 'bg-[#C50000]' : 'bg-[#E0A800] text-black'}">
                  ${esc(reportData.type)} · ${esc(reportData.animalType)}
                </span>
                <span class="text-xs text-gray-600 font-semibold">${esc(formatDateTime(reportData.dateTime))}</span>
              </div>

              <h3 class="text-lg font-black text-black">${esc(reportData.title || 'Alerta Comunitaria')}</h3>
              <p class="text-xs text-[#4A4A4A] leading-relaxed">${esc(reportData.description || 'Sin descripción')}</p>

              <div class="text-xs font-bold text-black pt-2 border-t border-gray-200 space-y-1">
                <p>📍 Ubicación: <span class="font-normal text-[#4A4A4A]">${esc(reportData.location)}</span></p>
                <p>🚨 Urgencia: <span class="font-normal text-[#4A4A4A]">${esc(reportData.urgencyLevel)}</span></p>
                <p>📞 Contacto: <span class="font-normal text-[#4A4A4A]">${esc(reportData.phone)}</span></p>
              </div>
            </div>

            <div class="pt-4 flex items-center justify-between">
              <button type="button" id="btn-prev-step" class="py-3 px-6 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-black">
                ⬅ Modificar Datos
              </button>
              <button type="button" id="btn-submit-report" class="py-4 px-8 rounded-full font-black text-sm uppercase text-white force-text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-xl transition-all">
                🚨 Publicar Alerta Inmediatamente
              </button>
            </div>
          </div>
        `;
    }
  };

  const attachWizardListeners = () => {
    // Paso 1 Listeners
    container.querySelectorAll('[data-select-type]').forEach(btn => {
      btn.onclick = () => {
        reportData.type = btn.getAttribute('data-select-type');
        renderWizard();
      };
    });

    container.querySelectorAll('[data-select-specie]').forEach(btn => {
      btn.onclick = () => {
        reportData.animalType = btn.getAttribute('data-select-specie');
        renderWizard();
      };
    });

    const urgencySel = document.getElementById('wizard-urgency');
    if (urgencySel) {
      urgencySel.onchange = (e) => { reportData.urgencyLevel = e.target.value; };
    }

    // Actualiza el marcado de un campo mientras se escribe (solo si ya fue marcado como inválido)
    const syncField = (key) => {
      if (!invalid.has(key)) return;
      const rule = FIELD_RULES[key];
      const el = document.getElementById(rule.id);
      const errEl = document.getElementById(el ? el.getAttribute('aria-describedby') : '');
      if (rule.ok()) {
        invalid.delete(key);
        if (el) el.setAttribute('aria-invalid', 'false');
        if (errEl) errEl.classList.add('hidden');
      }
    };

    // Paso 2 Listeners
    const titleInput = document.getElementById('step-title-input');
    if (titleInput) {
      titleInput.oninput = (e) => { reportData.title = e.target.value; syncField('title'); };
    }
    const descInput = document.getElementById('step-desc-input');
    if (descInput) {
      descInput.oninput = (e) => { reportData.description = e.target.value; syncField('description'); };
    }
    const fileInput = document.getElementById('wizard-file-input');
    if (fileInput) {
      fileInput.onchange = async () => {
        const files = Array.from(fileInput.files || []);
        if (!files.length) return;
        const room = MAX_REPORT_PHOTOS - reportData.attachedImages.length;
        if (room <= 0) {
          Store.notify('toast', { type: 'error', title: 'Máximo de fotos', message: `Podés adjuntar hasta ${MAX_REPORT_PHOTOS} fotos.` });
          fileInput.value = '';
          return;
        }
        const { images, errors } = await filesToDataURLs(
          files.slice(0, room),
          { maxSize: 800, quality: 0.75, maxPhotos: MAX_REPORT_PHOTOS },
          room
        );
        reportData.attachedImages.push(...images);
        if (files.length > room) errors.push(`Solo se pueden adjuntar ${MAX_REPORT_PHOTOS} fotos por reporte.`);
        renderWizard();
        if (errors.length) {
          Store.notify('toast', { type: 'error', title: 'Algunas fotos no se cargaron', message: errors.join(' ') });
        }
      };
    }
    container.querySelectorAll('[data-remove-img]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-remove-img'), 10);
        reportData.attachedImages.splice(idx, 1);
        renderWizard();
      };
    });

    // Paso 3 Listeners
    const dtInput = document.getElementById('step-datetime-input');
    if (dtInput) {
      dtInput.oninput = (e) => { reportData.dateTime = e.target.value; syncField('dateTime'); };
    }
    const locInput = document.getElementById('step-loc-input');
    if (locInput) {
      locInput.oninput = (e) => { reportData.location = e.target.value; syncField('location'); };
    }
    const phoneInput = document.getElementById('step-phone-input');
    if (phoneInput) {
      phoneInput.oninput = (e) => { reportData.phone = e.target.value; syncField('phone'); };
    }

    // Navegación Anterior / Siguiente
    const nextBtn = document.getElementById('btn-next-step');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const fields = STEP_FIELDS[currentStep] || [];
        const bad = fields.filter(k => !FIELD_RULES[k].ok());
        if (bad.length) {
          invalid = new Set(bad);
          renderWizard(); // pinta en rojo cada campo faltante con su mensaje
          Store.notify('toast', { type: 'error', ...FIELD_TOASTS[bad[0]] });
          const first = document.getElementById(FIELD_RULES[bad[0]].id);
          if (first) first.focus();
          return;
        }
        invalid = new Set();
        currentStep++;
        renderWizard();
      };
    }

    const prevBtn = document.getElementById('btn-prev-step');
    if (prevBtn) {
      prevBtn.onclick = () => {
        invalid = new Set();
        currentStep--;
        renderWizard();
      };
    }

    // Publicación Final
    const submitBtn = document.getElementById('btn-submit-report');
    if (submitBtn) {
      submitBtn.onclick = () => {
        publishedAlert = Store.addAlert({
          type: reportData.type,
          title: reportData.title,
          animalType: reportData.animalType,
          location: reportData.location,
          coords: coordsForLocation(reportData.location),
          date: new Date(reportData.dateTime).toISOString(),
          description: reportData.description,
          image: reportData.attachedImages[0] || '',
          images: [...reportData.attachedImages],
          urgencyLevel: reportData.type === 'HERIDO' ? reportData.urgencyLevel : '',
          publisher: {
            isAnonymous: !user.isAuthenticated,
            id: user.isAuthenticated ? user.id : 'anon',
            name: user.isAuthenticated ? user.name : 'Usuario Anónimo',
            phone: reportData.phone,
            verified: user.isAuthenticated
          }
        });

        // Si no se pudo guardar el Store ya avisó: se mantiene el formulario con lo cargado
        if (!publishedAlert) return;
        renderWizard();
        // Confirmación de éxito en modal accesible; detrás queda la ficha de difusión
        openSuccessModal({
          title: '¡Alerta publicada!',
          message: `"${publishedAlert.title}" ya está visible en el feed y en el mapa de Río Cuarto. Ahora podés difundir la ficha por WhatsApp.`,
          icon: '🚨',
          actionLabel: 'Ver ficha de difusión'
        });
      };
    }
  };

  /**
   * Pantalla de Éxito: FICHA DE ALERTA COMUNITARIA AUTOGENERADA (FLYER)
   */
  const renderPublishedFlyer = () => {
    const isHerido = publishedAlert.type === 'HERIDO';
    const borderColor = isHerido ? 'border-4 border-[#C50000]' : 'border-4 border-[#E0A800]';
    const headerBg = isHerido ? 'bg-[#C50000] text-white' : 'bg-[#E0A800] text-black';

    const shareText = buildShareText(publishedAlert);

    container.innerHTML = `
      <section class="max-w-2xl mx-auto px-4 py-8 space-y-6" aria-labelledby="flyer-heading">
        
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-[#0C832A] text-3xl font-black flex items-center justify-center mx-auto border-2 border-[#0C832A]">
            ✓
          </div>
          <h1 id="flyer-heading" class="text-2xl sm:text-3xl font-black text-black">¡Alerta Publicada en la Red!</h1>
          <p class="text-xs text-[#4A4A4A]">Hemos generado la Ficha Comunitaria para difundir de inmediato en Río Cuarto</p>
        </div>

        <!-- TARJETA FLYER COMUNITARIO -->
        <div class="bg-white rounded-3xl overflow-hidden shadow-2xl ${borderColor}">
          
          <div class="${headerBg} p-4 sm:p-5 text-center font-black tracking-wider uppercase text-sm sm:text-base flex items-center justify-between">
            <span>🐾 ALERTA COMUNITARIA RÍO CUARTO</span>
            <span class="text-xs px-3 py-1 rounded-full bg-black/30 text-white">${esc(publishedAlert.type)}</span>
          </div>

          <div class="relative h-64 w-full bg-gray-100">
            <img src="${esc(publishedAlert.image || PLACEHOLDER_ANIMAL)}" alt="${esc(publishedAlert.title)}" class="w-full h-full object-cover" />
          </div>
          ${extraPhotosStrip(publishedAlert) ? `<div class="px-6 sm:px-8 pt-3">${extraPhotosStrip(publishedAlert)}</div>` : ''}

          <div class="p-6 sm:p-8 space-y-4">
            <h3 class="text-2xl font-black text-black leading-tight">${esc(publishedAlert.title)}</h3>
            
            <p class="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              ${esc(publishedAlert.description)}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold pt-2">
              <div class="p-3 rounded-xl bg-[#EBEBEB]">
                <span class="text-gray-600 block text-[10px] uppercase">Ubicación</span>
                <span class="text-black font-black">📍 ${esc(publishedAlert.location)}</span>
              </div>
              <div class="p-3 rounded-xl bg-[#EBEBEB]">
                <span class="text-gray-600 block text-[10px] uppercase">Teléfono de Auxilio</span>
                <span class="text-black font-black">📞 ${esc(publishedAlert.publisher.phone)}</span>
              </div>
            </div>

            <!-- Botones de Difusión Rápida -->
            <div class="space-y-3 pt-4 border-t border-gray-100">
              <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="
                w-full py-4 px-6 rounded-full font-black text-sm text-white force-text-white bg-[#0C832A] hover:bg-emerald-700 active:scale-95
                shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all
              ">
                <span class="text-lg">📲</span>
                <span>DIFUNDIR EN WHATSAPP (GRUPOS Y ESTADOS)</span>
              </a>

              <button id="btn-copy-flyer" type="button" class="
                w-full py-3.5 px-6 rounded-full font-bold text-xs text-black bg-[#EBEBEB] hover:bg-gray-300 active:scale-95
                border border-gray-300 flex items-center justify-center gap-2 transition-all
              ">
                <span>📋</span>
                <span>Copiar Texto de la Ficha para Redes</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Enlaces Secundarios -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a href="#/mapa" class="w-full sm:w-auto py-3 px-6 rounded-full text-center font-bold text-xs bg-[#E0A800] text-black hover:bg-[#c99700]">
            🗺️ Ver en el Mapa
          </a>
          <a href="#/alertas" class="w-full sm:w-auto py-3 px-6 rounded-full text-center font-bold text-xs bg-gray-100 text-black hover:bg-gray-200">
            📢 Ir al Feed de Alertas
          </a>
          <button id="btn-reset-wizard" type="button" class="w-full sm:w-auto py-3 px-6 rounded-full font-bold text-xs text-gray-600 hover:text-black">
            + Nuevo Reporte
          </button>
        </div>

      </section>
    `;

    document.getElementById('btn-copy-flyer').onclick = () => {
      const plainText = `🚨 ALERTA CALLEJEROS RÍO CUARTO 🚨\nSituación: ${publishedAlert.type}\nAviso: ${publishedAlert.title}\nUbicación: ${publishedAlert.location}\nContacto: ${publishedAlert.publisher.phone}\n${publishedAlert.description}`;
      navigator.clipboard.writeText(plainText).then(() => {
        Store.notify('toast', { type: 'success', title: '¡Ficha Copiada!', message: 'Texto copiado al portapapeles para difundir en Facebook o Instagram.' });
      }).catch(() => {
        Store.notify('toast', { type: 'info', title: 'Ficha Lista', message: 'Podés copiar el texto directamente en pantalla.' });
      });
    };

    document.getElementById('btn-reset-wizard').onclick = () => {
      publishedAlert = null;
      invalid = new Set();
      currentStep = 1;
      renderWizard();
    };
  };

  renderWizard();
}

/**
 * Modal Completo de la Ficha de Alerta (Flyer) para abrir desde el feed o mapa
 */
export function openAlertDetailModal(alert) {
  const isHerido = alert.type === 'HERIDO';
  const isRescued = alert.status === 'rescued';
  let badgeColor = isHerido ? 'bg-[#C50000] text-white' : 'bg-[#E0A800] text-black';
  if (isRescued) badgeColor = 'bg-[#0C832A] text-white';

  const shareText = buildShareText(alert);

  Modal.open({
    title: `Ficha Oficial: ${alert.title}`,
    content: `
      <div class="space-y-4">
        
        <div class="relative h-60 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
          <img src="${esc(alert.image || PLACEHOLDER_ANIMAL)}" alt="${esc(alert.title)}" class="w-full h-full object-cover" />
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase ${badgeColor} shadow">
            ${isRescued ? '✓ CASO RESUELTO' : alert.type}
          </span>
          <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/75 text-white">
            🕒 ${esc(timeAgo(alert.date, alert.timestamp))}
          </span>
        </div>
        ${extraPhotosStrip(alert)}
        ${alert.urgencyLevel ? `<p class="text-xs font-bold text-[#C50000] bg-red-50 border border-red-200 rounded-xl px-3 py-2">⚠️ ${esc(alert.urgencyLevel)}</p>` : ''}

        <div class="space-y-2">
          <h4 class="text-xl font-black text-black leading-snug">${esc(alert.title)}</h4>
          <p class="text-xs text-[#4A4A4A] leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            ${esc(alert.description)}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs font-bold">
          <div class="p-2.5 rounded-xl bg-[#EBEBEB]">
            <span class="text-gray-600 block text-[10px] uppercase">Ubicación</span>
            <span class="text-black">📍 ${esc(alert.location)}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-[#EBEBEB]">
            <span class="text-gray-600 block text-[10px] uppercase">Contacto</span>
            <span class="text-black">📞 ${esc(alert.publisher?.phone || 'No disponible')}</span>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100">
          <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="
            w-full py-3 px-4 rounded-full font-black text-xs text-white force-text-white bg-[#0C832A] hover:bg-emerald-700 active:scale-95
            flex items-center justify-center gap-2 shadow transition-all
          ">
            <span>📲 Compartir por WhatsApp</span>
          </a>

          ${(!alert.publisher?.isAnonymous && Store.canEditAlert(alert)) ? `
            <button id="btn-modal-edit" type="button" class="
              w-full py-3 px-4 rounded-full font-black text-xs text-black bg-sky-100 hover:bg-sky-200 active:scale-95
              flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
            ">
              <span>✏️ Editar mi reporte</span>
            </button>
          ` : !alert.publisher?.isAnonymous ? `
            <button id="btn-modal-start-chat" type="button" class="
              w-full py-3 px-4 rounded-full font-black text-xs text-black bg-[#98D7FF] hover:bg-sky-300 active:scale-95
              flex items-center justify-center gap-2 transition-all
            ">
              <span>💬 Iniciar Chat con el Reportante</span>
            </button>
          ` : `
            <a href="tel:${esc(alert.publisher?.phone)}" class="
              w-full py-3 px-4 rounded-full font-black text-xs text-white force-text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95
              flex items-center justify-center gap-2 text-center transition-all
            ">
              📞 Llamar de Urgencia
            </a>
          `}
        </div>

      </div>
    `,
    onMount: (panel) => {
      wireImageFallbacks(panel);
      const editBtn = panel.querySelector('#btn-modal-edit');
      if (editBtn) {
        editBtn.onclick = () => {
          Modal.close();
          setTimeout(() => openAlertEditModal(alert), 260);
        };
      }
      const chatBtn = panel.querySelector('#btn-modal-start-chat');
      if (chatBtn) {
        chatBtn.onclick = () => {
          Modal.close();
          Store.createOrOpenRescueChat(`Rescate: ${alert.title}`, `Hola, me comunico sobre la alerta: "${alert.title}".`, Store.resolveContactId(alert.publisher?.id));
        };
      }
    }
  });
}


/**
 * Modal de edición de un reporte propio (el Store tenía updateAlert pero no existía ninguna pantalla para usarlo).
 */
export function openAlertEditModal(alert, { trigger = null, onSaved = null } = {}) {
  if (!Store.canEditAlert(alert)) {
    Store.notify('toast', { type: 'error', title: 'Sin permiso', message: 'Solo podés editar los reportes que publicaste con tu cuenta.' });
    return;
  }
  const draft = { images: alertPhotos(alert).filter(src => !String(src).startsWith('data:image/svg+xml')) };
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]';

  Modal.open({
    title: 'Editar mi reporte',
    trigger,
    content: `
      <form id="form-edit-alert" class="space-y-4" novalidate>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="edit-alert-type" class="block text-xs font-bold text-[#4A4A4A]">Situación</label>
            <select id="edit-alert-type" class="${inputCls}">
              <option value="HERIDO" ${alert.type === 'HERIDO' ? 'selected' : ''}>🚨 Herido</option>
              <option value="PERDIDO" ${alert.type === 'PERDIDO' ? 'selected' : ''}>⚠️ Perdido</option>
            </select>
          </div>
          <div class="space-y-1">
            <label for="edit-alert-animal" class="block text-xs font-bold text-[#4A4A4A]">Especie</label>
            <select id="edit-alert-animal" class="${inputCls}">
              <option value="Perro" ${alert.animalType === 'Perro' ? 'selected' : ''}>🐕 Perro</option>
              <option value="Gato" ${alert.animalType === 'Gato' ? 'selected' : ''}>🐈 Gato</option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label for="edit-alert-title" class="block text-xs font-bold text-[#4A4A4A]">Título *</label>
          <input type="text" id="edit-alert-title" maxlength="90" value="${esc(alert.title)}" class="${inputCls}" />
          <p id="err-edit-alert-title" role="alert" class="hidden text-xs text-[#C50000] font-bold"></p>
        </div>

        <div class="space-y-1">
          <label for="edit-alert-desc" class="block text-xs font-bold text-[#4A4A4A]">Descripción *</label>
          <textarea id="edit-alert-desc" rows="3" maxlength="600" class="${inputCls}">${esc(alert.description)}</textarea>
          <p id="err-edit-alert-desc" role="alert" class="hidden text-xs text-[#C50000] font-bold"></p>
        </div>

        <div class="space-y-1">
          <label for="edit-alert-loc" class="block text-xs font-bold text-[#4A4A4A]">Ubicación en Río Cuarto *</label>
          <input type="text" id="edit-alert-loc" list="barrios-edit-list" value="${esc(alert.location)}" class="${inputCls}" />
          <datalist id="barrios-edit-list">${BARRIOS_RIO_CUARTO.map(b => `<option value="${esc(b)}">`).join('')}</datalist>
          <p id="err-edit-alert-loc" role="alert" class="hidden text-xs text-[#C50000] font-bold"></p>
        </div>

        <div class="space-y-1">
          <label for="edit-alert-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono de contacto *</label>
          <input type="tel" id="edit-alert-phone" value="${esc(alert.publisher?.phone || '')}" class="${inputCls}" />
          <p id="err-edit-alert-phone" role="alert" class="hidden text-xs text-[#C50000] font-bold"></p>
        </div>

        <div class="space-y-1">
          <span class="block text-xs font-bold text-[#4A4A4A]">Fotos</span>
          <div id="edit-photo-host"></div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button id="btn-cancel-edit-alert" type="button" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Cancelar</button>
          <button type="submit" class="px-5 py-2 rounded-full text-xs font-black bg-[#E0A800] text-black hover:bg-[#c99700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Guardar cambios</button>
        </div>
      </form>
    `,
    onMount: (panel) => {
      mountPhotoField(panel.querySelector('#edit-photo-host'), draft.images, { max: MAX_REPORT_PHOTOS, inputId: 'edit-alert-file' });
      panel.querySelector('#btn-cancel-edit-alert').onclick = () => Modal.close();

      panel.querySelector('#form-edit-alert').addEventListener('submit', (e) => {
        e.preventDefault();
        const titleEl = panel.querySelector('#edit-alert-title');
        const descEl = panel.querySelector('#edit-alert-desc');
        const locEl = panel.querySelector('#edit-alert-loc');
        const phoneEl = panel.querySelector('#edit-alert-phone');
        const title = titleEl.value.trim();
        const description = descEl.value.trim();
        const location = locEl.value.trim();
        const phone = phoneEl.value.trim();

        const titleOk = title.length >= 5;
        const descOk = description.length >= 10;
        const locOk = isRecognizedLocation(location);
        const phoneOk = isValidPhone(phone);
        fieldError(titleEl, panel.querySelector('#err-edit-alert-title'), titleOk ? '' : 'Escribí un título de al menos 5 caracteres.');
        fieldError(descEl, panel.querySelector('#err-edit-alert-desc'), descOk ? '' : 'La descripción debe tener al menos 10 caracteres.');
        fieldError(locEl, panel.querySelector('#err-edit-alert-loc'), locOk ? '' : 'Dirección no encontrada. Ingresá un barrio o calle de Río Cuarto.');
        fieldError(phoneEl, panel.querySelector('#err-edit-alert-phone'), phoneOk ? '' : 'Ingresá un teléfono válido (8 a 13 dígitos).');
        if (!(titleOk && descOk && locOk && phoneOk)) return;

        const locationChanged = normalizeText(location) !== normalizeText(alert.location);
        const ok = Store.updateAlert(alert.id, {
          type: panel.querySelector('#edit-alert-type').value,
          animalType: panel.querySelector('#edit-alert-animal').value,
          title,
          description,
          location,
          coords: locationChanged ? coordsForLocation(location) : alert.coords,
          image: draft.images[0] || '',
          images: [...draft.images],
          publisher: { phone }
        });
        if (ok) {
          Modal.close();
          if (onSaved) onSaved();
          else window.dispatchEvent(new HashChangeEvent('hashchange')); // refresca la pantalla actual (feed o mapa)
        }
      });
    }
  });
}
