/**
 * Adoptions Component - Módulo de Adopciones Responsables
 * Catálogo con filtros, Modal con carrusel de fotos, Ficha del publicador y Formulario con chips
 */

import { Store } from '../store.js';
import { Modal } from './modal.js';

export function renderAdoptionsCatalog(containerId = 'view-adopciones') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentFilter = Store.state.activeAdoptionFilter; // TODOS | PERROS | GATOS
  const user = Store.state.user;

  const pets = Store.state.adoptions.filter(pet => {
    if (currentFilter === 'TODOS') return true;
    if (currentFilter === 'PERROS') return pet.type.toLowerCase() === 'perro';
    if (currentFilter === 'GATOS') return pet.type.toLowerCase() === 'gato';
    return true;
  });

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" aria-labelledby="adoptions-heading">
      
      <!-- Cabecera y Filtros -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 id="adoptions-heading" class="text-3xl font-black text-black tracking-tight">
            🐶 Adopciones Responsables en Río Cuarto
          </h2>
          <p class="text-xs text-[#4A4A4A] mt-1">Conocé a los perritos y gatitos rescatados que buscan un hogar definitivo</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Pestañas de Filtro Rápido -->
          <div class="bg-gray-200 p-1 rounded-full flex items-center gap-1" role="tablist">
            <button type="button" data-adop-filter="TODOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'TODOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              TODOS
            </button>
            <button type="button" data-adop-filter="PERROS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'PERROS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              🐕 PERROS
            </button>
            <button type="button" data-adop-filter="GATOS" class="px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'GATOS' ? 'bg-[#E0A800] text-black shadow-sm' : 'text-[#4A4A4A] hover:text-black'}">
              🐈 GATOS
            </button>
          </div>

          <a href="#/publicar-adopcion" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black text-black bg-[#E0A800] hover:bg-[#c99700] shadow-md transition-all">
            <span>+ Dar en Adopción</span>
          </a>
        </div>
      </div>

      <!-- Grid de Mascotas en Adopción -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${pets.map(pet => {
          const isOwner = user.isAuthenticated && pet.publisher?.id === user.id;

          return `
            <article class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 flex flex-col justify-between transition-all group">
              <div>
                <!-- Imagen con Badges Tipo Chip -->
                <div class="relative h-56 w-full bg-gray-100 overflow-hidden cursor-pointer" data-open-pet-modal="${pet.id}">
                  <img src="${pet.images[0]}" alt="${pet.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-black shadow-sm">
                      ${pet.gender === 'Hembra' ? '♀ Hembra' : '♂ Macho'}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0A800] text-black shadow-sm">
                      ${pet.age}
                    </span>
                  </div>
                </div>

                <!-- Info de Mascota -->
                <div class="p-5 space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="font-black text-xl text-black">${pet.name}</h3>
                    <span class="text-xs text-gray-500 font-medium">${pet.ageText}</span>
                  </div>
                  <p class="text-xs text-[#4A4A4A] flex items-center gap-1">
                    <span>📍</span>
                    <span>${pet.location}</span>
                  </p>
                  <p class="text-xs text-[#4A4A4A] line-clamp-2 leading-relaxed pt-1">
                    ${pet.story}
                  </p>
                </div>
              </div>

              <!-- Acciones de Tarjeta -->
              <div class="p-5 pt-0 space-y-2">
                <button type="button" data-open-pet-modal="${pet.id}" class="
                  w-full py-2.5 px-4 rounded-full font-bold text-xs text-black
                  bg-[#EBEBEB] hover:bg-gray-300 active:scale-98 transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                ">
                  Ver Ficha Completa & Fotos
                </button>

                ${isOwner ? `
                  <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <button type="button" data-delete-adop="${pet.id}" class="flex-1 py-1.5 rounded-full text-[11px] font-bold text-[#C50000] bg-red-50 hover:bg-red-100">
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
              <button id="cancel-del-adop" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button id="confirm-del-adop" class="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#C50000] hover:bg-red-800">Eliminar</button>
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
          <img id="carousel-img" src="${pet.images[0]}" alt="${pet.name}" class="w-full h-full object-cover transition-opacity duration-200" />
          
          ${pet.images.length > 1 ? `
            <button id="carousel-prev" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black" aria-label="Foto anterior">
              ‹
            </button>
            <button id="carousel-next" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black" aria-label="Siguiente foto">
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
            <span class="text-xl font-black text-black">${pet.name} (${pet.type})</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E0A800] text-black">${pet.ageText}</span>
          </div>

          <p class="text-xs text-[#4A4A4A] leading-relaxed">
            ${pet.story}
          </p>

          <div class="pt-2">
            <span class="text-xs font-bold text-black block mb-1.5">Estado de Salud:</span>
            <div class="flex flex-wrap gap-1.5">
              ${(pet.health || []).map(h => `
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0C832A] border border-emerald-200">
                  ✓ ${h}
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
              <span class="font-black text-sm text-black">${pet.publisher.name}</span>
              <span class="text-xs text-gray-500 block">${pet.publisher.role || 'Rescatista'} · Tel: ${pet.publisher.phone}</span>
            </div>
            <span class="text-2xl">🏡</span>
          </div>

          <button id="btn-start-adop-chat" type="button" class="
            w-full py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider text-black
            bg-[#98D7FF] hover:bg-sky-300 active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2
          ">
            <span>💬 INICIAR CHAT PARA ADOPCIÓN</span>
          </button>
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

      panel.querySelector('#btn-start-adop-chat').onclick = () => {
        Modal.close();
        Store.createOrOpenRescueChat(`Adopción: ${pet.name}`, `Hola ${pet.publisher.name}, me interesa postularme para adoptar a ${pet.name}. ¿Podemos conversar?`);
      };
    }
  });
}

/**
 * Formulario para Publicar / Editar Adopción con Selectores Tipo Píldora e Input de Imagen Real
 */
export function renderAdoptionForm(containerId = 'view-publicar-adopcion') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let selectedAge = 'Cachorro'; // Cachorro | Adulto | Anciano
  let selectedGender = 'Hembra'; // Hembra | Macho
  let selectedType = 'Perro'; // Perro | Gato
  
  // Arreglo dinámico para guardar las imágenes subidas en Base64
  let attachedPhotos = [
    'https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=600&q=80'
  ];

  const renderForm = () => {
    container.innerHTML = `
      <section class="max-w-2xl mx-auto px-4 py-10" aria-labelledby="form-adop-h">
        <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 space-y-6">
          
          <div class="border-b border-gray-100 pb-4 space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#E0A800] text-xs font-black uppercase">
              <span>HOGAR RESPONSABLE</span>
            </div>
            <h2 id="form-adop-h" class="text-2xl sm:text-3xl font-black text-black">Publicar Mascota en Adopción</h2>
            <p class="text-xs text-[#4A4A4A]">Completá los datos para encontrar una familia en Río Cuarto</p>
          </div>

          <form id="form-new-adoption" class="space-y-6" novalidate>
            
            <!-- Nombre de la Mascota -->
            <div class="space-y-1">
              <label for="adop-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre de la Mascota *</label>
              <input type="text" id="adop-name" placeholder="Ej. Toby" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            </div>

            <!-- SECCIÓN: CARGA DE IMAGEN DEL ANIMAL -->
            <div class="space-y-2">
              <label for="adop-image-file" class="block text-xs font-bold text-[#4A4A4A]">Fotografía de la Mascota *</label>
              <div class="flex items-center gap-4">
                <input type="file" id="adop-image-file" accept="image/*" class="block w-full text-xs text-gray-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-bold
                  file:bg-[#E0A800] file:text-black
                  hover:file:bg-[#c99700] cursor-pointer" />
              </div>
              <!-- Previsualización de la foto seleccionada -->
              <div id="image-preview-wrapper" class="mt-2 flex gap-2 flex-wrap">
                ${attachedPhotos.map((imgSrc, idx) => `
                  <div class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                    <img src="${imgSrc}" alt="Preview" class="w-full h-full object-cover" />
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- SELECTORES TIPO PÍLDORA (CHIPS) -->
            <!-- 1. Especie -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Especie *</label>
              <div class="flex items-center gap-2">
                <button type="button" data-chip-type="Perro" class="px-5 py-2 rounded-full font-bold text-xs border transition-all ${selectedType === 'Perro' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  🐕 Perro
                </button>
                <button type="button" data-chip-type="Gato" class="px-5 py-2 rounded-full font-bold text-xs border transition-all ${selectedType === 'Gato' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  🐈 Gato
                </button>
              </div>
            </div>

            <!-- 2. Sexo -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Sexo *</label>
              <div class="flex items-center gap-2">
                <button type="button" data-chip-gender="Hembra" class="px-5 py-2 rounded-full font-bold text-xs border transition-all ${selectedGender === 'Hembra' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  ♀ Hembra
                </button>
                <button type="button" data-chip-gender="Macho" class="px-5 py-2 rounded-full font-bold text-xs border transition-all ${selectedGender === 'Macho' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  ♂ Macho
                </button>
              </div>
            </div>

            <!-- 3. Edad Estimada -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Etapa de Vida *</label>
              <div class="flex items-center gap-2">
                <button type="button" data-chip-age="Cachorro" class="px-4 py-2 rounded-full font-bold text-xs border transition-all ${selectedAge === 'Cachorro' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  Cachorro (&lt; 1 año)
                </button>
                <button type="button" data-chip-age="Adulto" class="px-4 py-2 rounded-full font-bold text-xs border transition-all ${selectedAge === 'Adulto' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  Adulto (1-7 años)
                </button>
                <button type="button" data-chip-age="Anciano" class="px-4 py-2 rounded-full font-bold text-xs border transition-all ${selectedAge === 'Anciano' ? 'bg-[#E0A800] text-black border-[#E0A800] shadow-sm' : 'bg-white text-[#4A4A4A] border-gray-300 hover:border-[#E0A800]'}">
                  Anciano (+7 años)
                </button>
              </div>
            </div>

            <!-- Ubicación -->
            <div class="space-y-1">
              <label for="adop-loc" class="block text-xs font-bold text-[#4A4A4A]">Ubicación o Barrio en Río Cuarto *</label>
              <input type="text" id="adop-loc" placeholder="Ej. Barrio Alberdi" required class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            </div>

            <!-- Historia y Cuidados -->
            <div class="space-y-1">
              <label for="adop-story" class="block text-xs font-bold text-[#4A4A4A]">Historia y Cuidados Especiales *</label>
              <textarea id="adop-story" rows="3" required placeholder="Contá cómo fue rescatado/a, si convive con niños, gatos o perros..." class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]"></textarea>
            </div>

            <!-- Botón Publicar -->
            <div class="pt-2">
              <button type="submit" class="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider text-black bg-[#E0A800] hover:bg-[#c99700] active:scale-98 shadow-md transition-all">
                Publicar en Catálogo de Adopciones
              </button>
            </div>

          </form>

        </div>
      </section>
    `;

    // Chip Listeners
    container.querySelectorAll('[data-chip-type]').forEach(btn => {
      btn.onclick = () => { selectedType = btn.getAttribute('data-chip-type'); renderForm(); };
    });
    container.querySelectorAll('[data-chip-gender]').forEach(btn => {
      btn.onclick = () => { selectedGender = btn.getAttribute('data-chip-gender'); renderForm(); };
    });
    container.querySelectorAll('[data-chip-age]').forEach(btn => {
      btn.onclick = () => { selectedAge = btn.getAttribute('data-chip-age'); renderForm(); };
    });

    // Listener para capturar la imagen seleccionada y convertirla a Base64
    const fileInput = container.querySelector('#adop-image-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(event) {
            // Guardamos la imagen convertida en Base64
            attachedPhotos = [event.target.result];
            
            // Actualizamos la previsualización visual en pantalla
            const previewWrapper = container.querySelector('#image-preview-wrapper');
            if (previewWrapper) {
              previewWrapper.innerHTML = `
                <div class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 shadow-sm">
                  <img src="${event.target.result}" alt="Preview" class="w-full h-full object-cover" />
                </div>
              `;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Submit del Formulario
    document.getElementById('form-new-adoption').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('adop-name').value.trim();
      const loc = document.getElementById('adop-loc').value.trim();
      const story = document.getElementById('adop-story').value.trim();

      if (!name || !loc || !story) {
        Store.notify('toast', { type: 'error', title: 'Campos Incompletos', message: 'Completá todos los campos requeridos.' });
        return;
      }

      Store.addAdoption({
        name,
        type: selectedType,
        gender: selectedGender,
        age: selectedAge,
        ageText: selectedAge === 'Cachorro' ? '6 meses aprox' : selectedAge === 'Adulto' ? '2 años aprox' : '8 años aprox',
        location: `Río Cuarto (${loc})`,
        size: 'Mediano',
        health: ['Vacunado/a', 'Castrado/a'],
        story,
        images: attachedPhotos // Aquí viaja la foto subida en Base64
      });

      window.location.hash = '#/adopciones';
    };
  };

  renderForm();
}
