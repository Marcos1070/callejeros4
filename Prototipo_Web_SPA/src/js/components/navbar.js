/**
 * Navbar Component: Callejeros Río IV
 * Navegación semántica accesible y botón de alerta roja
 */

import { Store } from '../store.js';
import { esc } from '../utils.js';

// La suscripción al Store se registra UNA sola vez (si se hiciera en cada render,
// cada notificación agregaría un listener nuevo y entraría en un bucle infinito).
let navbarSubscribed = false;
let currentHashListener = null;

export function renderNavbar(containerId = 'navbar-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = Store.state.user;

  container.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-2">
          
          <!-- Logo Oficial Callejeros Río IV -->
          <a href="#/" class="
            group flex items-center gap-2 sm:gap-3 rounded-full p-1 sm:p-1.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
            active:scale-95 transition-transform
          " aria-label="Callejeros Río IV - Ir al inicio">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E0A800] flex items-center justify-center text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-transform">
              🐾
            </div>
            <div>
              <span class="block font-black text-lg sm:text-xl text-black tracking-tight leading-none group-hover:text-[#7A5900] transition-colors">
                Callejeros
              </span>
              <span class="hidden sm:block text-xs font-bold text-[#4A4A4A] tracking-wider uppercase">
                Río Cuarto · Comunidad
              </span>
            </div>
          </a>

          <!-- Enlaces de Navegación Desktop -->
          <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            <a href="#/mapa" class="nav-link px-4 py-2 rounded-full text-sm font-bold text-[#4A4A4A] hover:text-black hover:bg-[#EBEBEB] active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all">
              🗺️ Mapa
            </a>
            <a href="#/alertas" class="nav-link px-4 py-2 rounded-full text-sm font-bold text-[#4A4A4A] hover:text-black hover:bg-[#EBEBEB] active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all">
              🚨 Alertas
            </a>
            <a href="#/adopciones" class="nav-link px-4 py-2 rounded-full text-sm font-bold text-[#4A4A4A] hover:text-black hover:bg-[#EBEBEB] active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all">
              🐶 Adopciones
            </a>
            <a href="#/chats" class="nav-link px-4 py-2 rounded-full text-sm font-bold text-[#4A4A4A] hover:text-black hover:bg-[#EBEBEB] active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all">
              💬 Mensajes
            </a>
          </nav>

          <!-- Acciones Derecha: Botón Reportar Rojo + Perfil -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Conmutador de tema Claro / Oscuro (persistido en Store -> localStorage) -->
            <button id="theme-toggle" type="button" class="
              inline-flex items-center justify-center w-11 h-11 rounded-full text-xl
              /* 1. Default */
              bg-[#EBEBEB] text-black
              /* 2. Hover */
              hover:bg-gray-300
              /* 3. Active */
              active:scale-90 active:bg-gray-400
              /* 4. Focus-Visible */
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
              /* 5. Disabled */
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            " aria-pressed="${user.darkMode ? 'true' : 'false'}"
              aria-label="${user.darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}"
              title="${user.darkMode ? 'Modo claro' : 'Modo oscuro'}">
              <span aria-hidden="true">${user.darkMode ? '☀️' : '🌙'}</span>
            </button>

            <!-- Botón de Emergencia Rojo de Alto Impacto -->
            <a href="#/reportar" class="
              inline-flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full font-black text-sm tracking-wide text-white force-text-white
              /* 1. Default */
              bg-[#C50000] shadow-md shadow-rose-900/20
              /* 2. Hover */
              hover:bg-[#a50000] hover:shadow-lg hover:-translate-y-0.5
              /* 3. Active */
              active:bg-[#8f0000] active:scale-95
              /* 4. Focus-Visible */
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
              /* 5. Disabled */
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
            " aria-label="Crear reporte de mascota perdida o herida">
              <span class="hidden sm:inline">Reportar</span>
              <span class="text-base" aria-hidden="true">🚨</span>
            </a>

            <!-- Acceso a Perfil o Login -->
            ${user.isAuthenticated ? `
              <a href="#/perfil" class="
                flex items-center gap-2 p-1.5 rounded-full hover:bg-[#EBEBEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                transition-colors active:scale-95
              " aria-label="Ir a mi perfil y configuración (${esc(user.name)})">
                <img src="${esc(user.avatar)}" alt="" class="w-10 h-10 rounded-full object-cover border-2 border-[#E0A800]" />
              </a>
              <button id="btn-nav-logout" type="button" class="
                hidden md:inline-flex px-4 py-2 rounded-full text-sm font-bold bg-[#EBEBEB] text-[#C50000] hover:bg-red-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all
              ">
                Cerrar Sesión
              </button>
            ` : `
              ${user.isGuest ? `<span class="hidden lg:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-[#98D7FF] text-black">Modo Invitado</span>` : ''}
              <a href="#/login" class="
                hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-bold bg-[#EBEBEB] text-black hover:bg-gray-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all
              ">
                Iniciar Sesión
              </a>
            `}

            <!-- Botón Menú Móvil -->
            <button id="mobile-menu-btn" type="button" class="
              md:hidden p-2 rounded-xl text-black hover:bg-[#EBEBEB] active:bg-gray-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
              transition-colors
            " aria-expanded="false" aria-label="Abrir menú móvil">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>

          </div>

        </div>
      </div>

      <!-- Menú Desplegable Móvil -->
      <div id="mobile-nav" class="hidden md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-2">
        <a href="#/mapa" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
          🗺️ Mapa de Río Cuarto
        </a>
        <a href="#/alertas" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
          🚨 Feed de Alertas
        </a>
        <a href="#/adopciones" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
          🐶 Adopciones Responsables
        </a>
        <a href="#/chats" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
          💬 Mensajes y Grupos
        </a>
        ${user.isAuthenticated ? `
          <a href="#/perfil" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
            👤 Perfil y Configuración
          </a>
          <button id="btn-mobile-logout" type="button" class="block w-full text-left px-4 py-3 rounded-xl font-bold text-[#C50000] hover:bg-red-50">
            🚪 Cerrar Sesión
          </button>
        ` : `
          <a href="#/login" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
            🔑 Iniciar Sesión
          </a>
          <a href="#/registro" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
            ✨ Crear Cuenta
          </a>
        `}
      </div>
    </header>
  `;

  // Tema: al alternar, el Store notifica y el navbar se re-renderiza; se devuelve el foco
  // al botón para que la persona que navega con teclado no lo pierda (WCAG 2.4.3).
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      Store.toggleDarkMode();
      const refreshed = document.getElementById('theme-toggle');
      if (refreshed) refreshed.focus();
    });
  }

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileBtn.setAttribute('aria-label', isExpanded ? 'Abrir menú móvil' : 'Cerrar menú móvil');
      mobileNav.classList.toggle('hidden');
    });

    mobileNav.querySelectorAll('.mobile-nav-item').forEach(link => {
      link.addEventListener('click', () => {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.add('hidden');
      });
    });
  }

  const doLogout = () => {
    Store.logout();
    window.location.hash = '#/';
  };
  const navLogout = document.getElementById('btn-nav-logout');
  if (navLogout) navLogout.addEventListener('click', doLogout);
  const mobileLogout = document.getElementById('btn-mobile-logout');
  if (mobileLogout) {
    mobileLogout.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.add('hidden');
      doLogout();
    });
  }

  // Resaltado de ruta activa
  const highlightActive = () => {
    const currentHash = window.location.hash || '#/';
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
      if (link.getAttribute('href') === currentHash) {
        link.classList.add('bg-[#EBEBEB]', 'text-black');
        link.classList.remove('text-[#4A4A4A]');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('bg-[#EBEBEB]', 'text-black');
        link.classList.add('text-[#4A4A4A]');
        link.removeAttribute('aria-current');
      }
    });
  };

  // Evita acumular listeners de hashchange en cada re-render
  if (currentHashListener) window.removeEventListener('hashchange', currentHashListener);
  currentHashListener = highlightActive;
  window.addEventListener('hashchange', highlightActive);
  highlightActive();

  if (!navbarSubscribed) {
    navbarSubscribed = true;
    Store.subscribe('user:updated', () => renderNavbar(containerId));
  }
}
