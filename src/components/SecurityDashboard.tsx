import React, { useState, useEffect } from 'react';
import {
  EmergencyAlert,
  SecurityPatrolUnit,
  AlertStatus,
  GeoCoordinate,
  SafeZone,
  BreadcrumbPoint,
  UfpbCampusId,
  EmergencyPhotoSnapshot,
} from '../types';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, UFPB_CAMPI } from '../data/ufpbData';
import { CampusMap } from './CampusMap';
import { AlertHistoryModal } from './AlertHistoryModal';
import { PhotoEvidenceModal } from './PhotoEvidenceModal';
import { SoundEffects } from '../utils/sound';
import { formatDistance, calculateDistance, getCampusById } from '../utils/geo';
import { generateEmergencyEvidenceCanvas } from '../utils/camera';
import {
  ShieldAlert,
  Radio,
  WifiOff,
  Clock,
  User,
  Phone,
  HeartHandshake,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Send,
  Sparkles,
  Search,
  Battery,
  AlertTriangle,
  History,
  Route,
  ShieldCheck,
  Download,
  Eye,
  Camera,
  Building2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface SecurityDashboardProps {
  alerts: EmergencyAlert[];
  securityUnits: SecurityPatrolUnit[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, unitId?: string, note?: string) => void;
  onAddSimulatedAlert: (
    category: EmergencyAlert['category'],
    locationName: string,
    coord: GeoCoordinate,
    signalLost: boolean,
    campusId?: UfpbCampusId,
    photoSnapshot?: EmergencyPhotoSnapshot
  ) => void;
  userCoordinate: GeoCoordinate;
  userSignalLost: boolean;
  lastKnownCoordinate: GeoCoordinate | null;
  breadcrumbs: BreadcrumbPoint[];
  safeZones?: SafeZone[];
  selectedCampusId?: UfpbCampusId;
  onSelectCampus?: (campusId: UfpbCampusId) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  alerts,
  securityUnits,
  onUpdateAlertStatus,
  onAddSimulatedAlert,
  userCoordinate,
  userSignalLost,
  lastKnownCoordinate,
  breadcrumbs,
  safeZones = CAMPUS_SAFE_ZONES,
  selectedCampusId = 'campus_1_joao_pessoa',
  onSelectCampus,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ativos' | 'sinal_perdido' | 'zonas_seguras' | 'com_foto' | 'todos' | 'resolvidos'>('ativos');
  const [campusFilter, setCampusFilter] = useState<'todos' | UfpbCampusId>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [selectedUnitForDispatch, setSelectedUnitForDispatch] = useState<string>('');
  
  // Modais de Foto e Histórico
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedEvidencePhoto, setSelectedEvidencePhoto] = useState<EmergencyPhotoSnapshot | null>(null);

  const [showBreadcrumbRoute, setShowBreadcrumbRoute] = useState(true);
  const [showSafeZonesOnMap, setShowSafeZonesOnMap] = useState(true);

  // Selecionar o primeiro alerta ativo por padrão se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedAlertId && alerts.length > 0) {
      const activeOne = alerts.find((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario');
      if (activeOne) setSelectedAlertId(activeOne.id);
      else setSelectedAlertId(alerts[0].id);
    }
  }, [alerts, selectedAlertId]);

  // Alerta atualmente em foco
  const currentAlert = alerts.find((a) => a.id === selectedAlertId) || null;
  const currentAlertCampus = currentAlert ? getCampusById(currentAlert.campusId) : getCampusById(selectedCampusId);

  // Filtragem dos alertas
  const filteredAlerts = alerts.filter((alert) => {
    // Filtro de Campus
    if (campusFilter !== 'todos') {
      const alertCampus = alert.campusId || 'campus_1_joao_pessoa';
      if (alertCampus !== campusFilter) return false;
    }

    // Filtro de Busca
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.userProfile.name.toLowerCase().includes(q);
      const matchProtocol = alert.protocolNumber.toLowerCase().includes(q);
      const matchLoc = alert.locationName.toLowerCase().includes(q);
      if (!matchName && !matchProtocol && !matchLoc) return false;
    }

    if (filterType === 'ativos') {
      return alert.status === 'pendente' || alert.status === 'em_deslocamento' || alert.status === 'no_local';
    }
    if (filterType === 'sinal_perdido') {
      return alert.signalLost;
    }
    if (filterType === 'zonas_seguras') {
      return alert.isInSafeZone;
    }
    if (filterType === 'com_foto') {
      return !!alert.photoSnapshot;
    }
    if (filterType === 'resolvidos') {
      return alert.status === 'resolvido' || alert.status === 'cancelado_usuario';
    }
    return true;
  });

  // Estatísticas do Painel
  const activeAlertsCount = alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario').length;
  const lostSignalAlertsCount = alerts.filter((a) => a.signalLost && a.status !== 'resolvido').length;
  const photosAlertsCount = alerts.filter((a) => !!a.photoSnapshot && a.status !== 'resolvido').length;
  const availablePatrolsCount = securityUnits.filter((u) => u.status === 'disponivel').length;

  // Alternar Sirene de Alerta Sonoro
  const toggleSiren = () => {
    if (!isSirenActive) {
      SoundEffects.startSiren();
      setIsSirenActive(true);
    } else {
      SoundEffects.stopSiren();
      setIsSirenActive(false);
    }
  };

  // Despachar Ronda / Atualizar Status
  const handleDispatch = (status: AlertStatus) => {
    if (!currentAlert) return;
    SoundEffects.playClick();
    onUpdateAlertStatus(
      currentAlert.id,
      status,
      selectedUnitForDispatch || undefined,
      internalNote.trim() ? internalNote.trim() : undefined
    );
    setInternalNote('');
  };

  // Simular Alerta em campus específico para teste tático
  const handleCreateDemoAlert = (targetCampusId: UfpbCampusId = 'campus_1_joao_pessoa') => {
    SoundEffects.playClick();
    const campus = getCampusById(targetCampusId);
    const coord = {
      lat: campus.center.lat + (Math.random() - 0.5) * 0.002,
      lng: campus.center.lng + (Math.random() - 0.5) * 0.002,
      accuracy: 6,
    };

    const protocol = `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const photo = generateEmergencyEvidenceCanvas({
      coordinate: coord,
      protocolNumber: protocol,
      userName: 'Discente Simulado',
      campusName: campus.shortName,
    });

    onAddSimulatedAlert(
      'urgencia_geral',
      `Área Central • ${campus.shortName}`,
      coord,
      false,
      targetCampusId,
      photo
    );
  };

  // Calcular distância das unidades até o alerta selecionado
  const unitsWithDistance = securityUnits.map((u) => {
    if (!currentAlert) return { ...u, dist: 0 };
    const d = calculateDistance(u.coordinate, currentAlert.location);
    return { ...u, dist: d };
  }).sort((a, b) => a.dist - b.dist);

  // Rastro a ser exibido no mapa
  const routeToShow = currentAlert?.userRouteHistory && currentAlert.userRouteHistory.length > 0
    ? currentAlert.userRouteHistory
    : breadcrumbs;

  // Mapa a focar: o campus do alerta selecionado ou o campus do filtro
  const effectiveCampusId = currentAlert?.campusId || (campusFilter !== 'todos' ? campusFilter : selectedCampusId);

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto text-slate-800">
      
      {/* 1. CABEÇALHO DA CENTRAL DE SEGURANÇA INTEGRADA UFPB */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl shadow-sm shrink-0 border border-slate-700">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/30">
                  CENTRAL PU • MULTI-CAMPI
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Central Integrada de Monitoramento UFPB
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vigilância Tática, Foto Instantânea no SOS & Rastreamento em Todos os Campi da UFPB
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor de Filtro de Campus na Central */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-4 h-4 text-[#003d71]" />
              <select
                value={campusFilter}
                onChange={(e) => {
                  const val = e.target.value as 'todos' | UfpbCampusId;
                  setCampusFilter(val);
                  if (val !== 'todos' && onSelectCampus) {
                    onSelectCampus(val);
                  }
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos os Campi (Geral)</option>
                {UFPB_CAMPI.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Histórico de Alertas */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Histórico de Alertas ({alerts.length})</span>
            </button>

            {/* Botão de Sirene */}
            <button
              onClick={toggleSiren}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
                isSirenActive
                  ? 'bg-red-600 text-white border-red-600 animate-pulse shadow-md shadow-red-500/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isSirenActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSirenActive ? 'Sirene Ativa' : 'Alarme Sonoro'}</span>
            </button>

            {/* Simulação Rápida para Teste */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 px-2 font-semibold">Simular SOS:</span>
              <button
                onClick={() => handleCreateDemoAlert('campus_1_joao_pessoa')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                title="Simular SOS no Campus I"
              >
                Campus I
              </button>
              <button
                onClick={() => handleCreateDemoAlert('campus_2_areia')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                title="Simular SOS no Campus II (Areia)"
              >
                Areia
              </button>
              <button
                onClick={() => handleCreateDemoAlert('campus_3_bananeiras')}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                title="Simular SOS no Campus III (Bananeiras)"
              >
                Bananeiras
              </button>
            </div>
          </div>

        </div>

        {/* CARDS DE RESUMO DE INDICADORES (KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{activeAlertsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Alertas Ativos</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#003d71] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#003d71]">{photosAlertsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Fotos Instantâneas</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-800">{lostSignalAlertsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Sinal Interrompido</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-800">{availablePatrolsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Rondas Disponíveis</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. GRID PRINCIPAL: MAPA EM TEMPO REAL + PAINEL DE OCORRÊNCIAS & DESPACHO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* COLUNA ESQUERDA (7 colunas): MAPA OPERACIONAL */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#003d71]" />
                Monitoramento Operacional • {getCampusById(effectiveCampusId).name}
              </h3>
              
              <div className="flex items-center gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={showSafeZonesOnMap}
                    onChange={(e) => setShowSafeZonesOnMap(e.target.checked)}
                    className="rounded text-[#003d71] focus:ring-[#003d71] cursor-pointer"
                  />
                  <span>Zonas Seguras</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={showBreadcrumbRoute}
                    onChange={(e) => setShowBreadcrumbRoute(e.target.checked)}
                    className="rounded text-[#003d71] focus:ring-[#003d71] cursor-pointer"
                  />
                  <span>Rastro / Rota</span>
                </label>
              </div>
            </div>

            <CampusMap
              userCoordinate={userCoordinate}
              userSignalLost={userSignalLost}
              lastKnownCoordinate={lastKnownCoordinate}
              activeAlerts={alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario')}
              securityUnits={securityUnits}
              selectedAlertId={selectedAlertId}
              breadcrumbs={showBreadcrumbRoute ? routeToShow : []}
              safeZones={safeZones}
              showSafeZones={showSafeZonesOnMap}
              showBreadcrumbs={showBreadcrumbRoute}
              selectedCampusId={effectiveCampusId}
              onSelectAlert={(a) => {
                SoundEffects.playClick();
                setSelectedAlertId(a.id);
              }}
              heightClass="h-[480px]"
            />

            {/* Rodapé Tático do Mapa */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Viaturas com telemetria ativa</span>
                <span>•</span>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Alertas SOS</span>
              </div>

              <span className="font-mono text-slate-400">
                Rádio Campus: {getCampusById(effectiveCampusId).emergencyRadioChannel}
              </span>
            </div>
          </div>

          {/* Lista de Unidades de Ronda / Viaturas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#003d71]" />
                Viaturas e Rondas de Segurança no Campus
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {unitsWithDistance.filter((u) => u.status === 'disponivel').length} de {securityUnits.length} operando
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {unitsWithDistance.map((unit) => {
                const isAvail = unit.status === 'disponivel';
                return (
                  <div
                    key={unit.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isAvail ? 'bg-[#003d71] text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {unit.type === 'viatura' ? '🚔' : unit.type === 'motopatrulha' ? '🏍️' : '👮'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">
                          {unit.name} ({unit.code})
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {unit.sector} • Rádio: {unit.contactRadio}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full block ${
                        isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isAvail ? 'Disponível' : 'Ocupada'}
                      </span>
                      {currentAlert && (
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          ~ {formatDistance(unit.dist)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (5 colunas): FILTRO DE ALERTAS + DETALHAMENTO & EVIDÊNCIA DE FOTO */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* BARRA DE FILTROS DOS ALERTAS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por protocolo, nome ou local..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#003d71]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ativos', label: `Ativos (${activeAlertsCount})` },
                { id: 'com_foto', label: `📸 Com Foto (${photosAlertsCount})` },
                { id: 'sinal_perdido', label: `⚠️ Sinal Perdido (${lostSignalAlertsCount})` },
                { id: 'zonas_seguras', label: 'Zonas Seguras' },
                { id: 'todos', label: `Todos (${alerts.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    filterType === f.id
                      ? 'bg-[#003d71] text-white border-[#003d71] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA ROLÁVEL DE ALERTAS */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                Nenhum chamado correspondente aos filtros atuais.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlertId === alert.id;
                const isSignalLost = alert.signalLost;
                const hasPhoto = !!alert.photoSnapshot;
                const campusInfo = getCampusById(alert.campusId);

                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      SoundEffects.playClick();
                      setSelectedAlertId(alert.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-2 border-[#003d71] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          alert.status === 'pendente'
                            ? 'bg-red-500 animate-ping'
                            : alert.status === 'em_deslocamento'
                            ? 'bg-amber-500'
                            : alert.status === 'no_local'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`} />
                        <span className="font-bold text-slate-900 text-xs">{alert.protocolNumber}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 bg-[#003d71]/10 text-[#003d71] rounded">
                          {campusInfo.shortName}
                        </span>
                        {hasPhoto && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded flex items-center gap-0.5">
                            <Camera className="w-3 h-3" /> Foto
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {new Date(alert.createdAt).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate">{alert.userProfile.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.status === 'pendente' ? 'bg-red-50 text-red-700 border border-red-200' :
                        alert.status === 'em_deslocamento' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        alert.status === 'no_local' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {alert.status === 'pendente' && 'PENDENTE'}
                        {alert.status === 'em_deslocamento' && 'EM DESLOCAMENTO'}
                        {alert.status === 'no_local' && 'NO LOCAL'}
                        {alert.status === 'resolvido' && 'RESOLVIDO'}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate font-medium">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">{alert.locationName}</span>
                    </div>

                    {isSignalLost && (
                      <div className="mt-1.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        SINAL INTERROMPIDO: Última coordenada fixada
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* DETALHAMENTO & AÇÕES DA OCORRÊNCIA SELECIONADA */}
          {currentAlert && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in">
              
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                      Ocorrência em Atendimento
                    </span>
                    <span className="text-[10px] font-bold bg-[#003d71] text-white px-2 py-0.2 rounded-full">
                      {currentAlertCampus.shortName}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
                    {currentAlert.protocolNumber}
                    {currentAlert.signalLost && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        SINAL PERDIDO
                      </span>
                    )}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Disparo</div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {new Date(currentAlert.createdAt).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* CARD DE EVIDÊNCIA FOTOGRÁFICA DO DISPARO (REQUISITO CRUCIAL) */}
              {currentAlert.photoSnapshot ? (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase">
                        Evidência Fotográfica
                      </span>
                      <span className="text-[11px] text-slate-300 font-bold">
                        Capturada no Momento do SOS
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEvidencePhoto(currentAlert.photoSnapshot || null);
                        setIsPhotoModalOpen(true);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ampliar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => {
                        setSelectedEvidencePhoto(currentAlert.photoSnapshot || null);
                        setIsPhotoModalOpen(true);
                      }}
                      className="relative w-28 h-20 rounded-lg overflow-hidden bg-black border border-slate-700 shrink-0 cursor-pointer group shadow"
                    >
                      <img
                        src={currentAlert.photoSnapshot.dataUrl}
                        alt="Foto da vítima no SOS"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Câmera Autorizada:</span>
                        <span className="font-bold text-slate-200 capitalize">
                          {currentAlert.photoSnapshot.source.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Horário da Imagem:</span>
                        <span className="font-mono text-slate-200">
                          {new Date(currentAlert.photoSnapshot.capturedAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Sem evidência fotográfica registrada para este alerta.</span>
                </div>
              )}

              {/* Dados do Usuário / Vítima */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{currentAlert.userProfile.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003d71] border border-blue-100">
                    {currentAlert.userProfile.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400 block font-semibold">Matrícula:</span>
                    <span className="font-mono font-medium">{currentAlert.userProfile.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Telefone:</span>
                    <a href={`tel:${currentAlert.userProfile.phone}`} className="text-[#003d71] underline font-medium">
                      {currentAlert.userProfile.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Centro / Unidade:</span>
                    <span className="font-medium">{currentAlert.userProfile.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Contato Emergência:</span>
                    <span className="text-amber-800 font-semibold">
                      {currentAlert.userProfile.emergencyContactName} ({currentAlert.userProfile.emergencyContactPhone})
                    </span>
                  </div>
                </div>
              </div>

              {/* Localização & Último Ponto Conhecido */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#003d71]" />
                    {currentAlert.signalLost ? 'Último Ponto Conhecido (GPS Interrompido)' : 'Localização em Tempo Real'}:
                  </span>
                  {currentAlert.batteryLevel && (
                    <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" /> {currentAlert.batteryLevel}%
                    </span>
                  )}
                </div>

                <div className="text-slate-900 font-bold text-xs">
                  {currentAlert.locationName}
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Lat: {currentAlert.location.lat.toFixed(5)}, Lng: {currentAlert.location.lng.toFixed(5)}</span>
                  <a
                    href={`https://www.google.com/maps?q=${currentAlert.location.lat},${currentAlert.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#003d71] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>Abrir no Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {currentAlert.isInSafeZone && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Ocorrência dentro de <strong>Zona Segura ({currentAlert.safeZoneName})</strong></span>
                  </div>
                )}
              </div>

              {/* Despacho de Ronda / Viatura */}
              {currentAlert.status !== 'resolvido' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Despachar Viatura / Atualizar Ocorrência:
                  </label>
                  
                  <select
                    value={selectedUnitForDispatch}
                    onChange={(e) => setSelectedUnitForDispatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#003d71]"
                  >
                    <option value="">Selecione a Ronda / Viatura mais próxima...</option>
                    {unitsWithDistance.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code}) - {u.status === 'disponivel' ? 'Livre' : 'Ocupada'} • Dist: ~{formatDistance(u.dist)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Adicionar nota tática da central para a equipe..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#003d71]"
                  />

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleDispatch('em_deslocamento')}
                      className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Em Deslocamento
                    </button>
                    <button
                      onClick={() => handleDispatch('no_local')}
                      className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      No Local
                    </button>
                    <button
                      onClick={() => handleDispatch('resolvido')}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* MODAL DE HISTÓRICO COMPLETO */}
      <AlertHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        alerts={alerts}
        onSelectAlertToInspect={(alert) => {
          setSelectedAlertId(alert.id);
          setIsHistoryModalOpen(false);
        }}
      />

      {/* MODAL DE EVIDÊNCIA FOTOGRÁFICA AMPLIADA */}
      {selectedEvidencePhoto && (
        <PhotoEvidenceModal
          isOpen={isPhotoModalOpen}
          onClose={() => {
            setIsPhotoModalOpen(false);
            setSelectedEvidencePhoto(null);
          }}
          photoSnapshot={selectedEvidencePhoto}
          victimName={currentAlert?.userProfile.name}
          protocolNumber={currentAlert?.protocolNumber}
          locationName={currentAlert?.locationName}
        />
      )}

    </div>
  );
};
