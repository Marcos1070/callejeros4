/**
 * Map Component - Mapa Interactivo de Río Cuarto & Puntos de Interés
 * Integración con Leaflet.js, pines semánticos, popups y simulación de ruta punto a punto
 */

import { Store } from '../store.js';
import { RIO_CUARTO_CENTER, INITIAL_POIS } from '../data.js';
import { Modal } from './modal.js';

let leafletMapInstance = null;
let activePolyline = null;
let currentFilter = 'all'; // all | alerts | pois

export function renderMap(containerId = 'view-mapa') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4" aria-labelledby="map-heading">
      
      <!-- Barra Superior de Control y Filtros del Mapa -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 id="map-heading" class="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
            <span>🗺️</span>
            <span>Mapa Comunitario de Río Cuarto</span>
          </h2>
          <p class="text-xs text-[#4A4A4A]">Pines de alertas en tiempo real, clínicas veterinarias de guardia y refugios</p>
        </div>

        <!-- Filtros Rápidos de Pines -->
        <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0" role="tablist">
          <button type="button" data-map-filter="all" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'all' ? 'bg-[#E0A800] text-black shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            Ver Todos
          </button>
          <button type="button" data-map-filter="alerts" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'alerts' ? 'bg-[#C50000] text-white shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            🚨 Solo Alertas
          </button>
          <button type="button" data-map-filter="pois" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'pois' ? 'bg-sky-600 text-white shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            🏥 Solo Veterinarias y Refugios
          </button>
        </div>
      </div>

      <!-- Leyenda Semántica de Pines -->
      <div class="flex flex-wrap items-center gap-4 text-xs font-semibold px-2 text-[#4A4A4A]">
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#C50000]"></span> Heridos (Urgente)</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#E0A800]"></span> Perdidos</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#0284C7]"></span> Veterinarias</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#0C832A]"></span> Guarderías</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#EA580C]"></span> Refugios</div>
      </div>

      <!-- Contenedor del Mapa Leaflet -->
      <div class="relative w-full h-[620px] rounded-3xl overflow-hidden shadow-md border border-gray-300">
        <div id="leaflet-map-canvas" class="w-full h-full z-0"></div>

        <!-- Banner Flotante de Simulación de Ruta (Oculto inicialmente) -->
        <div id="route-simulation-banner" class="hidden absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 max-w-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase text-[#E0A800] tracking-wider flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#E0A800] animate-ping"></span>
              Navegación Activa
            </span>
            <button id="btn-cancel-route" class="text-xs font-bold text-gray-400 hover:text-black">Cancelar</button>
          </div>
          <h4 id="route-dest-name" class="font-black text-sm text-black truncate">Destino</h4>
          <div class="flex items-center justify-between text-xs text-[#4A4A4A] pt-1 border-t border-gray-100">
            <span>Distancia: <strong class="text-black">1.8 km</strong></span>
            <span>Tiempo Estimado: <strong class="text-[#0C832A]">5 min en vehículo</strong></span>
          </div>
        </div>
      </div>

    </section>
  `;

  // Inicializar o recargar Leaflet con retardo seguro para permitir cálculo del DOM
  setTimeout(() => initLeafletMap(), 50);

  // Filtros
  container.querySelectorAll('.map-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-map-filter');
      renderMap(containerId);
    });
  });
}

function initLeafletMap() {
  const canvas = document.getElementById('leaflet-map-canvas');
  if (!canvas || typeof window.L === 'undefined') return;

  // Destruir instancia previa para evitar Error de contenedor ya inicializado
  if (leafletMapInstance) {
    try {
      leafletMapInstance.remove();
    } catch (e) {}
    leafletMapInstance = null;
  }

  // Crear mapa centrado en Río Cuarto
  leafletMapInstance = window.L.map('leaflet-map-canvas', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([RIO_CUARTO_CENTER.lat, RIO_CUARTO_CENTER.lng], RIO_CUARTO_CENTER.zoom);

  // Tiles de OpenStreetMap
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap Río Cuarto'
  }).addTo(leafletMapInstance);

  // Cargar Pines de Alertas
  if (currentFilter === 'all' || currentFilter === 'alerts') {
    Store.state.alerts.forEach(alert => {
      const isHerido = alert.type === 'HERIDO';
      const pinClass = isHerido ? 'pin-alert-red' : 'pin-alert-amber';
      const iconEmoji = isHerido ? '🚨' : '⚠️';

      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-pin w-10 h-10 ${pinClass} text-base cursor-pointer">${iconEmoji}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = window.L.marker(alert.coords, { icon: customIcon }).addTo(leafletMapInstance);

      // Popup accesible con indicador de estado y botones
      const popupContent = `
        <div class="p-2 space-y-2 max-w-[260px]">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${isHerido ? 'bg-[#C50000]' : 'bg-[#E0A800] text-black'}">
              ${alert.type}
            </span>
            <span class="text-[11px] text-gray-500 font-medium">${alert.timestamp}</span>
          </div>
          <h4 class="font-black text-xs text-black leading-tight">${alert.title}</h4>
          <p class="text-[11px] text-[#4A4A4A] line-clamp-2">${alert.description}</p>
          <div class="flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <a href="tel:${alert.publisher.phone}" class="flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#EBEBEB] text-black hover:bg-gray-300">
              📞 Llamar
            </a>
            <button type="button" class="btn-route-action flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#E0A800] text-black hover:bg-[#c99700]" data-lat="${alert.coords[0]}" data-lng="${alert.coords[1]}" data-name="${alert.title}">
              🧭 Ir
            </button>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  }

  // Cargar Pines de Puntos de Interés (POIs)
  if (currentFilter === 'all' || currentFilter === 'pois') {
    INITIAL_POIS.forEach(poi => {
      let pinClass = 'pin-poi-blue';
      if (poi.type === 'guarderia') pinClass = 'pin-poi-green';
      if (poi.type === 'refugio') pinClass = 'pin-poi-orange';

      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-pin w-10 h-10 ${pinClass} text-base cursor-pointer">${poi.icon}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = window.L.marker(poi.coords, { icon: customIcon }).addTo(leafletMapInstance);

      const isOpen = poi.status === 'open';
      const popupContent = `
        <div class="p-2 space-y-2 max-w-[260px]">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold text-gray-500 uppercase">${poi.typeLabel}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black text-white ${isOpen ? 'bg-[#0C832A]' : 'bg-[#C50000]'}">
              ${isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          <h4 class="font-black text-sm text-black leading-tight">${poi.name}</h4>
          <p class="text-[11px] text-[#4A4A4A]">${poi.address}</p>
          <p class="text-[10px] text-gray-500 font-medium">🕒 ${poi.hours}</p>
          <div class="flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <a href="tel:${poi.phone}" class="flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#EBEBEB] text-black hover:bg-gray-300">
              📞 Llamar
            </a>
            <button type="button" class="btn-route-action flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#E0A800] text-black hover:bg-[#c99700]" data-lat="${poi.coords[0]}" data-lng="${poi.coords[1]}" data-name="${poi.name}">
              🧭 Cómo llegar
            </button>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  }

  // Delegación de clics para iniciar simulación de ruta
  canvas.addEventListener('click', (e) => {
    const routeBtn = e.target.closest('.btn-route-action');
    if (routeBtn) {
      const destLat = parseFloat(routeBtn.getAttribute('data-lat'));
      const destLng = parseFloat(routeBtn.getAttribute('data-lng'));
      const destName = routeBtn.getAttribute('data-name');
      startRouteSimulation([destLat, destLng], destName);
    }
  });

  // Revalidar tamaño del mapa
  leafletMapInstance.invalidateSize();
}

/**
 * Simulación de Trazado de Ruta Punto a Punto
 */
function startRouteSimulation(destCoords, destName) {
  if (!leafletMapInstance) return;

  // Punto de origen simulado: Plaza Roca (Centro de Río Cuarto)
  const originCoords = [-33.1250, -64.3490];

  // Remover polilínea previa si existiera
  if (activePolyline) {
    leafletMapInstance.removeLayer(activePolyline);
  }

  // Puntos intermedios para simular callejuelas de Río Cuarto
  const midPoint = [
    (originCoords[0] + destCoords[0]) / 2 + 0.001,
    (originCoords[1] + destCoords[1]) / 2 - 0.0015
  ];
  const routePoints = [originCoords, midPoint, destCoords];

  // Dibujar polilínea con animación dash
  activePolyline = window.L.polyline(routePoints, {
    color: '#E0A800',
    weight: 6,
    opacity: 0.9,
    className: 'route-polyline'
  }).addTo(leafletMapInstance);

  // Ajustar vista a la ruta
  leafletMapInstance.fitBounds(activePolyline.getBounds(), { padding: [50, 50] });

  // Mostrar banner de navegación
  const banner = document.getElementById('route-simulation-banner');
  const destLabel = document.getElementById('route-dest-name');
  if (banner && destLabel) {
    destLabel.textContent = destName;
    banner.classList.remove('hidden');

    document.getElementById('btn-cancel-route').onclick = () => {
      banner.classList.add('hidden');
      if (activePolyline) leafletMapInstance.removeLayer(activePolyline);
    };
  }

  // Simular avance del recorrido y culminar en modal de llegada tras 3 segundos
  Store.notify('toast', {
    type: 'info',
    title: 'Navegación Iniciada',
    message: `Ruta trazada hacia ${destName}. Avanzando por calles de Río Cuarto...`
  });

  setTimeout(() => {
    if (banner) banner.classList.add('hidden');
    if (activePolyline) leafletMapInstance.removeLayer(activePolyline);

    // Modal de Llegada: "¡Haz llegado a tu destino!"
    Modal.open({
      title: '¡Haz llegado a tu destino!',
      content: `
        <div class="text-center py-4 space-y-4">
          <div class="w-20 h-20 rounded-full bg-emerald-100 border-2 border-[#0C832A] flex items-center justify-center text-4xl mx-auto text-[#0C832A]">
            🏁
          </div>
          <h4 class="text-xl font-black text-black">Has arribado a la ubicación</h4>
          <p class="text-sm text-[#4A4A4A] leading-relaxed">
            Te encuentras en <strong class="text-black">${destName}</strong>. El auxilio comunitario ya está en marcha.
          </p>
          <div class="pt-2">
            <button id="btn-close-arrival" class="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#0C832A] text-white hover:bg-emerald-800 shadow-md">
              Cerrar Navegación
            </button>
          </div>
        </div>
      `,
      onMount: (panel) => {
        panel.querySelector('#btn-close-arrival').addEventListener('click', () => Modal.close());
      }
    });
  }, 3200);
}
