/**
 * Chat Component - Módulo de Mensajería, Chats y Grupos
 * Chat 1 a 1, buscador con error "Contacto no encontrado", grupos y administración de roles
 */

import { Store } from '../store.js';
import { Modal } from './modal.js';

let activeTab = 'chats'; // chats | groups | contacts
let contactSearchQuery = '';

export function renderChats(containerId = 'view-chats') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chats = Store.state.chats;
  const contacts = Store.state.contacts;
  const user = Store.state.user;
  const activeChat = chats.find(c => c.id === Store.state.activeChatId) || chats[0];

  // Filtrado de contactos para el buscador
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    c.phone.includes(contactSearchQuery)
  );

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-labelledby="chat-main-heading">
      <h2 id="chat-main-heading" class="sr-only">Centro de Mensajería y Coordinación Comunitaria</h2>

      <div class="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        
        <!-- COLUMNA IZQUIERDA: LISTA DE CHATS Y CONTACTOS (5 cols) -->
        <div class="md:col-span-5 border-r border-gray-200 flex flex-col bg-[#EBEBEB]/40">
          
          <!-- Cabecera de Columna y Pestañas -->
          <div class="p-4 border-b border-gray-200 bg-white space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-black text-xl text-black">Mensajes</h3>
              <button id="btn-create-group-modal" type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E0A800] text-black hover:bg-[#c99700] shadow-sm">
                <span>+ Crear Grupo</span>
              </button>
            </div>

            <!-- Buscador de Contactos con Validación -->
            <div class="relative">
              <input
                type="search"
                id="contact-search-input"
                value="${contactSearchQuery}"
                placeholder="Buscar contacto o voluntario..."
                class="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-300 text-xs focus-visible:ring-2 focus-visible:ring-[#E0A800] bg-white"
              />
              <span class="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            <!-- Pestañas de Vista: Chats vs Contactos -->
            <div class="flex items-center gap-1 bg-[#EBEBEB] p-1 rounded-full text-xs font-bold">
              <button type="button" id="tab-all-chats" class="flex-1 py-1.5 rounded-full transition-all ${activeTab === 'chats' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A]'}">
                Conversaciones (${chats.length})
              </button>
              <button type="button" id="tab-contacts" class="flex-1 py-1.5 rounded-full transition-all ${activeTab === 'contacts' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A]'}">
                Contactos (${contacts.length})
              </button>
            </div>
          </div>

          <!-- Lista Scrollable de Chats o Contactos -->
          <div class="flex-1 overflow-y-auto divide-y divide-gray-200/80">
            ${activeTab === 'chats' ? `
              <!-- Lista de Conversaciones Activas -->
              ${chats.map(chat => {
                const isActive = activeChat && activeChat.id === chat.id;
                const isGroup = chat.type === 'group';

                return `
                  <button type="button" data-select-chat="${chat.id}" class="
                    w-full p-4 text-left flex items-start gap-3 transition-colors
                    ${isActive ? 'bg-[#98D7FF]/25 border-l-4 border-[#0284C7]' : 'hover:bg-white'}
                  ">
                    <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold ${isGroup ? 'bg-[#E0A800] text-black' : 'bg-sky-100 text-[#0284C7]'} shadow-sm">
                      ${isGroup ? (chat.avatar || '🐾') : (chat.title.charAt(0))}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <h4 class="font-bold text-sm text-black truncate">${chat.title}</h4>
                        <span class="text-[10px] text-gray-400 font-semibold">${chat.timestamp}</span>
                      </div>
                      <p class="text-xs text-[#4A4A4A] truncate">${chat.lastMessage}</p>
                    </div>
                    ${chat.unreadCount > 0 ? `
                      <span class="w-5 h-5 rounded-full bg-[#E0A800] text-black text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        ${chat.unreadCount}
                      </span>
                    ` : ''}
                  </button>
                `;
              }).join('')}
            ` : `
              <!-- Vista de Búsqueda de Contactos con Error "Contacto no encontrado" -->
              ${filteredContacts.length === 0 ? `
                <div class="p-8 text-center space-y-3">
                  <div class="w-16 h-16 rounded-full bg-red-50 text-[#C50000] border border-red-200 flex items-center justify-center text-2xl mx-auto">
                    ⚠️
                  </div>
                  <h4 class="font-black text-sm text-black">Contacto no encontrado</h4>
                  <p class="text-xs text-[#4A4A4A] leading-relaxed max-w-xs mx-auto">
                    No encontramos ningún voluntario con el nombre "<strong>${contactSearchQuery}</strong>" en Río Cuarto.
                  </p>
                </div>
              ` : `
                ${filteredContacts.map(c => `
                  <div class="p-4 flex items-center justify-between hover:bg-white transition-colors">
                    <div class="flex items-center gap-3">
                      <img src="${c.avatar}" alt="${c.name}" class="w-10 h-10 rounded-full object-cover border border-gray-300" />
                      <div>
                        <span class="font-bold text-sm text-black block">${c.name}</span>
                        <span class="text-xs text-[#4A4A4A]">${c.role} · ${c.phone}</span>
                      </div>
                    </div>
                    <button type="button" data-start-contact-chat="${c.id}" class="px-3 py-1.5 rounded-full text-xs font-bold bg-[#98D7FF] text-black hover:bg-sky-300">
                      Chatear
                    </button>
                  </div>
                `).join('')}
              `}
            `}
          </div>

        </div>

        <!-- COLUMNA DERECHA: VENTANA DE CONVERSACIÓN ACTIVA (7 cols) -->
        <div class="md:col-span-7 flex flex-col justify-between bg-white h-[640px]">
          
          ${activeChat ? `
            <!-- Cabecera del Chat Activo con Menú Contextual (3 puntos) -->
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold ${activeChat.type === 'group' ? 'bg-[#E0A800] text-black' : 'bg-sky-100 text-[#0284C7]'}">
                  ${activeChat.type === 'group' ? (activeChat.avatar || '🐾') : activeChat.title.charAt(0)}
                </div>
                <div class="min-w-0">
                  <h3 class="font-black text-base text-black truncate flex items-center gap-2">
                    <span>${activeChat.title}</span>
                    ${activeChat.type === 'group' ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200">Grupo</span>' : ''}
                  </h3>
                  <span class="text-xs text-[#4A4A4A] block truncate">
                    ${activeChat.type === 'group' ? `${activeChat.members.length} integrantes · ${activeChat.description}` : 'En línea · Río Cuarto'}
                  </span>
                </div>
              </div>

              <!-- Menú Desplegable Contextual (3 puntos) -->
              <div class="relative">
                <button id="chat-options-menu-btn" type="button" class="p-2 rounded-full hover:bg-[#EBEBEB] text-black" aria-label="Opciones de chat" aria-haspopup="true">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>

                <!-- Menú Flotante -->
                <div id="chat-options-dropdown" class="hidden absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-30 text-xs font-semibold text-[#4A4A4A]">
                  ${activeChat.type === 'group' ? `
                    <button type="button" id="opt-view-members" class="w-full text-left px-4 py-2 hover:bg-[#EBEBEB] text-black flex items-center gap-2">
                      👥 Ver Integrantes (${activeChat.members.length})
                    </button>
                    <button type="button" id="opt-report-group" class="w-full text-left px-4 py-2 hover:bg-[#EBEBEB] text-black flex items-center gap-2">
                      🚩 Reportar Grupo
                    </button>
                    <button type="button" id="opt-leave-group" class="w-full text-left px-4 py-2 hover:bg-red-50 text-[#C50000] flex items-center gap-2 border-t border-gray-100">
                      🚪 Salir del Grupo
                    </button>
                  ` : `
                    <button type="button" id="opt-mute-chat" class="w-full text-left px-4 py-2 hover:bg-[#EBEBEB] text-black flex items-center gap-2">
                      🔔 Silenciar / Desilenciar
                    </button>
                    <button type="button" id="opt-report-user" class="w-full text-left px-4 py-2 hover:bg-[#EBEBEB] text-black flex items-center gap-2">
                      🚩 Reportar Usuario
                    </button>
                    <button type="button" id="opt-block-user" class="w-full text-left px-4 py-2 hover:bg-[#EBEBEB] text-black flex items-center gap-2">
                      🚫 Bloquear / Desbloquear
                    </button>
                    <button type="button" id="opt-delete-chat" class="w-full text-left px-4 py-2 hover:bg-red-50 text-[#C50000] flex items-center gap-2 border-t border-gray-100">
                      🗑️ Eliminar Contacto
                    </button>
                  `}
                </div>
              </div>

            </div>

            <!-- Cuerpo de Mensajes con Burbujas (Celeste #98D7FF / Blanco) -->
            <div id="messages-scroll-area" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#EBEBEB]/30">
              ${activeChat.messages.map(msg => `
                <div class="flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}">
                  ${(activeChat.type === 'group' && !msg.isMe && msg.senderName) ? `
                    <span class="text-[10px] text-gray-500 font-bold ml-2 mb-0.5">${msg.senderName}</span>
                  ` : ''}
                  <div class="
                    max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm
                    ${msg.isMe
                      ? 'bg-[#98D7FF] text-black rounded-tr-none'
                      : 'bg-white text-black border border-gray-200 rounded-tl-none'
                    }
                  ">
                    <p>${msg.text}</p>
                    <span class="text-[10px] text-[#4A4A4A] block text-right mt-1 font-semibold">${msg.time}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Input de Envío de Mensajes -->
            <form id="form-send-message" class="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
              <input
                type="text"
                id="message-input-text"
                required
                placeholder="Escribe un mensaje de coordinación..."
                class="flex-1 px-4 py-3 rounded-full border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0A800]"
              />
              <button type="submit" class="
                px-6 py-3 rounded-full font-black text-sm text-black uppercase tracking-wider
                bg-[#E0A800] hover:bg-[#c99700] active:scale-95 shadow-md transition-all
              ">
                Enviar
              </button>
            </form>
          ` : `
            <div class="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <span class="text-5xl block mb-2">💬</span>
              <p class="font-bold text-black">Selecciona una conversación para chatear</p>
            </div>
          `}

        </div>

      </div>
    </section>
  `;

  // Autoscroll hacia el último mensaje
  const msgArea = document.getElementById('messages-scroll-area');
  if (msgArea) {
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  // Pestañas
  document.getElementById('tab-all-chats').onclick = () => {
    activeTab = 'chats';
    renderChats(containerId);
  };
  document.getElementById('tab-contacts').onclick = () => {
    activeTab = 'contacts';
    renderChats(containerId);
  };

  // Buscador de contactos
  const searchInput = document.getElementById('contact-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      contactSearchQuery = e.target.value.trim();
      if (activeTab !== 'contacts') activeTab = 'contacts';
      renderChats(containerId);
    });
  }

  // Selección de Chat
  container.querySelectorAll('[data-select-chat]').forEach(btn => {
    btn.onclick = () => {
      Store.state.activeChatId = btn.getAttribute('data-select-chat');
      renderChats(containerId);
    };
  });

  // Chatear desde contactos
  container.querySelectorAll('[data-start-contact-chat]').forEach(btn => {
    btn.onclick = () => {
      const contactId = btn.getAttribute('data-start-contact-chat');
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        Store.createOrOpenRescueChat(contact.name);
      }
    };
  });

  // Envío de Mensaje
  const sendForm = document.getElementById('form-send-message');
  if (sendForm && activeChat) {
    sendForm.onsubmit = (e) => {
      e.preventDefault();
      const txt = document.getElementById('message-input-text').value;
      if (txt.trim()) {
        Store.sendMessage(activeChat.id, txt);
        renderChats(containerId);
      }
    };
  }

  // Menú de opciones (3 puntos)
  const menuBtn = document.getElementById('chat-options-menu-btn');
  const dropdown = document.getElementById('chat-options-dropdown');
  if (menuBtn && dropdown) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    };
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  }

  // Acciones de Menú Contextual (Reportar, Bloquear, Salir de Grupo, Ver Integrantes)
  if (activeChat) {
    // 1. Reportar Usuario o Grupo
    const reportUserBtn = document.getElementById('opt-report-user');
    const reportGroupBtn = document.getElementById('opt-report-group');
    const openReportModal = (entityTitle) => {
      Modal.open({
        title: `Reportar: ${entityTitle}`,
        content: `
          <form id="form-report-entity" class="space-y-4">
            <p class="text-xs text-[#4A4A4A]">Indicá el motivo del reporte para que los moderadores de Río Cuarto revisen el caso:</p>
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-xs font-semibold text-black cursor-pointer">
                <input type="radio" name="report_reason" value="Spam o Publicidad" checked /> Spam o contenido publicitario
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold text-black cursor-pointer">
                <input type="radio" name="report_reason" value="Conducta Agresiva / Maltrato" /> Conducta agresiva o información falsa
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold text-black cursor-pointer">
                <input type="radio" name="report_reason" value="Estafa o Venta Ilegal" /> Cobro de dinero indebido / Estafa
              </label>
            </div>
            <textarea id="report-details" rows="2" placeholder="Detalles adicionales (opcional)..." class="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus-visible:ring-2 focus-visible:ring-[#E0A800]"></textarea>
            <button type="submit" class="w-full py-3 px-6 rounded-full font-bold text-xs bg-[#C50000] text-white hover:bg-red-800">
              Enviar Reporte a Moderación
            </button>
          </form>
        `,
        onMount: (panel) => {
          panel.querySelector('#form-report-entity').onsubmit = (ev) => {
            ev.preventDefault();
            const reason = panel.querySelector('input[name="report_reason"]:checked').value;
            Modal.close();
            Store.reportEntity('chat', activeChat.id, reason);
          };
        }
      });
    };
    if (reportUserBtn) reportUserBtn.onclick = () => openReportModal(activeChat.title);
    if (reportGroupBtn) reportGroupBtn.onclick = () => openReportModal(`Grupo "${activeChat.title}"`);

    // 2. Salir de Grupo (con transferencia automática de Admin)
    const leaveGroupBtn = document.getElementById('opt-leave-group');
    if (leaveGroupBtn) {
      leaveGroupBtn.onclick = () => {
        Modal.open({
          title: '¿Salir del Grupo?',
          content: `
            <div class="space-y-4">
              <p class="text-xs text-[#4A4A4A]">
                ¿Seguro que deseas salir de <strong>${activeChat.title}</strong>?
                ${activeChat.isAdmin ? '<br/><span class="text-[#E0A800] font-bold">Nota: Al ser Administrador, el rol se transferirá automáticamente al siguiente integrante.</span>' : ''}
              </p>
              <div class="flex items-center justify-end gap-2">
                <button id="cancel-leave-btn" class="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button id="confirm-leave-btn" class="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#C50000] hover:bg-red-800">Salir del Grupo</button>
              </div>
            </div>
          `,
          onMount: (panel) => {
            panel.querySelector('#cancel-leave-btn').onclick = () => Modal.close();
            panel.querySelector('#confirm-leave-btn').onclick = () => {
              Modal.close();
              Store.leaveGroup(activeChat.id);
              renderChats(containerId);
            };
          }
        });
      };
    }

    // 3. Ver Integrantes y Acciones de Rol (Admin vs Miembro)
    const viewMembersBtn = document.getElementById('opt-view-members');
    if (viewMembersBtn) {
      viewMembersBtn.onclick = () => {
        const isAdmin = activeChat.isAdmin;
        Modal.open({
          title: `Integrantes de ${activeChat.title}`,
          content: `
            <div class="space-y-4">
              <div class="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                ${activeChat.members.map(m => `
                  <div class="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-black block">${m.name}</span>
                      <span class="text-[10px] text-gray-400 font-semibold uppercase">${m.role === 'admin' ? '⭐ Administrador' : 'Miembro Regular'}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      ${(isAdmin && m.role !== 'admin') ? `
                        <button type="button" data-promote-admin="${m.id}" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-black hover:bg-[#E0A800]">
                          Hacer Admin
                        </button>
                        <button type="button" data-kick-member="${m.id}" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-[#C50000] hover:bg-red-200">
                          Expulsar
                        </button>
                      ` : ''}
                      ${m.id !== user.id ? `
                        <button type="button" data-dm-member="${m.name}" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 hover:bg-sky-200">
                          Mensaje
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `,
          onMount: (panel) => {
            panel.querySelectorAll('[data-promote-admin]').forEach(b => {
              b.onclick = () => {
                Store.promoteToAdmin(activeChat.id, b.getAttribute('data-promote-admin'));
                Modal.close();
                renderChats(containerId);
              };
            });
            panel.querySelectorAll('[data-kick-member]').forEach(b => {
              b.onclick = () => {
                Store.removeMemberFromGroup(activeChat.id, b.getAttribute('data-kick-member'));
                Modal.close();
                renderChats(containerId);
              };
            });
            panel.querySelectorAll('[data-dm-member]').forEach(b => {
              b.onclick = () => {
                Modal.close();
                Store.createOrOpenRescueChat(b.getAttribute('data-dm-member'));
              };
            });
          }
        });
      };
    }

    // 4. Bloquear y Eliminar Contacto
    const blockBtn = document.getElementById('opt-block-user');
    if (blockBtn) {
      blockBtn.onclick = () => {
        Store.toggleBlockContact(activeChat.recipientId);
        renderChats(containerId);
      };
    }

    const delContactBtn = document.getElementById('opt-delete-chat');
    if (delContactBtn) {
      delContactBtn.onclick = () => {
        if (confirm(`¿Eliminar la conversación con ${activeChat.title}?`)) {
          Store.deleteContact(activeChat.recipientId);
          renderChats(containerId);
        }
      };
    }
  }

  // Modal para Crear Nuevo Grupo
  const createGroupBtn = document.getElementById('btn-create-group-modal');
  if (createGroupBtn) {
    createGroupBtn.onclick = () => {
      Modal.open({
        title: 'Crear Nuevo Grupo de Rescate',
        content: `
          <form id="form-new-group" class="space-y-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-[#4A4A4A]">Nombre del Grupo *</label>
              <input type="text" id="group-name-input" required placeholder="Ej. Rescatistas Alberdi y Centro" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus-visible:ring-2 focus-visible:ring-[#E0A800]" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-[#4A4A4A]">Descripción del Grupo</label>
              <textarea id="group-desc-input" rows="2" placeholder="Objetivo y zona de coordinación comunitaria..." class="w-full px-4 py-2 rounded-xl border border-gray-300 text-xs focus-visible:ring-2 focus-visible:ring-[#E0A800]"></textarea>
            </div>

            <!-- Buscador y Selección Múltiple de Integrantes -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-[#4A4A4A]">Seleccionar Integrantes Iniciales:</label>
              <div class="divide-y divide-gray-100 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-[#EBEBEB]/40">
                ${contacts.map(c => `
                  <label class="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer text-xs">
                    <span class="font-bold text-black">${c.name} (${c.role})</span>
                    <input type="checkbox" name="group_members" value="${c.id}" class="w-4 h-4 text-[#E0A800] rounded" />
                  </label>
                `).join('')}
              </div>
            </div>

            <button type="submit" class="w-full py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider bg-[#E0A800] text-black hover:bg-[#c99700] shadow-md">
              Crear Grupo Comunitario
            </button>
          </form>
        `,
        onMount: (panel) => {
          panel.querySelector('#form-new-group').onsubmit = (ev) => {
            ev.preventDefault();
            const name = panel.querySelector('#group-name-input').value.trim();
            const desc = panel.querySelector('#group-desc-input').value.trim();
            const checkedBoxes = panel.querySelectorAll('input[name="group_members"]:checked');
            const memberIds = Array.from(checkedBoxes).map(cb => cb.value);

            if (!name) return;
            Modal.close();
            Store.createGroupChat({ name, description: desc, memberIds });
            renderChats(containerId);
          };
        }
      });
    };
  }
}
