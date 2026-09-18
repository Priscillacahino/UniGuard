/**
 * @license
 * UniGuard - Protótipo de Apoio à Segurança e Geolocalização Universitária
 * © 2026 Priscilla S Cahino. Todos os direitos reservados.
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
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
  AccessRole,
} from './types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_TRACKING_CONFIG,
  INITIAL_ALERTS,
  INITIAL_SECURITY_UNITS,
  UFPB_CAMPUS_CENTER,
  UFPB_CAMPI,
  DEFAULT_INSTITUTION_ID,
} from './data/ufpbData';
import { isPointInsideCampus, getCampusById } from './utils/geo';
import { parseStoredJson } from './utils/storage';
import { SoundEffects } from './utils/sound';
import {
  cancelAlert,
  changeAlertStatus,
  firebaseEnabled,
  publishAlert,
  subscribeToAlerts,
} from './services/alertRepository';
import { safeLog } from './services/safeLogger';
import {
  authenticateAccount,
  getCurrentAuthorization,
  registerUserAccount,
  requestPasswordReset,
  signOutFirebase,
  type FirebaseAccount,
} from './services/firebase';
import { checkAlertAllowance } from './services/abuseControl';
import { purgeExpiredLocalAlerts } from './services/retention';

import { IdentityModal } from './components/IdentityModal';
import { AboutModal } from './components/AboutModal';
import { FlowchartModal } from './components/FlowchartModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

const UserApp = lazy(() =>
  import('./components/UserApp').then((module) => ({ default: module.UserApp })),
);
const SecurityDashboard = lazy(() =>
  import('./components/SecurityDashboard').then((module) => ({ default: module.SecurityDashboard })),
);

import {
  Shield,
  Smartphone,
  Radio,
  Info,
  GitMerge,
  Building2,
  LogOut,
  Wifi,
  WifiOff,
  User,
  LogIn,
} from 'lucide-react';

const STORAGE_KEYS = {
  loggedIn: 'uniguard_logged_in',
  user: 'uniguard_user',
  campus: 'uniguard_campus',
  alerts: 'uniguard_alerts',
  tracking: 'uniguard_tracking',
} as const;

function readStorageWithLegacy(key: string, legacyKey: string): string | null {
  const currentValue = localStorage.getItem(key);
  if (currentValue !== null) return currentValue;
  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) localStorage.setItem(key, legacyValue);
  return legacyValue;
}

function sanitizeProfile(profile: UserProfile): UserProfile {
  const { medicalNotes: _legacyMedicalNotes, ...safeProfile } =
    profile as UserProfile & { medicalNotes?: unknown };
  return {
    ...safeProfile,
    institutionId: safeProfile.institutionId || DEFAULT_INSTITUTION_ID,
  };
}

export default function App() {
  // 1. Estados Globais do Usuário e Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return firebaseEnabled
      ? false
      : readStorageWithLegacy(STORAGE_KEYS.loggedIn, 'guardiao_ufpb_logged_in') !== 'false';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accountRole, setAccountRole] = useState<AccessRole | null>(() =>
    firebaseEnabled ? null : 'operator',
  );

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = readStorageWithLegacy(STORAGE_KEYS.user, 'guardiao_ufpb_user');
    return sanitizeProfile(parseStoredJson(saved, DEFAULT_USER_PROFILE));
  });

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isFlowchartModalOpen, setIsFlowchartModalOpen] = useState(false);
  const [isFirstTimeOnboarding, setIsFirstTimeOnboarding] = useState(false);

  // Detector de Conexão Online/Offline usando a API nativa do navegador
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      SoundEffects.playSuccess();
    };
    const handleOffline = () => {
      setIsOnline(false);
      SoundEffects.playAlertSound();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handler de Logout do Usuário
  const handleLogout = () => {
    SoundEffects.playClick();
    setIsLoggedIn(false);
    setAccountRole(null);
    setActiveTab('user');
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'false');
    setIsAuthModalOpen(true);
    void signOutFirebase();
  };

  // Handler de Sucesso de Login
  const handleLoginSuccess = (profile: UserProfile, account?: FirebaseAccount) => {
    const safeProfile = sanitizeProfile(profile);
    SoundEffects.playSuccess();
    setUserProfile(safeProfile);
    setAccountRole(account?.role || (firebaseEnabled ? null : 'operator'));
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(safeProfile));
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  // Reidrata somente uma sessão Firebase já autorizada; nunca cria identidade anônima.
  useEffect(() => {
    if (!firebaseEnabled) return;
    let cancelled = false;
    void getCurrentAuthorization()
      .then((account) => {
        if (cancelled || !account) return;
        setAccountRole(account.role);
        setUserProfile((previous) => sanitizeProfile({
          ...previous,
          id: account.uid,
          email: account.email || previous.email,
          institutionId: account.institutionId,
        }));
        setIsLoggedIn(true);
      })
      .catch((error) => safeLog('error', 'firebase_authorization_rehydrate_failed', { message: error instanceof Error ? error.message : 'unknown_error' }));
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Modo da Interface (App do Usuário vs Painel da Segurança)
  const [activeTab, setActiveTab] = useState<'user' | 'security'>('user');

  // 3. Campus Ativo (Selecionável pelo usuário entre os 5 Campi da UFPB)
  const [selectedCampusId, setSelectedCampusId] = useState<UfpbCampusId>(() => {
    const saved = readStorageWithLegacy(STORAGE_KEYS.campus, 'guardiao_ufpb_campus');
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
    const saved = readStorageWithLegacy(STORAGE_KEYS.alerts, 'guardiao_ufpb_alerts');
    return purgeExpiredLocalAlerts(parseStoredJson(saved, INITIAL_ALERTS));
  });

  // Quando o Firebase estiver configurado, esta coleção passa a ser a fonte
  // compartilhada entre o Android e o painel. Sem configuração, o modo demo
  // local permanece disponível para apresentações seguras.
  useEffect(() => {
    if (!firebaseEnabled || !isLoggedIn || !accountRole || !userProfile.institutionId) return;
    let unsubscribe = () => undefined;
    void subscribeToAlerts(
      userProfile.institutionId,
      accountRole,
      setAlerts,
      (error) => safeLog('error', 'alerts_subscription_failed', { message: error instanceof Error ? error.message : 'unknown_error' }),
    )
      .then((stop) => { unsubscribe = stop; })
      .catch((error) => safeLog('warn', 'alerts_subscription_unauthorized', { message: error instanceof Error ? error.message : 'unknown_error' }));
    return () => unsubscribe();
  }, [accountRole, isLoggedIn, userProfile.institutionId]);

  const [securityUnits, setSecurityUnits] = useState<SecurityPatrolUnit[]>(INITIAL_SECURITY_UNITS);

  // 6. Configuração de Rastreamento de Localização
  const [trackingConfig, setTrackingConfig] = useState<LocationTrackingConfig>(() => {
    const saved = readStorageWithLegacy(STORAGE_KEYS.tracking, 'guardiao_ufpb_tracking');
    return parseStoredJson(saved, DEFAULT_TRACKING_CONFIG);
  });

  // Salvar no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    // Não persiste fotografias base64 no navegador. A captura fica apenas em
    // memória durante a demonstração ou é armazenada no Firebase Storage.
    const retainedAlerts = purgeExpiredLocalAlerts(alerts);
    if (retainedAlerts.length !== alerts.length) {
      setAlerts(retainedAlerts);
    }
    const alertsWithoutEmbeddedPhotos = retainedAlerts.map(({ photoSnapshot: _photo, ...alert }) => alert);
    localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alertsWithoutEmbeddedPhotos));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(trackingConfig));
  }, [trackingConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.campus, selectedCampusId);
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
    (a) => a.institutionId === userProfile.institutionId
      && a.userId === userProfile.id
      && a.status !== 'resolvido'
      && a.status !== 'cancelado_usuario'
  ) || null;

  // Handler para Salvar Identificação
  const handleSaveProfile = (profile: UserProfile, grantLocation: boolean) => {
    SoundEffects.playClick();
    const safeProfile = sanitizeProfile({
      ...profile,
      institutionId: userProfile.institutionId || DEFAULT_INSTITUTION_ID,
    });
    setUserProfile(safeProfile);
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
    const safeProfile = sanitizeProfile({
      ...newAlert.userProfile,
      institutionId: userProfile.institutionId || DEFAULT_INSTITUTION_ID,
    });
    const safeAlert: EmergencyAlert = {
      ...newAlert,
      institutionId: userProfile.institutionId || DEFAULT_INSTITUTION_ID,
      userProfile: safeProfile,
      receiptStatus: 'aguardando_central',
    };
    setAlerts((prev) => [safeAlert, ...prev]);
    void publishAlert(safeAlert).catch((error) => {
      safeLog('error', 'alert_remote_publish_failed', { message: error instanceof Error ? error.message : 'unknown_error' });
    });
  };

  // Handler para Cancelamento de Alerta pelo Usuário
  const handleCancelAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId
        ? { ...a, status: 'cancelado_usuario', updatedAt: new Date().toISOString() }
        : a))
    );
    void cancelAlert(alertId).catch((error) => {
      safeLog('error', 'alert_cancel_failed', { message: error instanceof Error ? error.message : 'unknown_error' });
    });
  };

  const canTriggerAlert = () => checkAlertAllowance(alerts, userProfile.id);

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

    const selectedUnit = unitId ? securityUnits.find((unit) => unit.id === unitId) : undefined;
    void changeAlertStatus(
      alertId,
      status,
      unitId,
      selectedUnit ? `${selectedUnit.name} (${selectedUnit.code})` : undefined,
      note,
    ).catch((error) => {
      safeLog('error', 'alert_status_update_failed', { message: error instanceof Error ? error.message : 'unknown_error' });
    });
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
      institutionId: DEFAULT_INSTITUTION_ID,
      protocolNumber: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      campusId: campusId,
      campusName: campus.name,
      userId: `user_sim_${Date.now()}`,
      userProfile: {
        id: `user_sim_${Date.now()}`,
        institutionId: DEFAULT_INSTITUTION_ID,
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
      receiptStatus: 'aguardando_central',
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
    void publishAlert(simAlert).catch((error) => {
      safeLog('error', 'simulated_alert_publish_failed', { message: error instanceof Error ? error.message : 'unknown_error' });
    });
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
                  Uni<span className="text-[#003d71]">Guard</span>
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

            {accountRole === 'operator' && (
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
            )}
          </div>

          {/* Indicador Visual do Status GPS / Rede (Bolinha Verde / Amarela / Vermelha no topo) */}
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <div
                title="Modo Offline: Sem conexão à internet. Dados retidos no aparelho."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-pulse"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="hidden sm:inline">Offline</span>
              </div>
            ) : userSignalLost ? (
              <div
                title="GPS Instável: Última coordenada fixada até retomada do sinal de satélite."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="hidden sm:inline">GPS Instável</span>
              </div>
            ) : (
              <div
                title="GPS & Conexão de Rede operando normalmente em tempo real."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
              >
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                <span className="hidden sm:inline">Sinal OK</span>
              </div>
            )}

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
              title="Sobre o projeto UniGuard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Info className="w-4 h-4 text-[#003d71]" />
              <span className="hidden md:inline">Sobre</span>
            </button>

            {/* Botão de Login / Deslogar no Header */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <button
                  onClick={handleLogout}
                  title="Encerrar sessão no UniGuard"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden md:inline">Deslogar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#003d71] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#002d54] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Faixa Superior de Aviso se estiver Offline */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-bold flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Atenção: Modo Offline ativado. Sem conexão com a internet. O histórico e fotos de emergência serão retidos localmente.</span>
        </div>
      )}

      {/* 2. CONTEÚDO PRINCIPAL (CONDICIONAL POR ABA) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <Suspense fallback={
          <div className="min-h-[45vh] flex items-center justify-center text-sm font-semibold text-slate-500">
            Carregando módulo do UniGuard...
          </div>
        }>
          {activeTab === 'security' && accountRole === 'operator' ? (
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
          ) : (
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
            canTriggerAlert={canTriggerAlert}
            onEditProfile={() => setIsIdentityModalOpen(true)}
            breadcrumbs={breadcrumbs}
            setBreadcrumbs={setBreadcrumbs}
            trackingConfig={trackingConfig}
            setTrackingConfig={setTrackingConfig}
            selectedCampusId={selectedCampusId}
            onSelectCampus={handleSelectCampus}
            onLogout={handleLogout}
            isOffline={!isOnline}
          />
          )}
        </Suspense>
      </main>

      {/* 3. MODAIS */}
      <AuthModal
        isOpen={!isLoggedIn || isAuthModalOpen}
        onClose={isLoggedIn ? () => setIsAuthModalOpen(false) : undefined}
        onLoginSuccess={handleLoginSuccess}
        currentProfile={userProfile}
        authenticate={firebaseEnabled ? authenticateAccount : undefined}
         register={firebaseEnabled ? registerUserAccount : undefined}
         sendPasswordReset={firebaseEnabled ? requestPasswordReset : undefined}
      />

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
