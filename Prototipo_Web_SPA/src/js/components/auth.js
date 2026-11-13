/**
 * Auth Component - Módulo de Autenticación, Registro y Recuperación
 * Implementa validaciones en tiempo real y flujo en 3 pasos de contraseña
 */

import { Store } from '../store.js';
import { esc, isValidName, isValidEmail, isValidPhone, isStrongPassword, setFieldError } from '../utils.js';
import { Modal } from './modal.js';

export function renderLanding(containerId = 'view-landing') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const loggedIn = Store.state.user.isAuthenticated;

  container.innerHTML = `
    <!-- Navegación interna de la página de inicio: salto suave a cada sección (rúbrica EFI) -->
    <nav aria-label="Secciones de la página de inicio" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <ul class="flex flex-wrap items-center justify-center gap-2">
        ${[['inicio', 'Inicio'], ['red-en-numeros', 'La red en números'], ['como-funciona', 'Cómo funciona']].map(([id, label]) => `
          <li>
            <a href="#${id}" data-scroll-to="${id}" class="
              inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-black bg-white border border-gray-300
              hover:bg-gray-100 active:bg-gray-200 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
              transition-all duration-150
            ">${label}</a>
          </li>`).join('')}
      </ul>
    </nav>

    <section id="inicio" tabindex="-1" class="relative overflow-hidden py-12 md:py-20 focus-visible:outline-none" aria-labelledby="landing-hero-title">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Hero Card Principal con Imagen Urbana de Río Cuarto -->
        <div class="relative rounded-3xl overflow-hidden shadow-2xl bg-black text-white force-text-white min-h-[500px] flex items-center">
          
          <!-- Imagen de Fondo Representativa de Río Cuarto con Overlay Oscuro -->
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80"
            alt="Perros en comunidad urbana"
            class="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

          <div class="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-6">
            
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0A800] text-black text-xs font-black uppercase tracking-wider">
              <span>RED COMUNITARIA OFICIAL · RÍO CUARTO</span>
            </div>

            <h1 id="landing-hero-title" class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
              Cada vida callejera <br/>
              <span class="text-[#E0A800]">importa en Río Cuarto</span>
            </h1>

            <p class="text-lg text-gray-200 leading-relaxed font-medium">
              Conectamos vecinos, rescatistas y veterinarias para alertar sobre animales perdidos o heridos, coordinar tránsitos y encontrar hogares responsables.
            </p>

            <!-- Acciones Principales: BOTÓN ROJO DE EMERGENCIA DESTACADO -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              
              <!-- Botón Rojo de Emergencia: Reportar sin Cuenta -->
              <a href="#/reportar" class="
                inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-base text-white force-text-white
                /* 1. Default */
                bg-[#C50000] shadow-xl shadow-rose-900/50 border-2 border-red-500 animate-alert-pulse
                /* 2. Hover */
                hover:bg-[#a50000] hover:shadow-2xl hover:-translate-y-0.5
                /* 3. Active */
                active:bg-[#8f0000] active:scale-98
                /* 4. Focus-Visible */
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2
                /* 5. Disabled */
                disabled:opacity-50
                transition-all duration-150
              ">
                <span class="text-xl" aria-hidden="true">🚨</span>
                <span>Reportar sin Cuenta</span>
              </a>

              ${loggedIn ? `
                <a href="#/mapa" class="
                  inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-base text-black
                  bg-[#E0A800] hover:bg-[#c99700] active:bg-[#b38600] active:scale-98 shadow-lg
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
                  transition-all duration-150
                ">
                  <span>🗺️ Ir al Mapa</span>
                </a>
                <a href="#/perfil" class="
                  inline-flex items-center justify-center px-6 py-4 rounded-full font-bold text-base text-white
                  bg-white/15 hover:bg-white/25 active:bg-white/35 backdrop-blur-sm border border-white/30
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                  transition-all duration-150
                ">
                  Mi Perfil
                </a>
              ` : `
              <!-- Botón Ámbar: Iniciar Sesión / Entrar -->
              <a href="#/login" class="
                inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-base text-black
                bg-[#E0A800] hover:bg-[#c99700] active:bg-[#b38600] active:scale-98 shadow-lg
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
                transition-all duration-150
              ">
                <span>Iniciar Sesión</span>
                <span aria-hidden="true">➔</span>
              </a>

              <!-- Botón Secundario: Crear Cuenta -->
              <a href="#/registro" class="
                inline-flex items-center justify-center px-6 py-4 rounded-full font-bold text-base text-white
                bg-white/15 hover:bg-white/25 active:bg-white/35 backdrop-blur-sm border border-white/30
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                transition-all duration-150
              ">
                Crear Cuenta
              </a>

              <!-- Botón Modo Invitado -->
              <button id="btn-landing-guest" type="button" class="
                inline-flex items-center justify-center gap-1.5 px-6 py-4 rounded-full font-bold text-sm text-gray-300
                hover:text-white hover:bg-white/10 active:bg-white/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                transition-all duration-150
              ">
                <span>🗺️ Explorar como Invitado</span>
              </button>

              `}

            </div>

          </div>
        </div>

        <!-- Métricas Comunitarias -->
        <div id="red-en-numeros" tabindex="-1" role="region" aria-label="La red en números" class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 focus-visible:outline-none">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
            <span class="block text-3xl font-black text-[#7A5900]">+480</span>
            <span class="text-xs font-bold text-[#4A4A4A] uppercase mt-1 block">Animales Rescatados</span>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
            <span class="block text-3xl font-black text-[#0C832A]">+290</span>
            <span class="text-xs font-bold text-[#4A4A4A] uppercase mt-1 block">Adopciones en Río IV</span>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
            <span class="block text-3xl font-black text-[#C50000]">15 min</span>
            <span class="text-xs font-bold text-[#4A4A4A] uppercase mt-1 block">Respuesta de Alerta</span>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
            <span class="block text-3xl font-black text-black">12</span>
            <span class="text-xs font-bold text-[#4A4A4A] uppercase mt-1 block">Veterinarias y Refugios</span>
          </div>
        </div>

      </div>
    </section>

    <section id="como-funciona" tabindex="-1" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 focus-visible:outline-none" aria-labelledby="como-funciona-title">
      <h2 id="como-funciona-title" class="text-2xl sm:text-3xl font-black text-black tracking-tight text-center">Cómo funciona</h2>
      <p class="text-sm text-[#4A4A4A] text-center mt-2">Tres pasos para ayudar a un animal en Río Cuarto</p>
      <ol class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        ${[
          ['1', '🚨', 'Reportá', 'Avisá en minutos de un animal perdido o herido, con fotos y ubicación. No hace falta tener cuenta.', '#/reportar', 'Crear un reporte'],
          ['2', '💬', 'Coordiná', 'Chateá con rescatistas, veterinarias y tránsitos para organizar el auxilio.', '#/chats', 'Ir a los mensajes'],
          ['3', '🐶', 'Adoptá', 'Conocé a las mascotas que buscan hogar y postulate con tenencia responsable.', '#/adopciones', 'Ver adopciones']
        ].map(([n, icon, title, text, href, cta]) => `
          <li class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
            <div class="flex items-center gap-3">
              <span class="w-9 h-9 rounded-full bg-[#E0A800] text-black font-black flex items-center justify-center" aria-hidden="true">${n}</span>
              <span class="text-2xl" aria-hidden="true">${icon}</span>
            </div>
            <h3 class="text-lg font-black text-black">${title}</h3>
            <p class="text-xs text-[#4A4A4A] leading-relaxed">${text}</p>
            <a href="${href}" class="
              inline-flex items-center text-xs font-black text-[#7A5900] underline underline-offset-2
              hover:text-black active:opacity-70
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded
              transition-colors
            ">${cta} →</a>
          </li>`).join('')}
      </ol>
    </section>
  `;

  // Salto suave a las secciones de la página (respeta "reducir movimiento"; el foco acompaña al scroll)
  container.querySelectorAll('[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault(); // evita que el hash "#inicio" lo interprete el router como una ruta
      const target = document.getElementById(link.getAttribute('data-scroll-to'));
      if (!target) return;
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    });
  });

  const guestBtn = document.getElementById('btn-landing-guest');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      Store.loginAsGuest();
      window.location.hash = '#/mapa';
    });
  }
}

export function renderLogin(containerId = 'view-login') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="max-w-md mx-auto px-4 py-16" aria-labelledby="login-heading">
      <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 space-y-6">
        
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-full bg-[#E0A800] flex items-center justify-center text-3xl mx-auto shadow-md">
            🐾
          </div>
          <h1 id="login-heading" class="text-2xl font-black text-black">Iniciar Sesión</h1>
          <p class="text-xs text-[#4A4A4A]">Ingresá con tu cuenta para gestionar reportes y adopciones</p>
        </div>

        <form id="form-login" class="space-y-4" novalidate>
          <div class="space-y-1">
            <label for="login-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico</label>
            <input
              type="email"
              id="login-email"
              required
              aria-invalid="false"
              aria-describedby="err-login-email"
              placeholder="tu@email.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            <p id="err-login-email" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label for="login-password" class="block text-xs font-bold text-[#4A4A4A]">Contraseña</label>
              <a href="#/recuperar-password" class="text-xs font-bold text-[#7A5900] hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              type="password"
              id="login-password"
              required
              aria-invalid="false"
              aria-describedby="err-login-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            <p id="err-login-password" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
          </div>

          <p id="login-error" role="alert" class="hidden text-xs text-[#C50000] font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2"></p>

          <button type="submit" class="
            w-full py-3.5 px-6 rounded-full font-black text-sm text-black uppercase tracking-wider
            bg-[#E0A800] hover:bg-[#c99700] active:scale-98 shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
            transition-all
          ">
            Ingresar
          </button>
        </form>

        <div class="space-y-3 pt-3 border-t border-gray-100 text-center">
          <button id="btn-login-guest" type="button" class="
            w-full py-3 px-4 rounded-full font-bold text-xs text-black bg-[#EBEBEB] hover:bg-gray-300 active:scale-98
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all
          ">
            🗺️ Continuar como Invitado (Sin Cuenta)
          </button>

          <div class="text-xs text-[#4A4A4A]">
            ¿No tenés cuenta todavía?
            <a href="#/registro" class="font-bold text-[#7A5900] hover:underline ml-1">Registrate acá</a>
          </div>
        </div>

      </div>
    </section>
  `;

  const form = document.getElementById('form-login');
  const loginError = document.getElementById('login-error');
  const showLoginError = (msg) => {
    loginError.textContent = msg;
    loginError.classList.toggle('hidden', !msg);
  };

  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const errEmail = document.getElementById('err-login-email');
  const errPass = document.getElementById('err-login-password');
  let submitted = false; // tras el primer intento, los errores se actualizan mientras se escribe

  const emailMsg = (v) => !v.trim()
    ? 'Ingresá tu correo electrónico.'
    : (!isValidEmail(v.trim()) ? 'Ingresá un correo válido, por ejemplo tu@email.com.' : '');
  const passMsg = (v) => (v ? '' : 'Ingresá tu contraseña.');
  const refresh = () => {
    if (!submitted) return;
    showLoginError('');
    setFieldError(emailEl, errEmail, emailMsg(emailEl.value));
    setFieldError(passEl, errPass, passMsg(passEl.value));
  };
  emailEl.addEventListener('input', refresh);
  passEl.addEventListener('input', refresh);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
      showLoginError('');
      const email = emailEl.value.trim();
      const eMsg = emailMsg(emailEl.value);
      const pMsg = passMsg(passEl.value);
      setFieldError(emailEl, errEmail, eMsg); // se evalúan ambos campos para marcarlos a la vez
      setFieldError(passEl, errPass, pMsg);

      if (eMsg || pMsg) {
        Store.notify('toast', (email && eMsg)
          ? { type: 'error', title: 'Correo inválido', message: 'Ingresá un correo electrónico válido.' }
          : { type: 'error', title: 'Campos Incompletos', message: 'Completá tu correo y contraseña.' });
        (eMsg ? emailEl : passEl).focus();
        return;
      }

      // Se verifica contra las cuentas registradas
      const result = Store.login(email, passEl.value);
      if (!result.ok) {
        showLoginError(result.error);
        passEl.setAttribute('aria-invalid', 'true');
        Store.notify('toast', { type: 'error', title: 'No se pudo ingresar', message: result.error });
        passEl.select();
        return;
      }
      window.location.hash = Store.consumeReturnTo('#/mapa');
    });
  }

  const guestBtn = document.getElementById('btn-login-guest');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      Store.loginAsGuest();
      window.location.hash = '#/mapa';
    });
  }

}

export function renderRegister(containerId = 'view-registro') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="max-w-lg mx-auto px-4 py-12" aria-labelledby="register-heading">
      <div class="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-200 space-y-6">
        
        <div class="text-center space-y-2">
          <h1 id="register-heading" class="text-2xl font-black text-black">Crear Cuenta</h1>
          <p class="text-xs text-[#4A4A4A]">Sumate a la red de protección animal de Río Cuarto</p>
        </div>

        <form id="form-register" class="space-y-4" novalidate>
          
          <!-- 1. Nombre Completo (solo letras) -->
          <div class="space-y-1">
            <label for="reg-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre Completo *</label>
            <input
              type="text"
              id="reg-name"
              placeholder="Ej. Juan Carlos Pérez"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            <p id="err-reg-name" class="hidden text-xs text-[#C50000] font-semibold mt-1">Ingresá tu nombre (mínimo 3 letras; se permiten espacios, guiones y apóstrofes).</p>
          </div>

          <!-- 2. Correo Electrónico -->
          <div class="space-y-1">
            <label for="reg-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico Válido *</label>
            <input
              type="email"
              id="reg-email"
              placeholder="juan@ejemplo.com"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            <p id="err-reg-email" class="hidden text-xs text-[#C50000] font-semibold mt-1">Ingresá un correo electrónico válido.</p>
          </div>

          <!-- 3. Teléfono con Código de Área (8 a 10 dígitos) -->
          <div class="space-y-1">
            <label for="reg-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono con Código de Área (8 a 13 dígitos) *</label>
            <input
              type="tel"
              id="reg-phone"
              placeholder="Ej. 3584123456"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            <p id="err-reg-phone" class="hidden text-xs text-[#C50000] font-semibold mt-1">El teléfono debe tener entre 8 y 13 dígitos numéricos.</p>
          </div>

          <!-- 4. Contraseña Segura -->
          <div class="space-y-2">
            <label for="reg-password" class="block text-xs font-bold text-[#4A4A4A]">Contraseña Segura *</label>
            <input
              type="password"
              id="reg-password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
            
            <!-- Indicadores de Seguridad en Tiempo Real -->
            <div class="p-3 bg-[#EBEBEB] rounded-xl space-y-1.5 text-xs text-[#4A4A4A]">
              <span class="font-bold block text-black">Requisitos de contraseña:</span>
              <div id="rule-len" class="flex items-center gap-1.5"><span>⚪</span> Mínimo 8 caracteres</div>
              <div id="rule-upper" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 letra mayúscula</div>
              <div id="rule-num" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 número</div>
              <div id="rule-sym" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 símbolo especial (@ o $)</div>
            </div>
            <p id="err-reg-password" class="hidden text-xs text-[#C50000] font-semibold mt-1">La contraseña todavía no cumple todos los requisitos.</p>
          </div>

          <div class="space-y-1">
            <label for="reg-password2" class="block text-xs font-bold text-[#4A4A4A]">Repetir Contraseña *</label>
            <input type="password" id="reg-password2" autocomplete="new-password" placeholder="••••••••" required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            <p id="err-reg-password2" class="hidden text-xs text-[#C50000] font-semibold mt-1">Las contraseñas no coinciden.</p>
          </div>

          <p id="register-error" role="alert" class="hidden text-xs text-[#C50000] font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2"></p>

          <button type="submit" class="
            w-full py-4 px-6 rounded-full font-black text-sm text-black uppercase tracking-wider
            bg-[#E0A800] hover:bg-[#c99700] active:scale-98 shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black
            transition-all
          ">
            Crear Mi Cuenta
          </button>
        </form>

        <div class="space-y-3 pt-3 border-t border-gray-100 text-center">
          <button id="btn-reg-guest" type="button" class="
            w-full py-3 px-4 rounded-full font-bold text-xs text-black bg-[#EBEBEB] hover:bg-gray-300 active:scale-98
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all
          ">
            🗺️ Entrar como Invitado (Sin Registro)
          </button>

          <div class="text-xs text-[#4A4A4A]">
            ¿Ya tenés una cuenta?
            <a href="#/login" class="font-bold text-[#7A5900] hover:underline ml-1">Iniciá sesión</a>
          </div>
        </div>

      </div>
    </section>
  `;

  // Validaciones en tiempo real
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const phoneInput = document.getElementById('reg-phone');
  const passInput = document.getElementById('reg-password');

  const errName = document.getElementById('err-reg-name');
  const errEmail = document.getElementById('err-reg-email');
  const errPhone = document.getElementById('err-reg-phone');

  const ruleLen = document.getElementById('rule-len');
  const ruleUpper = document.getElementById('rule-upper');
  const ruleNum = document.getElementById('rule-num');
  const ruleSym = document.getElementById('rule-sym');

  const errPass = document.getElementById('err-reg-password');

  // Accesibilidad: cada error queda asociado a su campo y se anuncia al aparecer
  [[nameInput, errName], [emailInput, errEmail], [phoneInput, errPhone], [passInput, errPass]].forEach(([input, err]) => {
    input.setAttribute('aria-describedby', err.id);
    input.setAttribute('aria-invalid', 'false');
    err.setAttribute('role', 'alert');
  });

  // `force` = true al enviar: marca el error aunque el campo esté vacío
  const showError = (input, err, invalid) => {
    err.classList.toggle('hidden', !invalid);
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  };

  const validateName = (force = false) => {
    const val = nameInput.value.trim();
    const isValid = isValidName(val);
    showError(nameInput, errName, !isValid && (force || val.length > 0));
    return isValid;
  };

  const validateEmail = (force = false) => {
    const val = emailInput.value.trim();
    const isValid = isValidEmail(val);
    showError(emailInput, errEmail, !isValid && (force || val.length > 0));
    return isValid;
  };

  const validatePhone = (force = false) => {
    const val = phoneInput.value;
    const isValid = isValidPhone(val);
    showError(phoneInput, errPhone, !isValid && (force || val.length > 0));
    return isValid;
  };

  const validatePassword = (force = false) => {
    const p = passInput.value;
    const okLen = p.length >= 8;
    const okUpper = /[A-Z]/.test(p);
    const okNum = /[0-9]/.test(p);
    const okSym = /[@$]/.test(p);

    ruleLen.innerHTML = `${okLen ? '🟢' : '⚪'} Mínimo 8 caracteres`;
    ruleUpper.innerHTML = `${okUpper ? '🟢' : '⚪'} Al menos 1 letra mayúscula`;
    ruleNum.innerHTML = `${okNum ? '🟢' : '⚪'} Al menos 1 número`;
    ruleSym.innerHTML = `${okSym ? '🟢' : '⚪'} Al menos 1 símbolo especial (@ o $)`;

    const isValid = isStrongPassword(p);
    showError(passInput, errPass, !isValid && force);
    if (isValid) showError(passInput, errPass, false);
    return isValid;
  };

  nameInput.addEventListener('input', () => validateName());
  emailInput.addEventListener('input', () => validateEmail());
  phoneInput.addEventListener('input', () => validatePhone());
  passInput.addEventListener('input', () => validatePassword());

  const pass2Input = document.getElementById('reg-password2');
  const errPass2 = document.getElementById('err-reg-password2');
  // Mismo tratamiento de accesibilidad que el resto de los campos
  pass2Input.setAttribute('aria-describedby', errPass2.id);
  pass2Input.setAttribute('aria-invalid', 'false');
  errPass2.setAttribute('role', 'alert');
  const registerError = document.getElementById('register-error');
  const validatePass2 = (force = false) => {
    const ok = pass2Input.value.length > 0 && pass2Input.value === passInput.value;
    showError(pass2Input, errPass2, !ok && (force || pass2Input.value.length > 0));
    return ok;
  };
  pass2Input.addEventListener('input', validatePass2);
  passInput.addEventListener('input', () => { if (pass2Input.value) validatePass2(); });

  document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    registerError.classList.add('hidden');
    // Se evalúan todos los campos (sin cortocircuito) para marcar cada error a la vez
    const checks = [
      [nameInput, validateName(true)],
      [emailInput, validateEmail(true)],
      [phoneInput, validatePhone(true)],
      [passInput, validatePassword(true)],
      [pass2Input, validatePass2(true)]
    ];
    const firstInvalid = checks.find(([, ok]) => !ok);

    if (firstInvalid) {
      registerError.textContent = 'Corregí los campos marcados en rojo antes de continuar.';
      registerError.classList.remove('hidden');
      Store.notify('toast', {
        type: 'error',
        title: 'Verificá los Campos',
        message: 'Por favor corregí los campos marcados en rojo antes de continuar.'
      });
      firstInvalid[0].focus();
      return;
    }

    const displayName = nameInput.value.trim();
    const result = Store.register({
      name: displayName,
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      password: passInput.value
    });
    if (!result.ok) {
      registerError.textContent = result.error;
      registerError.classList.remove('hidden');
      return;
    }

    // Confirmación de éxito en Modal accesible (role=dialog, focus trap, Esc, foco devuelto)
    Modal.open({
      title: '¡Cuenta creada con éxito!',
      trigger: e.submitter || document.querySelector('#form-register button[type="submit"]'),
      content: `
        <div class="space-y-5 text-center">
          <div class="text-5xl" aria-hidden="true">🎉</div>
          <p class="text-sm text-[#4A4A4A] leading-relaxed">
            Bienvenido/a, <strong class="text-black">${esc(displayName)}</strong>. Tu cuenta ya está activa
            y podés reportar, adoptar y coordinar con la red de Río Cuarto.
          </p>
          <button id="btn-reg-success-continue" type="button" class="
            w-full py-3 px-6 rounded-full font-black text-sm bg-[#E0A800] text-black
            hover:bg-[#c99700] active:bg-[#b38600] active:scale-95
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
          ">Continuar</button>
        </div>
      `,
      onMount: (panel) => {
        panel.querySelector('#btn-reg-success-continue').addEventListener('click', () => Modal.close());
      },
      // Cierre por botón, X, Esc o clic fuera: en todos los casos se continúa al destino
      onClose: () => { window.location.hash = Store.consumeReturnTo('#/mapa'); }
    });
  });

  const regGuestBtn = document.getElementById('btn-reg-guest');
  if (regGuestBtn) {
    regGuestBtn.addEventListener('click', () => {
      Store.loginAsGuest();
      window.location.hash = '#/mapa';
    });
  }
}


export function renderPasswordRecovery(containerId = 'view-recuperar-password') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let currentStep = 1; // 1: Email, 2: Enviado con éxito, 3: Nueva clave
  let recoveryEmail = '';

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      container.innerHTML = `
        <section class="max-w-md mx-auto px-4 py-16" aria-labelledby="recovery-h">
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 space-y-6">
            <div class="text-center space-y-2">
              <span class="text-4xl block">🔑</span>
              <h1 id="recovery-h" class="text-2xl font-black text-black">Paso 1: Recuperar Clave</h1>
              <p class="text-xs text-[#4A4A4A]">Ingresá tu correo electrónico registrado para recibir el enlace seguro.</p>
            </div>
            <form id="form-rec-1" class="space-y-4" novalidate>
              <div class="space-y-1">
                <label for="rec-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Registrado</label>
                <input type="email" id="rec-email" required aria-invalid="false" aria-describedby="rec-error" placeholder="tu@email.com" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
              </div>
              <p id="rec-error" role="alert" class="hidden text-xs text-[#C50000] font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-2"></p>
              <button type="submit" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md">
                Enviar Enlace de Recuperación
              </button>
            </form>
            <div class="text-center text-xs"><a href="#/login" class="text-[#7A5900] font-bold hover:underline">Volver a Iniciar Sesión</a></div>
          </div>
        </section>
      `;

      const recEmail = document.getElementById('rec-email');
      const recError = document.getElementById('rec-error');
      let recSubmitted = false;
      const recFormatMsg = (v) => !v.trim()
        ? 'Ingresá tu correo electrónico.'
        : (!isValidEmail(v.trim()) ? 'Ingresá un correo electrónico válido.' : '');

      // Al corregir, se limpia el error (el de "cuenta inexistente" también)
      recEmail.addEventListener('input', () => {
        if (recSubmitted) setFieldError(recEmail, recError, recFormatMsg(recEmail.value));
      });

      document.getElementById('form-rec-1').addEventListener('submit', (e) => {
        e.preventDefault();
        recSubmitted = true;
        const email = recEmail.value.trim();
        const formatMsg = recFormatMsg(recEmail.value);
        if (formatMsg) {
          setFieldError(recEmail, recError, formatMsg);
          Store.notify('toast', email
            ? { type: 'error', title: 'Correo inválido', message: 'Ingresá un correo electrónico válido.' }
            : { type: 'error', title: 'Campos Incompletos', message: 'Ingresá el correo con el que te registraste.' });
          recEmail.focus();
          return;
        }
        if (!Store._accountExists(email)) {
          const msg = 'No encontramos una cuenta registrada con ese correo.';
          setFieldError(recEmail, recError, msg);
          Store.notify('toast', { type: 'error', title: 'Cuenta no encontrada', message: msg });
          recEmail.focus();
          return;
        }
        setFieldError(recEmail, recError, '');
        recoveryEmail = email;
        currentStep = 2;
        renderCurrentStep();
      });
    } else if (currentStep === 2) {
      container.innerHTML = `
        <section class="max-w-md mx-auto px-4 py-16" aria-labelledby="rec-success-h">
          <div class="bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-200 space-y-6">
            <div class="w-20 h-20 rounded-full bg-emerald-100 border-2 border-[#0C832A] flex items-center justify-center text-4xl mx-auto text-[#0C832A]">
              ✓
            </div>
            <h1 id="rec-success-h" class="text-2xl font-black text-black">Paso 2: Correo Enviado</h1>
            <p class="text-sm text-[#4A4A4A] leading-relaxed">
              Hemos enviado un enlace de redefinición de contraseña a <br/><strong class="text-black">${esc(recoveryEmail)}</strong>.
            </p>
            <button id="btn-goto-step-3" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#0C832A] text-white force-text-white hover:bg-emerald-800 shadow-md">
              Continuar a Redefinir Clave (Simulación)
            </button>
          </div>
        </section>
      `;

      document.getElementById('btn-goto-step-3').addEventListener('click', () => {
        currentStep = 3;
        renderCurrentStep();
      });
    } else if (currentStep === 3) {
      container.innerHTML = `
        <section class="max-w-md mx-auto px-4 py-16" aria-labelledby="rec-step3-h">
          <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 space-y-6">
            <div class="text-center space-y-2">
              <span class="text-4xl block">🛡️</span>
              <h1 id="rec-step3-h" class="text-2xl font-black text-black">Paso 3: Nueva Contraseña</h1>
              <p class="text-xs text-[#4A4A4A]">Ingresá tu nueva clave con los requisitos de seguridad.</p>
            </div>
            <form id="form-rec-3" class="space-y-4" novalidate>
              <div class="space-y-1">
                <label for="new-pass" class="block text-xs font-bold text-[#4A4A4A]">Nueva Contraseña Segura</label>
                <input type="password" id="new-pass" required aria-invalid="false" aria-describedby="err-new-pass" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
                <p id="err-new-pass" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
              </div>
              <div class="space-y-1">
                <label for="confirm-pass" class="block text-xs font-bold text-[#4A4A4A]">Confirmar Nueva Contraseña</label>
                <input type="password" id="confirm-pass" required aria-invalid="false" aria-describedby="err-confirm-pass" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-black" />
                <p id="err-confirm-pass" role="alert" class="hidden text-xs text-[#C50000] font-black"></p>
              </div>
              <button type="submit" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md">
                Guardar Contraseña y Acceder
              </button>
            </form>
          </div>
        </section>
      `;

      const newPassEl = document.getElementById('new-pass');
      const confirmEl = document.getElementById('confirm-pass');
      const errNew = document.getElementById('err-new-pass');
      const errConfirm = document.getElementById('err-confirm-pass');
      let passSubmitted = false;

      const newPassMsg = (v) => !v
        ? 'Ingresá tu nueva contraseña.'
        : (!isStrongPassword(v) ? 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo (@ o $).' : '');
      const confirmMsg = (v, p) => !v
        ? 'Repetí la contraseña para confirmarla.'
        : (v !== p ? 'Las contraseñas no coinciden.' : '');
      const refreshPass = () => {
        if (!passSubmitted) return;
        setFieldError(newPassEl, errNew, newPassMsg(newPassEl.value));
        setFieldError(confirmEl, errConfirm, confirmMsg(confirmEl.value, newPassEl.value));
      };
      newPassEl.addEventListener('input', refreshPass);
      confirmEl.addEventListener('input', refreshPass);

      document.getElementById('form-rec-3').addEventListener('submit', (e) => {
        e.preventDefault();
        passSubmitted = true;
        const p1 = newPassEl.value;
        const p2 = confirmEl.value;
        const m1 = newPassMsg(p1);
        const m2 = confirmMsg(p2, p1);
        setFieldError(newPassEl, errNew, m1); // ambos campos se marcan a la vez
        setFieldError(confirmEl, errConfirm, m2);

        if (m1 || m2) {
          let toast;
          if (!p1 || !p2) toast = { title: 'Campos Incompletos', message: 'Completá la nueva contraseña y su confirmación.' };
          else if (m1) toast = { title: 'Contraseña Débil', message: m1 };
          else toast = { title: 'No Coinciden', message: 'Las contraseñas no son idénticas.' };
          Store.notify('toast', { type: 'error', ...toast });
          (m1 ? newPassEl : confirmEl).focus();
          return;
        }

        const result = Store.resetPassword(recoveryEmail, p1);
        if (!result.ok) {
          setFieldError(newPassEl, errNew, result.error);
          Store.notify('toast', { type: 'error', title: 'No se pudo cambiar', message: result.error });
          newPassEl.focus();
          return;
        }
        Store.notify('toast', { type: 'success', title: '¡Contraseña Cambiada!', message: 'Tu clave se actualizó. Ya podés iniciar sesión con la nueva.' });
        window.location.hash = '#/login';
      });
    }
  };

  renderCurrentStep();
}
