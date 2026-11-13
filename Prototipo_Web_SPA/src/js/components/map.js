/**
 * Map Component - Mapa Interactivo de Río Cuarto & Puntos de Interés
 * Integración con Leaflet.js, pines semánticos, popups y simulación de ruta punto a punto
 */

import { Store } from '../store.js';
import { RIO_CUARTO_CENTER, INITIAL_POIS } from '../data.js';
import { Modal } from './modal.js';
import { esc } from '../utils.js';
import { fetchDrivingRoute } from '../routing.js';

let leafletMapInstance = null;
let activePolyline = null;
let currentFilter = 'all'; // all | alerts | pois
let routeTimer = null;     // temporizador de la simulación de llegada
let routeRequestId = 0;    // invalida cálculos de ruta en curso al cancelar o iniciar otra ruta

const ORIGIN_COORDS = [-33.1250, -64.3490]; // Plaza Roca (origen simulado)

// Región navegable: ~130 km alrededor de Río Cuarto. Impide alejarse tanto como para perder la ciudad.
const MAP_BOUNDS = [[-34.3, -65.6], [-31.9, -63.1]];
const MAP_MIN_ZOOM = 10;

/** Vuelve a la vista inicial de Río Cuarto (con animación, salvo que la persona pida menos movimiento). */
function recenterOnRioCuarto(map) {
  const target = [RIO_CUARTO_CENTER.lat, RIO_CUARTO_CENTER.lng];
  const reduceMotion = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    map.setView(target, RIO_CUARTO_CENTER.zoom, { animate: false });
  } else {
    map.flyTo(target, RIO_CUARTO_CENTER.zoom, { duration: 1.1 });
  }
}

/**
 * Botón "Río Cuarto" dentro del mapa. Se resalta en ámbar cuando la vista está lejos del centro,
 * para que se note que hay un camino de vuelta.
 */
function addRecenterControl(map) {
  const L = window.L;
  const Recenter = L.Control.extend({
    options: { position: 'topleft' },
    onAdd() {
      const bar = L.DomUtil.create('div', 'leaflet-bar leaflet-control recenter-control');
      const btn = L.DomUtil.create('a', 'recenter-btn', bar);
      btn.href = '#';
      btn.setAttribute('role', 'button');
      btn.setAttribute('title', 'Volver al centro de Río Cuarto');
      btn.setAttribute('aria-label', 'Centrar el mapa en Río Cuarto');
      btn.innerHTML = '<span aria-hidden="true">📍</span><span>Río Cuarto</span>';

      L.DomEvent.disableClickPropagation(bar);
      const activate = (e) => {
        L.DomEvent.preventDefault(e);
        recenterOnRioCuarto(map);
      };
      L.DomEvent.on(btn, 'click', activate);
      // Enter ya dispara "click" en un enlace; la barra espaciadora hay que atenderla a mano
      L.DomEvent.on(btn, 'keydown', (e) => { if (e.key === ' ') activate(e); });

      // Resaltar el botón cuando la vista se alejó del centro o del zoom inicial
      const refresh = () => {
        const c = map.getCenter();
        const away = distanceKm([c.lat, c.lng], [RIO_CUARTO_CENTER.lat, RIO_CUARTO_CENTER.lng]) > 1.5 ||
          Math.abs(map.getZoom() - RIO_CUARTO_CENTER.zoom) >= 2;
        btn.classList.toggle('recenter-away', away);
      };
      map.on('moveend', refresh);
      refresh();
      return bar;
    }
  });
  new Recenter().addTo(map);
}

/** Distancia en km entre dos puntos [lat, lng] (fórmula de Haversine). */
function distanceKm([lat1, lng1], [lat2, lng2]) {
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function clearRouteTimer() {
  if (routeTimer) {
    clearTimeout(routeTimer);
    routeTimer = null;
  }
}

export function renderMap(containerId = 'view-mapa') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4" aria-labelledby="map-heading">
      
      <!-- Barra Superior de Control y Filtros del Mapa -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 id="map-heading" class="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
            <span>🗺️</span>
            <span>Mapa Comunitario de Río Cuarto</span>
          </h1>
          <p class="text-xs text-[#4A4A4A]">Pines de alertas en tiempo real, clínicas veterinarias de guardia y refugios</p>
        </div>

        <!-- Filtros Rápidos de Pines -->
        <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0" role="tablist">
          <button type="button" data-map-filter="all" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'all' ? 'bg-[#E0A800] text-black shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            Ver Todos
          </button>
          <button type="button" data-map-filter="alerts" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'alerts' ? 'bg-[#C50000] text-white force-text-white shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            🚨 Solo Alertas
          </button>
          <button type="button" data-map-filter="pois" class="map-filter-btn px-4 py-2 rounded-full text-xs font-bold transition-all ${currentFilter === 'pois' ? 'bg-sky-700 text-white force-text-white shadow-sm' : 'bg-gray-100 text-[#4A4A4A] hover:bg-gray-200'}">
            🏥 Solo Veterinarias y Refugios
          </button>
        </div>
      </div>

      <!-- Leyenda Semántica de Pines -->
      <div class="flex flex-wrap items-center gap-4 text-xs font-semibold px-2 text-[#4A4A4A]">
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#C50000]"></span> Heridos (Urgente)</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#E0A800]"></span> Perdidos</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#0369A1]"></span> Veterinarias</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#0C832A]"></span> Guarderías</div>
        <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-full bg-[#EA580C]"></span> Refugios</div>
      </div>

      <!-- Contenedor del Mapa Leaflet -->
      <div class="relative w-full h-[620px] rounded-3xl overflow-hidden shadow-md border border-gray-300">
        <div id="leaflet-map-canvas" class="w-full h-full z-0"></div>

        <!-- Banner Flotante de Simulación de Ruta (Oculto inicialmente) -->
        <div id="route-simulation-banner" class="hidden absolute top-4 left-4 right-4 sm:left-auto sm:right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 max-w-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase text-[#7A5900] tracking-wider flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#E0A800] animate-ping"></span>
              Navegación Activa
            </span>
            <button id="btn-cancel-route" class="text-xs font-bold text-gray-600 hover:text-black">Cancelar</button>
          </div>
          <h4 id="route-dest-name" class="font-black text-sm text-black truncate">Destino</h4>
          <div class="flex items-center justify-between text-xs text-[#4A4A4A] pt-1 border-t border-gray-100">
            <span>Distancia: <strong id="route-distance" class="text-black">—</strong></span>
            <span>Tiempo Estimado: <strong id="route-time" class="text-[#0C832A]">—</strong></span>
          </div>
        </div>
      </div>

    </section>
  `;

  // Una simulación de ruta pendiente no debe terminar sobre un mapa que ya no existe
  clearRouteTimer();

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
  if (!canvas) return;
  if (typeof window.L === 'undefined') {
    canvas.innerHTML = '<div class="w-full h-full flex items-center justify-center text-center p-6 bg-gray-100"><p class="text-sm font-bold text-[#4A4A4A]">No se pudo cargar el mapa. Revisá tu conexión a internet y recargá la página.</p></div>';
    return;
  }

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
    scrollWheelZoom: true,
    minZoom: MAP_MIN_ZOOM,
    maxBounds: MAP_BOUNDS,
    maxBoundsViscosity: 0.9
  }).setView([RIO_CUARTO_CENTER.lat, RIO_CUARTO_CENTER.lng], RIO_CUARTO_CENTER.zoom);

  addRecenterControl(leafletMapInstance);

  // Tiles de OpenStreetMap
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
  }).addTo(leafletMapInstance);

  // Cargar Pines de Alertas
  if (currentFilter === 'all' || currentFilter === 'alerts') {
    // Los casos ya resueltos no se muestran como alertas activas en el mapa
    // (y los registros sin coordenadas válidas se omiten: uno solo no debe romper el mapa entero)
    Store.state.alerts.filter(a => a.status !== 'rescued' && Array.isArray(a.coords) && a.coords.length === 2).forEach(alert => {
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
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white force-text-white ${isHerido ? 'bg-[#C50000]' : 'bg-[#E0A800] text-black'}">
              ${esc(alert.type)}
            </span>
            <span class="text-[11px] text-gray-600 font-medium">${esc(alert.timestamp)}</span>
          </div>
          <h4 class="font-black text-xs text-black leading-tight">${esc(alert.title)}</h4>
          <p class="text-[11px] text-[#4A4A4A] line-clamp-2">${esc(alert.description)}</p>
          <div class="flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <a href="tel:${esc(alert.publisher.phone)}" class="flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#EBEBEB] text-black hover:bg-gray-300">
              📞 Llamar
            </a>
            <button type="button" class="btn-route-action flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#E0A800] text-black hover:bg-[#c99700]" data-lat="${esc(alert.coords[0])}" data-lng="${esc(alert.coords[1])}" data-name="${esc(alert.title)}">
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
        html: `<div class="custom-pin w-10 h-10 ${pinClass} text-base cursor-pointer">${esc(poi.icon)}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = window.L.marker(poi.coords, { icon: customIcon }).addTo(leafletMapInstance);

      const isOpen = poi.status === 'open';
      const popupContent = `
        <div class="p-2 space-y-2 max-w-[260px]">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold text-gray-600 uppercase">${esc(poi.typeLabel)}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black text-white force-text-white ${isOpen ? 'bg-[#0C832A]' : 'bg-[#C50000]'}">
              ${isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          <h4 class="font-black text-sm text-black leading-tight">${esc(poi.name)}</h4>
          <p class="text-[11px] text-[#4A4A4A]">${esc(poi.address)}</p>
          <p class="text-[10px] text-gray-600 font-medium">🕒 ${esc(poi.hours)}</p>
          <div class="flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <a href="tel:${esc(poi.phone)}" class="flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#EBEBEB] text-black hover:bg-gray-300">
              📞 Llamar
            </a>
            <button type="button" class="btn-route-action flex-1 py-1 px-2 rounded-full text-center text-xs font-bold bg-[#E0A800] text-black hover:bg-[#c99700]" data-lat="${esc(poi.coords[0])}" data-lng="${esc(poi.coords[1])}" data-name="${esc(poi.name)}">
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
 * Trazado de ruta hacia un destino. Intenta el recorrido real por calles (OSRM) y, si no se puede,
 * dibuja un trazado aproximado. La llegada sigue siendo simulada.
 */
async function startRouteSimulation(destCoords, destName) {
  if (!leafletMapInstance) return;
  const mapAtStart = leafletMapInstance;
  const requestId = ++routeRequestId; // invalida cualquier cálculo anterior todavía en curso

  clearRouteTimer();

  // Remover polilínea previa si existiera
  if (activePolyline) {
    mapAtStart.removeLayer(activePolyline);
    activePolyline = null;
  }

  const banner = document.getElementById('route-simulation-banner');
  const destLabel = document.getElementById('route-dest-name');
  const distEl = document.getElementById('route-distance');
  const timeEl = document.getElementById('route-time');

  const finishRoute = () => {
    routeRequestId++; // si se cancela mientras se calcula, el resultado se descarta
    clearRouteTimer();
    if (banner) banner.classList.add('hidden');
    if (activePolyline) {
      try { mapAtStart.removeLayer(activePolyline); } catch (e) {}
      activePolyline = null;
    }
  };

  // El banner aparece enseguida (con "Calculando…") para que se pueda cancelar en cualquier momento
  if (banner && destLabel) {
    destLabel.textContent = destName;
    if (distEl) distEl.textContent = '…';
    if (timeEl) timeEl.textContent = 'Calculando…';
    banner.classList.remove('hidden');

    // Cancelar detiene también la llegada simulada (antes igual aparecía el modal)
    document.getElementById('btn-cancel-route').onclick = finishRoute;
  }

  const route = await fetchDrivingRoute(ORIGIN_COORDS, destCoords);
  // Si se canceló, se inició otra ruta o el mapa fue reemplazado, este resultado ya no sirve
  if (requestId !== routeRequestId || leafletMapInstance !== mapAtStart) return;

  let routePoints, km, minutes;
  if (route) {
    // Se unen los extremos exactos con los pines (el servicio ajusta a la calle más cercana)
    routePoints = [ORIGIN_COORDS, ...route.points, destCoords];
    km = route.km;
    minutes = route.minutes;
  } else {
    // Respaldo sin conexión: un punto intermedio simula las callejuelas
    const midPoint = [
      (ORIGIN_COORDS[0] + destCoords[0]) / 2 + 0.001,
      (ORIGIN_COORDS[1] + destCoords[1]) / 2 - 0.0015
    ];
    routePoints = [ORIGIN_COORDS, midPoint, destCoords];
    km = distanceKm(ORIGIN_COORDS, destCoords) * 1.3; // recta + 30 % por calles
    minutes = Math.max(1, Math.round(km / 30 * 60));  // a ~30 km/h
  }

  // Dibujar polilínea con animación dash
  activePolyline = window.L.polyline(routePoints, {
    color: '#E0A800',
    weight: 6,
    opacity: 0.9,
    className: 'route-polyline'
  }).addTo(mapAtStart);

  // Ajustar vista a la ruta
  mapAtStart.fitBounds(activePolyline.getBounds(), { padding: [50, 50] });

  if (distEl) distEl.textContent = `${km.toFixed(1)} km`;
  if (timeEl) timeEl.textContent = `${minutes} min en vehículo${route ? '' : ' (aprox.)'}`;

  Store.notify('toast', route ? {
    type: 'info',
    title: 'Navegación Iniciada',
    message: `Ruta trazada hacia ${destName} por las calles de Río Cuarto...`
  } : {
    type: 'info',
    title: 'Ruta aproximada',
    message: `No se pudo calcular el recorrido por calles (sin conexión al servicio de rutas). Se muestra una línea orientativa hacia ${destName}.`
  });

  routeTimer = setTimeout(() => {
    // Si el mapa fue reemplazado o la ruta cancelada, no hay llegada que mostrar
    if (leafletMapInstance !== mapAtStart) return;
    finishRoute();

    Modal.open({
      title: '¡Has llegado a tu destino!',
      content: `
        <div class="text-center py-4 space-y-4">
          <div class="w-20 h-20 rounded-full bg-emerald-100 border-2 border-[#0C832A] flex items-center justify-center text-4xl mx-auto text-[#0C832A]">
            🏁
          </div>
          <h4 class="text-xl font-black text-black">Has arribado a la ubicación</h4>
          <p class="text-sm text-[#4A4A4A] leading-relaxed">
            Te encuentras en <strong class="text-black">${esc(destName)}</strong>. El auxilio comunitario ya está en marcha.
          </p>
          <div class="pt-2">
            <button id="btn-close-arrival" class="w-full py-3 px-6 rounded-full font-bold text-sm bg-[#0C832A] text-white force-text-white hover:bg-emerald-800 shadow-md">
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
