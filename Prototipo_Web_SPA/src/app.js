/**
 * Callejeros Río IV - Bootstrap Central de la SPA
 * Orquesta Router, Store, Componentes y Accesibilidad Global
 */

import { Router } from './js/router.js';
import { Store } from './js/store.js';
import { Toasts } from './js/components/toast.js';
import { Modal } from './js/components/modal.js';
import { renderNavbar } from './js/components/navbar.js';
import { renderLanding, renderLogin, renderRegister, renderPasswordRecovery } from './js/components/auth.js';
import { renderProfile } from './js/components/profile.js';
import { renderMap } from './js/components/map.js';
import { renderAlertsFeed, renderReportForm } from './js/components/alerts.js';
import { renderAdoptionsCatalog, renderAdoptionForm } from './js/components/adoptions.js';
import { renderChats } from './js/components/chat.js';

class CallejerosApp {
  constructor() {
    this.init();
  }

  init() {
    console.info('[CallejerosRioIV] Inicializando plataforma comunitaria de Río Cuarto...');

    // 1. Renderizar Navbar Global y Modal Root
    renderNavbar('navbar-container');

    // 2. Registrar Rutas Hash de la SPA (ADR-002 y ADR-003)
    Router.register('#/', 'view-landing');
    Router.register('#/login', 'view-login');
    Router.register('#/registro', 'view-registro');
    Router.register('#/recuperar-password', 'view-recuperar-password');
    Router.register('#/mapa', 'view-mapa');
    Router.register('#/alertas', 'view-alertas');
    Router.register('#/reportar', 'view-reportar');
    Router.register('#/adopciones', 'view-adopciones');
    Router.register('#/publicar-adopcion', 'view-publicar-adopcion');
    Router.register('#/chats', 'view-chats');
    Router.register('#/perfil', 'view-perfil');

    // 3. Listener para renderizar componentes al cambiar de vista
    window.addEventListener('view:rendered', (e) => {
      const { viewId, params } = e.detail;
      this.handleViewRender(viewId, params);
    });

    // 4. Iniciar Router
    Router.init();

    console.info('[CallejerosRioIV] SPA activa y lista para rescates.');
  }

  handleViewRender(viewId, params) {
    switch (viewId) {
      case 'view-landing':
        renderLanding('view-landing');
        break;
      case 'view-login':
        renderLogin('view-login');
        break;
      case 'view-registro':
        renderRegister('view-registro');
        break;
      case 'view-recuperar-password':
        renderPasswordRecovery('view-recuperar-password');
        break;
      case 'view-mapa':
        renderMap('view-mapa');
        break;
      case 'view-alertas':
        renderAlertsFeed('view-alertas');
        break;
      case 'view-reportar':
        renderReportForm('view-reportar');
        break;
      case 'view-adopciones':
        renderAdoptionsCatalog('view-adopciones');
        break;
      case 'view-publicar-adopcion':
        renderAdoptionForm('view-publicar-adopcion');
        break;
      case 'view-chats':
        renderChats('view-chats');
        break;
      case 'view-perfil':
        renderProfile('view-perfil');
        break;
      default:
        console.warn(`[App] Vista desconocida: ${viewId}`);
        break;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CallejerosApp());
} else {
  new CallejerosApp();
}
