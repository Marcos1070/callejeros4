/**
 * Navbar Component: Callejeros Río IV
 * Navegación semántica accesible y botón de alerta roja
 */

import { Store } from '../store.js';

export function renderNavbar(containerId = 'navbar-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = Store.state.user;

  container.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Logo Oficial Callejeros Río IV -->
          <a href="#/" class="
            group flex items-center gap-3 rounded-full p-1.5
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
            active:scale-95 transition-transform
          " aria-label="Callejeros Río IV - Ir al inicio">
            <div class="w-12 h-12 rounded-full bg-[#E0A800] flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
              🐾
            </div>
            <div>
              <span class="block font-black text-xl text-black tracking-tight leading-none group-hover:text-[#E0A800] transition-colors">
                Callejeros
              </span>
              <span class="block text-xs font-bold text-[#4A4A4A] tracking-wider uppercase">
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
          <div class="flex items-center gap-3">
            
            <!-- Botón de Emergencia Rojo de Alto Impacto -->
            <a href="#/reportar" class="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm tracking-wide text-white
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
              <span>Reportar</span>
              <span class="text-base" aria-hidden="true">🚨</span>
            </a>

            <!-- Acceso a Perfil o Login -->
            ${user.isAuthenticated ? `
              <a href="#/perfil" class="
                flex items-center gap-2 p-1.5 rounded-full hover:bg-[#EBEBEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
                transition-colors active:scale-95
              " aria-label="Ir a mi perfil y configuración">
                <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover border-2 border-[#E0A800]" />
              </a>
            ` : `
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
        <a href="#/perfil" class="mobile-nav-item block px-4 py-3 rounded-xl font-bold text-black hover:bg-[#EBEBEB]">
          👤 Perfil y Configuración
        </a>
      </div>
    </header>
  `;

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('hidden');
    });

    mobileNav.querySelectorAll('.mobile-nav-item').forEach(link => {
      link.addEventListener('click', () => {
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.add('hidden');
      });
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

  window.addEventListener('hashchange', highlightActive);
  highlightActive();

  Store.subscribe('user:updated', () => renderNavbar(containerId));
}
