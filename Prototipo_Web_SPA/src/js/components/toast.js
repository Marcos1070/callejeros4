/**
 * ToastManager - Notificaciones flotantes semánticas para Callejeros Río IV
 * Cumple con DoD (WCAG AA, role="status", aria-live="polite")
 */

import { Store } from '../store.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-[70] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('role', 'status');
      document.body.appendChild(this.container);
    }

    Store.subscribe('toast', (toastData) => {
      this.show(toastData);
    });
  }

  show({ type = 'info', title, message, duration = 3500 }) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `
      pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl
      transform transition-all duration-300 ease-out translate-y-4 opacity-0
      ${this.getTypeStyles(type)}
    `;

    toast.innerHTML = `
      <div class="text-xl flex-shrink-0 mt-0.5">${this.getTypeIcon(type)}</div>
      <div class="flex-1 min-w-0">
        <h4 data-toast-title class="font-bold text-sm tracking-wide text-black"></h4>
        <p data-toast-message class="text-xs mt-0.5 text-[#4A4A4A] leading-relaxed"></p>
      </div>
      <button type="button" aria-label="Cerrar notificación" class="
        flex-shrink-0 text-gray-600 hover:text-black p-1 rounded-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
        transition-colors
      ">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    // Texto plano: título y mensaje pueden incluir datos del usuario (nombres, títulos...)
    toast.querySelector('[data-toast-title]').textContent = title ?? '';
    toast.querySelector('[data-toast-message]').textContent = message ?? '';

    const closeBtn = toast.querySelector('button');
    let timer = null;

    const dismiss = () => {
      clearTimeout(timer);
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    timer = setTimeout(dismiss, duration);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => {
      timer = setTimeout(dismiss, 1500);
    });
  }

  getTypeStyles(type) {
    switch (type) {
      case 'success':
        return 'bg-white border-2 border-[#0C832A] shadow-emerald-900/10';
      case 'error':
        return 'bg-white border-2 border-[#C50000] shadow-rose-900/10';
      case 'warning':
        return 'bg-white border-2 border-[#E0A800] shadow-amber-900/10';
      default:
        return 'bg-white border-2 border-[#98D7FF] shadow-sky-900/10';
    }
  }

  getTypeIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      default: return '🐾';
    }
  }
}

export const Toasts = new ToastManager();
