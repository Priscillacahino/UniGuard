import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, UFPB_CAMPI } from '../data/ufpbData';
import { BreadcrumbPoint, EmergencyAlert, GeoCoordinate, SecurityPatrolUnit, SafeZone, UfpbCampusId } from '../types';
import { getCampusById } from '../utils/geo';

interface CampusMapProps {
  userCoordinate: GeoCoordinate;
  userSignalLost: boolean;
  lastKnownCoordinate: GeoCoordinate | null;
  activeAlerts: EmergencyAlert[];
  securityUnits: SecurityPatrolUnit[];
  selectedAlertId?: string | null;
  onSelectAlert?: (alert: EmergencyAlert) => void;
  breadcrumbs?: BreadcrumbPoint[];
  heightClass?: string;
  isInsideCampus?: boolean;
  safeZones?: SafeZone[];
  showSafeZones?: boolean;
  showBreadcrumbs?: boolean;
  selectedCampusId?: UfpbCampusId;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  userCoordinate,
  userSignalLost,
  lastKnownCoordinate,
  activeAlerts,
  securityUnits,
  selectedAlertId,
  onSelectAlert,
  breadcrumbs = [],
  heightClass = 'h-[450px]',
  isInsideCampus = true,
  safeZones = CAMPUS_SAFE_ZONES,
  showSafeZones = true,
  showBreadcrumbs = true,
  selectedCampusId = 'campus_1_joao_pessoa',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundsLayerRef = useRef<L.LayerGroup | null>(null);

  const currentCampus = getCampusById(selectedCampusId);

  // 1. Inicializar o mapa do Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentCampus.center.lat, currentCampus.center.lng],
      zoom: currentCampus.zoom || 16,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: false,
    });

    // Zoom control estilizado no topo direito
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Voyager tiles para excelente contraste visual
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const boundsLayer = L.layerGroup().addTo(map);
    boundsLayerRef.current = boundsLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Mudar foco do mapa suavemente quando o campus selecionado mudar
  useEffect(() => {
    const map = mapInstanceRef.current;
    const boundsGroup = boundsLayerRef.current;
    if (!map || !boundsGroup) return;

    boundsGroup.clearLayers();

    // Redesenhar polígono ou círculo de limites do campus
    if (currentCampus.bounds && currentCampus.bounds.length >= 3) {
      const campusPolygon = L.polygon(currentCampus.bounds, {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.07,
        dashArray: '5, 8',
      }).addTo(boundsGroup);

      campusPolygon.bindTooltip(`${currentCampus.name}`, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900 text-emerald-300 font-bold px-2 py-1 rounded border border-emerald-500/40 text-xs shadow-lg',
      });
    } else {
      // Círculo perimetral se não houver bounds específicos
      L.circle([currentCampus.center.lat, currentCampus.center.lng], {
        radius: currentCampus.radiusMeters,
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.05,
        dashArray: '4, 6',
      }).addTo(boundsGroup);
    }

    // Centrar no campus
    map.flyTo([currentCampus.center.lat, currentCampus.center.lng], currentCampus.zoom || 16, {
      duration: 1.2,
    });
  }, [selectedCampusId]);

  // 3. Atualizar marcadores, rotas, alertas e viaturas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Zonas de Segurança do Campus Selecionado
    const campusZones = safeZones.filter(
      (sz) => !sz.campusId || sz.campusId === selectedCampusId
    );

    if (showSafeZones && campusZones) {
      campusZones.forEach((sz) => {
        const zoneCircle = L.circle([sz.center.lat, sz.center.lng], {
          radius: sz.radiusMeters,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.14,
          weight: 1.5,
          dashArray: '3, 4',
        });

        const zoneIcon = L.divIcon({
          className: 'custom-safezone-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer group">
              <div class="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shadow-md border-2 border-emerald-200">
                ${sz.icon || '🛡️'}
              </div>
              <div class="absolute -bottom-5 bg-emerald-950/90 text-emerald-200 font-bold text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-emerald-500/40">
                ${sz.code}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const zoneMarker = L.marker([sz.center.lat, sz.center.lng], { icon: zoneIcon });
        
        zoneMarker.bindPopup(`
          <div class="text-xs p-1 text-slate-900 font-sans max-w-[220px]">
            <div class="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <span>${sz.icon}</span>
              <span>${sz.name}</span>
            </div>
            <div class="text-[10px] bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 font-semibold">
              Perímetro Seguro • Raio: ${sz.radiusMeters}m
            </div>
            <div class="text-[11px] text-slate-600 mt-1.5 leading-relaxed">${sz.description}</div>
            <div class="mt-2 text-[10px] text-slate-700">
              <span class="font-bold text-slate-900">Vigilantes Ativos:</span> ${sz.activeGuardsCount} guardas
            </div>
          </div>
        `);

        layer.addLayer(zoneCircle);
        layer.addLayer(zoneMarker);
      });
    }

    // 2. Pontos de Referência filtrados pelo campus
    const campusLocations = CAMPUS_LOCATIONS.filter(
      (loc) => !loc.campusId || loc.campusId === selectedCampusId
    );

    campusLocations.forEach((loc) => {
      let iconColor = '#3b82f6';
      let iconBg = '#1e293b';
      let tag = '🏛️';

      if (loc.category === 'seguranca') {
        iconColor = '#10b981';
        iconBg = '#064e3b';
        tag = '🛡️';
      } else if (loc.category === 'saude') {
        iconColor = '#ec4899';
        iconBg = '#831843';
        tag = '🏥';
      } else if (loc.category === 'servico') {
        iconColor = '#f59e0b';
        iconBg = '#78350f';
        tag = '🍽️';
      }

      const landmarkIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="background-color: ${iconBg}; border: 1.5px solid ${iconColor};" class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md transform -translate-x-1/2 -translate-y-1/2 opacity-85 hover:opacity-100 hover:scale-110 transition-all cursor-pointer">
            ${tag}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const poiMarker = L.marker([loc.coordinate.lat, loc.coordinate.lng], { icon: landmarkIcon });
      poiMarker.bindPopup(`
        <div class="text-xs p-1 text-slate-900 font-sans">
          <div class="font-bold text-slate-900 flex items-center gap-1">${loc.name}</div>
          <div class="text-[11px] text-slate-600 mt-1">${loc.description}</div>
          <div class="text-[10px] text-emerald-700 font-semibold mt-1">✓ Cobertura UFPB</div>
        </div>
      `);
      layer.addLayer(poiMarker);
    });

    // 3. Breadcrumbs do usuário
    if (showBreadcrumbs && breadcrumbs.length > 1) {
      const lineCoords: [number, number][] = breadcrumbs.map((b) => [b.coordinate.lat, b.coordinate.lng]);
      const breadcrumbPolyline = L.polyline(lineCoords, {
        color: userSignalLost ? '#d97706' : '#2563eb',
        weight: 3.5,
        opacity: 0.75,
        dashArray: userSignalLost ? '6, 6' : undefined,
      });
      layer.addLayer(breadcrumbPolyline);

      breadcrumbs.forEach((pt, idx) => {
        if (idx === breadcrumbs.length - 1) return;
        const isPointInSafe = pt.isInSafeZone;
        const ptIcon = L.divIcon({
          className: 'custom-breadcrumb-dot',
          html: `
            <div class="w-3 h-3 rounded-full ${isPointInSafe ? 'bg-emerald-500' : 'bg-blue-600'} border border-white shadow-xs opacity-75 transform -translate-x-1/2 -translate-y-1/2"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const ptMarker = L.marker([pt.coordinate.lat, pt.coordinate.lng], { icon: ptIcon });
        const dateStr = new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ptMarker.bindTooltip(`Rastro #${idx + 1} (${dateStr}) - ${pt.locationName || 'Campus'}`, {
          direction: 'top',
          className: 'text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow',
        });
        layer.addLayer(ptMarker);
      });
    }

    // 4. Marcador do Usuário
    const userPos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;
    const isInside = isInsideCampus;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
          ${
            userSignalLost
              ? `
              <div class="absolute w-10 h-10 rounded-full bg-amber-500/25 animate-ping"></div>
              <div class="w-8 h-8 rounded-full bg-amber-600 border-2 border-amber-200 text-white flex items-center justify-center text-xs shadow-xl shadow-amber-900/50">
                <span style="font-size: 14px;">⚠️</span>
              </div>
              <div class="absolute -bottom-6 bg-slate-950/90 text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded border border-amber-500/40 shadow whitespace-nowrap">
                Última Localização
              </div>
            `
              : `
              <div class="absolute w-10 h-10 rounded-full ${isInside ? 'bg-blue-500/30' : 'bg-red-500/30'} animate-ping"></div>
              <div class="w-7 h-7 rounded-full ${isInside ? 'bg-blue-600 border-2 border-blue-200' : 'bg-rose-600 border-2 border-rose-200'} text-white flex items-center justify-center text-xs shadow-xl shadow-blue-950/60 font-bold">
                📍
              </div>
              <div class="absolute -bottom-5 bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded border border-slate-700 shadow whitespace-nowrap">
                Você Está Aqui
              </div>
            `
          }
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const userMarker = L.marker([userPos.lat, userPos.lng], { icon: userIcon, zIndexOffset: 1000 });
    userMarker.bindPopup(`
      <div class="text-xs p-1 text-slate-900 font-sans">
        <div class="font-extrabold ${userSignalLost ? 'text-amber-800' : 'text-blue-800'}">
          ${userSignalLost ? '⚠️ SINAL INTERROMPIDO' : '📍 Minha Localização Atual'}
        </div>
        <div class="text-[11px] text-slate-600 mt-1 font-mono">
          Lat: ${userPos.lat.toFixed(5)}, Lng: ${userPos.lng.toFixed(5)}
        </div>
        <div class="text-[10px] ${isInside ? 'text-emerald-700' : 'text-rose-700'} font-bold mt-1">
          ${isInside ? '✓ Dentro do Perímetro do Campus' : '⚠️ Fora dos limites da UFPB'}
        </div>
      </div>
    `);
    layer.addLayer(userMarker);

    // 5. Marcadores de Alertas Ativos
    activeAlerts.forEach((alert) => {
      const isSelected = selectedAlertId === alert.id;
      const isPending = alert.status === 'pendente';
      const hasPhoto = !!alert.photoSnapshot;

      const alertIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6 cursor-pointer group">
            <div class="absolute w-12 h-12 rounded-full ${isPending ? 'bg-red-500/40 animate-ping' : 'bg-amber-500/30'}"></div>
            <div class="w-9 h-9 rounded-full ${
              isSelected
                ? 'bg-red-700 ring-4 ring-red-300 shadow-2xl scale-110'
                : isPending
                ? 'bg-red-600 border-2 border-white shadow-xl'
                : 'bg-amber-600 border-2 border-white shadow-xl'
            } text-white flex items-center justify-center text-sm font-black transition-transform">
              ${hasPhoto ? '📸' : '🚨'}
            </div>
            <div class="absolute -top-4 bg-red-950 text-red-200 font-bold text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-red-500/50">
              ${alert.protocolNumber} ${hasPhoto ? '• FOTO' : ''}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const alertMarker = L.marker([alert.location.lat, alert.location.lng], { icon: alertIcon, zIndexOffset: 900 });
      alertMarker.on('click', () => {
        if (onSelectAlert) onSelectAlert(alert);
      });

      layer.addLayer(alertMarker);
    });

    // 6. Marcadores das Viaturas & Rondas de Segurança do Campus
    const campusUnits = securityUnits.filter(
      (u) => !u.campusId || u.campusId === selectedCampusId
    );

    campusUnits.forEach((unit) => {
      const isAvailable = unit.status === 'disponivel';
      const unitIcon = L.divIcon({
        className: 'custom-patrol-marker',
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 -ml-4.5 -mt-4.5 cursor-pointer">
            <div class="w-7 h-7 rounded-xl ${
              isAvailable ? 'bg-[#003d71] border-2 border-blue-200' : 'bg-amber-600 border-2 border-amber-200'
            } text-white flex items-center justify-center text-xs shadow-lg shadow-blue-950/40">
              ${unit.type === 'viatura' ? '🚔' : unit.type === 'motopatrulha' ? '🏍️' : '👮'}
            </div>
            <div class="absolute -bottom-4 bg-slate-900 text-blue-200 font-bold text-[8px] px-1 py-0.2 rounded border border-blue-400/40 whitespace-nowrap">
              ${unit.code}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const unitMarker = L.marker([unit.coordinate.lat, unit.coordinate.lng], { icon: unitIcon, zIndexOffset: 800 });
      unitMarker.bindPopup(`
        <div class="text-xs p-1 text-slate-900 font-sans">
          <div class="font-bold text-[#003d71]">${unit.name} (${unit.code})</div>
          <div class="text-[10px] font-semibold text-slate-500">${unit.sector}</div>
          <div class="text-[10px] mt-1 text-slate-700">Rádio: ${unit.contactRadio}</div>
          <div class="text-[9px] mt-1 px-1.5 py-0.5 rounded font-bold ${
            isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }">
            ${isAvailable ? 'Disponível para Chamado' : 'Em Atendimento'}
          </div>
        </div>
      `);
      layer.addLayer(unitMarker);
    });
  }, [
    userCoordinate,
    userSignalLost,
    lastKnownCoordinate,
    activeAlerts,
    securityUnits,
    selectedAlertId,
    breadcrumbs,
    safeZones,
    showSafeZones,
    showBreadcrumbs,
    isInsideCampus,
    selectedCampusId,
  ]);

  // Se um alerta for selecionado, centralizar nele com zoom suave
  useEffect(() => {
    if (!selectedAlertId) return;
    const alert = activeAlerts.find((a) => a.id === selectedAlertId);
    if (alert && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([alert.location.lat, alert.location.lng], 17, {
        duration: 1.0,
      });
    }
  }, [selectedAlertId, activeAlerts]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Indicador de Campus Atual sobre o Mapa */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{currentCampus.shortName}</span>
      </div>
    </div>
  );
};
