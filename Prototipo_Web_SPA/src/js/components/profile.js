/**
 * Profile Component - Perfil y Configuración de Usuario
 * Edición de datos, Módulo de Seguridad (2FA, Biometría, Sesiones) y Configuración
 */

import { Store } from '../store.js';
import { Modal } from './modal.js';

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
          <img src="${user.avatar}" alt="${user.name}" class="w-24 h-24 rounded-full object-cover border-4 border-[#E0A800] shadow-md" />
          <button type="button" class="absolute bottom-0 right-0 p-2 bg-[#E0A800] text-black rounded-full hover:bg-amber-500 shadow" title="Cambiar foto de perfil">
            📷
          </button>
        </div>
        <div class="text-center sm:text-left space-y-1">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <h2 id="profile-heading" class="text-2xl font-black text-black">${user.name}</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0A800] text-black">Verificado</span>
          </div>
          <p class="text-sm text-[#4A4A4A]">${user.email} · ${user.phone}</p>
          <p class="text-xs text-gray-500">Miembro voluntario activo en Río Cuarto</p>
        </div>
        <div class="sm:ml-auto">
          <button id="btn-logout" type="button" class="px-5 py-2 rounded-full font-bold text-xs bg-gray-100 text-[#C50000] hover:bg-red-50 border border-gray-300 transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- SECCIÓN 1: EDITAR DATOS -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6">
        <h3 class="text-lg font-black text-black border-b border-gray-100 pb-3 flex items-center gap-2">
          <span>👤</span>
          <span>Editar Datos Personales</span>
        </h3>

        <form id="form-edit-profile" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label for="edit-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre y Apellido</label>
            <input type="text" id="edit-name" value="${user.name}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
          </div>

          <div class="space-y-1">
            <label for="edit-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono de Contacto</label>
            <input type="tel" id="edit-phone" value="${user.phone}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
          </div>

          <div class="space-y-1 sm:col-span-2">
            <label for="edit-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico (requiere confirmación por mail)</label>
            <input type="email" id="edit-email" value="${user.email}" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
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
            <button id="toggle-2fa" type="button" class="w-12 h-6 rounded-full p-1 transition-colors ${user.twoFactorEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${user.twoFactorEnabled}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Acceso con Biometría (Huella / Face ID)</span>
              <span class="text-xs text-[#4A4A4A]">Permite ingresar con la seguridad de tu dispositivo móvil</span>
            </div>
            <button id="toggle-biometrics" type="button" class="w-12 h-6 rounded-full p-1 transition-colors ${user.biometricsEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${user.biometricsEnabled}">
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
                      <span class="font-bold text-black block">${s.device} ${s.isCurrent ? '<span class="text-[11px] text-[#0C832A] font-black">(Este dispositivo)</span>' : ''}</span>
                      <span class="text-xs text-[#4A4A4A]">${s.location} · IP: ${s.ip} · ${s.lastActive}</span>
                    </div>
                  </div>
                  ${!s.isCurrent ? `
                    <button type="button" data-terminate-session="${s.id}" class="text-xs font-bold text-gray-500 hover:text-[#C50000] p-1">
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
            <button id="btn-delete-account-modal" type="button" class="px-4 py-2 rounded-full font-bold text-xs bg-[#C50000] text-white hover:bg-[#a50000]">
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
            <button id="toggle-notifications" type="button" class="w-12 h-6 rounded-full p-1 transition-colors ${user.notificationsEnabled ? 'bg-[#0C832A]' : 'bg-gray-300'}" aria-checked="${user.notificationsEnabled}">
              <div class="w-4 h-4 rounded-full bg-white transition-transform ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}"></div>
            </button>
          </div>

          <!-- Toggle Modo Oscuro -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-[#EBEBEB]">
            <div>
              <span class="font-bold text-sm text-black block">Modo Oscuro (Dark Mode)</span>
              <span class="text-xs text-[#4A4A4A]">Reduce la fatiga visual en guardias nocturnas</span>
            </div>
            <button id="toggle-darkmode" type="button" class="w-12 h-6 rounded-full p-1 transition-colors ${user.darkMode ? 'bg-[#E0A800]' : 'bg-gray-300'}" aria-checked="${user.darkMode}">
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
                ${user.searchRadiusKm} km
              </span>
            </div>

            <div class="flex items-center gap-4">
              <span class="text-xs font-bold text-gray-500">1 km</span>
              <input
                type="range"
                id="search-radius-slider"
                min="1"
                max="10"
                step="4"
                value="${user.searchRadiusKm}"
                class="w-full accent-[#E0A800] cursor-pointer"
              />
              <span class="text-xs font-bold text-gray-500">10 km</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-500 px-1 font-medium">
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

  document.getElementById('form-edit-profile').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    Store.updateProfile({ name, phone, email });
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
    user.notificationsEnabled = !user.notificationsEnabled;
    Store.updateProfile({ notificationsEnabled: user.notificationsEnabled });
    renderProfile(containerId);
  });

  document.getElementById('toggle-darkmode').addEventListener('click', () => {
    Store.toggleDarkMode();
    renderProfile(containerId);
  });

  // Slider de radio
  const slider = document.getElementById('search-radius-slider');
  slider.addEventListener('change', () => {
    let val = Number(slider.value);
    if (val < 3) val = 1;
    else if (val <= 7) val = 5;
    else val = 10;
    Store.setSearchRadius(val);
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
        <form id="form-change-pass" class="space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-[#4A4A4A]">Contraseña Actual</label>
            <input type="password" id="current-pass" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-[#4A4A4A]">Nueva Contraseña Segura</label>
            <input type="password" id="new-pass-modal" required placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número, @ o $" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-[#4A4A4A]">Confirmar Nueva Contraseña</label>
            <input type="password" id="confirm-pass-modal" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
          </div>
          <button type="submit" class="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#E0A800] text-black hover:bg-[#c99700]">
            Confirmar y Actualizar
          </button>
        </form>
      `,
      onMount: (panel) => {
        panel.querySelector('#form-change-pass').addEventListener('submit', (ev) => {
          ev.preventDefault();
          const p = panel.querySelector('#new-pass-modal').value;
          const cp = panel.querySelector('#confirm-pass-modal').value;
          if (p.length < 8 || !/[A-Z]/.test(p) || !/[0-9]/.test(p) || !/[@$]/.test(p)) {
            Store.notify('toast', { type: 'error', title: 'Contraseña Débil', message: 'Debe contener al menos 8 caracteres, 1 mayúscula, 1 número y un símbolo (@ o $).' });
            return;
          }
          if (p !== cp) {
            Store.notify('toast', { type: 'error', title: 'No Coinciden', message: 'Las contraseñas ingresadas no son iguales.' });
            return;
          }
          Modal.close();
          Store.notify('toast', { type: 'success', title: 'Contraseña Actualizada', message: 'Tu clave ha sido modificada con éxito.' });
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
            <label class="block text-xs font-bold text-[#4A4A4A]">Ingresá tu contraseña para confirmar:</label>
            <input type="password" id="del-acc-pass" placeholder="••••••••" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#C50000]" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button id="cancel-del-btn" class="px-4 py-2 rounded-full text-xs font-bold text-[#4A4A4A] bg-gray-100 hover:bg-gray-200">Cancelar</button>
            <button id="confirm-del-btn" class="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#C50000] hover:bg-red-800">Eliminar Definitivamente</button>
          </div>
        </div>
      `,
      onMount: (panel) => {
        panel.querySelector('#cancel-del-btn').addEventListener('click', () => Modal.close());
        panel.querySelector('#confirm-del-btn').addEventListener('click', () => {
          const pass = panel.querySelector('#del-acc-pass').value;
          if (!pass) {
            Store.notify('toast', { type: 'error', title: 'Contraseña Requerida', message: 'Por favor ingresá tu contraseña para validar la baja.' });
            return;
          }
          Modal.close();
          Store.deleteAccount(pass);
          window.location.hash = '#/';
        });
      }
    });
  });
}
