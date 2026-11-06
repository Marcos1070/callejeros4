/**
 * Alerts Component - Módulo de Reportes y Alertas en Vía Pública
 * Implementa Wizard en 4 pasos, Ficha de Difusión Comunitaria (Flyer) con WhatsApp y Feed
 */

import { Store } from '../store.js';
import { BARRIOS_RIO_CUARTO } from '../data.js';
import { Modal } from './modal.js';

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
          <h2 id="alerts-feed-heading" class="text-3xl font-black text-black tracking-tight">
            🚨 Alertas en Vía Pública
          </h2>
          <p class="text-xs text-[#4A4A4A] mt-1">Avisos urgentes de mascotas perdidas, heridas o avistadas en Río Cuarto</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Pestañas de Filtro Semánticas -->
          <div class="bg-gray-200 p-1 rounded-full flex items-center gap-1" role="tablist">
            <button type="button" data-alert-filter="TODOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'TODOS' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              TODOS
            </button>
            <button type="button" data-alert-filter="PERDIDOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'PERDIDOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              PERDIDOS
            </button>
            <button type="button" data-alert-filter="HERIDOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'HERIDOS' ? 'bg-[#C50000] text-white shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              HERIDOS
            </button>
            <button type="button" data-alert-filter="RESCATADOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'RESCATADOS' ? 'bg-[#0C832A] text-white shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              ✓ RESUELTOS
            </button>
          </div>

          <a href="#/reportar" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-md transition-all">
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
          const isOwner = user.isAuthenticated && alert.publisher?.id === user.id;

          return `
            <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${borderColor}">
              
              <div>
                <!-- Imagen con Badge de Peligro y Fecha/Hora -->
                <div class="relative h-48 w-full bg-gray-100 overflow-hidden cursor-pointer" data-open-flyer="${alert.id}">
                  <img src="${alert.image}" alt="${alert.title}" class="w-full h-full object-cover pet-img-cover hover:scale-105 transition-transform duration-300" />
                  <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeBg} shadow">
                    ${isRescued ? '✓ CASO RESUELTO' : alert.type}
                  </span>
                  <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/75 text-white backdrop-blur-sm">
                    🕒 ${alert.timestamp || 'Reciente'}
                  </span>
                </div>

                <!-- Contenido Informativo -->
                <div class="p-5 space-y-3">
                  <h3 class="font-black text-lg text-black leading-snug cursor-pointer hover:text-[#E0A800] transition-colors" data-open-flyer="${alert.id}">
                    ${alert.title}
                  </h3>
                  
                  <div class="flex items-center gap-1.5 text-xs text-[#4A4A4A] font-semibold">
                    <span>📍</span>
                    <span class="truncate">${alert.location}</span>
                  </div>

                  <p class="text-xs text-[#4A4A4A] leading-relaxed line-clamp-3">
                    ${alert.description}
                  </p>
                </div>
              </div>

              <!-- Pie de Tarjeta: Perfil del Publicador y Acciones -->
              <div class="p-5 pt-3 border-t border-gray-100 bg-gray-50/70 space-y-3">
                
                <div class="flex items-center justify-between text-xs">
                  ${alert.publisher?.isAnonymous ? `
                    <div class="flex items-center gap-2 text-gray-500">
                      <span class="text-lg">👤</span>
                      <div>
                        <span class="font-bold text-black block">Usuario Anónimo</span>
                        <span class="text-[10px] text-gray-400">Emergencia en vía pública</span>
                      </div>
                    </div>
                  ` : `
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-[#E0A800] text-black font-bold flex items-center justify-center text-xs">
                        ${(alert.publisher?.name || 'V').charAt(0)}
                      </div>
                      <div>
                        <span class="font-bold text-black block">${alert.publisher?.name || 'Vecino'}</span>
                        <span class="text-[10px] text-[#0C832A] font-semibold">✓ Rescatista Verificado</span>
                      </div>
                    </div>
                  `}

                  <button type="button" data-open-flyer="${alert.id}" class="text-xs font-bold text-[#E0A800] hover:underline flex items-center gap-1">
                    <span>Ver Flyer</span> ↗
                  </button>
                </div>

                <!-- Botones Contextuales: INICIAR CHAT vs LLAMAR -->
                <div class="flex items-center gap-2">
                  ${!alert.publisher?.isAnonymous ? `
                    <button type="button" data-start-rescue-chat="${alert.id}" data-alert-title="${alert.title}" class="
                      flex-1 py-2.5 px-4 rounded-full font-black text-xs text-black uppercase tracking-wider
                      bg-[#98D7FF] hover:bg-sky-300 active:scale-95 shadow-sm transition-all flex items-center justify-center gap-1.5
                    ">
                      <span>💬 Iniciar Chat</span>
                    </button>
                  ` : `
                    <a href="tel:${alert.publisher?.phone || '0358154123456'}" class="
                      flex-1 py-2.5 px-4 rounded-full font-black text-xs text-white uppercase tracking-wider
                      bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-sm transition-all text-center
                    ">
                      📞 Llamar al Reportante
                    </a>
                  `}

                  ${isOwner ? `
                    <button type="button" data-toggle-resolved="${alert.id}" class="p-2 rounded-full ${isRescued ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#0C832A]'} hover:opacity-80" title="${isRescued ? 'Reactivar Alerta' : 'Marcar como Rescatado'}">
                      ${isRescued ? '🔄' : '✓'}
                    </button>
                    <button type="button" data-delete-alert="${alert.id}" class="p-2 rounded-full bg-red-100 text-[#C50000] hover:bg-red-200" title="Eliminar mi reporte">🗑️</button>
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

  // Iniciar Chat de Rescate
  container.querySelectorAll('[data-start-rescue-chat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const alertTitle = btn.getAttribute('data-alert-title');
      Store.createOrOpenRescueChat(`Rescate: ${alertTitle}`, `Hola, me comunico sobre la alerta: "${alertTitle}". Puedo colaborar.`);
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
              <button id="btn-cancel-del-alert" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button id="btn-confirm-del-alert" class="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#C50000] hover:bg-red-800">Eliminar</button>
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
    attachedImages: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
    ],
    dateTime: new Date().toISOString().slice(0, 16),
    location: '',
    phone: user.isAuthenticated ? user.phone : ''
  };

  let publishedAlert = null;

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
            <h2 id="wizard-report-h" class="text-2xl sm:text-3xl font-black text-black">
              ${user.isAuthenticated ? 'Nuevo Reporte en Vía Pública' : 'Reportar sin Cuenta (Emergencia)'}
            </h2>
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
                <button type="button" data-select-type="HERIDO" class="py-4 px-4 rounded-2xl font-black text-sm text-center border-2 transition-all ${reportData.type === 'HERIDO' ? 'border-[#C50000] bg-red-50 text-[#C50000] shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-400'}">
                  🚨 ANIMAL HERIDO
                  <span class="block text-[11px] font-normal mt-1">Atropellado, herido o en riesgo vital</span>
                </button>
                <button type="button" data-select-type="PERDIDO" class="py-4 px-4 rounded-2xl font-black text-sm text-center border-2 transition-all ${reportData.type === 'PERDIDO' ? 'border-[#E0A800] bg-amber-50 text-black shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-400'}">
                  ⚠️ ANIMAL PERDIDO / EXTRAVIADO
                  <span class="block text-[11px] font-normal mt-1">Mascota con collar o desorientada</span>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Nivel de Urgencia / Estado de Salud *</label>
              <select id="wizard-urgency" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]">
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
              <input type="text" id="step-title-input" value="${reportData.title}" required placeholder="Ej. Perro atropellado cerca del Puente Colgante" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Fotografías del Animal (para difusión rápida)</label>
              <div class="flex flex-wrap items-center gap-3">
                ${reportData.attachedImages.map((imgUrl, idx) => `
                  <div class="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-300 shadow-sm group">
                    <img src="${imgUrl}" alt="Adjunto ${idx + 1}" class="w-full h-full object-cover" />
                    <button type="button" data-remove-img="${idx}" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center text-xs hover:bg-[#C50000]" title="Eliminar foto">
                      ✕
                    </button>
                  </div>
                `).join('')}

                <label class="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E0A800] text-gray-400 hover:text-black">
                  <span class="text-2xl">📷</span>
                  <span class="text-[10px] font-bold mt-1">+ Foto</span>
                  <input type="file" accept="image/*" id="wizard-file-input" class="hidden" />
                </label>
              </div>
            </div>

            <div class="space-y-1">
              <label for="step-desc-input" class="block text-xs font-bold text-[#4A4A4A]">Descripción del Estado y Señas Particulares *</label>
              <textarea id="step-desc-input" rows="4" required placeholder="Color de pelaje, si tiene collar, si renguea, si está al resguardo de algún vecino..." class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]">${reportData.description}</textarea>
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
              <input type="datetime-local" id="step-datetime-input" value="${reportData.dateTime}" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            </div>

            <div class="space-y-1">
              <label for="step-loc-input" class="block text-xs font-bold text-[#4A4A4A]">Ubicación en Río Cuarto (Barrio y Calle) *</label>
              <div class="relative">
                <input
                  type="text"
                  id="step-loc-input"
                  list="barrios-wizard-list"
                  value="${reportData.location}"
                  placeholder="Ej. Banda Norte, calle Marcelo T. de Alvear al 500"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]"
                />
                <datalist id="barrios-wizard-list">
                  ${BARRIOS_RIO_CUARTO.map(b => `<option value="${b}">`).join('')}
                </datalist>
              </div>
              <p id="err-step-loc" class="hidden text-xs text-[#C50000] font-black mt-1">
                ⚠️ Ingresá un barrio o calle reconocida de Río Cuarto.
              </p>
            </div>

            <div class="space-y-1">
              <label for="step-phone-input" class="block text-xs font-bold text-[#4A4A4A]">Teléfono de Contacto de Emergencia *</label>
              <input type="tel" id="step-phone-input" value="${reportData.phone}" required placeholder="Ej. 0358 154-123456" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
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
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase text-white ${reportData.type === 'HERIDO' ? 'bg-[#C50000]' : 'bg-[#E0A800] text-black'}">
                  ${reportData.type} · ${reportData.animalType}
                </span>
                <span class="text-xs text-gray-500 font-semibold">${reportData.dateTime}</span>
              </div>

              <h3 class="text-lg font-black text-black">${reportData.title || 'Alerta Comunitaria'}</h3>
              <p class="text-xs text-[#4A4A4A] leading-relaxed">${reportData.description || 'Sin descripción'}</p>

              <div class="text-xs font-bold text-black pt-2 border-t border-gray-200 space-y-1">
                <p>📍 Ubicación: <span class="font-normal text-[#4A4A4A]">${reportData.location}</span></p>
                <p>🚨 Urgencia: <span class="font-normal text-[#4A4A4A]">${reportData.urgencyLevel}</span></p>
                <p>📞 Contacto: <span class="font-normal text-[#4A4A4A]">${reportData.phone}</span></p>
              </div>
            </div>

            <div class="pt-4 flex items-center justify-between">
              <button type="button" id="btn-prev-step" class="py-3 px-6 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-black">
                ⬅ Modificar Datos
              </button>
              <button type="button" id="btn-submit-report" class="py-4 px-8 rounded-full font-black text-sm uppercase text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95 shadow-xl transition-all">
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

    // Paso 2 Listeners
    const titleInput = document.getElementById('step-title-input');
    if (titleInput) {
      titleInput.oninput = (e) => { reportData.title = e.target.value; };
    }
    const descInput = document.getElementById('step-desc-input');
    if (descInput) {
      descInput.oninput = (e) => { reportData.description = e.target.value; };
    }
    const fileInput = document.getElementById('wizard-file-input');
    if (fileInput) {
      fileInput.onchange = () => {
        reportData.attachedImages.push('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80');
        renderWizard();
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
      dtInput.oninput = (e) => { reportData.dateTime = e.target.value; };
    }
    const locInput = document.getElementById('step-loc-input');
    if (locInput) {
      locInput.oninput = (e) => { reportData.location = e.target.value; };
    }
    const phoneInput = document.getElementById('step-phone-input');
    if (phoneInput) {
      phoneInput.oninput = (e) => { reportData.phone = e.target.value; };
    }

    // Navegación Anterior / Siguiente
    const nextBtn = document.getElementById('btn-next-step');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentStep === 2) {
          if (!reportData.title.trim() || !reportData.description.trim()) {
            Store.notify('toast', { type: 'error', title: 'Campos requeridos', message: 'Completá el título y la descripción del reporte.' });
            return;
          }
        }
        if (currentStep === 3) {
          const loc = reportData.location.trim();
          const phone = reportData.phone.trim();
          const isValidLoc = loc.length >= 4 && (
            BARRIOS_RIO_CUARTO.some(b => loc.toLowerCase().includes(b.toLowerCase())) ||
            loc.toLowerCase().includes('calle') ||
            loc.toLowerCase().includes('alvear') ||
            loc.toLowerCase().includes('roca') ||
            loc.toLowerCase().includes('puente') ||
            loc.toLowerCase().includes('centro')
          );
          if (!isValidLoc) {
            const errLoc = document.getElementById('err-step-loc');
            if (errLoc) errLoc.classList.remove('hidden');
            Store.notify('toast', { type: 'error', title: 'Ubicación no encontrada', message: 'Indicá un barrio o calle reconocida de Río Cuarto.' });
            return;
          }
          if (!phone) {
            Store.notify('toast', { type: 'error', title: 'Teléfono requerido', message: 'Ingresá un teléfono de contacto para coordinar el auxilio.' });
            return;
          }
        }
        currentStep++;
        renderWizard();
      };
    }

    const prevBtn = document.getElementById('btn-prev-step');
    if (prevBtn) {
      prevBtn.onclick = () => {
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
          coords: [-33.1235 + (Math.random() - 0.5) * 0.02, -64.3490 + (Math.random() - 0.5) * 0.02],
          timestamp: 'Recién publicado',
          date: reportData.dateTime,
          description: reportData.description,
          image: reportData.attachedImages[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
          publisher: {
            isAnonymous: !user.isAuthenticated,
            id: user.isAuthenticated ? user.id : 'anon',
            name: user.isAuthenticated ? user.name : 'Usuario Anónimo',
            phone: reportData.phone,
            verified: user.isAuthenticated
          }
        });

        renderWizard();
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

    const shareText = `🚨 *ALERTA CALLEJEROS RÍO CUARTO* 🚨%0A%0A*Situación:* ${publishedAlert.type} (${publishedAlert.animalType})%0A*Aviso:* ${publishedAlert.title}%0A*Ubicación:* ${publishedAlert.location}%0A*Contacto:* ${publishedAlert.publisher.phone}%0A%0A👉 Ver alerta en mapa: ${window.location.origin}/#/mapa`;

    container.innerHTML = `
      <section class="max-w-2xl mx-auto px-4 py-8 space-y-6" aria-labelledby="flyer-heading">
        
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-[#0C832A] text-3xl font-black flex items-center justify-center mx-auto border-2 border-[#0C832A]">
            ✓
          </div>
          <h2 id="flyer-heading" class="text-2xl sm:text-3xl font-black text-black">¡Alerta Publicada en la Red!</h2>
          <p class="text-xs text-[#4A4A4A]">Hemos generado la Ficha Comunitaria para difundir de inmediato en Río Cuarto</p>
        </div>

        <!-- TARJETA FLYER COMUNITARIO -->
        <div class="bg-white rounded-3xl overflow-hidden shadow-2xl ${borderColor}">
          
          <div class="${headerBg} p-4 sm:p-5 text-center font-black tracking-wider uppercase text-sm sm:text-base flex items-center justify-between">
            <span>🐾 ALERTA COMUNITARIA RÍO CUARTO</span>
            <span class="text-xs px-3 py-1 rounded-full bg-black/30 text-white">${publishedAlert.type}</span>
          </div>

          <div class="relative h-64 w-full bg-gray-100">
            <img src="${publishedAlert.image}" alt="${publishedAlert.title}" class="w-full h-full object-cover" />
          </div>

          <div class="p-6 sm:p-8 space-y-4">
            <h3 class="text-2xl font-black text-black leading-tight">${publishedAlert.title}</h3>
            
            <p class="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              ${publishedAlert.description}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold pt-2">
              <div class="p-3 rounded-xl bg-[#EBEBEB]">
                <span class="text-gray-500 block text-[10px] uppercase">Ubicación</span>
                <span class="text-black font-black">📍 ${publishedAlert.location}</span>
              </div>
              <div class="p-3 rounded-xl bg-[#EBEBEB]">
                <span class="text-gray-500 block text-[10px] uppercase">Teléfono de Auxilio</span>
                <span class="text-black font-black">📞 ${publishedAlert.publisher.phone}</span>
              </div>
            </div>

            <!-- Botones de Difusión Rápida -->
            <div class="space-y-3 pt-4 border-t border-gray-100">
              <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="
                w-full py-4 px-6 rounded-full font-black text-sm text-white bg-[#0C832A] hover:bg-emerald-700 active:scale-95
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
          <button id="btn-reset-wizard" type="button" class="w-full sm:w-auto py-3 px-6 rounded-full font-bold text-xs text-gray-500 hover:text-black">
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

  const shareText = `🚨 *ALERTA CALLEJEROS RÍO CUARTO* 🚨%0A%0A*${alert.type}:* ${alert.title}%0A*Ubicación:* ${alert.location}%0A*Tel:* ${alert.publisher?.phone}%0A%0A👉 ${window.location.origin}/#/mapa`;

  Modal.open({
    title: `Ficha Oficial: ${alert.title}`,
    content: `
      <div class="space-y-4">
        
        <div class="relative h-60 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
          <img src="${alert.image}" alt="${alert.title}" class="w-full h-full object-cover" />
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase ${badgeColor} shadow">
            ${isRescued ? '✓ CASO RESUELTO' : alert.type}
          </span>
          <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/75 text-white">
            🕒 ${alert.timestamp || 'Reciente'}
          </span>
        </div>

        <div class="space-y-2">
          <h4 class="text-xl font-black text-black leading-snug">${alert.title}</h4>
          <p class="text-xs text-[#4A4A4A] leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            ${alert.description}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs font-bold">
          <div class="p-2.5 rounded-xl bg-[#EBEBEB]">
            <span class="text-gray-500 block text-[10px] uppercase">Ubicación</span>
            <span class="text-black">📍 ${alert.location}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-[#EBEBEB]">
            <span class="text-gray-500 block text-[10px] uppercase">Contacto</span>
            <span class="text-black">📞 ${alert.publisher?.phone || 'No disponible'}</span>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100">
          <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="
            w-full py-3 px-4 rounded-full font-black text-xs text-white bg-[#0C832A] hover:bg-emerald-700 active:scale-95
            flex items-center justify-center gap-2 shadow transition-all
          ">
            <span>📲 Compartir por WhatsApp</span>
          </a>

          ${!alert.publisher?.isAnonymous ? `
            <button id="btn-modal-start-chat" type="button" class="
              w-full py-3 px-4 rounded-full font-black text-xs text-black bg-[#98D7FF] hover:bg-sky-300 active:scale-95
              flex items-center justify-center gap-2 transition-all
            ">
              <span>💬 Iniciar Chat con el Reportante</span>
            </button>
          ` : `
            <a href="tel:${alert.publisher?.phone}" class="
              w-full py-3 px-4 rounded-full font-black text-xs text-white bg-[#C50000] hover:bg-[#a50000] active:scale-95
              flex items-center justify-center gap-2 text-center transition-all
            ">
              📞 Llamar de Urgencia
            </a>
          `}
        </div>

      </div>
    `,
    onMount: (panel) => {
      const chatBtn = panel.querySelector('#btn-modal-start-chat');
      if (chatBtn) {
        chatBtn.onclick = () => {
          Modal.close();
          Store.createOrOpenRescueChat(`Rescate: ${alert.title}`, `Hola, me comunico sobre la alerta: "${alert.title}".`);
        };
      }
    }
  });
}
