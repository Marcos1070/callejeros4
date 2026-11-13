/**
 * Store Central Reactivo: Callejeros Río IV
 * Administra el estado global, persistencia en LocalStorage y eventos Pub/Sub
 */

import { StorageManager } from './storage.js';
import { initialsAvatar, hashPassword, isValidName, isValidEmail, isValidPhone, isStrongPassword } from './utils.js';
import {
  INITIAL_USER,
  INITIAL_ALERTS,
  INITIAL_POIS,
  INITIAL_ADOPTIONS,
  INITIAL_CONTACTS,
  INITIAL_CHATS,
  INITIAL_ADOPTION_APPLICATIONS
} from './data.js';

// El tema (claro/oscuro) es una preferencia del DISPOSITIVO, no de una cuenta: vive en su propia
// clave para que sobreviva a cerrar sesión, cambiar de cuenta y a un localStorage lleno
// (si localStorage no acepta la escritura, se usa sessionStorage, que tiene cuota aparte).
const THEME_KEY = 'callejeros_theme';

function readThemePreference() {
  try {
    const stored = localStorage.getItem(THEME_KEY) ?? sessionStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch (e) { /* storage bloqueado */ }
  return null; // sin elección previa
}

function writeThemePreference(isDark) {
  const value = isDark ? 'dark' : 'light';
  try { localStorage.setItem(THEME_KEY, value); return; } catch (e) { /* lleno o bloqueado */ }
  try { sessionStorage.setItem(THEME_KEY, value); } catch (e) { /* sin persistencia posible */ }
}

const STORAGE_KEYS = {
  USER: 'callejeros_user',
  ALERTS: 'callejeros_alerts',
  ADOPTIONS: 'callejeros_adoptions',
  APPLICATIONS: 'callejeros_applications',
  SESSIONS: 'callejeros_sessions',
  CONTACTS: 'callejeros_contacts',
  CHATS: 'callejeros_chats',
  SETTINGS: 'callejeros_settings',
  ACCOUNTS: 'callejeros_accounts', // perfiles por correo (sin contraseñas)
  CREDENTIALS: 'callejeros_credentials' // correo -> hash SHA-256 de la contraseña (nunca la clave en texto plano)
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowTime = () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
// Charlas, contactos y sesiones se guardan POR USUARIO: una cuenta nueva ya no hereda las de otra
const scopedKey = (base, userId) => `${base}:${userId}`;

function seedChatsFor(user) {
  if (user.id === INITIAL_USER.id) return clone(INITIAL_CHATS);
  return clone(INITIAL_CHATS)
    .filter(c => c.isChannel)
    .map(c => ({
      ...c,
      isAdmin: false,
      unreadCount: 0,
      members: [
        ...c.members.map(m => (m.id === INITIAL_USER.id ? { ...m, name: INITIAL_USER.name } : m)),
        { id: user.id, name: `${user.name} (Tú)`, role: 'member' }
      ]
    }));
}

class ReactiveStore {
  constructor() {
    this.listeners = new Map();

    // Estado reactivo cargado con fallbacks
    this.state = {
      user: StorageManager.get(STORAGE_KEYS.USER, null) || this._blankUser(),
      alerts: StorageManager.get(STORAGE_KEYS.ALERTS, clone(INITIAL_ALERTS)),
      pois: INITIAL_POIS,
      adoptions: StorageManager.get(STORAGE_KEYS.ADOPTIONS, clone(INITIAL_ADOPTIONS)),
      applications: StorageManager.get(STORAGE_KEYS.APPLICATIONS, clone(INITIAL_ADOPTION_APPLICATIONS)),
      sessions: [],
      contacts: [],
      chats: [],
      currentView: 'home',
      returnTo: null,
      activeAlertFilter: 'TODOS', // TODOS | PERDIDOS | HERIDOS
      activeAdoptionFilter: 'TODOS', // Legacy tab
      adoptionFilters: {
        species: 'TODOS',
        size: 'TODOS',
        age: 'TODOS',
        gender: 'TODOS',
        zone: 'TODOS',
        modality: 'TODOS'
      },
      activeChatId: null,
      selectedPOI: null,
      editingAdoptionId: null,
      activeModal: null
    };

    this._loadScope();

    // Tema inicial: 1) elección guardada, 2) preferencia heredada del perfil (versiones anteriores),
    // 3) preferencia del sistema operativo. (index.html ya lo aplicó antes de pintar; esto lo sincroniza.)
    const saved = readThemePreference();
    const osPrefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._applyTheme(saved ?? (this.state.user.darkMode === true ? true : osPrefersDark));
  }

  /** Aplica el tema: clase en <html> y copia en el perfil (los componentes leen user.darkMode). */
  _applyTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    this.state.user.darkMode = isDark;
  }


  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data, this.state);
        } catch (err) {
          console.error(`[Store] Error en listener de "${event}":`, err);
        }
      });
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => {
        try {
          cb({ event, data }, this.state);
        } catch (e) {}
      });
    }
  }

  // ========================================================
  // AUTENTICACIÓN Y PERFIL DE USUARIO
  // ========================================================

  // --------------------------------------------------------
  // Helpers internos de persistencia y cuentas
  // --------------------------------------------------------

  /**
   * Persiste en storage y avisa si falla (por ejemplo cuota de localStorage llena).
   * Devuelve true/false para que el llamador pueda revertir el cambio.
   */
  _persist(key, value) {
    const ok = StorageManager.set(key, value);
    if (!ok) {
      this.notify('toast', {
        type: 'error',
        title: 'No se pudo guardar',
        message: 'El almacenamiento del navegador está lleno. Probá con fotos más livianas o eliminá publicaciones antiguas.'
      });
    }
    return ok;
  }

  /** Guarda el usuario actual y su copia en el registro de cuentas (por correo). */
  _saveUser() {
    const user = this.state.user;
    const ok = this._persist(STORAGE_KEYS.USER, user);
    if (ok && user.email && !user.isGuest) {
      const accounts = StorageManager.get(STORAGE_KEYS.ACCOUNTS, {}) || {};
      accounts[user.email.toLowerCase()] = user;
      StorageManager.set(STORAGE_KEYS.ACCOUNTS, accounts);
    }
    return ok;
  }

  get isAuthenticated() {
    return !!this.state.user.isAuthenticated;
  }

  toast(type, title, message) {
    this.notify('toast', { type, title, message });
  }

  /** Usuario "visitante": sin sesión y sin datos de ninguna cuenta. */
  _blankUser() {
    return {
      id: 'anon',
      name: 'Visitante',
      email: '',
      phone: '',
      isAuthenticated: false,
      isGuest: false,
      avatar: initialsAvatar('Visitante'),
      twoFactorEnabled: false,
      biometricsEnabled: false,
      notificationsEnabled: true,
      darkMode: !!this.state?.user?.darkMode,
      searchRadiusKm: 5
    };
  }

  /** Carga charlas, contactos y sesiones del usuario actual (vacío si no hay sesión). */
  _loadScope() {
    const user = this.state.user;
    if (user.isAuthenticated) {
      this.state.contacts = StorageManager.get(scopedKey(STORAGE_KEYS.CONTACTS, user.id), clone(INITIAL_CONTACTS));
      this.state.chats = StorageManager.get(scopedKey(STORAGE_KEYS.CHATS, user.id), seedChatsFor(user));
      this.state.sessions = StorageManager.get(scopedKey(STORAGE_KEYS.SESSIONS, user.id), this._freshSessions());
    } else {
      this.state.contacts = [];
      this.state.chats = [];
      this.state.sessions = [];
    }
    if (!this.state.chats.some(c => c.id === this.state.activeChatId)) {
      this.state.activeChatId = this.state.chats[0]?.id || null;
    }
  }

  _saveChats() { if (this.isAuthenticated) this._persist(scopedKey(STORAGE_KEYS.CHATS, this.state.user.id), this.state.chats); }
  _saveContacts() { if (this.isAuthenticated) this._persist(scopedKey(STORAGE_KEYS.CONTACTS, this.state.user.id), this.state.contacts); }
  _saveSessions() { if (this.isAuthenticated) this._persist(scopedKey(STORAGE_KEYS.SESSIONS, this.state.user.id), this.state.sessions); }

  _credentials() { return StorageManager.get(STORAGE_KEYS.CREDENTIALS, {}) || {}; }
  _setCredential(email, hash) {
    const creds = this._credentials();
    creds[String(email).toLowerCase()] = hash;
    this._persist(STORAGE_KEYS.CREDENTIALS, creds);
  }

  /** ¿Existe una cuenta con ese correo registrada en este navegador? */
  _accountExists(email) {
    const key = String(email || '').trim().toLowerCase();
    const accounts = StorageManager.get(STORAGE_KEYS.ACCOUNTS, {}) || {};
    return !!accounts[key];
  }

  /** Compara la clave ingresada con el hash guardado de esa cuenta. */
  _verifyPassword(email, password) {
    const key = String(email || '').trim().toLowerCase();
    const stored = this._credentials()[key];
    const hash = hashPassword(String(password ?? ''));
    return !!stored && stored === hash;
  }

  _hasCredential(email) {
    const key = String(email || '').trim().toLowerCase();
    return !!this._credentials()[key];
  }

  _currentDeviceName() {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Google Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
    const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'dispositivo';
    return `${browser} en ${os}`;
  }

  /** Perfil nuevo y limpio: nunca hereda id, foto ni sesiones de otra cuenta. */
  _buildProfile({ email = '', name = '', phone = '' } = {}) {
    const displayName = name || (email ? email.split('@')[0] : 'Vecino');
    return {
      id: `user-${Date.now()}`,
      name: displayName,
      email,
      phone,
      isAuthenticated: true,
      isGuest: false,
      avatar: initialsAvatar(displayName),
      twoFactorEnabled: false,
      biometricsEnabled: false,
      notificationsEnabled: true,
      darkMode: !!this.state.user?.darkMode,
      searchRadiusKm: 5
    };
  }

  _freshSessions() {
    return [{
      id: `sess-${Date.now()}`,
      device: this._currentDeviceName(),
      location: 'Río Cuarto, Córdoba',
      isCurrent: true,
      lastActive: 'Activa ahora',
      ip: '—'
    }];
  }

  _setUserAndSessions(user, sessions) {
    this.state.user = user;
    // El tema es del dispositivo: el perfil que se carga no lo cambia
    this._applyTheme(document.documentElement.classList.contains('dark'));
    this._saveUser();
    this._loadScope();
    if (sessions) {
      this.state.sessions = sessions;
      this._saveSessions();
    }
    this.notify('user:updated', this.state.user);
  }

  /**
   * Mantiene coherentes las publicaciones propias cuando cambia el perfil:
   * el nombre/teléfono del publicador deben reflejar los datos actuales.
   */
  _syncPublisherInfo() {
    const { id, name, phone } = this.state.user;
    let alertsChanged = false;
    let adoptionsChanged = false;

    this.state.alerts.forEach(a => {
      if (a.publisher && a.publisher.id === id && !a.publisher.isAnonymous) {
        if (a.publisher.name !== name || a.publisher.phone !== phone) {
          a.publisher.name = name;
          a.publisher.phone = phone;
          alertsChanged = true;
        }
      }
    });
    this.state.adoptions.forEach(a => {
      if (a.publisher && a.publisher.id === id) {
        if (a.publisher.name !== name || a.publisher.phone !== phone) {
          a.publisher.name = name;
          a.publisher.phone = phone;
          adoptionsChanged = true;
        }
      }
    });

    if (alertsChanged) {
      StorageManager.set(STORAGE_KEYS.ALERTS, this.state.alerts);
      this.notify('alerts:updated', this.state.alerts);
    }
    if (adoptionsChanged) {
      StorageManager.set(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
      this.notify('adoptions:updated', this.state.adoptions);
    }
  }

  // --------------------------------------------------------
  // Ruta a la que volver después de iniciar sesión
  // --------------------------------------------------------

  setReturnTo(hash) {
    this.state.returnTo = hash;
  }

  consumeReturnTo(defaultHash = '#/mapa') {
    const target = this.state.returnTo || defaultHash;
    this.state.returnTo = null;
    return target;
  }

  // --------------------------------------------------------
  // Sesión
  // --------------------------------------------------------

  /**
   * Inicio de sesión (prototipo sin backend: no existe verificación real de clave).
   * - Si la cuenta ya existe en este navegador, se recupera con sus datos.
   * - Si no existe, se crea un perfil nuevo y limpio (no hereda datos ajenos).
   */
  login(email, password) {
    const cleanEmail = String(email || '').trim();
    const key = cleanEmail.toLowerCase();
    const accounts = StorageManager.get(STORAGE_KEYS.ACCOUNTS, {}) || {};

    if (!cleanEmail || !password) return { ok: false, error: 'Completá tu correo y contraseña.' };
    if (!this._accountExists(key)) return { ok: false, error: 'Correo o contraseña incorrectos.' };
    if (!this._hasCredential(key)) {
      // Cuentas creadas antes de que existieran las contraseñas: definen una nueva con "Olvidé mi contraseña"
      return { ok: false, needsReset: true, error: 'Tu cuenta es anterior al sistema de contraseñas. Usá "¿Olvidaste tu contraseña?" para definir una.' };
    }
    if (!this._verifyPassword(key, password)) return { ok: false, error: 'Correo o contraseña incorrectos.' };

    const profile = { ...(accounts[key] || {}) };
    profile.isAuthenticated = true;
    profile.isGuest = false;
    this._setUserAndSessions(profile, null);
    this.toast('success', '¡Bienvenido/a!', `Sesión iniciada como ${profile.name}`);
    return { ok: true };
  }

  register(userData) {
    const name = String(userData.name || '').trim();
    const email = String(userData.email || '').trim();
    const phone = String(userData.phone || '').trim();
    const password = String(userData.password || '');

    if (!isValidName(name)) return { ok: false, error: 'Ingresá tu nombre (mínimo 3 letras).' };
    if (!isValidEmail(email)) return { ok: false, error: 'Ingresá un correo electrónico válido.' };
    if (!isValidPhone(phone)) return { ok: false, error: 'El teléfono debe tener entre 8 y 13 dígitos.' };
    if (!isStrongPassword(password)) return { ok: false, error: 'La contraseña no cumple los requisitos de seguridad.' };
    if (this._accountExists(email)) return { ok: false, error: 'Ya existe una cuenta con ese correo. Probá iniciar sesión.' };

    const profile = this._buildProfile({ email, name, phone });
    this._setCredential(email, hashPassword(password));
    this._setUserAndSessions(profile, this._freshSessions());
    this.toast('success', '¡Cuenta creada!', 'Te has registrado con éxito en Callejeros Río IV.');
    return { ok: true };
  }

  logout() {
    this.state.user = this._blankUser();
    this._saveUser();
    this._loadScope();
    this.notify('user:updated', this.state.user);
    this.toast('info', 'Sesión Finalizada', 'Has cerrado tu sesión con éxito.');
  }

  loginAsGuest() {
    const guest = {
      ...this._blankUser(),
      id: 'guest-' + Date.now(),
      name: 'Vecino Invitado',
      isGuest: true,
      avatar: initialsAvatar('Invitado')
    };
    this.state.returnTo = null;
    this._setUserAndSessions(guest, null);
    this.toast('info', 'Modo Invitado Activo', 'Podés consultar el mapa, el feed y reportar emergencias. Para publicar adopciones o chatear necesitás una cuenta.');
    return true;
  }

  // --------------------------------------------------------
  // Perfil
  // --------------------------------------------------------

  updateProfile(profileData, { message = null, silent = false } = {}) {
    const previous = this.state.user;
    if (!previous.isAuthenticated) return false;
    const next = { ...previous, ...profileData };

    if (profileData.email !== undefined) {
      if (!isValidEmail(next.email)) { this.toast('error', 'Correo inválido', 'Ingresá un correo electrónico válido.'); return false; }
      const oldKey = String(previous.email).toLowerCase();
      const newKey = String(next.email).trim().toLowerCase();
      if (newKey !== oldKey && this._accountExists(newKey)) {
        this.toast('error', 'Correo en uso', 'Ese correo ya pertenece a otra cuenta.');
        return false;
      }
    }

    // Si el avatar es el generado por iniciales, acompañar el cambio de nombre
    if (profileData.name && profileData.name !== previous.name &&
        typeof previous.avatar === 'string' && previous.avatar.startsWith('data:image/svg+xml')) {
      next.avatar = initialsAvatar(profileData.name);
    }

    const oldKey = String(previous.email).toLowerCase();
    const newKey = String(next.email).trim().toLowerCase();
    const emailChanged = newKey !== oldKey;

    this.state.user = next;
    if (!this._saveUser()) {
      this.state.user = previous; // revertir: no se pudo guardar
      return false;
    }

    // El correo es el identificador de la cuenta: la clave y el perfil se mudan al correo nuevo
    if (emailChanged) {
      const creds = this._credentials();
      if (creds[oldKey]) creds[newKey] = creds[oldKey];
      delete creds[oldKey];
      this._persist(STORAGE_KEYS.CREDENTIALS, creds);
      const accounts = StorageManager.get(STORAGE_KEYS.ACCOUNTS, {}) || {};
      delete accounts[oldKey];
      this._persist(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    this._syncPublisherInfo();
    this.notify('user:updated', this.state.user);

    if (!silent) {
      this.toast('success', 'Perfil Actualizado', message || (emailChanged
        ? 'Guardamos tus cambios. Te enviaremos un correo para confirmar la nueva dirección.'
        : 'Se han guardado tus cambios.'));
    }
    return true;
  }

  changePassword(currentPassword, newPassword) {
    const email = this.state.user.email;
    if (!this.isAuthenticated) return { ok: false, error: 'Tenés que iniciar sesión.' };
    if (!this._verifyPassword(email, currentPassword)) return { ok: false, error: 'La contraseña actual no es correcta.' };
    if (!isStrongPassword(newPassword)) return { ok: false, error: 'La nueva contraseña no cumple los requisitos de seguridad.' };
    this._setCredential(email, hashPassword(newPassword));
    this.toast('success', 'Contraseña Actualizada', 'Tu clave ha sido modificada con éxito.');
    return { ok: true };
  }

  /** Recuperación (simulada, sin envío real de correo): define una clave nueva para un correo registrado. */
  resetPassword(email, newPassword) {
    if (!this._accountExists(email)) return { ok: false, error: 'No encontramos una cuenta registrada con ese correo.' };
    if (!isStrongPassword(newPassword)) return { ok: false, error: 'La nueva contraseña no cumple los requisitos de seguridad.' };
    this._setCredential(email, hashPassword(newPassword));
    return { ok: true };
  }

  updateAvatar(avatarDataUrl) {
    const previous = this.state.user;
    this.state.user = { ...previous, avatar: avatarDataUrl };
    if (!this._saveUser()) {
      this.state.user = previous; // no mostrar éxito si no se guardó
      return false;
    }
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'success',
      title: 'Foto Actualizada',
      message: 'Tu foto de perfil se cambió correctamente.'
    });
    return true;
  }

  toggleNotifications() {
    this.state.user.notificationsEnabled = !this.state.user.notificationsEnabled;
    this._saveUser();
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Notificaciones',
      message: this.state.user.notificationsEnabled
        ? 'Recibirás avisos de alertas en tu zona.'
        : 'Notificaciones desactivadas.'
    });
  }

  toggle2FA() {
    this.state.user.twoFactorEnabled = !this.state.user.twoFactorEnabled;
    this._saveUser();
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: this.state.user.twoFactorEnabled ? 'success' : 'info',
      title: 'Autenticación en 2 Pasos (2FA)',
      message: this.state.user.twoFactorEnabled ? '2FA activado correctamente.' : '2FA desactivado.'
    });
  }

  toggleBiometrics() {
    this.state.user.biometricsEnabled = !this.state.user.biometricsEnabled;
    this._saveUser();
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Seguridad Biométrica',
      message: this.state.user.biometricsEnabled ? 'Acceso biométrico habilitado.' : 'Acceso biométrico deshabilitado.'
    });
  }

  toggleDarkMode() {
    const next = !document.documentElement.classList.contains('dark');
    this._applyTheme(next);
    writeThemePreference(next);
    // La preferencia ya quedó guardada en su propia clave. La copia en el perfil se guarda en
    // silencio: si el almacenamiento está lleno, cambiar de tema no debe mostrar un error.
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
  }

  setSearchRadius(radiusKm) {
    this.state.user.searchRadiusKm = Number(radiusKm);
    this._saveUser();
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Radio de Búsqueda',
      message: `Radio ajustado a ${radiusKm} km en Río Cuarto.`
    });
  }

  terminateSession(sessionId) {
    this.state.sessions = this.state.sessions.filter(s => s.id !== sessionId || s.isCurrent);
    this._saveSessions();
    this.notify('sessions:updated', this.state.sessions);
    this.toast('info', 'Sesión Cerrada', 'La sesión remota fue desconectada.');
  }

  terminateOtherSessions() {
    this.state.sessions = this.state.sessions.filter(s => s.isCurrent);
    this._saveSessions();
    this.notify('sessions:updated', this.state.sessions);
    this.toast('success', 'Sesiones Cerradas', 'Se han cerrado todas las demás sesiones remotas.');
  }

  deleteAccount(password) {
    const { id, email } = this.state.user;
    if (!this.isAuthenticated) return { ok: false, error: 'Tenés que iniciar sesión.' };
    if (!this._verifyPassword(email, password)) return { ok: false, error: 'La contraseña no es correcta.' };

    // Lo que la pantalla promete borrar: publicaciones, postulaciones, charlas y credenciales
    const ownPetIds = this.state.adoptions.filter(a => a.publisher?.id === id).map(a => a.id);
    this.state.alerts = this.state.alerts.filter(a => a.publisher?.id !== id);
    this.state.adoptions = this.state.adoptions.filter(a => a.publisher?.id !== id);
    this.state.applications = this.state.applications.filter(a => a.applicantId !== id && !ownPetIds.includes(a.petId));
    this._persist(STORAGE_KEYS.ALERTS, this.state.alerts);
    this._persist(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
    this._persist(STORAGE_KEYS.APPLICATIONS, this.state.applications);

    const key = String(email).toLowerCase();
    const accounts = StorageManager.get(STORAGE_KEYS.ACCOUNTS, {}) || {};
    delete accounts[key];
    StorageManager.set(STORAGE_KEYS.ACCOUNTS, accounts);
    const creds = this._credentials();
    delete creds[key];
    StorageManager.set(STORAGE_KEYS.CREDENTIALS, creds);
    [STORAGE_KEYS.CHATS, STORAGE_KEYS.CONTACTS, STORAGE_KEYS.SESSIONS].forEach(k => StorageManager.remove(scopedKey(k, id)));

    // Quedar en estado "sin sesión" y persistirlo (así no reaparece la cuenta al recargar)
    this.state.user = this._blankUser();
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this._loadScope();

    this.notify('alerts:updated', this.state.alerts);
    this.notify('adoptions:updated', this.state.adoptions);
    this.notify('user:deleted', null);
    this.notify('user:updated', this.state.user);
    this.toast('warning', 'Cuenta Eliminada', 'Tu cuenta y tus publicaciones fueron eliminadas.');
    return { ok: true };
  }

  // ========================================================
  // PERMISOS: solo el autor puede modificar sus publicaciones
  // ========================================================

  canEditAlert(alert) {
    return !!alert && this.isAuthenticated && !alert.publisher?.isAnonymous && alert.publisher?.id === this.state.user.id;
  }

  canEditAdoption(pet) {
    return !!pet && this.isAuthenticated && pet.publisher?.id === this.state.user.id;
  }

  // ========================================================
  // ALERTAS Y REPORTES DE EMERGENCIA
  // ========================================================

  setAlertFilter(filter) {
    this.state.activeAlertFilter = filter;
    this.notify('alerts:filterChanged', filter);
  }

  addAlert(alertData) {
    const newAlert = {
      id: uid('alert'),
      date: new Date().toISOString(),
      status: 'active',
      ...alertData
    };
    this.state.alerts.unshift(newAlert);
    if (!this._persist(STORAGE_KEYS.ALERTS, this.state.alerts)) {
      this.state.alerts.shift(); // revertir: no se pudo guardar
      return null;
    }
    this.notify('alerts:updated', this.state.alerts);
    this.notify('toast', {
      type: 'success',
      title: '¡Reporte Publicado!',
      message: 'La alerta comunitaria ya está visible en el feed y mapa de Río Cuarto.'
    });
    return newAlert;
  }

  updateAlert(alertId, updatedData) {
    const index = this.state.alerts.findIndex(a => a.id === alertId);
    if (index === -1 || !this.canEditAlert(this.state.alerts[index])) return false;
    const { id, publisher, ...safe } = updatedData;
    const previous = this.state.alerts[index];
    this.state.alerts[index] = {
      ...previous,
      ...safe,
      publisher: publisher ? { ...previous.publisher, phone: publisher.phone ?? previous.publisher.phone } : previous.publisher
    };
    if (!this._persist(STORAGE_KEYS.ALERTS, this.state.alerts)) {
      this.state.alerts[index] = previous;
      return false;
    }
    this.notify('alerts:updated', this.state.alerts);
    this.toast('success', 'Reporte Actualizado', 'Los datos del reporte fueron modificados con éxito.');
    return true;
  }

  deleteAlert(alertId) {
    if (!this.canEditAlert(this.state.alerts.find(a => a.id === alertId))) return false;
    this.state.alerts = this.state.alerts.filter(a => a.id !== alertId);
    this._persist(STORAGE_KEYS.ALERTS, this.state.alerts);
    this.notify('alerts:updated', this.state.alerts);
    this.toast('info', 'Reporte Eliminado', 'El reporte fue retirado de la plataforma.');
    return true;
  }

  markAlertResolved(alertId) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (!this.canEditAlert(alert)) return false;
    alert.status = alert.status === 'rescued' ? 'active' : 'rescued';
    this._persist(STORAGE_KEYS.ALERTS, this.state.alerts);
    this.notify('alerts:updated', this.state.alerts);
    this.toast('success',
      alert.status === 'rescued' ? '¡Caso Resuelto!' : 'Alerta Reactivada',
      alert.status === 'rescued'
        ? 'El animal fue marcado como rescatado o reunido con su familia.'
        : 'La alerta volvió al estado activo en Río Cuarto.');
    return true;
  }

  // ========================================================
  // ADOPCIONES RESPONSABLES
  // ========================================================

  /** Compatibilidad: acepta TODOS | PERROS | GATOS (o el valor de especie directo). */
  setAdoptionFilter(filter) {
    const map = { TODOS: 'TODOS', PERROS: 'Perro', GATOS: 'Gato' };
    this.state.activeAdoptionFilter = filter;
    this.state.adoptionFilters.species = map[filter] || filter;
    this.notify('adoptions:filterChanged', filter);
  }

  setAdoptionFilters(filters) {
    this.state.adoptionFilters = {
      ...this.state.adoptionFilters,
      ...filters
    };
    this.notify('adoptions:filtersUpdated', this.state.adoptionFilters);
  }

  resetAdoptionFilters() {
    this.state.activeAdoptionFilter = 'TODOS';
    this.setAdoptionFilters({ species: 'TODOS', size: 'TODOS', age: 'TODOS', gender: 'TODOS', zone: 'TODOS', modality: 'TODOS' });
  }

  addAdoption(adoptionData) {
    if (!this.isAuthenticated) return null;
    const newAdop = {
      id: uid('adop'),
      publisher: {
        id: this.state.user.id,
        name: this.state.user.name,
        phone: this.state.user.phone,
        role: 'Vecino Rescatista'
      },
      status: 'available',
      publishedAt: new Date().toISOString(),
      ...adoptionData
    };
    this.state.adoptions.unshift(newAdop);
    if (!this._persist(STORAGE_KEYS.ADOPTIONS, this.state.adoptions)) {
      this.state.adoptions.shift(); // revertir: no se pudo guardar
      return null;
    }
    this.notify('adoptions:updated', this.state.adoptions);
    this.notify('toast', {
      type: 'success',
      title: '¡Mascota Publicada!',
      message: `${newAdop.name} ya está en la lista de adopción responsable.`
    });
    return newAdop;
  }

  updateAdoption(adopId, updatedData) {
    const index = this.state.adoptions.findIndex(a => a.id === adopId);
    if (index === -1 || !this.canEditAdoption(this.state.adoptions[index])) return false;
    const { id, publisher, ...safe } = updatedData; // no se puede cambiar el dueño ni el id
    const previous = this.state.adoptions[index];
    this.state.adoptions[index] = { ...previous, ...safe };
    if (!this._persist(STORAGE_KEYS.ADOPTIONS, this.state.adoptions)) {
      this.state.adoptions[index] = previous;
      return false;
    }
    this.notify('adoptions:updated', this.state.adoptions);
    this.toast('success', 'Ficha Actualizada', 'Se han guardado los cambios en la publicación de adopción.');
    return true;
  }

  deleteAdoption(adopId) {
    if (!this.canEditAdoption(this.state.adoptions.find(a => a.id === adopId))) return false;
    this.state.adoptions = this.state.adoptions.filter(a => a.id !== adopId);
    this.state.applications = this.state.applications.filter(a => a.petId !== adopId);
    this._persist(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
    this._persist(STORAGE_KEYS.APPLICATIONS, this.state.applications);
    this.notify('adoptions:updated', this.state.adoptions);
    this.toast('info', 'Publicación Eliminada', 'La ficha de adopción fue dada de baja.');
    return true;
  }

  markAdoptionCompleted(adopId) {
    const pet = this.state.adoptions.find(a => a.id === adopId);
    if (!this.canEditAdoption(pet)) return false;
    pet.status = pet.status === 'adopted' ? 'available' : 'adopted';
    this._persist(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
    this.notify('adoptions:updated', this.state.adoptions);
    this.toast('success',
      pet.status === 'adopted' ? '¡Adopción Concretada!' : 'Ficha Disponible',
      pet.status === 'adopted'
        ? `¡Felicidades! ${pet.name} encontró su hogar definitivo.`
        : `${pet.name} está nuevamente disponible para adopción.`);
    return true;
  }

  submitAdoptionApplication(applicationData) {
    if (!this.isAuthenticated) return null;
    const user = this.state.user;
    const duplicated = this.state.applications.some(a =>
      a.petId === applicationData.petId && a.applicantId === user.id && a.status === 'pending');
    if (duplicated) {
      this.toast('info', 'Ya te postulaste', 'Tu solicitud para esta mascota ya está pendiente de revisión.');
      return null;
    }
    const newApplication = {
      id: uid('app'),
      date: new Date().toISOString(),
      status: 'pending',
      ...applicationData,
      applicantId: user.id
    };
    this.state.applications.unshift(newApplication);
    this._persist(STORAGE_KEYS.APPLICATIONS, this.state.applications);
    this.notify('applications:updated', this.state.applications);
    this.toast('success', '¡Postulación Enviada!', `Tu solicitud para adoptar a ${newApplication.petName} fue enviada al rescatista.`);
    return newApplication;
  }

  updateApplicationStatus(appId, newStatus) {
    const app = this.state.applications.find(a => a.id === appId);
    if (!app) return false;
    if (!this.canEditAdoption(this.state.adoptions.find(p => p.id === app.petId))) return false;
    app.status = newStatus;
    this._persist(STORAGE_KEYS.APPLICATIONS, this.state.applications);
    this.notify('applications:updated', this.state.applications);
    this.toast(newStatus === 'approved' ? 'success' : 'info', 'Estado de Solicitud Actualizado',
      `La solicitud de ${app.applicantName} fue marcada como ${newStatus === 'approved' ? 'Aprobada' : 'Rechazada'}.`);
    return true;
  }

  getRescueStats() {
    const activeAlerts = this.state.alerts.filter(a => a.status === 'active').length;
    const resolvedAlerts = this.state.alerts.filter(a => a.status === 'rescued').length;
    const availableAdoptions = this.state.adoptions.filter(a => a.status !== 'adopted').length;
    const adoptedPets = this.state.adoptions.filter(a => a.status === 'adopted').length;
    const pendingApps = this.state.applications.filter(a => a.status === 'pending').length;

    return {
      activeAlerts,
      resolvedAlerts,
      availableAdoptions,
      adoptedPets,
      pendingApps,
      totalRescues: resolvedAlerts + 184 // Mock total histórico
    };
  }


  // ========================================================
  // MENSAJERÍA, CHATS Y GRUPOS
  // ========================================================

  sendMessage(chatId, text) {
    const chat = this.state.chats.find(c => c.id === chatId);
    if (!chat || !text.trim() || !this.isAuthenticated) return false;
    if (chat.type === 'direct' && this.getContact(chat.recipientId)?.isBlocked) {
      this.toast('warning', 'Contacto bloqueado', 'Desbloqueá a este contacto para poder enviarle mensajes.');
      return false;
    }

    const timeStr = nowTime();
    const newMsg = {
      id: uid('msg'),
      senderId: this.state.user.id,
      senderName: this.state.user.name,
      text: text.trim(),
      time: timeStr
    };

    chat.messages.push(newMsg);
    chat.lastMessage = (chat.type === 'group' ? `${this.state.user.name}: ` : '') + text.trim();
    chat.timestamp = timeStr;

    this._saveChats();
    this.notify('chat:messageSent', { chatId, message: newMsg });
    this.notify('chats:updated', this.state.chats);
    return true;
  }

  getContact(contactId) {
    return this.state.contacts.find(c => c.id === contactId) || null;
  }

  /** Contacto que corresponde al publicador de una alerta/adopción (null si no es un contacto). */
  resolveContactId(publisherId) {
    if (!publisherId) return null;
    if (this.getContact(publisherId)) return publisherId;
    const guess = String(publisherId).replace(/^user-/, 'contact-');
    return this.getContact(guess) ? guess : null;
  }

  isGroupAdmin(chat) {
    return !!chat?.members?.some(m => m.id === this.state.user.id && m.role === 'admin');
  }

  markChatRead(chatId) {
    const chat = this.state.chats.find(c => c.id === chatId);
    if (chat && chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this._saveChats();
    }
  }

  /**
   * Abre (o crea) una conversación directa. `recipientId` debe ser un contacto real:
   * antes todas las salas nuevas quedaban asociadas a "Sofía", y bloquear o eliminar afectaba a la persona equivocada.
   */
  createOrOpenRescueChat(title, initialMessage = null, recipientId = null) {
    if (!this.isAuthenticated) {
      this.state.returnTo = '#/chats';
      this.toast('info', 'Iniciá sesión para chatear', 'Necesitás una cuenta para coordinar por mensajes.');
      window.location.hash = '#/login';
      return null;
    }

    let existing = this.state.chats.find(c => c.title === title && (c.recipientId || null) === (recipientId || null));
    if (!existing) {
      existing = {
        id: uid('rescue-chat'),
        type: 'direct',
        title,
        recipientId: recipientId || null,
        lastMessage: initialMessage || 'Sala de coordinación de rescate iniciada.',
        timestamp: nowTime(),
        unreadCount: 0,
        messages: [
          {
            id: uid('m-init'),
            senderId: this.state.user.id,
            senderName: this.state.user.name,
            text: initialMessage || `Hola, me comunico sobre: "${title}". ¿Cómo podemos coordinar?`,
            time: nowTime()
          }
        ]
      };
      this.state.chats.unshift(existing);
      this._saveChats();
    }

    this.state.activeChatId = existing.id;
    this.notify('chats:updated', this.state.chats);
    window.location.hash = '#/chats';
    return existing;
  }

  createGroupChat({ name, description, avatar, memberIds }) {
    const newGroup = {
      id: uid('group'),
      type: 'group',
      title: name,
      description: description || 'Grupo de rescate y coordinación comunitaria.',
      avatar: avatar || '🐾',
      lastMessage: 'Grupo creado por ' + this.state.user.name,
      timestamp: 'Ahora',
      unreadCount: 0,
      isAdmin: true,
      members: [
        { id: this.state.user.id, name: `${this.state.user.name} (Tú)`, role: 'admin' },
        ...memberIds.map(mid => {
          const c = this.state.contacts.find(con => con.id === mid);
          return { id: mid, name: c ? c.name : 'Miembro', role: 'member' };
        })
      ],
      messages: [
        {
          id: `gm-0-${Date.now()}`,
          senderId: this.state.user.id,
          senderName: 'Sistema',
          text: `¡Grupo "${name}" creado exitosamente!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        }
      ]
    };

    this.state.chats.unshift(newGroup);
    this.state.activeChatId = newGroup.id;
    this._saveChats();
    this.notify('chats:updated', this.state.chats);
    this.notify('toast', {
      type: 'success',
      title: '¡Grupo Creado!',
      message: `El grupo "${name}" fue creado con ${newGroup.members.length} integrantes.`
    });
    return newGroup;
  }

  leaveGroup(groupId) {
    const chatIndex = this.state.chats.findIndex(c => c.id === groupId);
    if (chatIndex === -1) return;
    const group = this.state.chats[chatIndex];
    const wasAdmin = this.isGroupAdmin(group);
    const others = group.members.filter(m => m.id !== this.state.user.id);
    // Si era el único admin, el rol pasa al siguiente integrante
    if (wasAdmin && others.length > 0 && !others.some(m => m.role === 'admin')) others[0].role = 'admin';
    this.state.chats.splice(chatIndex, 1);
    this._saveChats();
    this.state.activeChatId = this.state.chats[0]?.id || null;
    this.notify('chats:updated', this.state.chats);
    this.toast('info', 'Has salido del grupo',
      wasAdmin && others.length > 0 ? 'Saliste del grupo y la administración se transfirió.' : 'Saliste del grupo.');
  }

  promoteToAdmin(groupId, memberId) {
    const group = this.state.chats.find(c => c.id === groupId);
    if (!group || !this.isGroupAdmin(group)) return;
    const member = group.members.find(m => m.id === memberId);
    if (member) {
      member.role = 'admin';
      this._saveChats();
      this.notify('chats:updated', this.state.chats);
      this.toast('success', 'Rol Actualizado', `${member.name} ahora es Administrador del grupo.`);
    }
  }

  removeMemberFromGroup(groupId, memberId) {
    const group = this.state.chats.find(c => c.id === groupId);
    if (!group || !this.isGroupAdmin(group) || memberId === this.state.user.id) return;
    group.members = group.members.filter(m => m.id !== memberId);
    this._saveChats();
    this.notify('chats:updated', this.state.chats);
    this.toast('warning', 'Miembro Expulsado', 'El usuario fue removido del grupo.');
  }

  reportEntity(entityType, entityId, reason) {
    this.notify('toast', {
      type: 'info',
      title: 'Reporte Recibido',
      message: `Gracias. Hemos registrado tu denuncia por "${reason}". El equipo de moderación revisará el caso.`
    });
  }

  toggleMuteContact(contactId) {
    const contact = this.getContact(contactId);
    if (!contact) return;
    contact.isMuted = !contact.isMuted;
    this._saveContacts();
    this.notify('contacts:updated', this.state.contacts);
    this.toast('info', contact.isMuted ? 'Chat silenciado' : 'Chat con sonido',
      contact.isMuted ? `No recibirás avisos de ${contact.name}.` : `Volverás a recibir avisos de ${contact.name}.`);
  }

  toggleBlockContact(contactId) {
    const contact = this.getContact(contactId);
    if (!contact) return;
    contact.isBlocked = !contact.isBlocked;
    this._saveContacts();
    this.notify('contacts:updated', this.state.contacts);
    this.toast(contact.isBlocked ? 'warning' : 'info',
      contact.isBlocked ? 'Contacto Bloqueado' : 'Contacto Desbloqueado',
      contact.isBlocked
        ? `Has bloqueado a ${contact.name}. No podrás enviarle mensajes.`
        : `Has desbloqueado a ${contact.name}.`);
  }

  deleteContact(contactId) {
    if (!this.getContact(contactId)) return;
    this.state.contacts = this.state.contacts.filter(c => c.id !== contactId);
    this.state.chats = this.state.chats.filter(c => c.recipientId !== contactId);
    if (!this.state.chats.some(c => c.id === this.state.activeChatId)) this.state.activeChatId = this.state.chats[0]?.id || null;
    this._saveContacts();
    this._saveChats();
    this.notify('contacts:updated', this.state.contacts);
    this.notify('chats:updated', this.state.chats);
    this.toast('info', 'Contacto Eliminado', 'El contacto y sus conversaciones han sido eliminados.');
  }

  /** Elimina solo la conversación (charlas que no tienen un contacto asociado). */
  deleteChat(chatId) {
    this.state.chats = this.state.chats.filter(c => c.id !== chatId);
    if (!this.state.chats.some(c => c.id === this.state.activeChatId)) this.state.activeChatId = this.state.chats[0]?.id || null;
    this._saveChats();
    this.notify('chats:updated', this.state.chats);
    this.toast('info', 'Conversación Eliminada', 'La conversación fue eliminada.');
  }
}

export const Store = new ReactiveStore();
