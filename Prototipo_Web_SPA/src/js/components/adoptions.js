/**
 * Adoptions Component - Módulo de Adopciones Responsables
 * Catálogo con filtros, Modal con carrusel de fotos, Ficha del publicador y Formulario con chips
 */

import { Store } from '../store.js';
import { Modal, openSuccessModal } from './modal.js';
import { esc, filesToDataURLs, PLACEHOLDER_ANIMAL, isValidPhone, isValidEmail, wireImageFallbacks } from '../utils.js';

export function renderAdoptionsCatalog(containerId = 'view-adopciones') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentFilter = Store.state.activeAdoptionFilter; // TODOS | PERROS | GATOS
  const user = Store.state.user;

  const f = Store.state.adoptionFilters;
  const all = Store.state.adoptions;
  const unique = (key) => [...new Set(all.map(p => p[key]).filter(Boolean))];
  const sel = (id, label, key, options) => `
    <div class="space-y-1">
      <label for="${id}" class="block text-[11px] font-bold text-[#4A4A4A] uppercase">${label}</label>
      <select id="${id}" data-adop-select="${key}" class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]">
        <option value="TODOS">Todos</option>
        ${options.map(o => `<option value="${esc(o)}" ${f[key] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}
      </select>
    </div>`;

  // Los casos ya concretados quedan al final del catálogo
  const pets = all
    .filter(pet =>
      (f.species === 'TODOS' || String(pet.type).toLowerCase() === f.species.toLowerCase()) &&
      (f.size === 'TODOS' || pet.size === f.size) &&
      (f.age === 'TODOS' || pet.age === f.age) &&
      (f.gender === 'TODOS' || pet.gender === f.gender) &&
      (f.zone === 'TODOS' || pet.zone === f.zone) &&
      (f.modality === 'TODOS' || pet.modality === f.modality))
    .sort((a, b) => Number(a.status === 'adopted') - Number(b.status === 'adopted'));
  const hasActiveFilters = Object.values(f).some(v => v !== 'TODOS');

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" aria-labelledby="adoptions-heading">
      
      <!-- Cabecera y Filtros -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 id="adoptions-heading" class="text-3xl font-black text-black tracking-tight">
            🐶 Adopciones Responsables en Río Cuarto
          </h1>
          <p class="text-xs text-[#4A4A4A] mt-1">Conocé a los perritos y gatitos rescatados que buscan un hogar definitivo</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 max-w-full">
          <!-- Pestañas de Filtro Rápido -->
          <div class="bg-gray-200 p-1 rounded-full flex items-center gap-1 max-w-full overflow-x-auto" role="tablist">
            <button type="button" data-adop-filter="TODOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'TODOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              TODOS
            </button>
            <button type="button" data-adop-filter="PERROS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'PERROS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              🐕 PERROS
            </button>
            <button type="button" data-adop-filter="GATOS" class="px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 rounded-full text-xs font-bold transition-all ${currentFilter === 'GATOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              🐈 GATOS
            </button>
          </div>

          <a href="#/publicar-adopcion" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black text-black bg-[#E0A800] hover:bg-[#c99700] shadow-md transition-all">
            <span>+ Dar en Adopción</span>
          </a>
        </div>
      </div>

      <!-- Filtros por criterio -->
      <div class="bg-white rounded-3xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
        ${sel('adop-f-size', 'Tamaño', 'size', unique('size'))}
        ${sel('adop-f-age', 'Edad', 'age', ['Cachorro', 'Adulto', 'Anciano'])}
        ${sel('adop-f-gender', 'Género', 'gender', ['Hembra', 'Macho'])}
        ${sel('adop-f-zone', 'Zona', 'zone', unique('zone'))}
        ${sel('adop-f-modality', 'Modalidad', 'modality', unique('modality'))}
        <button type="button" id="btn-clear-adop-filters" ${hasActiveFilters ? '' : 'disabled'} class="py-2 px-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
          Limpiar filtros
        </button>
      </div>

      ${pets.length === 0 ? `
        <div class="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8">
          <span class="text-4xl block mb-2" aria-hidden="true">🐾</span>
          <h3 class="text-lg font-black text-black">No encontramos mascotas con esos filtros</h3>
          <p class="text-xs text-[#4A4A4A] mt-1">Probá quitando algún criterio.</p>
        </div>` : ''}

      <!-- Grid de Mascotas en Adopción -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${pets.map(pet => {
          const isOwner = Store.canEditAdoption(pet);
          const isAdopted = pet.status === 'adopted';

          return `
            <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 flex flex-col justify-between transition-all group">
              <div>
                <!-- Imagen con Badges Tipo Chip -->
                <div class="relative h-56 w-full bg-gray-100 overflow-hidden cursor-pointer" data-open-pet-modal="${esc(pet.id)}">
                  <img src="${esc(pet.images?.[0] || PLACEHOLDER_ANIMAL)}" data-fallback="1" alt="${esc(pet.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isAdopted ? 'opacity-70' : ''}" />
                  ${isAdopted ? '<span class="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-[#0C832A] text-white force-text-white shadow">✓ ADOPTADA</span>' : ''}
                  <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-black shadow-sm">
                      ${pet.gender === 'Hembra' ? '♀ Hembra' : '♂ Macho'}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0A800] text-black shadow-sm">
                      ${esc(pet.age)}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black text-white force-text-white shadow-sm">
                      ${pet.type === 'Gato' ? '🐱 Gato' : '🐶 Perro'}
                    </span>
                  </div>
                </div>

                <!-- Info de Mascota -->
                <div class="p-5 space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="font-black text-xl text-black">${esc(pet.name)}</h3>
                    <span class="text-xs text-gray-600 font-medium">${esc(pet.ageText)}</span>
                  </div>
                  <p class="text-xs text-[#4A4A4A] flex items-center gap-1">
                    <span>📍</span>
                    <span>${esc(pet.location)}</span>
                  </p>
                  ${pet.publishedAt ? `<p class="text-xs text-[#4A4A4A] flex items-center gap-1"><span aria-hidden="true">📅</span><span>Publicado el <time datetime="${esc(pet.publishedAt)}">${esc(new Date(pet.publishedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }))}</time></span></p>` : ''}
                  <p class="text-xs text-[#4A4A4A] line-clamp-2 leading-relaxed pt-1">
                    ${esc(pet.story)}
                  </p>
                </div>
              </div>

              <!-- Acciones de Tarjeta -->
              <div class="p-5 pt-0 space-y-2">
                <button type="button" data-open-pet-modal="${esc(pet.id)}" class="
                  w-full py-2.5 px-4 rounded-full font-bold text-xs text-black
                  bg-[#EBEBEB] hover:bg-gray-300 active:scale-98 transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                ">
                  Ver Ficha Completa & Fotos
                </button>

                ${isOwner ? `
                  <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button type="button" data-edit-adop="${esc(pet.id)}" class="flex-1 py-1.5 rounded-full text-[11px] font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                      ✏️ Editar
                    </button>
                    <button type="button" data-toggle-adopted="${esc(pet.id)}" class="flex-1 py-1.5 rounded-full text-[11px] font-bold ${isAdopted ? 'text-amber-900 bg-amber-100 hover:bg-amber-200' : 'text-[#0C832A] bg-emerald-100 hover:bg-emerald-200'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                      ${isAdopted ? '🔄 Reabrir' : '✓ Adoptada'}
                    </button>
                    <button type="button" data-delete-adop="${esc(pet.id)}" class="flex-1 py-1.5 rounded-full text-[11px] font-bold text-[#C50000] bg-red-50 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
                      Eliminar
                    </button>
                  </div>
                ` : ''}
              </div>

            </article>
          `;
        }).join('')}
      </div>

    </section>
  `;

  wireImageFallbacks(container);

  // Filtros por criterio
  container.querySelectorAll('[data-adop-select]').forEach(el => {
    el.addEventListener('change', () => {
      Store.setAdoptionFilters({ [el.getAttribute('data-adop-select')]: el.value });
      renderAdoptionsCatalog(containerId);
    });
  });
  const clearBtn = container.querySelector('#btn-clear-adop-filters');
  if (clearBtn) clearBtn.addEventListener('click', () => { Store.resetAdoptionFilters(); renderAdoptionsCatalog(containerId); });

  // Editar y marcar como adoptada (solo el publicador)
  container.querySelectorAll('[data-edit-adop]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.state.editingAdoptionId = btn.getAttribute('data-edit-adop');
      window.location.hash = '#/publicar-adopcion';
    });
  });
  container.querySelectorAll('[data-toggle-adopted]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.markAdoptionCompleted(btn.getAttribute('data-toggle-adopted'));
      renderAdoptionsCatalog(containerId);
    });
  });

  // Listeners de filtros
  container.querySelectorAll('[data-adop-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.setAdoptionFilter(btn.getAttribute('data-adop-filter'));
      renderAdoptionsCatalog(containerId);
    });
  });

  // Listener para Abrir Modal con Carrusel de Fotos
  container.querySelectorAll('[data-open-pet-modal]').forEach(el => {
    el.addEventListener('click', () => {
      const petId = el.getAttribute('data-open-pet-modal');
      const pet = Store.state.adoptions.find(p => p.id === petId);
      if (pet) openPetDetailModal(pet);
    });
  });

  // Listener de eliminación
  container.querySelectorAll('[data-delete-adop]').forEach(btn => {
    btn.addEventListener('click', () => {
      const adopId = btn.getAttribute('data-delete-adop');
      Modal.open({
        title: '¿Dar de baja publicación?',
        content: `
          <div class="space-y-4">
            <p class="text-xs text-[#4A4A4A]">¿Deseas retirar esta mascota del catálogo de adopciones?</p>
            <div class="flex items-center justify-end gap-2">
              <button id="cancel-del-adop" type="button" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button id="confirm-del-adop" type="button" class="px-5 py-2 rounded-full text-xs font-bold text-white force-text-white bg-[#C50000] hover:bg-red-800">Eliminar</button>
            </div>
          </div>
        `,
        onMount: (panel) => {
          panel.querySelector('#cancel-del-adop').onclick = () => Modal.close();
          panel.querySelector('#confirm-del-adop').onclick = () => {
            Modal.close();
            Store.deleteAdoption(adopId);
            renderAdoptionsCatalog(containerId);
          };
        }
      });
    });
  });
}

/**
 * Modal Detalle de Mascota con Carrusel de Fotografías y Ficha del Publicador
 */
function openPetDetailModal(pet) {
  let currentImgIndex = 0;

  Modal.open({
    title: `Ficha de ${pet.name}`,
    content: `
      <div class="space-y-6">
        
        <!-- Carrusel de Fotografías Interactivo -->
        <div class="relative h-64 w-full rounded-2xl overflow-hidden bg-black shadow-inner">
          <img id="carousel-img" src="${esc(pet.images?.[0] || PLACEHOLDER_ANIMAL)}" alt="${esc(pet.name)}" class="w-full h-full object-cover transition-opacity duration-200" />
          
          ${(pet.images?.length || 0) > 1 ? `
            <button id="carousel-prev" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white force-text-white flex items-center justify-center hover:bg-black" aria-label="Foto anterior">
              ‹
            </button>
            <button id="carousel-next" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white force-text-white flex items-center justify-center hover:bg-black" aria-label="Siguiente foto">
              ›
            </button>
            <div id="carousel-dots" class="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5">
              ${pet.images.map((_, i) => `
                <span class="w-2 h-2 rounded-full ${i === 0 ? 'bg-[#E0A800]' : 'bg-white/60'}"></span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Ficha de Datos y Estado Sanitario -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xl font-black text-black">${esc(pet.name)} (${esc(pet.type)})</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E0A800] text-black">${esc(pet.ageText)}</span>
          </div>

          <p class="text-xs text-[#4A4A4A] leading-relaxed">
            ${esc(pet.story)}
          </p>

          <div class="pt-2">
            <span class="text-xs font-bold text-black block mb-1.5">Estado de Salud:</span>
            <div class="flex flex-wrap gap-1.5">
              ${(pet.health || []).length === 0 ? '<span class="text-xs text-gray-600">Sin datos de salud informados por el publicador.</span>' : ''}
              ${(pet.health || []).map(h => `
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0C832A] border border-emerald-200">
                  ✓ ${esc(h)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Ficha del Publicador ("Dueño de / Rescatista") y Botón Directo INICIAR CHAT -->
        <div class="p-4 rounded-2xl bg-[#EBEBEB] space-y-3 border border-gray-300">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[11px] uppercase font-bold text-[#4A4A4A] block">Publicado por:</span>
              <span class="font-black text-sm text-black">${esc(pet.publisher.name)}</span>
              <span class="text-xs text-gray-600 block">${esc(pet.publisher.role || 'Rescatista')} · Tel: ${esc(pet.publisher.phone)}</span>
            </div>
            <span class="text-2xl">🏡</span>
          </div>

          ${Store.canEditAdoption(pet) ? `
            <p class="text-xs font-bold text-[#4A4A4A] text-center">Esta es tu publicación. Podés editarla desde el catálogo.</p>
          ` : `
            ${pet.status === 'adopted' ? `<p class="text-xs font-black text-[#0C832A] text-center">✓ ${esc(pet.name)} ya encontró su hogar</p>` : `
            <button id="btn-apply-adop" type="button" class="
              w-full py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider text-black
              bg-[#E0A800] hover:bg-[#c99700] active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
            ">
              <span>📋 POSTULARME PARA ADOPTAR</span>
            </button>`}
            <button id="btn-start-adop-chat" type="button" class="
              w-full py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider text-black
              bg-[#98D7FF] hover:bg-sky-300 active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
            ">
              <span>💬 INICIAR CHAT PARA ADOPCIÓN</span>
            </button>
          `}
        </div>

      </div>
    `,
    onMount: (panel) => {
      const imgEl = panel.querySelector('#carousel-img');
      const prevBtn = panel.querySelector('#carousel-prev');
      const nextBtn = panel.querySelector('#carousel-next');

      if (prevBtn && nextBtn) {
        const updateImg = (idx) => {
          currentImgIndex = idx;
          imgEl.src = pet.images[currentImgIndex];
          const dots = panel.querySelectorAll('#carousel-dots span');
          dots.forEach((dot, i) => {
            dot.className = `w-2 h-2 rounded-full ${i === currentImgIndex ? 'bg-[#E0A800]' : 'bg-white/60'}`;
          });
        };

        prevBtn.onclick = () => {
          const nextIdx = (currentImgIndex - 1 + pet.images.length) % pet.images.length;
          updateImg(nextIdx);
        };
        nextBtn.onclick = () => {
          const nextIdx = (currentImgIndex + 1) % pet.images.length;
          updateImg(nextIdx);
        };
      }

      const chatBtn = panel.querySelector('#btn-start-adop-chat');
      if (chatBtn) {
        chatBtn.onclick = () => {
          Modal.close();
          Store.createOrOpenRescueChat(
            `Adopción: ${pet.name}`,
            `Hola ${pet.publisher.name}, me interesa postularme para adoptar a ${pet.name}. ¿Podemos conversar?`,
            Store.resolveContactId(pet.publisher?.id)
          );
        };
      }
      const applyBtn = panel.querySelector('#btn-apply-adop');
      if (applyBtn) {
        applyBtn.onclick = () => {
          Modal.close();
          setTimeout(() => openApplicationModal(pet), 260);
        };
      }
    }
  });
}

/**
 * Formulario de postulación: el Store ya tenía submitAdoptionApplication pero no existía la pantalla.
 */
function openApplicationModal(pet) {
  const user = Store.state.user;
  if (!user.isAuthenticated) {
    Store.setReturnTo('#/adopciones');
    Store.notify('toast', { type: 'info', title: 'Iniciá sesión para postularte', message: 'Necesitás una cuenta para enviar tu solicitud de adopción.' });
    window.location.hash = '#/login';
    return;
  }
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]';
  Modal.open({
    title: `Postulación para adoptar a ${pet.name}`,
    content: `
      <form id="form-apply-adoption" class="space-y-3" novalidate>
        <div class="space-y-1">
          <label for="app-housing" class="block text-xs font-bold text-[#4A4A4A]">Tipo de vivienda *</label>
          <select id="app-housing" class="${inputCls}">
            <option value="">Elegí una opción</option>
            <option>Casa con patio cerrado</option>
            <option>Casa sin patio</option>
            <option>Departamento</option>
            <option>Departamento con red en balcón</option>
          </select>
        </div>
        <div class="space-y-1">
          <label for="app-pets" class="block text-xs font-bold text-[#4A4A4A]">¿Convive con otras mascotas? *</label>
          <input type="text" id="app-pets" maxlength="120" placeholder="Ej. No / Sí, un perro castrado" class="${inputCls}" />
        </div>
        <div class="space-y-1">
          <label for="app-time" class="block text-xs font-bold text-[#4A4A4A]">Tiempo diario disponible *</label>
          <input type="text" id="app-time" maxlength="120" placeholder="Ej. 3 horas para paseos y juegos" class="${inputCls}" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="app-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono *</label>
            <input type="tel" id="app-phone" value="${esc(user.phone)}" class="${inputCls}" />
          </div>
          <div class="space-y-1">
            <label for="app-email" class="block text-xs font-bold text-[#4A4A4A]">Correo *</label>
            <input type="email" id="app-email" value="${esc(user.email)}" class="${inputCls}" />
          </div>
        </div>
        <label class="flex items-start gap-2 text-xs text-[#4A4A4A]">
          <input type="checkbox" id="app-commit" class="mt-0.5 accent-[#E0A800]" />
          <span>Me comprometo a la tenencia responsable: vacunación, castración y cuidado de por vida.</span>
        </label>
        <p id="app-error" role="alert" class="hidden text-xs text-[#C50000] font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2"></p>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button id="app-cancel" type="button" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Cancelar</button>
          <button type="submit" class="px-5 py-2 rounded-full text-xs font-black bg-[#E0A800] text-black hover:bg-[#c99700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Enviar solicitud</button>
        </div>
      </form>
    `,
    onMount: (panel) => {
      panel.querySelector('#app-cancel').onclick = () => Modal.close();
      panel.querySelector('#form-apply-adoption').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = (id) => panel.querySelector(id).value.trim();
        const errEl = panel.querySelector('#app-error');
        let error = '';
        if (!val('#app-housing')) error = 'Indicá tu tipo de vivienda.';
        else if (val('#app-pets').length < 2) error = 'Contanos si convive con otras mascotas.';
        else if (val('#app-time').length < 3) error = 'Indicá cuánto tiempo diario podés dedicarle.';
        else if (!isValidPhone(val('#app-phone'))) error = 'Ingresá un teléfono válido (8 a 13 dígitos).';
        else if (!isValidEmail(val('#app-email'))) error = 'Ingresá un correo válido.';
        else if (!panel.querySelector('#app-commit').checked) error = 'Tenés que aceptar el compromiso de tenencia responsable.';
        errEl.textContent = error;
        errEl.classList.toggle('hidden', !error);
        if (error) return;

        const created = Store.submitAdoptionApplication({
          petId: pet.id,
          petName: pet.name,
          petType: pet.type,
          applicantName: user.name,
          applicantPhone: val('#app-phone'),
          applicantEmail: val('#app-email'),
          housingType: val('#app-housing'),
          hasOtherPets: val('#app-pets'),
          dailyTime: val('#app-time'),
          commitment: true
        });
        if (created) {
          openSuccessModal({
            title: '¡Postulación enviada!',
            message: `Tu solicitud para adoptar a ${pet.name} fue enviada. El rescatista se pondrá en contacto con vos.`,
            icon: '📋',
            actionLabel: 'Entendido'
          });
        }
      });
    }
  });
}

/**
 * Formulario para Publicar Adopción con Selectores Tipo Píldora.
 * Todo el estado vive en `form`: al tocar una píldora o agregar una foto se vuelve a
 * dibujar, pero lo ya escrito (nombre, barrio, historia) se conserva.
 */
const MAX_ADOPTION_PHOTOS = 4;
const HEALTH_OPTIONS = ['Vacunado/a', 'Desparasitado/a', 'Castrado/a', 'Compromiso de Castración'];
const DEFAULT_AGE_TEXT = { Cachorro: '6 meses aprox', Adulto: '2 años aprox', Anciano: '8 años aprox' };

export function renderAdoptionForm(containerId = 'view-publicar-adopcion') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Modo edición: se llega desde "Editar" en el catálogo (solo el publicador puede editar)
  const editing = Store.state.adoptions.find(a => a.id === Store.state.editingAdoptionId && Store.canEditAdoption(a)) || null;
  Store.state.editingAdoptionId = null;

  const form = {
    name: '',
    type: 'Perro',     // Perro | Gato
    gender: 'Hembra',  // Hembra | Macho
    age: 'Cachorro',   // Cachorro | Adulto | Anciano
    ageText: '',       // opcional: "4 meses", "3 años"...
    size: 'Mediano',   // Pequeño | Mediano | Grande
    health: [],        // subconjunto de HEALTH_OPTIONS
    location: '',
    story: '',
    photos: []         // data URLs ya reducidos
  };
  if (editing) {
    Object.assign(form, {
      name: editing.name,
      type: editing.type,
      gender: editing.gender,
      age: editing.age,
      ageText: editing.ageText || '',
      size: editing.size || 'Mediano',
      health: [...(editing.health || [])],
      location: editing.zone || String(editing.location || '').replace(/^Río Cuarto \((.*)\)$/, '$1'),
      story: editing.story,
      photos: [...(editing.images || [])]
    });
  }
  let photoBusy = false;
  let submitted = false; // tras un intento de envío, los campos vacíos se marcan en rojo

  const fieldErr = (key) => submitted && !String(form[key] || '').trim();
  const photoErr = () => submitted && form.photos.length === 0;

  const chipClass = (active) => active
    ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm'
    : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]';

  const chip = (attr, value, label, active) => `
    <button type="button" ${attr}="${esc(value)}" aria-pressed="${active}" class="px-4 py-2 rounded-full font-bold text-xs border transition-all ${chipClass(active)}">
      ${label}
    </button>`;

  const renderForm = () => {
    container.innerHTML = `
      <section class="max-w-2xl mx-auto px-4 py-10" aria-labelledby="form-adop-h">
        <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 space-y-6">

          <div class="border-b border-gray-100 pb-4 space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#7A5900] text-xs font-black uppercase">
              <span>HOGAR RESPONSABLE</span>
            </div>
            <h1 id="form-adop-h" class="text-2xl sm:text-3xl font-black text-black">${editing ? 'Editar Ficha de ' + esc(editing.name) : 'Publicar Mascota en Adopción'}</h1>
            <p class="text-xs text-[#4A4A4A]">Completá los datos para encontrar una familia en Río Cuarto</p>
          </div>

          <form id="form-new-adoption" class="space-y-6" novalidate>

            <!-- Fotografías -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#4A4A4A]">Fotos de la Mascota * <span class="font-medium text-gray-600">(hasta ${MAX_ADOPTION_PHOTOS})</span></label>
              <div class="flex flex-wrap items-center gap-3">
                ${form.photos.map((src, idx) => `
                  <div class="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
                    <img src="${esc(src)}" alt="Foto ${idx + 1} de ${esc(form.name || 'la mascota')}" class="w-full h-full object-cover" />
                    <button type="button" data-remove-photo="${idx}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 text-white force-text-white flex items-center justify-center text-xs hover:bg-[#C50000]" title="Quitar foto" aria-label="Quitar foto ${idx + 1}">✕</button>
                    ${idx === 0 ? '<span class="absolute bottom-0 inset-x-0 text-center text-[9px] font-black bg-[#E0A800] text-black">PRINCIPAL</span>' : ''}
                  </div>
                `).join('')}

                ${form.photos.length < MAX_ADOPTION_PHOTOS ? `
                  <label id="adop-photo-label" data-invalid="${photoErr()}" class="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E0A800] text-gray-600 hover:text-black focus-within:ring-2 focus-within:ring-black">
                    <span class="text-2xl">${photoBusy ? '⏳' : '📷'}</span>
                    <span class="text-[10px] font-bold mt-1">${photoBusy ? 'Procesando…' : '+ Foto'}</span>
                    <input type="file" id="adop-photo-input" accept="image/*" multiple class="sr-only" ${photoBusy ? 'disabled' : ''} />
                  </label>
                ` : ''}
              </div>
              <p id="err-adop-photos" role="alert" class="${photoErr() ? '' : 'hidden'} text-xs text-[#C50000] font-black">⚠️ Agregá al menos una foto para que las familias puedan conocerlo/a.</p>
            </div>

            <!-- Nombre -->
            <div class="space-y-1">
              <label for="adop-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre de la Mascota *</label>
              <input type="text" id="adop-name" aria-invalid="${fieldErr('name')}" aria-describedby="err-adop-name" value="${esc(form.name)}" maxlength="40" placeholder="Ej. Toby" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              <p id="err-adop-name" role="alert" class="${fieldErr('name') ? '' : 'hidden'} text-xs text-[#C50000] font-black">⚠️ Ingresá el nombre de la mascota.</p>
            </div>

            <!-- Especie -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Especie *</label>
              <div class="flex items-center gap-2">
                ${chip('data-chip-type', 'Perro', '🐕 Perro', form.type === 'Perro')}
                ${chip('data-chip-type', 'Gato', '🐈 Gato', form.type === 'Gato')}
              </div>
            </div>

            <!-- Sexo -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Sexo *</label>
              <div class="flex items-center gap-2">
                ${chip('data-chip-gender', 'Hembra', '♀ Hembra', form.gender === 'Hembra')}
                ${chip('data-chip-gender', 'Macho', '♂ Macho', form.gender === 'Macho')}
              </div>
            </div>

            <!-- Etapa de vida -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Etapa de Vida *</label>
              <div class="flex flex-wrap items-center gap-2">
                ${chip('data-chip-age', 'Cachorro', 'Cachorro (&lt; 1 año)', form.age === 'Cachorro')}
                ${chip('data-chip-age', 'Adulto', 'Adulto (1-7 años)', form.age === 'Adulto')}
                ${chip('data-chip-age', 'Anciano', 'Anciano (+7 años)', form.age === 'Anciano')}
              </div>
              <input type="text" id="adop-age-text" value="${esc(form.ageText)}" maxlength="30" placeholder="Edad aproximada (opcional). Ej. 4 meses" aria-label="Edad aproximada" class="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            </div>

            <!-- Tamaño -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Tamaño *</label>
              <div class="flex items-center gap-2">
                ${chip('data-chip-size', 'Pequeño', 'Pequeño', form.size === 'Pequeño')}
                ${chip('data-chip-size', 'Mediano', 'Mediano', form.size === 'Mediano')}
                ${chip('data-chip-size', 'Grande', 'Grande', form.size === 'Grande')}
              </div>
            </div>

            <!-- Salud -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Estado de Salud <span class="font-medium text-gray-600">(marcá solo lo que sea cierto)</span></label>
              <div class="flex flex-wrap items-center gap-2">
                ${HEALTH_OPTIONS.map(h => chip('data-chip-health', h, (form.health.includes(h) ? '✓ ' : '') + esc(h), form.health.includes(h))).join('')}
              </div>
            </div>

            <!-- Ubicación -->
            <div class="space-y-1">
              <label for="adop-loc" class="block text-xs font-bold text-[#4A4A4A]">Ubicación o Barrio en Río Cuarto *</label>
              <input type="text" id="adop-loc" aria-invalid="${fieldErr('location')}" aria-describedby="err-adop-loc" value="${esc(form.location)}" maxlength="60" placeholder="Ej. Barrio Alberdi" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              <p id="err-adop-loc" role="alert" class="${fieldErr('location') ? '' : 'hidden'} text-xs text-[#C50000] font-black">⚠️ Indicá el barrio o la zona donde está.</p>
            </div>

            <!-- Historia -->
            <div class="space-y-1">
              <label for="adop-story" class="block text-xs font-bold text-[#4A4A4A]">Historia y Cuidados Especiales *</label>
              <textarea id="adop-story" aria-invalid="${fieldErr('story')}" aria-describedby="err-adop-story" rows="3" maxlength="600" required placeholder="Contá cómo fue rescatado/a, si convive con niños, gatos o perros..." class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black">${esc(form.story)}</textarea>
              <p id="err-adop-story" role="alert" class="${fieldErr('story') ? '' : 'hidden'} text-xs text-[#C50000] font-black">⚠️ Contá brevemente su historia y cuidados.</p>
            </div>

            <div class="pt-2">
              <button type="submit" class="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider text-black bg-[#E0A800] hover:bg-[#c99700] active:scale-98 shadow-md transition-all">
                ${editing ? 'Guardar Cambios' : 'Publicar en Catálogo de Adopciones'}
              </button>
            </div>

          </form>
        </div>
      </section>
    `;

    bindFormEvents();
  };

  const bindFormEvents = () => {
    // Campos de texto: guardar en `form` mientras se escribe
    const bindText = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        form[key] = el.value;
        const errEl = document.getElementById(`err-${id}`);
        if (errEl) {
          const bad = fieldErr(key);
          errEl.classList.toggle('hidden', !bad);
          el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        }
      });
    };
    bindText('adop-name', 'name');
    bindText('adop-age-text', 'ageText');
    bindText('adop-loc', 'location');
    bindText('adop-story', 'story');

    // Píldoras (conservan lo escrito porque los textos ya están en `form`)
    const bindChips = (attr, key) => {
      container.querySelectorAll(`[${attr}]`).forEach(btn => {
        btn.addEventListener('click', () => { form[key] = btn.getAttribute(attr); renderForm(); });
      });
    };
    bindChips('data-chip-type', 'type');
    bindChips('data-chip-gender', 'gender');
    bindChips('data-chip-age', 'age');
    bindChips('data-chip-size', 'size');

    container.querySelectorAll('[data-chip-health]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-chip-health');
        form.health = form.health.includes(value)
          ? form.health.filter(h => h !== value)
          : [...form.health, value];
        renderForm();
      });
    });

    // Fotos
    container.querySelectorAll('[data-remove-photo]').forEach(btn => {
      btn.addEventListener('click', () => {
        form.photos.splice(Number(btn.getAttribute('data-remove-photo')), 1);
        renderForm();
      });
    });

    const photoInput = document.getElementById('adop-photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', async () => {
        const files = Array.from(photoInput.files || []);
        if (!files.length) return;

        const room = MAX_ADOPTION_PHOTOS - form.photos.length;
        photoBusy = true;
        renderForm();

        const { images, errors } = await filesToDataURLs(
          files.slice(0, room),
          { maxSize: 800, quality: 0.75, maxPhotos: MAX_ADOPTION_PHOTOS },
          room
        );
        form.photos.push(...images);
        if (files.length > room) errors.push(`Solo se pueden cargar ${MAX_ADOPTION_PHOTOS} fotos por publicación.`);

        photoBusy = false;
        renderForm();

        if (errors.length) {
          Store.notify('toast', { type: 'error', title: 'Algunas fotos no se cargaron', message: errors.join(' ') });
        }
      });
    }

    // Publicar
    document.getElementById('form-new-adoption').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.trim();
      const loc = form.location.trim();
      const story = form.story.trim();

      submitted = true;
      const missingPhoto = form.photos.length === 0;
      const missingFields = !name || !loc || !story;

      if (missingPhoto || missingFields) {
        renderForm(); // pinta en rojo cada campo faltante y muestra su mensaje
        Store.notify('toast', missingFields
          ? { type: 'error', title: 'Campos Incompletos', message: 'Completá todos los campos requeridos.' }
          : { type: 'error', title: 'Falta una foto', message: 'Agregá al menos una foto de la mascota.' });
        const firstInvalid = missingPhoto ? 'adop-photo-input' : !name ? 'adop-name' : !loc ? 'adop-loc' : 'adop-story';
        const target = document.getElementById(firstInvalid);
        if (target) target.focus();
        return;
      }

      const payload = {
        name,
        type: form.type,
        gender: form.gender,
        age: form.age,
        ageText: form.ageText.trim() || DEFAULT_AGE_TEXT[form.age],
        location: `Río Cuarto (${loc})`,
        zone: loc,
        size: form.size,
        modality: editing?.modality || 'Adopción Definitiva',
        health: form.health,
        story,
        images: form.photos
      };
      const created = editing ? Store.updateAdoption(editing.id, payload) : Store.addAdoption(payload);

      // Si no se pudo guardar (almacenamiento lleno) el Store ya avisó: nos quedamos con el formulario intacto
      if (created) {
        openSuccessModal({
          title: editing ? '¡Ficha actualizada!' : '¡Mascota publicada!',
          message: editing
            ? `Guardamos los cambios en la ficha de ${name}.`
            : `${name} ya está en el catálogo de adopciones responsables de Río Cuarto.`,
          icon: '🐾',
          actionLabel: 'Ver catálogo',
          trigger: e.submitter || null,
          // Se cierre como se cierre (botón, X, Esc o clic fuera), se continúa al catálogo
          onClose: () => { window.location.hash = '#/adopciones'; }
        });
      }
    });
  };

  renderForm();
}
