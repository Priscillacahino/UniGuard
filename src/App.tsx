/**
 * @license
 * Guardião UFPB - Sistema de Apoio à Segurança e Geolocalização Universitária
 * © 2026 Priscilla S Cahino. Todos os direitos reservados.
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  GeoCoordinate,
  EmergencyAlert,
  SecurityPatrolUnit,
  AlertStatus,
  BreadcrumbPoint,
  LocationTrackingConfig,
  UfpbCampusId,
  EmergencyPhotoSnapshot,
} from './types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_TRACKING_CONFIG,
  INITIAL_ALERTS,
  INITIAL_SECURITY_UNITS,
  UFPB_CAMPUS_CENTER,
  UFPB_CAMPI,
} from './data/ufpbData';
import { isPointInsideCampus, getCampusById } from './utils/geo';
import { SoundEffects } from './utils/sound';

import { UserApp } from './components/UserApp';
import { SecurityDashboard } from './components/SecurityDashboard';
import { IdentityModal } from './components/IdentityModal';
import { AboutModal } from './components/AboutModal';
import { FlowchartModal } from './components/FlowchartModal';
import { Footer } from './components/Footer';

import {
  Shield,
  Smartphone,
  Radio,
  Info,
  GitMerge,
  Building2,
} from 'lucide-react';

export default function App() {
  // 1. Estados Globais do Usuário
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('guardiao_ufpb_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isFlowchartModalOpen, setIsFlowchartModalOpen] = useState(false);
  const [isFirstTimeOnboarding, setIsFirstTimeOnboarding] = useState(false);

  // 2. Modo da Interface (App do Usuário vs Painel da Segurança)
  const [activeTab, setActiveTab] = useState<'user' | 'security'>('user');

  // 3. Campus Ativo (Selecionável pelo usuário entre os 5 Campi da UFPB)
  const [selectedCampusId, setSelectedCampusId] = useState<UfpbCampusId>(() => {
    const saved = localStorage.getItem('guardiao_ufpb_campus');
    return (saved as UfpbCampusId) || 'campus_1_joao_pessoa';
  });

  const activeCampus = getCampusById(selectedCampusId);

  // 4. Estado de Geolocalização e Conexão
  const [userCoordinate, setUserCoordinate] = useState<GeoCoordinate>(() => {
    return {
      lat: activeCampus.center.lat,
      lng: activeCampus.center.lng,
      accuracy: 5,
    };
  });

  const [userSignalLost, setUserSignalLost] = useState<boolean>(false);
  const [lastKnownCoordinate, setLastKnownCoordinate] = useState<GeoCoordinate | null>(() => {
    return {
      lat: activeCampus.center.lat,
      lng: activeCampus.center.lng,
      accuracy: 5,
    };
  });
  const [lastSignalTimestamp, setLastSignalTimestamp] = useState<string>(new Date().toISOString());

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbPoint[]>([
    {
      coordinate: { lat: -7.1388, lng: -34.8450 },
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      locationName: 'Reitoria',
    },
    {
      coordinate: { lat: -7.1408, lng: -34.8462 },
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      locationName: 'Restaurante Universitário',
    },
    {
      coordinate: { lat: -7.1448, lng: -34.8486 },
      timestamp: new Date().toISOString(),
      locationName: 'Centro de Tecnologia (CT)',
    },
  ]);

  // 5. Alertas e Unidades de Segurança
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('guardiao_ufpb_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [securityUnits, setSecurityUnits] = useState<SecurityPatrolUnit[]>(INITIAL_SECURITY_UNITS);

  // 6. Configuração de Rastreamento de Localização
  const [trackingConfig, setTrackingConfig] = useState<LocationTrackingConfig>(() => {
    const saved = localStorage.getItem('guardiao_ufpb_tracking');
    return saved ? JSON.parse(saved) : DEFAULT_TRACKING_CONFIG;
  });

  // Salvar no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('guardiao_ufpb_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('guardiao_ufpb_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('guardiao_ufpb_tracking', JSON.stringify(trackingConfig));
  }, [trackingConfig]);

  useEffect(() => {
    localStorage.setItem('guardiao_ufpb_campus', selectedCampusId);
  }, [selectedCampusId]);

  // Alterar campus ativo e reposicionar telemetria
  const handleSelectCampus = (newCampusId: UfpbCampusId) => {
    setSelectedCampusId(newCampusId);
    const newCampus = getCampusById(newCampusId);

    // Mover a coordenada do usuário para o centro do novo campus
    const newCoord = {
      lat: newCampus.center.lat,
      lng: newCampus.center.lng,
      accuracy: 5,
    };
    setUserCoordinate(newCoord);
    if (!userSignalLost) {
      setLastKnownCoordinate(newCoord);
      setLastSignalTimestamp(new Date().toISOString());
    }

    setBreadcrumbs([
      {
        coordinate: newCoord,
        timestamp: new Date().toISOString(),
        locationName: `Área Central - ${newCampus.shortName}`,
        isInSafeZone: true,
        safeZoneName: 'Entrada / Guarita Principal',
      },
    ]);
  };

  // Verificar se o usuário está dentro dos limites do campus selecionado
  const currentPos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;
  const isInsideCampus = isPointInsideCampus(currentPos, selectedCampusId);

  // Alerta ativo emitido pelo próprio usuário atual
  const userActiveAlert = alerts.find(
    (a) => a.userId === userProfile.id && a.status !== 'resolvido' && a.status !== 'cancelado_usuario'
  ) || null;

  // Handler para Salvar Identificação
  const handleSaveProfile = (profile: UserProfile, grantLocation: boolean) => {
    SoundEffects.playClick();
    setUserProfile(profile);
    setIsIdentityModalOpen(false);
    setIsFirstTimeOnboarding(false);

    if (grantLocation && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          const distToCampus = Math.abs(coord.lat - activeCampus.center.lat);
          if (distToCampus < 0.2) {
            setUserCoordinate(coord);
            setLastKnownCoordinate(coord);
          }
        },
        () => {
          // Permissão negada ou erro, mantém no centro do campus
        }
      );
    }
  };

  // Handler para Envio de Alerta SOS pelo Usuário (já com foto capturada)
  const handleSendAlert = (newAlert: EmergencyAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Handler para Cancelamento de Alerta pelo Usuário
  const handleCancelAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'cancelado_usuario', updatedAt: new Date().toISOString() } : a))
    );
  };

  // Handler para a Central de Segurança Atualizar Status / Despachar
  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus, unitId?: string, note?: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const notes = a.securityNotes ? [...a.securityNotes] : [];
        if (note) notes.push(`[${new Date().toLocaleTimeString('pt-BR')}] ${note}`);

        let unitName = a.assignedUnitName;
        if (unitId) {
          const u = securityUnits.find((unit) => unit.id === unitId);
          if (u) unitName = `${u.name} (${u.code})`;
        }

        return {
          ...a,
          status,
          assignedUnitId: unitId || a.assignedUnitId,
          assignedUnitName: unitName,
          securityNotes: notes,
          resolvedAt: status === 'resolvido' ? new Date().toISOString() : a.resolvedAt,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Se despachou uma unidade, marcar como em ocorrência
    if (unitId) {
      setSecurityUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, status: 'em_ocorrencia', currentAlertId: alertId } : u))
      );
    }
  };

  // Handler para Inserir Alerta Simulado via Central
  const handleAddSimulatedAlert = (
    category: EmergencyAlert['category'],
    locationName: string,
    coord: GeoCoordinate,
    signalLost: boolean,
    campusId: UfpbCampusId = selectedCampusId,
    photoSnapshot?: EmergencyPhotoSnapshot
  ) => {
    const campus = getCampusById(campusId);
    const simAlert: EmergencyAlert = {
      id: `alert_sim_${Date.now()}`,
      protocolNumber: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      campusId: campusId,
      campusName: campus.name,
      userId: `user_sim_${Date.now()}`,
      userProfile: {
        id: `user_sim_${Date.now()}`,
        name: 'Aluno(a) Simulado(a) UFPB',
        documentNumber: `2024${Math.floor(100000 + Math.random() * 900000)}`,
        role: 'estudante',
        phone: '(83) 99123-4567',
        email: 'aluno.simulado@academico.ufpb.br',
        emergencyContactName: 'Familiar Responsável',
        emergencyContactPhone: '(83) 98888-0000',
        emergencyContactRelation: 'Família',
        department: campus.shortName,
        registeredAt: new Date().toISOString(),
      },
      category: category,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: coord,
      locationName: locationName,
      isInsideCampus: true,
      signalLost: signalLost,
      lastSignalTimestamp: signalLost ? new Date(Date.now() - 1000 * 60 * 3).toISOString() : new Date().toISOString(),
      batteryLevel: signalLost ? 18 : 80,
      photoSnapshot: photoSnapshot,
      securityNotes: [
        signalLost
          ? 'ATENÇÃO: Sinal de GPS interrompido subitamente. Última coordenada fixada.'
          : `Chamado simulado no ${campus.shortName} com evidência visual gerada.`,
      ],
    };

    setAlerts((prev) => [simAlert, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 font-sans selection:bg-[#003d71] selection:text-white">
      
      {/* 1. BARRA SUPERIOR DE NAVEGAÇÃO & CONTROLE */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003d71] flex items-center justify-center shadow-sm text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
                  Guardião <span className="text-[#003d71]">UFPB</span>
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003d71] border border-blue-100 uppercase tracking-wide">
                  {activeCampus.shortName}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hidden sm:block">
                Segurança, Foto no SOS & Rastreamento Multi-Campi
              </p>
            </div>
          </div>

          {/* Seletor de Visão: App Usuário vs Central de Segurança */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              id="tab-user-view"
              onClick={() => {
                SoundEffects.playClick();
                setActiveTab('user');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-[#003d71] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>App do Usuário</span>
            </button>

            <button
              id="tab-security-view"
              onClick={() => {
                SoundEffects.playClick();
                setActiveTab('security');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Painel Segurança</span>
              {alerts.filter((a) => a.status !== 'resolvido' && a.status !== 'cancelado_usuario').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>

          {/* Botões Auxiliares: Fluxograma e Sobre */}
          <div className="flex items-center gap-2">
            {/* Botão Fluxograma solicitado pelo usuário */}
            <button
              onClick={() => {
                SoundEffects.playClick();
                setIsFlowchartModalOpen(true);
              }}
              title="Ver Fluxograma Completo do Projeto"
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003d71] border border-blue-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-bold shadow-xs"
            >
              <GitMerge className="w-4 h-4" />
              <span className="hidden md:inline">Fluxograma</span>
            </button>

            <button
              onClick={() => {
                SoundEffects.playClick();
                setIsAboutModalOpen(true);
              }}
              title="Sobre o Projeto Guardião UFPB"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Info className="w-4 h-4 text-[#003d71]" />
              <span className="hidden md:inline">Sobre</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CONDICIONAL POR ABA) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'user' ? (
          <UserApp
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            userCoordinate={userCoordinate}
            setUserCoordinate={setUserCoordinate}
            userSignalLost={userSignalLost}
            setUserSignalLost={setUserSignalLost}
            lastKnownCoordinate={lastKnownCoordinate}
            setLastKnownCoordinate={setLastKnownCoordinate}
            lastSignalTimestamp={lastSignalTimestamp}
            setLastSignalTimestamp={setLastSignalTimestamp}
            isInsideCampus={isInsideCampus}
            userActiveAlert={userActiveAlert}
            onSendAlert={handleSendAlert}
            onCancelAlert={handleCancelAlert}
            onEditProfile={() => setIsIdentityModalOpen(true)}
            breadcrumbs={breadcrumbs}
            setBreadcrumbs={setBreadcrumbs}
            trackingConfig={trackingConfig}
            setTrackingConfig={setTrackingConfig}
            selectedCampusId={selectedCampusId}
            onSelectCampus={handleSelectCampus}
          />
        ) : (
          <SecurityDashboard
            alerts={alerts}
            securityUnits={securityUnits}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onAddSimulatedAlert={handleAddSimulatedAlert}
            userCoordinate={userCoordinate}
            userSignalLost={userSignalLost}
            lastKnownCoordinate={lastKnownCoordinate}
            breadcrumbs={breadcrumbs}
            selectedCampusId={selectedCampusId}
            onSelectCampus={handleSelectCampus}
          />
        )}
      </main>

      {/* 3. MODAIS */}
      <IdentityModal
        isOpen={isIdentityModalOpen}
        onSave={handleSaveProfile}
        initialProfile={userProfile}
        isFirstTime={isFirstTimeOnboarding}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <FlowchartModal
        isOpen={isFlowchartModalOpen}
        onClose={() => setIsFlowchartModalOpen(false)}
      />

      {/* 4. RODAPÉ COM DIREITOS AUTORAIS E AVISO DISCRETO */}
      <Footer onOpenAbout={() => setIsAboutModalOpen(true)} />

    </div>
  );
}
