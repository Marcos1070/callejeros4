/**
 * Hash Router para SPA: Callejeros Río IV
 * Cumple con ADR-003 de docs/contexto/decisiones.md
 */

import { Store } from './store.js';

// Rutas que requieren sesión iniciada (el resto es público, incluido el modo invitado)
const PROTECTED_ROUTES = new Set(['#/perfil', '#/chats', '#/publicar-adopcion']);
// Pantallas de acceso: con sesión iniciada no tiene sentido mostrarlas
const GUEST_ONLY_ROUTES = new Set(['#/login', '#/registro']);

class HashRouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.params = {};

    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  register(pattern, viewId) {
    this.routes.set(pattern, {
      viewId,
      regex: this.patternToRegex(pattern)
    });
  }

  patternToRegex(pattern) {
    const regexStr = '^' + pattern.replace(/:([a-zA-Z0-9_]+)/g, '(?<$1>[a-zA-Z0-9_-]+)') + '$';
    return new RegExp(regexStr);
  }

  init() {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/';
    } else {
      this.handleHashChange();
    }
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  handleHashChange() {
    const rawHash = window.location.hash || '#/';
    const cleanHash = rawHash.split('?')[0];

    let matched = null;
    let matchedParams = {};

    for (const [pattern, config] of this.routes.entries()) {
      const match = cleanHash.match(config.regex);
      if (match) {
        matched = config;
        matchedParams = match.groups || {};
        this.currentRoute = pattern;
        break;
      }
    }

    if (!matched) {
      console.warn(`[Router] Ruta no encontrada: "${cleanHash}". Redirigiendo a "#/"`);
      window.location.hash = '#/';
      return;
    }

    // Guard: rutas privadas sin sesión => ir al login y volver luego a la ruta pedida
    if (PROTECTED_ROUTES.has(this.currentRoute) && !Store.state.user.isAuthenticated) {
      Store.setReturnTo(cleanHash);
      Store.notify('toast', {
        type: 'warning',
        title: 'Iniciá sesión',
        message: 'Necesitás una cuenta para acceder a esta sección.'
      });
      window.location.hash = '#/login';
      return;
    }

    if (GUEST_ONLY_ROUTES.has(this.currentRoute) && Store.state.user.isAuthenticated) {
      window.location.hash = '#/perfil';
      return;
    }

    this.params = matchedParams;
    this.renderView(matched.viewId, matchedParams);
    Store.state.currentView = matched.viewId;
    Store.notify('view:changed', matched.viewId);
  }

  renderView(viewId, params = {}) {
    const allViews = document.querySelectorAll('.view-section');
    allViews.forEach(v => {
      v.classList.remove('view-visible');
      v.classList.add('view-hidden');
      v.setAttribute('aria-hidden', 'true');
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('view-hidden');
      target.classList.add('view-visible');
      target.setAttribute('aria-hidden', 'false');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Accesibilidad: Mover el foco al título de la vista
      const heading = target.querySelector('h1, h2, [tabindex="-1"]');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }

    window.dispatchEvent(new CustomEvent('view:rendered', {
      detail: { viewId, params }
    }));
  }
}

export const Router = new HashRouter();
