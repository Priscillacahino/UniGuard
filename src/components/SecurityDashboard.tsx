import React, { useState, useEffect } from 'react';
import {
  EmergencyAlert,
  SecurityPatrolUnit,
  AlertStatus,
  GeoCoordinate,
  SafeZone,
  BreadcrumbPoint,
} from '../types';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES } from '../data/ufpbData';
import { CampusMap } from './CampusMap';
import { AlertHistoryModal } from './AlertHistoryModal';
import { SoundEffects } from '../utils/audio';
import { formatDistance, calculateDistance } from '../utils/geo';
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
} from 'lucide-react';

interface SecurityDashboardProps {
  alerts: EmergencyAlert[];
  securityUnits: SecurityPatrolUnit[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, unitId?: string, note?: string) => void;
  onAddSimulatedAlert: (category: EmergencyAlert['category'], locationName: string, coord: GeoCoordinate, signalLost: boolean) => void;
  userCoordinate: GeoCoordinate;
  userSignalLost: boolean;
  lastKnownCoordinate: GeoCoordinate | null;
  breadcrumbs: BreadcrumbPoint[];
  safeZones?: SafeZone[];
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
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ativos' | 'sinal_perdido' | 'zonas_seguras' | 'todos' | 'resolvidos'>('ativos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [selectedUnitForDispatch, setSelectedUnitForDispatch] = useState<string>('');
  
  // Modais e Visualização
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
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

  // Filtragem dos alertas
  const filteredAlerts = alerts.filter((alert) => {
    // Filtro por texto
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
    if (filterType === 'resolvidos') {
      return alert.status === 'resolvido' || alert.status === 'cancelado_usuario';
    }
    return true;
  });

  // Estatísticas do Painel
  const activeAlertsCount = alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario').length;
  const lostSignalAlertsCount = alerts.filter((a) => a.signalLost && a.status !== 'resolvido').length;
  const availablePatrolsCount = securityUnits.filter((u) => u.status === 'disponivel').length;
  const safeZonesAlertsCount = alerts.filter((a) => a.isInSafeZone).length;

  // Alternar Sirene de Alerta Sonoro
  const toggleSiren = () => {
    if (isSirenActive) {
      SoundEffects.stopSiren();
      setIsSirenActive(false);
    } else {
      SoundEffects.startSiren();
      setIsSirenActive(true);
    }
  };

  // Despachar Unidade
  const handleDispatch = () => {
    if (!currentAlert || !selectedUnitForDispatch) return;
    SoundEffects.playClick();
    const unit = securityUnits.find((u) => u.id === selectedUnitForDispatch);
    const unitName = unit ? `${unit.name} (${unit.code})` : 'Ronda Móvel';
    onUpdateAlertStatus(
      currentAlert.id,
      'em_deslocamento',
      selectedUnitForDispatch,
      `Unidade ${unitName} despachada para o local via rádio.`
    );
    setSelectedUnitForDispatch('');
  };

  // Adicionar Nota de Segurança
  const handleAddSecurityNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlert || !internalNote.trim()) return;
    SoundEffects.playClick();
    onUpdateAlertStatus(currentAlert.id, currentAlert.status, currentAlert.assignedUnitId, internalNote.trim());
    setInternalNote('');
  };

  // Simular Novo Alerta Rápido para Demonstração
  const handleCreateDemoAlert = (scenario: 'cchla' | 'ct' | 'mata_ccen') => {
    SoundEffects.playSosTriggered();
    if (scenario === 'cchla') {
      onAddSimulatedAlert(
        'perseguicao_suspeito',
        'Bosque do CCHLA / Saída Sul',
        { lat: -7.1445, lng: -34.8432, accuracy: 5 },
        false
      );
    } else if (scenario === 'ct') {
      onAddSimulatedAlert(
        'saude_desmaio',
        'CT - Bloco de Aulas de Engenharia',
        { lat: -7.1448, lng: -34.8486, accuracy: 4 },
        false
      );
    } else {
      onAddSimulatedAlert(
        'area_escura_risco',
        'Mata do CCEN / Próximo ao Herbário (Sinal Interrompido)',
        { lat: -7.1378, lng: -34.8410, accuracy: 20 },
        true // COM PERDA DE SINAL
      );
    }
  };

  // Rota a ser exibida no mapa: se houver rota específica no alerta selecionado, usar ela; senão usar o rastro geral
  const routeToShow = currentAlert?.userRouteHistory && currentAlert.userRouteHistory.length > 0
    ? currentAlert.userRouteHistory
    : breadcrumbs;

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto text-slate-800">
      
      {/* 1. CABEÇALHO DO PAINEL OPERACIONAL DA SEGURANÇA - SLEEK INTERFACE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#003d71] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  CENTRAL PU
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Central Integrada de Monitoramento UFPB
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vigilância, Análise de Histórico de Acionamentos SOS & Rastreamento • Campus I (João Pessoa)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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

            {/* Criar Alerta Simulado */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 px-2 font-semibold">Simular:</span>
              <button
                onClick={() => handleCreateDemoAlert('cchla')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
              >
                + SOS CCHLA
              </button>
              <button
                onClick={() => handleCreateDemoAlert('mata_ccen')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[10px] font-semibold text-amber-800 border border-amber-200 cursor-pointer"
              >
                + Queda de Sinal
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

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#003d71] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">~ 2.5 min</div>
              <div className="text-[11px] text-slate-500 font-medium">Tempo Médio Resposta</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. GRID PRINCIPAL: MAPA EM TEMPO REAL + PAINEL DE OCORRÊNCIAS & DESPACHO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* COLUNA ESQUERDA (7 colunas): MAPA OPERACIONAL COMPLETO */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#003d71]" />
                Monitoramento Geográfico em Tempo Real
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
              onSelectAlert={(a) => {
                SoundEffects.playClick();
                setSelectedAlertId(a.id);
              }}
              heightClass="h-[520px]"
            />
          </div>

          {/* Rondas e Unidades em Campo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
            <h4 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#003d71]" />
              Unidades de Segurança & Rondas em Campo:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {securityUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-[#003d71] font-bold border border-blue-100">
                      {unit.code}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">{unit.name}</div>
                      <div className="text-[10px] text-slate-500">{unit.sector}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    unit.status === 'disponivel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {unit.status === 'disponivel' ? 'Disponível' : 'Em Ocorrência'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (5 colunas): FEED DE OCORRÊNCIAS & DESPACHO OPERACIONAL */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Barra de Filtros & Pesquisa */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, protocolo, local..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#003d71]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterType('ativos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === 'ativos' ? 'bg-[#003d71] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ativos ({alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario').length})
              </button>
              <button
                onClick={() => setFilterType('sinal_perdido')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === 'sinal_perdido' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚠️ Sinal Perdido ({alerts.filter((a) => a.signalLost && a.status !== 'resolvido').length})
              </button>
              <button
                onClick={() => setFilterType('zonas_seguras')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === 'zonas_seguras' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🛡️ Zonas Seguras ({safeZonesAlertsCount})
              </button>
              <button
                onClick={() => setFilterType('todos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === 'todos' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({alerts.length})
              </button>
              <button
                onClick={() => setFilterType('resolvidos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterType === 'resolvidos' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resolvidos
              </button>
            </div>
          </div>

          {/* Lista de Chamados */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                Nenhum chamado correspondente aos filtros.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlertId === alert.id;
                const isSignalLost = alert.signalLost;

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
                      <div className="flex items-center gap-2">
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
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
                          {alert.userProfile.role}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {new Date(alert.createdAt).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate">{alert.userProfile.name}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                    <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px]">
                      {alert.isInSafeZone && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          🛡️ Zona Segura ({alert.safeZoneName || 'Campus'})
                        </span>
                      )}

                      {alert.userRouteHistory && alert.userRouteHistory.length > 0 && (
                        <span className="font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Route className="w-3 h-3" />
                          {alert.userRouteHistory.length} pontos de rota
                        </span>
                      )}
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
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                    Ocorrência em Atendimento
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {currentAlert.protocolNumber}
                    {currentAlert.signalLost && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        SINAL PERDIDO
                      </span>
                    )}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Horário</div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    {new Date(currentAlert.createdAt).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Dados do Usuário / Vítima */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{currentAlert.userProfile.name}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003d71] border border-blue-100">
                    {currentAlert.userProfile.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400 block font-semibold">Matrícula / ID:</span>
                    <span className="font-mono font-medium">{currentAlert.userProfile.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Telefone:</span>
                    <a href={`tel:${currentAlert.userProfile.phone}`} className="text-[#003d71] underline font-medium">
                      {currentAlert.userProfile.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Centro / Depto:</span>
                    <span className="font-medium">{currentAlert.userProfile.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Contato Emergência:</span>
                    <span className="text-amber-800 font-semibold">
                      {currentAlert.userProfile.emergencyContactName} ({currentAlert.userProfile.emergencyContactPhone})
                    </span>
                  </div>
                </div>

                {currentAlert.userProfile.medicalNotes && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-rose-700 font-medium">
                    <strong>Avisos Médicos:</strong> {currentAlert.userProfile.medicalNotes}
                  </div>
                )}
              </div>

              {/* Localização & Último Ponto Conhecido */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#003d71]" />
                    {currentAlert.signalLost ? 'Última Localização Conhecida' : 'Posição em Tempo Real'}:
                  </span>
                  {currentAlert.batteryLevel && (
                    <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" /> {currentAlert.batteryLevel}%
                    </span>
                  )}
                </div>

                <div className="text-slate-900 font-semibold text-xs">
                  {currentAlert.locationName}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Coord: {currentAlert.location.lat.toFixed(5)}, {currentAlert.location.lng.toFixed(5)} • Precisão: ±{currentAlert.location.accuracy || 10}m
                </div>

                {currentAlert.isInSafeZone && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Ocorrência dentro de <strong>Zona Segura ({currentAlert.safeZoneName})</strong></span>
                  </div>
                )}

                {currentAlert.smsNotificationsSent && currentAlert.smsNotificationsSent.length > 0 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-medium">
                    ✓ Notificações SMS de emergência enviadas para {currentAlert.smsNotificationsSent.length} contatos cadastrados da vítima.
                  </div>
                )}

                {currentAlert.signalLost && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                    <strong>Atenção Tática:</strong> Comunicação com o aparelho interrompida em {new Date(currentAlert.lastSignalTimestamp).toLocaleTimeString('pt-BR')}. Direcionar busca para este quadrante.
                  </div>
                )}
              </div>

              {/* Despacho de Ronda / Viatura */}
              {currentAlert.status !== 'resolvido' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Despachar Viatura / Ronda Mais Próxima:
                  </label>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedUnitForDispatch}
                      onChange={(e) => setSelectedUnitForDispatch(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
                    >
                      <option value="">Selecione uma ronda para despacho...</option>
                      {securityUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code}) - {unit.status === 'disponivel' ? 'Disponível' : 'Ocupada'}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleDispatch}
                      disabled={!selectedUnitForDispatch}
                      className="px-4 py-2 rounded-xl bg-[#003d71] hover:bg-[#002b50] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Despachar
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de Alteração Rápida de Status */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    SoundEffects.playClick();
                    onUpdateAlertStatus(currentAlert.id, 'em_deslocamento');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    currentAlert.status === 'em_deslocamento'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Em Deslocamento
                </button>

                <button
                  onClick={() => {
                    SoundEffects.playClick();
                    onUpdateAlertStatus(currentAlert.id, 'no_local');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    currentAlert.status === 'no_local'
                      ? 'bg-[#003d71] text-white border-[#003d71] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  No Local
                </button>

                <button
                  onClick={() => {
                    SoundEffects.playResolved();
                    onUpdateAlertStatus(currentAlert.id, 'resolvido', undefined, 'Ocorrência atendida e encerrada com sucesso pela equipe de segurança.');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    currentAlert.status === 'resolvido'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Concluir / Resolvido
                </button>
              </div>

              {/* Histórico de Notas e Mensagens Internas */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block">Notas Operacionais da Vigilância:</span>
                
                {currentAlert.securityNotes && currentAlert.securityNotes.length > 0 ? (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {currentAlert.securityNotes.map((note, idx) => (
                      <div key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5 font-medium">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">Nenhuma anotação registrada ainda.</div>
                )}

                <form onSubmit={handleAddSecurityNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Adicionar nota de ocorrência..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL DE HISTÓRICO COMPLETO DE ALERTAS */}
      <AlertHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        alerts={alerts}
        onSelectAlertToInspect={(a) => {
          setSelectedAlertId(a.id);
        }}
      />

    </div>
  );
};
