import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, UFPB_CAMPUS_BOUNDS, UFPB_CAMPUS_CENTER } from '../data/ufpbData';
import { BreadcrumbPoint, EmergencyAlert, GeoCoordinate, SecurityPatrolUnit, SafeZone } from '../types';

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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Inicializar o mapa do Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [UFPB_CAMPUS_CENTER.lat, UFPB_CAMPUS_CENTER.lng],
      zoom: 16,
      minZoom: 14,
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

    // Polígono de Limites do Campus I da UFPB
    const campusPolygon = L.polygon(UFPB_CAMPUS_BOUNDS, {
      color: '#10b981',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.06,
      dashArray: '5, 8',
    }).addTo(map);

    campusPolygon.bindTooltip('Campus I - UFPB (João Pessoa)', {
      permanent: false,
      direction: 'center',
      className: 'bg-slate-900 text-emerald-400 font-bold px-2 py-1 rounded border border-emerald-500/40 text-xs shadow-lg',
    });

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atualizar marcadores, rotas e alertas
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Adicionar Zonas de Segurança (Safe Zones)
    if (showSafeZones && safeZones) {
      safeZones.forEach((sz) => {
        // Círculo de cobertura da Zona Segura
        const zoneCircle = L.circle([sz.center.lat, sz.center.lng], {
          radius: sz.radiusMeters,
          color: '#059669', // Emerald 600
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
            <div class="mt-1 flex flex-wrap gap-1">
              ${sz.securityFeatures.map(f => `<span class="bg-slate-100 text-slate-700 text-[9px] px-1 py-0.5 rounded">${f}</span>`).join('')}
            </div>
          </div>
        `);

        layer.addLayer(zoneCircle);
        layer.addLayer(zoneMarker);
      });
    }

    // 2. Adicionar Pontos de Referência da UFPB
    CAMPUS_LOCATIONS.forEach((loc) => {
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

    // 3. Traçar Linha de Rastro/Breadcrumb (Histórico de deslocamento) com marcadores de pontos
    if (showBreadcrumbs && breadcrumbs.length > 1) {
      const lineCoords: [number, number][] = breadcrumbs.map((b) => [b.coordinate.lat, b.coordinate.lng]);
      const breadcrumbPolyline = L.polyline(lineCoords, {
        color: userSignalLost ? '#d97706' : '#2563eb',
        weight: 3.5,
        opacity: 0.75,
        dashArray: userSignalLost ? '6, 6' : undefined,
      });
      layer.addLayer(breadcrumbPolyline);

      // Adicionar pequenos pontos nos breadcrumbs intermediários
      breadcrumbs.forEach((pt, idx) => {
        if (idx === breadcrumbs.length - 1) return; // Posição atual tratada separadamente
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

    // 4. Marcador da Posição do Usuário
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
                Última Localização Conhecida
              </div>
            `
              : `
              <div class="absolute w-10 h-10 rounded-full ${isInside ? 'bg-blue-500/30' : 'bg-red-500/30'} animate-ping"></div>
              <div class="w-7 h-7 rounded-full ${isInside ? 'bg-blue-600 border-2 border-blue-200' : 'bg-rose-600 border-2 border-rose-200'} text-white flex items-center justify-center text-xs shadow-xl shadow-blue-950/60 font-bold">
                📍
              </div>
              <div class="absolute -bottom-6 bg-slate-950/90 ${isInside ? 'text-blue-300 border-blue-500/40' : 'text-rose-300 border-rose-500/40'} font-bold text-[9px] px-1.5 py-0.5 rounded border shadow whitespace-nowrap">
                Você
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
        <div class="font-bold text-slate-900 flex items-center gap-1">
          ${userSignalLost ? '⚠️ Última Localização Conhecida' : '📍 Sua Localização Atual'}
        </div>
        <div class="text-[11px] text-slate-600 mt-1">
          Lat: ${userPos.lat.toFixed(5)}, Lng: ${userPos.lng.toFixed(5)}
        </div>
        <div class="text-[10px] ${userSignalLost ? 'text-amber-700' : isInside ? 'text-emerald-700' : 'text-rose-700'} font-semibold mt-1">
          ${userSignalLost ? 'Sinal Interrompido - Ponto de Referência' : isInside ? 'Dentro do Campus UFPB' : 'Fora dos limites da UFPB'}
        </div>
      </div>
    `);
    layer.addLayer(userMarker);

    // Círculo de precisão para a última localização
    if (userPos.accuracy) {
      const accuracyCircle = L.circle([userPos.lat, userPos.lng], {
        radius: Math.max(userPos.accuracy, 15),
        color: userSignalLost ? '#f59e0b' : '#3b82f6',
        fillColor: userSignalLost ? '#f59e0b' : '#3b82f6',
        fillOpacity: 0.12,
        weight: 1,
      });
      layer.addLayer(accuracyCircle);
    }

    // 5. Marcadores de Alertas Ativos (SOS)
    activeAlerts.forEach((alert) => {
      const isSelected = selectedAlertId === alert.id;
      const isSignalLost = alert.signalLost;

      let badgeBg = '#dc2626'; // Vermelho SOS
      let badgeLabel = 'SOS ATIVO';

      if (alert.status === 'em_deslocamento') {
        badgeBg = '#ea580c'; // Laranja
        badgeLabel = 'EM ATENDIMENTO';
      } else if (alert.status === 'no_local') {
        badgeBg = '#0284c7'; // Azul
        badgeLabel = 'VIATURA NO LOCAL';
      } else if (alert.status === 'resolvido') {
        badgeBg = '#16a34a'; // Verde
        badgeLabel = 'RESOLVIDO';
      }

      const alertIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6 cursor-pointer">
            <div class="absolute w-12 h-12 rounded-full" style="background-color: ${badgeBg}; opacity: 0.35; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-2xl border-2 ${isSelected ? 'border-yellow-300 scale-125' : 'border-white'}" style="background-color: ${badgeBg};">
              <span class="text-xs font-black">SOS</span>
            </div>
            <div class="absolute -bottom-6 text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap text-white" style="background-color: ${badgeBg};">
              ${isSignalLost ? '⚡ ÚLTIMO PONTO' : badgeLabel}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const alertMarker = L.marker([alert.location.lat, alert.location.lng], {
        icon: alertIcon,
        zIndexOffset: 2000,
      });

      alertMarker.on('click', () => {
        if (onSelectAlert) onSelectAlert(alert);
      });

      alertMarker.bindPopup(`
        <div class="text-xs p-1 text-slate-900 font-sans min-w-[180px]">
          <div class="font-bold text-red-600 flex items-center justify-between">
            <span>🚨 ${alert.protocolNumber}</span>
            <span class="text-[9px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">${alert.userProfile.role.toUpperCase()}</span>
          </div>
          <div class="font-semibold text-slate-900 mt-1">${alert.userProfile.name}</div>
          <div class="text-[11px] text-slate-600">${alert.locationName}</div>
          ${alert.isInSafeZone ? `<div class="text-[10px] text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-semibold mt-1">🛡️ Dentro de Zona Segura</div>` : ''}
          ${alert.customNote ? `<div class="text-[11px] bg-red-50 text-red-900 p-1 rounded mt-1 border border-red-200 italic">"${alert.customNote}"</div>` : ''}
          ${isSignalLost ? `<div class="text-[10px] text-amber-700 font-bold mt-1 bg-amber-50 p-1 rounded border border-amber-200">⚠️ Sinal Perdido - Última posição conhecida</div>` : ''}
        </div>
      `);

      layer.addLayer(alertMarker);
    });

    // 6. Marcadores de Unidades de Segurança / Rondas
    securityUnits.forEach((unit) => {
      let iconSymbol = '🚔';
      if (unit.type === 'motopatrulha') iconSymbol = '🏍️';
      if (unit.type === 'posto_fixo') iconSymbol = '🏢';
      if (unit.type === 'ronda_a_pe') iconSymbol = '👮';

      const unitIcon = L.divIcon({
        className: 'custom-patrol-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-400 text-white flex items-center justify-center text-xs shadow-lg">
              ${iconSymbol}
            </div>
            <div class="absolute -bottom-5 bg-emerald-900 text-emerald-200 font-semibold text-[8px] px-1 py-0.2 rounded whitespace-nowrap border border-emerald-500/30">
              ${unit.code}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const unitMarker = L.marker([unit.coordinate.lat, unit.coordinate.lng], {
        icon: unitIcon,
        zIndexOffset: 500,
      });

      unitMarker.bindPopup(`
        <div class="text-xs p-1 text-slate-900 font-sans">
          <div class="font-bold text-emerald-800 flex items-center gap-1">${unit.name} (${unit.code})</div>
          <div class="text-[11px] text-slate-600 mt-0.5">Setor: ${unit.sector}</div>
          <div class="text-[11px] text-slate-700 font-medium">Equipe: ${unit.officers.join(', ')}</div>
          <div class="text-[10px] text-slate-500 mt-1">Rádio: ${unit.contactRadio}</div>
        </div>
      `);

      layer.addLayer(unitMarker);
    });

    // Se houver um alerta selecionado, centrar nele suavemente
    if (selectedAlertId) {
      const selAlert = activeAlerts.find((a) => a.id === selectedAlertId);
      if (selAlert) {
        map.panTo([selAlert.location.lat, selAlert.location.lng], { animate: true, duration: 0.8 });
      }
    }
  }, [userCoordinate, userSignalLost, lastKnownCoordinate, activeAlerts, securityUnits, selectedAlertId, breadcrumbs, isInsideCampus, safeZones, showSafeZones, showBreadcrumbs]);

  // Função para recentralizar o mapa
  const handleRecenter = (target: 'user' | 'campus') => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (target === 'user') {
      const pos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;
      map.flyTo([pos.lat, pos.lng], 17, { duration: 1 });
    } else {
      map.flyTo([UFPB_CAMPUS_CENTER.lat, UFPB_CAMPUS_CENTER.lng], 16, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-100">
      {/* Contêiner Leaflet */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

      {/* Barra de Controles Rápidos no Mapa */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
        <button
          onClick={() => handleRecenter('user')}
          className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs backdrop-blur-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>📍</span>
          <span>Centrar em Mim</span>
        </button>

        <button
          onClick={() => handleRecenter('campus')}
          className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs backdrop-blur-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>🏛️</span>
          <span>Campus I UFPB</span>
        </button>
      </div>

      {/* Legenda Informativa Flutuante */}
      <div className="absolute bottom-2 left-2 z-20 hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-[11px] text-slate-700 backdrop-blur-md shadow-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Limite UFPB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block border border-emerald-300"></span>
          <span>Zona Segura</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#003d71] inline-block"></span>
          <span>Você / Rastro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-pulse"></span>
          <span>SOS Ativo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Último Sinal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block"></span>
          <span>Ronda UFPB</span>
        </div>
      </div>
    </div>
  );
};

