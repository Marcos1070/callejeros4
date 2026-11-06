/**
 * Auth Component - Módulo de Autenticación, Registro y Recuperación
 * Implementa validaciones en tiempo real y flujo en 3 pasos de contraseña
 */

import { Store } from '../store.js';

export function renderLanding(containerId = 'view-landing') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="relative overflow-hidden py-12 md:py-20" aria-labelledby="landing-hero-title">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Hero Card Principal con Imagen Urbana de Río Cuarto -->
        <div class="relative rounded-3xl overflow-hidden shadow-2xl bg-black text-white min-h-[500px] flex items-center">
          
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
                inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-base text-white
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

            </div>

          </div>
        </div>

        <!-- Métricas Comunitarias -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
            <span class="block text-3xl font-black text-[#E0A800]">+480</span>
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
  `;

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
          <h2 id="login-heading" class="text-2xl font-black text-black">Iniciar Sesión</h2>
          <p class="text-xs text-[#4A4A4A]">Ingresá con tu cuenta para gestionar reportes y adopciones</p>
        </div>

        <form id="form-login" class="space-y-4" novalidate>
          <div class="space-y-1">
            <label for="login-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico</label>
            <input
              type="email"
              id="login-email"
              required
              placeholder="tu@email.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label for="login-password" class="block text-xs font-bold text-[#4A4A4A]">Contraseña</label>
              <a href="#/recuperar-password" class="text-xs font-bold text-[#E0A800] hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              type="password"
              id="login-password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
          </div>

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
            <a href="#/registro" class="font-bold text-[#E0A800] hover:underline ml-1">Registrate acá</a>
          </div>
        </div>

      </div>
    </section>
  `;

  const form = document.getElementById('form-login');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      if (!email || !pass) {
        Store.notify('toast', { type: 'error', title: 'Campos Incompletos', message: 'Completá tu correo y contraseña.' });
        return;
      }
      Store.login(email, pass);
      window.location.hash = '#/mapa';
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
          <h2 id="register-heading" class="text-2xl font-black text-black">Crear Cuenta</h2>
          <p class="text-xs text-[#4A4A4A]">Sumate a la red de protección animal de Río Cuarto</p>
        </div>

        <form id="form-register" class="space-y-4" novalidate>
          
          <!-- 1. Nombre Completo (solo letras) -->
          <div class="space-y-1">
            <label for="reg-name" class="block text-xs font-bold text-[#4A4A4A]">Nombre Completo (solo letras) *</label>
            <input
              type="text"
              id="reg-name"
              placeholder="Ej. Juan Carlos Pérez"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
            <p id="err-reg-name" class="hidden text-xs text-[#C50000] font-semibold mt-1">El nombre solo puede contener letras y espacios.</p>
          </div>

          <!-- 2. Correo Electrónico -->
          <div class="space-y-1">
            <label for="reg-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Electrónico Válido *</label>
            <input
              type="email"
              id="reg-email"
              placeholder="juan@ejemplo.com"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
            <p id="err-reg-email" class="hidden text-xs text-[#C50000] font-semibold mt-1">Ingresá un correo electrónico válido.</p>
          </div>

          <!-- 3. Teléfono con Código de Área (8 a 10 dígitos) -->
          <div class="space-y-1">
            <label for="reg-phone" class="block text-xs font-bold text-[#4A4A4A]">Teléfono con Código de Área (8 a 10 dígitos) *</label>
            <input
              type="tel"
              id="reg-phone"
              placeholder="Ej. 3584123456"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
            <p id="err-reg-phone" class="hidden text-xs text-[#C50000] font-semibold mt-1">El teléfono debe tener entre 8 y 10 dígitos numéricos.</p>
          </div>

          <!-- 4. Contraseña Segura -->
          <div class="space-y-2">
            <label for="reg-password" class="block text-xs font-bold text-[#4A4A4A]">Contraseña Segura *</label>
            <input
              type="password"
              id="reg-password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
            />
            
            <!-- Indicadores de Seguridad en Tiempo Real -->
            <div class="p-3 bg-[#EBEBEB] rounded-xl space-y-1.5 text-xs text-[#4A4A4A]">
              <span class="font-bold block text-black">Requisitos de contraseña:</span>
              <div id="rule-len" class="flex items-center gap-1.5"><span>⚪</span> Mínimo 8 caracteres</div>
              <div id="rule-upper" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 letra mayúscula</div>
              <div id="rule-num" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 número</div>
              <div id="rule-sym" class="flex items-center gap-1.5"><span>⚪</span> Al menos 1 símbolo especial (@ o $)</div>
            </div>
          </div>

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
            <a href="#/login" class="font-bold text-[#E0A800] hover:underline ml-1">Iniciá sesión</a>
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

  const validateName = () => {
    const val = nameInput.value.trim();
    const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/.test(val);
    errName.classList.toggle('hidden', isValid || val.length === 0);
    return isValid;
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    errEmail.classList.toggle('hidden', isValid || val.length === 0);
    return isValid;
  };

  const validatePhone = () => {
    const val = phoneInput.value.replace(/\D/g, '');
    const isValid = val.length >= 8 && val.length <= 10;
    errPhone.classList.toggle('hidden', isValid || phoneInput.value.length === 0);
    return isValid;
  };

  const validatePassword = () => {
    const p = passInput.value;
    const okLen = p.length >= 8;
    const okUpper = /[A-Z]/.test(p);
    const okNum = /[0-9]/.test(p);
    const okSym = /[@$]/.test(p);

    ruleLen.innerHTML = `${okLen ? '🟢' : '⚪'} Mínimo 8 caracteres`;
    ruleUpper.innerHTML = `${okUpper ? '🟢' : '⚪'} Al menos 1 letra mayúscula`;
    ruleNum.innerHTML = `${okNum ? '🟢' : '⚪'} Al menos 1 número`;
    ruleSym.innerHTML = `${okSym ? '🟢' : '⚪'} Al menos 1 símbolo especial (@ o $)`;

    return okLen && okUpper && okNum && okSym;
  };

  nameInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);
  phoneInput.addEventListener('input', validatePhone);
  passInput.addEventListener('input', validatePassword);

  document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateName() && validateEmail() && validatePhone() && validatePassword()) {
      Store.register({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      });
      window.location.hash = '#/mapa';
    } else {
      Store.notify('toast', {
        type: 'error',
        title: 'Verificá los Campos',
        message: 'Por favor corregí los campos marcados en rojo antes de continuar.'
      });
    }
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
              <h2 id="recovery-h" class="text-2xl font-black text-black">Paso 1: Recuperar Clave</h2>
              <p class="text-xs text-[#4A4A4A]">Ingresá tu correo electrónico registrado para recibir el enlace seguro.</p>
            </div>
            <form id="form-rec-1" class="space-y-4">
              <div class="space-y-1">
                <label for="rec-email" class="block text-xs font-bold text-[#4A4A4A]">Correo Registrado</label>
                <input type="email" id="rec-email" required placeholder="tu@email.com" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
              </div>
              <button type="submit" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md">
                Enviar Enlace de Recuperación
              </button>
            </form>
            <div class="text-center text-xs"><a href="#/login" class="text-[#E0A800] font-bold hover:underline">Volver a Iniciar Sesión</a></div>
          </div>
        </section>
      `;

      document.getElementById('form-rec-1').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('rec-email').value;
        if (email) {
          recoveryEmail = email;
          currentStep = 2;
          renderCurrentStep();
        }
      });
    } else if (currentStep === 2) {
      container.innerHTML = `
        <section class="max-w-md mx-auto px-4 py-16" aria-labelledby="rec-success-h">
          <div class="bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-200 space-y-6">
            <div class="w-20 h-20 rounded-full bg-emerald-100 border-2 border-[#0C832A] flex items-center justify-center text-4xl mx-auto text-[#0C832A]">
              ✓
            </div>
            <h2 id="rec-success-h" class="text-2xl font-black text-black">Paso 2: Correo Enviado</h2>
            <p class="text-sm text-[#4A4A4A] leading-relaxed">
              Hemos enviado un enlace de redefinición de contraseña a <br/><strong class="text-black">${recoveryEmail}</strong>.
            </p>
            <button id="btn-goto-step-3" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#0C832A] text-white hover:bg-emerald-800 shadow-md">
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
              <h2 id="rec-step3-h" class="text-2xl font-black text-black">Paso 3: Nueva Contraseña</h2>
              <p class="text-xs text-[#4A4A4A]">Ingresá tu nueva clave con los requisitos de seguridad.</p>
            </div>
            <form id="form-rec-3" class="space-y-4">
              <div class="space-y-1">
                <label for="new-pass" class="block text-xs font-bold text-[#4A4A4A]">Nueva Contraseña Segura</label>
                <input type="password" id="new-pass" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
              </div>
              <div class="space-y-1">
                <label for="confirm-pass" class="block text-xs font-bold text-[#4A4A4A]">Confirmar Nueva Contraseña</label>
                <input type="password" id="confirm-pass" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
              </div>
              <button type="submit" class="w-full py-3.5 px-6 rounded-full font-black text-sm bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md">
                Guardar Contraseña y Acceder
              </button>
            </form>
          </div>
        </section>
      `;

      document.getElementById('form-rec-3').addEventListener('submit', (e) => {
        e.preventDefault();
        const p1 = document.getElementById('new-pass').value;
        const p2 = document.getElementById('confirm-pass').value;
        const isValid = p1.length >= 8 && /[A-Z]/.test(p1) && /[0-9]/.test(p1) && /[@$]/.test(p1);

        if (!isValid) {
          Store.notify('toast', { type: 'error', title: 'Contraseña Débil', message: 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo (@ o $).' });
          return;
        }
        if (p1 !== p2) {
          Store.notify('toast', { type: 'error', title: 'No Coinciden', message: 'Las contraseñas no son idénticas.' });
          return;
        }

        Store.notify('toast', { type: 'success', title: '¡Contraseña Cambiada!', message: 'Tu clave se actualizó correctamente.' });
        window.location.hash = '#/login';
      });
    }
  };

  renderCurrentStep();
}
