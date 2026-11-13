/**
 * Profile Component - Perfil y Configuración de Usuario
 * Edición de datos, Módulo de Seguridad (2FA, Biometría, Sesiones) y Configuración
 */

import { Store } from '../store.js';
import { Modal } from './modal.js';
import { esc, fileToDataURL, isValidName, isValidEmail, isValidPhone, isStrongPassword, formatDateTime, setFieldError } from '../utils.js';


/** Solicitudes de adopción recibidas (por mis mascotas) y enviadas (por mí). */
function applicationsPanel(user) {
  const myPetIds = new Set(Store.state.adoptions.filter(p => p.publisher?.id === user.id).map(p => p.id));
  const received = Store.state.applications.filter(a => myPetIds.has(a.petId));
  const sent = Store.state.applications.filter(a => a.applicantId === user.id);
  const label = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
  const cls = { pending: 'bg-amber-100 text-black', approved: 'bg-emerald-100 text-[#0C832A]', rejected: 'bg-red-100 text-[#C50000]' };

  return `
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
      <h3 class="text-lg font-black text-black border-b border-gray-100 pb-3 flex items-center gap-2">
        <span aria-hidden="true">📋</span><span>Solicitudes de Adopción</span>
      </h3>
      <div class="space-y-3">
        <h4 class="font-bold text-sm text-black">Recibidas por mis mascotas (${received.length})</h4>
        ${received.length === 0 ? '<p class="text-xs text-[#4A4A4A]">Todavía no recibiste postulaciones.</p>' : received.map(a => `
          <div class="p-3.5 rounded-xl border border-gray-200 text-xs space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-sm text-black">${esc(a.applicantName)} → ${esc(a.petName)}</span>
              <span class="px-2.5 py-0.5 rounded-full font-bold ${cls[a.status] || cls.pending}">${label[a.status] || esc(a.status)}</span>
            </div>
            <p class="text-[#4A4A4A]">🏠 ${esc(a.housingType)} · 🐾 ${esc(a.hasOtherPets)} · ⏱ ${esc(a.dailyTime)}</p>
            <p class="text-[#4A4A4A]">📞 ${esc(a.applicantPhone)}${a.applicantEmail ? ' · ✉️ ' + esc(a.applicantEmail) : ''} · ${esc(formatDateTime(a.date))}</p>
            ${a.status === 'pending' ? `
              <div class="flex items-center gap-2 pt-1">
                <button type="button" data-app-approve="${esc(a.id)}" class="px-3 py-1.5 rounded-full font-bold bg-[#0C832A] text-white force-text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Aprobar</button>
                <button type="button" data-app-reject="${esc(a.id)}" class="px-3 py-1.5 rounded-full font-bold bg-red-100 text-[#C50000] hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">Rechazar</button>
              </div>` : ''}
          </div>`).join('')}
      </div>
      <div class="space-y-3 pt-4 border-t border-gray-100">
        <h4 class="font-bold text-sm text-black">Mis postulaciones enviadas (${sent.length})</h4>
        ${sent.length === 0 ? '<p class="text-xs text-[#4A4A4A]">Aún no te postulaste para adoptar a ninguna mascota.</p>' : `<ul class="space-y-2">${sent.map(a => `
          <li class="p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-2 text-xs">
            <span class="font-bold text-black">${esc(a.petName)}</span>
            <span class="px-2.5 py-0.5 rounded-full font-bold ${cls[a.status] || cls.pending}">${label[a.status] || esc(a.status)}</span>
          </li>`).join('')}</ul>`}
      </div>
    </div>`;
}

/**
 * Mantiene el interruptor de modo oscuro del perfil alineado con el tema real.
 * El tema también se cambia desde la navbar: si el perfil está abierto en ese momento,
 * el interruptor debe reflejarlo (antes quedaba mostrando "apagado" con la página ya oscura).
 */
function syncThemeSwitch() {
  const btn = document.getElementById('toggle-darkmode');
  if (!btn) return;
  const on = !!Store.state.user.darkMode;
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  btn.classList.toggle('bg-[#E0A800]', on);
  btn.classList.toggle('bg-gray-400', !on);
  const knob = btn.firstElementChild;
  if (knob) {
    knob.classList.toggle('translate-x-6', on);
    knob.classList.toggle('translate-x-0', !on);
  }
}
// Se suscribe una sola vez (el módulo se evalúa una vez); no depende de cuántas veces se dibuje el perfil
Store.subscribe('user:updated', syncThemeSwitch);

export function renderProfile(containerId = 'view-perfil') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = Store.state.user;
  const sessions = Store.state.sessions;

  container.innerHTML = `
    <section class="max-w-4xl mx-auto px-4 py-10 space-y-8" aria-labelledby="profile-heading">
      
      <!-- Cabecera de Perfil -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
        <div class="relative">
          <img id="profile-avatar-img" src="${esc(user.avatar)}" alt="${esc(user.name)}" class="w-24 h-24 rounded-full object-cover border-4 border-[#E0A800] shadow-md" />
          <button id="btn-change-avatar" type="button" class="absolute bottom-0 right-0 p-2 bg-[#E0A800] text-black rounded-full hover:bg-amber-500 shadow" title="Cambiar foto de perfil" aria-label="Cambiar foto de perfil">
            📷
          </button>
          <input type="file" id="avatar-file-input" accept="image/*" class="hidden" />
        </div>
        <div class="text-center sm:text-left space-y-1">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <h1 id="profile-heading" class="text-2xl font-black text-black">${esc(user.name)}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0A800] text-black">Verificado</span>
          </div>
          <p class="text-sm text-[#4A4A4A]">${esc(user.email)} · ${esc(user.phone)}</p>
          <p class="text-xs text-gray-600">Miembro voluntario activo en Río Cuarto</p>
        </div>
        <div class="sm:ml-auto">
          <button id="btn-logout" type="button" class="px-5 py-2 rounded-full font-bold text-xs bg-gray-100 text-[#C50000] hover:bg-red-50 border border-gray-300 transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>

      ${applicationsPanel(user)}

      <!-- SECCIÓN 1: EDITAR DATOS -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
        <h3 class="text-lg font-black text-black border-b border-gray-100 pb-3 flex items-center gap-2">
          <span>👤</span>
          <span>Editar Datos Personales</span>
        </h3>

        <form id="form-edit-profile" class="grid grid-cols-1 sm:grid-cols-2 gap-4" novalidate>
          <div class="space-y-1">
            <label for="edit-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre y Apellido</label>
            <input type="text" id="edit-name" value="${esc(user.name)}" required aria-invalid="false" aria-describedby="err-edit-name" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-edit-name" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>

          <div class="space-y-1">
            <label for="edit-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono de Contacto</label>
            <input type="tel" id="edit-phone" value="${esc(user.phone)}" required aria-invalid="false" aria-describedby="err-edit-phone" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-edit-phone" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>

          <div class="space-y-1 sm:col-span-2">
            <label for="edit-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico (requiere confirmación por mail)</label>
            <input type="email" id="edit-email" value="${esc(user.email)}" required aria-invalid="false" aria-describedby="err-edit-email" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-edit-email" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>

          <div class="sm:col-span-2 pt-2">
            <button type="submit" class="px-6 py-3 rounded-full font-bold text-sm bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md transition-all">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <!-- SECCIÓN 2: SEGURIDAD DE LA CUENTA -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
        <h3 class="text-lg font-black text-black border-b border-gray-100 pb-3 flex items-center gap-2">
          <span>🛡️</span>
          <span>Seguridad de la Cuenta</span>
        </h3>

        <div class="space-y-4">
          <!-- Toggles 2FA y Biometría -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Autenticación en 2 Pasos (2FA)</span>
              <span class="text-xs text-[#4A4A4A]">Requiere un código temporal al iniciar sesión desde dispositivos nuevos</span>
            </div>
            <button id="toggle-2fa" type="button" role="switch" aria-label="Autenticación en 2 pasos" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 w-12 h-6 rounded-full p-1 transition-colors ${user.twoFactorEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${esc(user.twoFactorEnabled)}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Acceso con Biometría (Huella / Face ID)</span>
              <span class="text-xs text-[#4A4A4A]">Permite ingresar con la seguridad de tu dispositivo móvil</span>
            </div>
            <button id="toggle-biometrics" type="button" role="switch" aria-label="Acceso con biometría" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 w-12 h-6 rounded-full p-1 transition-colors ${user.biometricsEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${esc(user.biometricsEnabled)}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.biometricsEnabled ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <!-- Gestión de Sesiones Activas -->
          <div class="pt-4 border-t border-gray-100 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-sm text-black">Sesiones Activas Conectadas</h4>
                <p class="text-xs text-[#4A4A4A]">Dispositivos con acceso a tu cuenta en Río Cuarto y alrededores</p>
              </div>
              <button id="btn-close-all-sessions" type="button" class="text-xs font-bold text-[#C50000] hover:underline">
                Cerrar todas las demás sesiones
              </button>
            </div>

            <div class="space-y-2">
              ${sessions.map(s => `
                <div class="p-3.5 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-sm">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">${s.device.includes('Samsung') || s.device.includes('Moto') ? '📱' : '💻'}</span>
                    <div>
                      <span class="font-bold text-black block">${esc(s.device)} ${s.isCurrent ? '<span class="text-[11px] text-[#0C832A] font-black">(Este dispositivo)</span>' : ''}</span>
                      <span class="text-xs text-[#4A4A4A]">${esc(s.location)} · IP: ${esc(s.ip)} · ${esc(s.lastActive)}</span>
                    </div>
                  </div>
                  ${!s.isCurrent ? `
                    <button type="button" data-terminate-session="${esc(s.id)}" class="text-xs font-bold text-gray-600 hover:text-[#C50000] p-1">
                      Cerrar
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Cambio de Contraseña Seguro -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span class="font-bold text-sm text-black block">Cambiar Contraseña</span>
              <span class="text-xs text-[#4A4A4A]">Actualizá periódicamente tu clave para proteger tus publicaciones</span>
            </div>
            <button id="btn-change-password-modal" type="button" class="px-4 py-2 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-black border border-gray-300">
              Modificar Clave
            </button>
          </div>

          <!-- Eliminación Permanente de Cuenta -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between bg-red-50/60 p-4 rounded-2xl border border-red-200">
            <div>
              <span class="font-bold text-sm text-[#C50000] block">Zona de Peligro: Eliminar Cuenta</span>
              <span class="text-xs text-[#4A4A4A]">Se borrarán tus datos, reportes y publicaciones de forma irreversible</span>
            </div>
            <button id="btn-delete-account-modal" type="button" class="px-4 py-2 rounded-full font-bold text-xs bg-[#C50000] text-white force-text-white hover:bg-[#a50000]">
              Dar de Baja
            </button>
          </div>

        </div>
      </div>

      <!-- SECCIÓN 3: CONFIGURACIÓN GENERAL -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
        <h3 class="text-lg font-black text-black border-b border-gray-100 pb-3 flex items-center gap-2">
          <span>⚙️</span>
          <span>Configuración de la Aplicación</span>
        </h3>

        <div class="space-y-4">
          <!-- Toggle Notificaciones -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Notificaciones Push de Alertas</span>
              <span class="text-xs text-[#4A4A4A]">Avisos instantáneos cuando un animal herido sea reportado en tu zona</span>
            </div>
            <button id="toggle-notifications" type="button" role="switch" aria-label="Notificaciones de alertas" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 w-12 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${esc(user.notificationsEnabled)}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <!-- Toggle Modo Oscuro -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Modo Oscuro (Dark Mode)</span>
              <span class="text-xs text-[#4A4A4A]">Reduce la fatiga visual en guardias nocturnas</span>
            </div>
            <button id="toggle-darkmode" type="button" role="switch" aria-label="Modo oscuro" class="w-12 h-6 rounded-full p-1 transition-all hover:brightness-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${user.darkMode ? 'bg-[#E0A800]' : 'bg-gray-400'}" aria-checked="${user.darkMode ? 'true' : 'false'}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.darkMode ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <!-- Slider de Distancia de Búsqueda -->
          <div class="p-4 rounded-2xl bg-[#EBEBEB] space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-sm text-black block">Distancia de Búsqueda en Río Cuarto</span>
                <span class="text-xs text-[#4A4A4A]">Radio geográfico para alertas comunitarias y mapa</span>
              </div>
              <span id="radius-value-badge" class="px-3 py-1 rounded-full text-xs font-black bg-[#E0A800] text-black">
                ${esc(user.searchRadiusKm)} km
              </span>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-xs font-bold text-gray-600">1 km</span>
              <input
                type="range"
                id="search-radius-slider"
                aria-label="Distancia de búsqueda en kilómetros"
                min="0"
                max="2"
                step="1"
                value="${Math.max(0, [1, 5, 10].indexOf(Number(user.searchRadiusKm)))}"
                class="w-full accent-[#E0A800] cursor-pointer"
              />
              <span class="text-xs font-bold text-gray-600">10 km</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-600 px-1 font-medium">
              <span>Barrio cercano (1km)</span>
              <span>Intermedio (5km)</span>
              <span>Toda la ciudad (10km)</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  `;

  // Listeners de Formulario y Toggles
  document.getElementById('btn-logout').addEventListener('click', () => {
    Store.logout();
    window.location.hash = '#/';
  });

  // Cambio de foto de perfil
  const avatarInput = document.getElementById('avatar-file-input');

  document.getElementById('btn-change-avatar').addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    avatarInput.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    try {
      // Recorte cuadrado centrado a 200x200: liviano para localStorage
      const dataUrl = await fileToDataURL(file, { maxSize: 200, quality: 0.8, square: true });
      if (Store.updateAvatar(dataUrl)) {
        renderProfile(containerId);
      }
    } catch (err) {
      Store.notify('toast', { type: 'error', title: 'No se pudo cambiar la foto', message: err.message });
    }
  });

  const nameEl = document.getElementById('edit-name');
  const phoneEl = document.getElementById('edit-phone');
  const emailEl = document.getElementById('edit-email');
  const errName = document.getElementById('err-edit-name');
  const errPhone = document.getElementById('err-edit-phone');
  const errEmail = document.getElementById('err-edit-email');
  let profileSubmitted = false; // tras el primer intento, los errores se actualizan mientras se escribe

  const nameMsg = (v) => !v.trim() ? 'Ingresá tu nombre y apellido.' : (!isValidName(v.trim()) ? 'Ingresá tu nombre y apellido (mínimo 3 letras).' : '');
  const phoneMsg = (v) => !v.trim() ? 'Ingresá un teléfono de contacto.' : (!isValidPhone(v.trim()) ? 'Ingresá un teléfono de 8 a 13 dígitos.' : '');
  const emailMsg = (v) => !v.trim() ? 'Ingresá tu correo electrónico.' : (!isValidEmail(v.trim()) ? 'Ingresá un correo válido, por ejemplo tu@email.com.' : '');
  const refreshProfile = () => {
    if (!profileSubmitted) return;
    setFieldError(nameEl, errName, nameMsg(nameEl.value));
    setFieldError(phoneEl, errPhone, phoneMsg(phoneEl.value));
    setFieldError(emailEl, errEmail, emailMsg(emailEl.value));
  };
  [nameEl, phoneEl, emailEl].forEach(el => el.addEventListener('input', refreshProfile));

  document.getElementById('form-edit-profile').addEventListener('submit', (e) => {
    e.preventDefault();
    profileSubmitted = true;
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim();

    const checks = [
      [nameEl, errName, nameMsg(nameEl.value), name, { title: 'Nombre inválido', message: 'Ingresá tu nombre y apellido (mínimo 3 letras).' }],
      [phoneEl, errPhone, phoneMsg(phoneEl.value), phone, { title: 'Teléfono inválido', message: 'Ingresá un teléfono de 8 a 13 dígitos.' }],
      [emailEl, errEmail, emailMsg(emailEl.value), email, { title: 'Correo inválido', message: 'Ingresá un correo electrónico válido.' }]
    ];
    checks.forEach(([input, errEl, msg]) => setFieldError(input, errEl, msg)); // se marcan todos a la vez
    const firstBad = checks.find(c => c[2]);
    if (firstBad) {
      const [input, , , value, toast] = firstBad;
      Store.notify('toast', { type: 'error', ...(value ? toast : { title: 'Campos Incompletos', message: 'Completá todos los campos requeridos.' }) });
      input.focus();
      return;
    }
    if (Store.updateProfile({ name, phone, email })) {
      renderProfile(containerId);
    }
  });

  document.getElementById('toggle-2fa').addEventListener('click', () => {
    Store.toggle2FA();
    renderProfile(containerId);
  });

  document.getElementById('toggle-biometrics').addEventListener('click', () => {
    Store.toggleBiometrics();
    renderProfile(containerId);
  });

  document.getElementById('toggle-notifications').addEventListener('click', () => {
    Store.toggleNotifications();
    renderProfile(containerId);
  });

  document.getElementById('toggle-darkmode').addEventListener('click', () => {
    Store.toggleDarkMode();
    renderProfile(containerId);
    document.getElementById('toggle-darkmode')?.focus();
  });

  // Solicitudes de adopción recibidas
  container.querySelectorAll('[data-app-approve]').forEach(b => {
    b.addEventListener('click', () => { Store.updateApplicationStatus(b.getAttribute('data-app-approve'), 'approved'); renderProfile(containerId); });
  });
  container.querySelectorAll('[data-app-reject]').forEach(b => {
    b.addEventListener('click', () => { Store.updateApplicationStatus(b.getAttribute('data-app-reject'), 'rejected'); renderProfile(containerId); });
  });

  // Slider de radio: 3 pasos reales (antes llegaba a 9 km pero decía 10)
  const RADIUS_STEPS = [1, 5, 10];
  const slider = document.getElementById('search-radius-slider');
  const radiusBadge = document.getElementById('radius-value-badge');
  slider.addEventListener('input', () => {
    radiusBadge.textContent = `${RADIUS_STEPS[Number(slider.value)]} km`;
  });
  slider.addEventListener('change', () => {
    Store.setSearchRadius(RADIUS_STEPS[Number(slider.value)]);
    renderProfile(containerId);
  });

  // Desconectar sesiones
  container.querySelectorAll('[data-terminate-session]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.terminateSession(btn.getAttribute('data-terminate-session'));
      renderProfile(containerId);
    });
  });

  document.getElementById('btn-close-all-sessions').addEventListener('click', () => {
    Store.terminateOtherSessions();
    renderProfile(containerId);
  });

  // Modal de Cambio de Contraseña
  document.getElementById('btn-change-password-modal').addEventListener('click', () => {
    Modal.open({
      title: 'Modificar Contraseña',
      content: `
        <form id="form-change-pass" class="space-y-4" novalidate>
          <div class="space-y-1">
            <label for="current-pass" class="block text-xs font-bold text-[#4A4A4A]">Contraseña Actual</label>
            <input type="password" id="current-pass" required aria-invalid="false" aria-describedby="err-current-pass" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-current-pass" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>
          <div class="space-y-1">
            <label for="new-pass-modal" class="block text-xs font-bold text-[#4A4A4A]">Nueva Contraseña Segura</label>
            <input type="password" id="new-pass-modal" required aria-invalid="false" aria-describedby="err-new-pass-modal" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número, @ o $" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-new-pass-modal" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>
          <div class="space-y-1">
            <label for="confirm-pass-modal" class="block text-xs font-bold text-[#4A4A4A]">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirm-pass-modal" required aria-invalid="false" aria-describedby="err-confirm-pass-modal" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
            <p id="err-confirm-pass-modal" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>
          <button type="submit" class="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#E0A800] text-black hover:bg-[#c99700]">
            Confirmar y Actualizar
          </button>
        </form>
      `,
      onMount: (panel) => {
        const curEl = panel.querySelector('#current-pass');
        const newEl = panel.querySelector('#new-pass-modal');
        const cfmEl = panel.querySelector('#confirm-pass-modal');
        const errCur = panel.querySelector('#err-current-pass');
        const errNew = panel.querySelector('#err-new-pass-modal');
        const errCfm = panel.querySelector('#err-confirm-pass-modal');
        let passSubmitted = false;

        const curMsg = (v) => (v ? '' : 'Ingresá tu contraseña actual.');
        const newMsg = (v) => !v ? 'Ingresá la nueva contraseña.' : (!isStrongPassword(v) ? 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo (@ o $).' : '');
        const cfmMsg = (v, p) => !v ? 'Repetí la nueva contraseña.' : (v !== p ? 'Las contraseñas no coinciden.' : '');
        const refreshPass = () => {
          if (!passSubmitted) return;
          setFieldError(curEl, errCur, curMsg(curEl.value));
          setFieldError(newEl, errNew, newMsg(newEl.value));
          setFieldError(cfmEl, errCfm, cfmMsg(cfmEl.value, newEl.value));
        };
        [curEl, newEl, cfmEl].forEach(el => el.addEventListener('input', refreshPass));

        panel.querySelector('#form-change-pass').addEventListener('submit', (ev) => {
          ev.preventDefault();
          passSubmitted = true;
          const current = curEl.value;
          const p = newEl.value;
          const cp = cfmEl.value;
          const mCur = curMsg(current);
          const mNew = newMsg(p);
          const mCfm = cfmMsg(cp, p);
          setFieldError(curEl, errCur, mCur); // los tres campos se marcan a la vez
          setFieldError(newEl, errNew, mNew);
          setFieldError(cfmEl, errCfm, mCfm);

          if (mCur || mNew || mCfm) {
            let toast;
            if (!current || !p || !cp) toast = { title: 'Campos Incompletos', message: 'Completá los tres campos para cambiar la contraseña.' };
            else if (mNew) toast = { title: 'Contraseña Débil', message: mNew };
            else toast = { title: 'No Coinciden', message: 'Las contraseñas ingresadas no son iguales.' };
            Store.notify('toast', { type: 'error', ...toast });
            (mCur ? curEl : mNew ? newEl : cfmEl).focus();
            return;
          }
          const result = Store.changePassword(current, p);
          if (!result.ok) {
            setFieldError(curEl, errCur, result.error); // por ejemplo: la contraseña actual es incorrecta
            Store.notify('toast', { type: 'error', title: 'No se pudo cambiar', message: result.error });
            curEl.focus();
            return;
          }
          Modal.close();
        });
      }
    });
  });

  // Modal de Eliminación de Cuenta
  document.getElementById('btn-delete-account-modal').addEventListener('click', () => {
    Modal.open({
      title: '¿Confirmar Baja Definitiva de Cuenta?',
      content: `
        <div class="space-y-4">
          <p class="text-xs text-[#C50000] font-bold leading-relaxed">
            Esta acción es completamente irreversible. Perderás tus alertas publicadas, fichas de adopción y chats de rescate.
          </p>
          <div class="space-y-1">
            <label for="del-acc-pass" class="block text-xs font-bold text-[#4A4A4A]">Ingresá tu contraseña para confirmar:</label>
            <input type="password" id="del-acc-pass" aria-invalid="false" aria-describedby="err-del-acc-pass" placeholder="••••••••" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#C50000]" />
            <p id="err-del-acc-pass" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button id="cancel-del-btn" type="button" class="px-4 py-2 rounded-full text-xs font-bold text-[#4A4A4A] bg-gray-100 hover:bg-gray-200">Cancelar</button>
            <button id="confirm-del-btn" type="button" class="px-5 py-2 rounded-full text-xs font-bold text-white force-text-white bg-[#C50000] hover:bg-red-800">Eliminar Definitivamente</button>
          </div>
        </div>
      `,
      onMount: (panel) => {
        const delInput = panel.querySelector('#del-acc-pass');
        delInput.addEventListener('input', () => setFieldError(delInput, panel.querySelector('#err-del-acc-pass'), ''));
        panel.querySelector('#cancel-del-btn').addEventListener('click', () => Modal.close());
        panel.querySelector('#confirm-del-btn').addEventListener('click', () => {
          const delEl = panel.querySelector('#del-acc-pass');
          const pass = delEl.value;
          if (!pass) {
            setFieldError(delEl, panel.querySelector('#err-del-acc-pass'), 'Ingresá tu contraseña para confirmar la baja.');
            Store.notify('toast', { type: 'error', title: 'Contraseña Requerida', message: 'Por favor ingresá tu contraseña para validar la baja.' });
            delEl.focus();
            return;
          }
          const result = Store.deleteAccount(pass);
          if (!result.ok) {
            setFieldError(delEl, panel.querySelector('#err-del-acc-pass'), result.error);
            Store.notify('toast', { type: 'error', title: 'No se pudo eliminar la cuenta', message: result.error });
            delEl.focus();
            return;
          }
          Modal.close();
          window.location.hash = '#/';
        });
      }
    });
  });
}
