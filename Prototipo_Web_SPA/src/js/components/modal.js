/**
 * ModalManager - Gestor unificado de Modales con Focus Trap estricto
 * Cumple con DoD de accesibilidad WCAG AA
 */

class AccessibleModalManager {
  constructor() {
    this.modalRoot = null;
    this.activeModal = null;
    this.triggerElement = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.init();
  }

  init() {
    this.modalRoot = document.getElementById('modal-root');
    if (!this.modalRoot) {
      this.modalRoot = document.createElement('div');
      this.modalRoot.id = 'modal-root';
      this.modalRoot.className = 'fixed inset-0 z-50 pointer-events-none transition-opacity duration-200 opacity-0';
      this.modalRoot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.modalRoot);
    }
  }

  /**
   * Abre un modal con contenido dinámico.
   * @param {Object} options
   * @param {string} options.title - Título accesible
   * @param {string} options.content - HTML del cuerpo
   * @param {Function} [options.onMount] - Callback al montar el modal
   * @param {HTMLElement} [options.trigger] - Elemento disparador para devolver foco
   */
  open({ title, content, onMount = null, trigger = null }) {
    this.triggerElement = trigger || document.activeElement;

    this.modalRoot.innerHTML = `
      <div id="modal-backdrop" class="fixed inset-0 modal-backdrop transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
        <div id="modal-panel" class="
          w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200
          pointer-events-auto transform transition-all duration-200 scale-95 opacity-0
        " role="dialog" aria-modal="true" aria-labelledby="modal-title">
          
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 id="modal-title" class="font-black text-xl text-black">
              ${title}
            </h3>
            <button id="modal-close-btn" type="button" class="
              p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 active:bg-gray-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
              transition-colors
            " aria-label="Cerrar ventana modal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div id="modal-body">
            ${content}
          </div>

        </div>
      </div>
    `;

    this.activeModal = this.modalRoot.querySelector('#modal-panel');
    const backdrop = this.modalRoot.querySelector('#modal-backdrop');
    const closeBtn = this.modalRoot.querySelector('#modal-close-btn');

    closeBtn.addEventListener('click', () => this.close());
    backdrop.addEventListener('click', () => this.close());

    // Mostrar modal
    this.modalRoot.classList.remove('pointer-events-none', 'opacity-0');
    this.modalRoot.classList.add('pointer-events-auto', 'opacity-100');
    this.modalRoot.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleKeyDown);

    requestAnimationFrame(() => {
      this.activeModal.classList.remove('scale-95', 'opacity-0');
      this.activeModal.classList.add('scale-100', 'opacity-100');
    });

    if (onMount) {
      onMount(this.activeModal);
    }

    // Foco en el botón de cierre inicial o primer elemento
    setTimeout(() => {
      const firstInput = this.activeModal.querySelector('input, button:not(#modal-close-btn)');
      if (firstInput) {
        firstInput.focus();
      } else {
        closeBtn.focus();
      }
    }, 100);
  }

  close() {
    if (!this.modalRoot || !this.activeModal) return;

    this.activeModal.classList.remove('scale-100', 'opacity-100');
    this.activeModal.classList.add('scale-95', 'opacity-0');

    this.modalRoot.classList.remove('pointer-events-auto', 'opacity-100');
    this.modalRoot.classList.add('pointer-events-none', 'opacity-0');
    this.modalRoot.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }

    this.activeModal = null;
  }

  handleKeyDown(e) {
    if (!this.activeModal) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = this.activeModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

export const Modal = new AccessibleModalManager();
