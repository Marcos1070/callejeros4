/**
 * Store Central Reactivo: Callejeros Río IV
 * Administra el estado global, persistencia en LocalStorage y eventos Pub/Sub
 */

import { StorageManager } from './storage.js';
import {
  INITIAL_USER,
  INITIAL_ALERTS,
  INITIAL_POIS,
  INITIAL_ADOPTIONS,
  INITIAL_SESSIONS,
  INITIAL_CONTACTS,
  INITIAL_CHATS,
  INITIAL_ADOPTION_APPLICATIONS
} from './data.js';

const STORAGE_KEYS = {
  USER: 'callejeros_user',
  ALERTS: 'callejeros_alerts',
  ADOPTIONS: 'callejeros_adoptions',
  APPLICATIONS: 'callejeros_applications',
  SESSIONS: 'callejeros_sessions',
  CONTACTS: 'callejeros_contacts',
  CHATS: 'callejeros_chats',
  SETTINGS: 'callejeros_settings'
};

class ReactiveStore {
  constructor() {
    this.listeners = new Map();

    // Estado reactivo cargado con fallbacks
    this.state = {
      user: StorageManager.get(STORAGE_KEYS.USER, INITIAL_USER),
      alerts: StorageManager.get(STORAGE_KEYS.ALERTS, INITIAL_ALERTS),
      pois: INITIAL_POIS,
      adoptions: StorageManager.get(STORAGE_KEYS.ADOPTIONS, INITIAL_ADOPTIONS),
      applications: StorageManager.get(STORAGE_KEYS.APPLICATIONS, INITIAL_ADOPTION_APPLICATIONS),
      sessions: StorageManager.get(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS),
      contacts: StorageManager.get(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS),
      chats: StorageManager.get(STORAGE_KEYS.CHATS, INITIAL_CHATS),
      currentView: 'home',
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
      activeChatId: 'group-banda-norte',
      selectedPOI: null,
      activeModal: null
    };

    // Aplicar modo oscuro si estuviera activo
    if (this.state.user.darkMode) {
      document.documentElement.classList.add('dark');
    }
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

  login(email, password) {
    this.state.user = {
      ...this.state.user,
      email,
      isAuthenticated: true
    };
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'success',
      title: '¡Bienvenido/a!',
      message: `Sesión iniciada como ${this.state.user.name}`
    });
    return true;
  }

  register(userData) {
    this.state.user = {
      ...this.state.user,
      ...userData,
      isAuthenticated: true
    };
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'success',
      title: '¡Cuenta creada!',
      message: 'Te has registrado con éxito en Callejeros Río IV.'
    });
    return true;
  }

  logout() {
    this.state.user.isAuthenticated = false;
    this.state.user.isGuest = false;
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Sesión Finalizada',
      message: 'Has cerrado tu sesión con éxito.'
    });
  }

  loginAsGuest() {
    this.state.user = {
      ...this.state.user,
      id: 'guest-' + Date.now(),
      name: 'Vecino Invitado',
      email: '',
      phone: '',
      isAuthenticated: false,
      isGuest: true
    };
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Modo Invitado Activo',
      message: 'Podés consultar el mapa, el feed y reportar emergencias.'
    });
    return true;
  }

  updateProfile(profileData) {
    this.state.user = {
      ...this.state.user,
      ...profileData
    };
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'success',
      title: 'Perfil Actualizado',
      message: 'Se han guardado tus cambios. Hemos enviado un mail de confirmación a tu correo.'
    });
  }

  updateAvatar(avatarDataUrl) {
    this.state.user = {
      ...this.state.user,
      avatar: avatarDataUrl
    };
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'success',
      title: 'Foto Actualizada',
      message: 'Tu foto de perfil se cambió correctamente.'
    });
  }

  toggle2FA() {
    this.state.user.twoFactorEnabled = !this.state.user.twoFactorEnabled;
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: this.state.user.twoFactorEnabled ? 'success' : 'info',
      title: 'Autenticación en 2 Pasos (2FA)',
      message: this.state.user.twoFactorEnabled ? '2FA activado correctamente.' : '2FA desactivado.'
    });
  }

  toggleBiometrics() {
    this.state.user.biometricsEnabled = !this.state.user.biometricsEnabled;
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Seguridad Biométrica',
      message: this.state.user.biometricsEnabled ? 'Acceso biométrico habilitado.' : 'Acceso biométrico deshabilitado.'
    });
  }

  toggleDarkMode() {
    this.state.user.darkMode = !this.state.user.darkMode;
    if (this.state.user.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
  }

  setSearchRadius(radiusKm) {
    this.state.user.searchRadiusKm = Number(radiusKm);
    StorageManager.set(STORAGE_KEYS.USER, this.state.user);
    this.notify('user:updated', this.state.user);
    this.notify('toast', {
      type: 'info',
      title: 'Radio de Búsqueda',
      message: `Radio ajustado a ${radiusKm} km en Río Cuarto.`
    });
  }

  terminateSession(sessionId) {
    this.state.sessions = this.state.sessions.filter(s => s.id !== sessionId);
    StorageManager.set(STORAGE_KEYS.SESSIONS, this.state.sessions);
    this.notify('sessions:updated', this.state.sessions);
    this.notify('toast', {
      type: 'info',
      title: 'Sesión Cerrada',
      message: 'La sesión remota fue desconectada.'
    });
  }

  terminateOtherSessions() {
    this.state.sessions = this.state.sessions.filter(s => s.isCurrent);
    StorageManager.set(STORAGE_KEYS.SESSIONS, this.state.sessions);
    this.notify('sessions:updated', this.state.sessions);
    this.notify('toast', {
      type: 'success',
      title: 'Sesiones Cerradas',
      message: 'Se han cerrado todas las demás sesiones remotas.'
    });
  }

  deleteAccount(password) {
    this.state.user.isAuthenticated = false;
    this.state.user.name = 'Usuario Eliminado';
    StorageManager.remove(STORAGE_KEYS.USER);
    this.notify('user:deleted', null);
    this.notify('toast', {
      type: 'warning',
      title: 'Cuenta Eliminada',
      message: 'Tu cuenta ha sido eliminada permanentemente.'
    });
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
      id: `alert-${Date.now()}`,
      timestamp: 'Recién publicado',
      date: new Date().toISOString(),
      status: 'active',
      ...alertData
    };
    this.state.alerts.unshift(newAlert);
    StorageManager.set(STORAGE_KEYS.ALERTS, this.state.alerts);
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
    if (index > -1) {
      this.state.alerts[index] = { ...this.state.alerts[index], ...updatedData };
      StorageManager.set(STORAGE_KEYS.ALERTS, this.state.alerts);
      this.notify('alerts:updated', this.state.alerts);
      this.notify('toast', {
        type: 'success',
        title: 'Reporte Actualizado',
        message: 'Los datos del reporte fueron modificados con éxito.'
      });
    }
  }

  deleteAlert(alertId) {
    this.state.alerts = this.state.alerts.filter(a => a.id !== alertId);
    StorageManager.set(STORAGE_KEYS.ALERTS, this.state.alerts);
    this.notify('alerts:updated', this.state.alerts);
    this.notify('toast', {
      type: 'info',
      title: 'Reporte Eliminado',
      message: 'El reporte fue retirado de la plataforma.'
    });
  }

  markAlertResolved(alertId) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = alert.status === 'rescued' ? 'active' : 'rescued';
      StorageManager.set(STORAGE_KEYS.ALERTS, this.state.alerts);
      this.notify('alerts:updated', this.state.alerts);
      this.notify('toast', {
        type: 'success',
        title: alert.status === 'rescued' ? '¡Caso Resuelto!' : 'Alerta Reactivada',
        message: alert.status === 'rescued'
          ? 'El animal fue marcado como rescatado o reunido con su familia.'
          : 'La alerta volvió al estado activo en Río Cuarto.'
      });
    }
  }

  // ========================================================
  // ADOPCIONES RESPONSABLES
  // ========================================================

  setAdoptionFilter(filter) {
    this.state.activeAdoptionFilter = filter;
    this.state.adoptionFilters.species = filter;
    this.notify('adoptions:filterChanged', filter);
  }

  setAdoptionFilters(filters) {
    this.state.adoptionFilters = {
      ...this.state.adoptionFilters,
      ...filters
    };
    this.notify('adoptions:filtersUpdated', this.state.adoptionFilters);
  }

  addAdoption(adoptionData) {
    const newAdop = {
      id: `adop-${Date.now()}`,
      publisher: {
        id: this.state.user.id,
        name: this.state.user.name,
        phone: this.state.user.phone,
        role: 'Vecino Rescatista'
      },
      status: 'available',
      ...adoptionData
    };
    this.state.adoptions.unshift(newAdop);
    StorageManager.set(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
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
    if (index > -1) {
      this.state.adoptions[index] = { ...this.state.adoptions[index], ...updatedData };
      StorageManager.set(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
      this.notify('adoptions:updated', this.state.adoptions);
      this.notify('toast', {
        type: 'success',
        title: 'Ficha Actualizada',
        message: 'Se han guardado los cambios en la publicación de adopción.'
      });
    }
  }

  deleteAdoption(adopId) {
    this.state.adoptions = this.state.adoptions.filter(a => a.id !== adopId);
    StorageManager.set(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
    this.notify('adoptions:updated', this.state.adoptions);
    this.notify('toast', {
      type: 'info',
      title: 'Publicación Eliminada',
      message: 'La ficha de adopción fue dada de baja.'
    });
  }

  markAdoptionCompleted(adopId) {
    const pet = this.state.adoptions.find(a => a.id === adopId);
    if (pet) {
      pet.status = pet.status === 'adopted' ? 'available' : 'adopted';
      StorageManager.set(STORAGE_KEYS.ADOPTIONS, this.state.adoptions);
      this.notify('adoptions:updated', this.state.adoptions);
      this.notify('toast', {
        type: 'success',
        title: pet.status === 'adopted' ? '¡Adopción Concretada!' : 'Ficha Disponible',
        message: pet.status === 'adopted'
          ? `¡Felicidades! ${pet.name} encontró su hogar definitivo.`
          : `${pet.name} está nuevamente disponible para adopción.`
      });
    }
  }

  submitAdoptionApplication(applicationData) {
    const newApplication = {
      id: `app-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending',
      ...applicationData
    };
    this.state.applications.unshift(newApplication);
    StorageManager.set(STORAGE_KEYS.APPLICATIONS, this.state.applications);
    this.notify('applications:updated', this.state.applications);
    this.notify('toast', {
      type: 'success',
      title: '¡Postulación Enviada!',
      message: `Tu solicitud para adoptar a ${newApplication.petName} fue enviada al rescatista.`
    });
    return newApplication;
  }

  updateApplicationStatus(appId, newStatus) {
    const app = this.state.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      StorageManager.set(STORAGE_KEYS.APPLICATIONS, this.state.applications);
      this.notify('applications:updated', this.state.applications);
      this.notify('toast', {
        type: newStatus === 'approved' ? 'success' : 'info',
        title: 'Estado de Solicitud Actualizado',
        message: `La solicitud de ${app.applicantName} fue marcada como ${newStatus === 'approved' ? 'Aprobada' : 'Rechazada'}.`
      });
    }
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
    if (!chat || !text.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: this.state.user.id,
      senderName: this.state.user.name,
      text: text.trim(),
      time: timeStr,
      isMe: true
    };

    chat.messages.push(newMsg);
    chat.lastMessage = (chat.type === 'group' ? `${this.state.user.name}: ` : '') + text.trim();
    chat.timestamp = timeStr;

    StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
    this.notify('chat:messageSent', { chatId, message: newMsg });
    this.notify('chats:updated', this.state.chats);
  }

  createOrOpenRescueChat(title, initialMessage = null) {
    let existing = this.state.chats.find(c => c.title === title);
    if (!existing) {
      existing = {
        id: `rescue-chat-${Date.now()}`,
        type: 'direct',
        title,
        recipientId: 'contact-sofia',
        lastMessage: initialMessage || 'Sala de coordinación de rescate iniciada.',
        timestamp: 'Ahora',
        unreadCount: 0,
        messages: [
          {
            id: `m-init-${Date.now()}`,
            senderId: this.state.user.id,
            text: initialMessage || `Hola, me comunico sobre: "${title}". ¿Cómo podemos coordinar?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
          }
        ]
      };
      this.state.chats.unshift(existing);
      StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
    }

    this.state.activeChatId = existing.id;
    this.notify('chats:updated', this.state.chats);
    window.location.hash = '#/chats';
    return existing;
  }

  createGroupChat({ name, description, avatar, memberIds }) {
    const newGroup = {
      id: `group-${Date.now()}`,
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
    StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
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
    if (chatIndex > -1) {
      const group = this.state.chats[chatIndex];
      // Si era admin, transferir rol al siguiente miembro
      if (group.isAdmin && group.members.length > 1) {
        const nextMember = group.members.find(m => m.id !== this.state.user.id);
        if (nextMember) nextMember.role = 'admin';
      }
      this.state.chats.splice(chatIndex, 1);
      StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
      this.state.activeChatId = this.state.chats[0]?.id || null;
      this.notify('chats:updated', this.state.chats);
      this.notify('toast', {
        type: 'info',
        title: 'Has salido del grupo',
        message: 'Has abandonado el grupo y transferido la administración.'
      });
    }
  }

  promoteToAdmin(groupId, memberId) {
    const group = this.state.chats.find(c => c.id === groupId);
    if (group) {
      const member = group.members.find(m => m.id === memberId);
      if (member) {
        member.role = 'admin';
        StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
        this.notify('chats:updated', this.state.chats);
        this.notify('toast', {
          type: 'success',
          title: 'Rol Actualizado',
          message: `${member.name} ahora es Administrador del grupo.`
        });
      }
    }
  }

  removeMemberFromGroup(groupId, memberId) {
    const group = this.state.chats.find(c => c.id === groupId);
    if (group) {
      group.members = group.members.filter(m => m.id !== memberId);
      StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
      this.notify('chats:updated', this.state.chats);
      this.notify('toast', {
        type: 'warning',
        title: 'Miembro Expulsado',
        message: 'El usuario fue removido del grupo.'
      });
    }
  }

  reportEntity(entityType, entityId, reason) {
    this.notify('toast', {
      type: 'info',
      title: 'Reporte Recibido',
      message: `Gracias. Hemos registrado tu denuncia por "${reason}". El equipo de moderación revisará el caso.`
    });
  }

  toggleBlockContact(contactId) {
    const contact = this.state.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.isBlocked = !contact.isBlocked;
      StorageManager.set(STORAGE_KEYS.CONTACTS, this.state.contacts);
      this.notify('contacts:updated', this.state.contacts);
      this.notify('toast', {
        type: contact.isBlocked ? 'warning' : 'info',
        title: contact.isBlocked ? 'Contacto Bloqueado' : 'Contacto Desbloqueado',
        message: contact.isBlocked
          ? `Has bloqueado a ${contact.name}. No recibirás más mensajes.`
          : `Has desbloqueado a ${contact.name}.`
      });
    }
  }

  deleteContact(contactId) {
    this.state.contacts = this.state.contacts.filter(c => c.id !== contactId);
    this.state.chats = this.state.chats.filter(c => c.recipientId !== contactId);
    StorageManager.set(STORAGE_KEYS.CONTACTS, this.state.contacts);
    StorageManager.set(STORAGE_KEYS.CHATS, this.state.chats);
    this.notify('contacts:updated', this.state.contacts);
    this.notify('chats:updated', this.state.chats);
    this.notify('toast', {
      type: 'info',
      title: 'Contacto Eliminado',
      message: 'El contacto y sus conversaciones han sido eliminados.'
    });
  }
}

export const Store = new ReactiveStore();
