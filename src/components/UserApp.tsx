import React, { useState, useEffect, useRef } from 'react';
import {
  EmergencyAlert,
  EmergencyCategory,
  GeoCoordinate,
  UserProfile,
  BreadcrumbPoint,
  SafeZone,
  LocationTrackingConfig,
  EmergencyContact,
  SmsNotification,
} from '../types';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, EMERGENCY_PHONES, DEFAULT_TRACKING_CONFIG } from '../data/ufpbData';
import { findNearestCampusLocation, formatDistance, generateProtocolNumber, checkPointInSafeZone } from '../utils/geo';
import { SoundEffects } from '../utils/audio';
import { CampusMap } from './CampusMap';
import { EmergencyContactsModal } from './EmergencyContactsModal';
import {
  AlertTriangle,
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  ShieldCheck,
  User,
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Edit3,
  PhoneCall,
  Clock,
  Sparkles,
  ShieldAlert,
  Users,
  MessageSquare,
  Route,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserAppProps {
  userProfile: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  userCoordinate: GeoCoordinate;
  setUserCoordinate: React.Dispatch<React.SetStateAction<GeoCoordinate>>;
  userSignalLost: boolean;
  setUserSignalLost: React.Dispatch<React.SetStateAction<boolean>>;
  lastKnownCoordinate: GeoCoordinate | null;
  setLastKnownCoordinate: React.Dispatch<React.SetStateAction<GeoCoordinate | null>>;
  lastSignalTimestamp: string;
  setLastSignalTimestamp: React.Dispatch<React.SetStateAction<string>>;
  isInsideCampus: boolean;
  userActiveAlert: EmergencyAlert | null;
  onSendAlert: (alert: EmergencyAlert) => void;
  onCancelAlert: (alertId: string) => void;
  onEditProfile: () => void;
  breadcrumbs: BreadcrumbPoint[];
  setBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbPoint[]>>;
  trackingConfig?: LocationTrackingConfig;
  setTrackingConfig?: React.Dispatch<React.SetStateAction<LocationTrackingConfig>>;
  safeZones?: SafeZone[];
}

const CATEGORIES: { id: EmergencyCategory; label: string; icon: string; desc: string }[] = [
  { id: 'urgencia_geral', label: 'Urgência Geral', icon: '🆘', desc: 'Necessidade de apoio imediato' },
  { id: 'violencia_ameaca', label: 'Violência ou Ameaça', icon: '🚨', desc: 'Agressão, coação ou risco físico' },
  { id: 'perseguicao_suspeito', label: 'Perseguição / Suspeito', icon: '🏃', desc: 'Pessoa seguindo ou atitude suspeita' },
  { id: 'saude_desmaio', label: 'Saúde ou Desmaio', icon: '🩺', desc: 'Mal súbito, convulsão ou crise' },
  { id: 'acidente_queda', label: 'Acidente ou Queda', icon: '⚠️', desc: 'Lesão física ou atropelamento' },
  { id: 'area_escura_risco', label: 'Área Escura / Risco', icon: '💡', desc: 'Local ermo ou sem iluminação' },
  { id: 'furto_roubo', label: 'Furto ou Roubo', icon: '📦', desc: 'Subtração de bens ou assalto' },
];

export const UserApp: React.FC<UserAppProps> = ({
  userProfile,
  setUserProfile = () => {},
  userCoordinate,
  setUserCoordinate,
  userSignalLost,
  setUserSignalLost,
  lastKnownCoordinate,
  setLastKnownCoordinate,
  lastSignalTimestamp,
  setLastSignalTimestamp,
  isInsideCampus,
  userActiveAlert,
  onSendAlert,
  onCancelAlert,
  onEditProfile,
  breadcrumbs,
  setBreadcrumbs,
  trackingConfig = DEFAULT_TRACKING_CONFIG,
  setTrackingConfig = () => {},
  safeZones = CAMPUS_SAFE_ZONES,
}: UserAppProps) => {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('urgencia_geral');
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  
  // Modais e Configurações
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [showTrackingConfigBox, setShowTrackingConfigBox] = useState(false);
  const [smsFeedbackList, setSmsFeedbackList] = useState<SmsNotification[]>([]);

  // Lógica de Zona Segura (Safe Zone)
  const currentSafeZoneCheck = checkPointInSafeZone(
    userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate,
    safeZones
  );
  const isInSafeZone = currentSafeZoneCheck.inZone;
  const currentSafeZone = currentSafeZoneCheck.zone;

  // Lógica de Pressionar e Segurar (Long Press) para Zonas Seguras
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressIntervalRef = useRef<number | null>(null);

  // Contagem regressiva do SOS normal
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownTimerRef = useRef<number | null>(null);

  // Informação do local mais próximo
  const nearestInfo = findNearestCampusLocation(userCoordinate);

  // Monitorar nível real de bateria se suportado pela API do navegador
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-expect-error - navigator.getBattery experimental
      navigator.getBattery?.().then((battery: { level: number; addEventListener: (event: string, fn: () => void) => void }) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {
        // Fallback standard value
      });
    }
  }, []);

  // Gravação Periódica do Histórico de Localização (Breadcrumbs / Intervalo Configurável)
  useEffect(() => {
    const isEnabled = trackingConfig?.isEnabled ?? true;
    const intervalMinutes = trackingConfig?.intervalMinutes ?? 2;
    if (!isEnabled) return;

    const intervalMs = Math.max(intervalMinutes, 0.5) * 60 * 1000;
    const trackingTimer = window.setInterval(() => {
      const activePos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;
      const zoneCheck = checkPointInSafeZone(activePos, safeZones);
      const nearest = findNearestCampusLocation(activePos);

      const newPoint: BreadcrumbPoint = {
        coordinate: { ...activePos },
        timestamp: new Date().toISOString(),
        locationName: nearest.distance < 80 ? nearest.location.name : `${nearest.location.name} (${formatDistance(nearest.distance)})`,
        batteryLevel: batteryLevel,
        isInSafeZone: zoneCheck.inZone,
        safeZoneName: zoneCheck.zone ? zoneCheck.zone.name : undefined,
      };

      setBreadcrumbs((prev) => [...prev.slice(-30), newPoint]);
      setTrackingConfig?.((prev) => ({ ...prev, lastRecordedAt: new Date().toISOString() }));
    }, intervalMs);

    return () => clearInterval(trackingTimer);
  }, [trackingConfig?.isEnabled, trackingConfig?.intervalMinutes, userCoordinate, userSignalLost, lastKnownCoordinate, batteryLevel, safeZones, setBreadcrumbs, setTrackingConfig]);

  // Iniciar SOS Normal
  const handleStartSos = () => {
    if (isInSafeZone) {
      // Em Zona Segura, o usuário precisa segurar o botão por 2.5 segundos
      return;
    }
    SoundEffects.playClick();
    setIsCountingDown(true);
    setCountdown(3);
    SoundEffects.playCountdown();

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsCountingDown(false);
          triggerActualAlert();
          return 0;
        }
        SoundEffects.playCountdown();
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsCountingDown(false);
    setCountdown(3);
    SoundEffects.playClick();
  };

  // Manipulação de Pressionar e Segurar (Long Press) para Zonas Seguras
  const startLongPress = () => {
    if (!isInSafeZone) return;
    setIsPressing(true);
    setLongPressProgress(0);
    SoundEffects.playClick();

    const startTime = Date.now();
    const duration = 2200; // 2.2 segundos de pressão contínua necessária

    longPressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setLongPressProgress(progress);

      if (progress >= 100) {
        if (longPressIntervalRef.current) clearInterval(longPressIntervalRef.current);
        setIsPressing(false);
        setLongPressProgress(0);
        triggerActualAlert();
      }
    }, 50);
  };

  const cancelLongPress = () => {
    if (!isInSafeZone) return;
    if (longPressIntervalRef.current) {
      clearInterval(longPressIntervalRef.current);
      longPressIntervalRef.current = null;
    }
    setIsPressing(false);
    setLongPressProgress(0);
  };

  // Disparo efetivo do Alerta SOS
  const triggerActualAlert = () => {
    SoundEffects.playSosTriggered();
    
    // Efeito visual de confirmação
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#f59e0b', '#ffffff'],
      });
    } catch {
      // Ignore
    }

    const currentPos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;
    const locInfo = findNearestCampusLocation(currentPos);
    const safeCheck = checkPointInSafeZone(currentPos, safeZones);

    // Gerar notificações SMS aos contatos cadastrados
    const smsNotifications: SmsNotification[] = [];
    const contactsToNotify = userProfile.emergencyContacts?.filter((c) => c.isNotifySms) || [];

    if (contactsToNotify.length > 0) {
      contactsToNotify.forEach((contact) => {
        smsNotifications.push({
          id: `sms_${Date.now()}_${contact.id}`,
          contactName: contact.name,
          contactPhone: contact.phone,
          message: `GUARDIÃO UFPB: Alerta SOS acionado por ${userProfile.name} em ${locInfo.location.name} (Lat: ${currentPos.lat.toFixed(5)}, Lng: ${currentPos.lng.toFixed(5)}). Central de Segurança UFPB já acionada.`,
          sentAt: new Date().toISOString(),
          status: 'entregue',
        });
      });
      setSmsFeedbackList(smsNotifications);
    }

    const newAlert: EmergencyAlert = {
      id: `alert_${Date.now()}`,
      protocolNumber: generateProtocolNumber(),
      userId: userProfile.id,
      userProfile: userProfile,
      category: selectedCategory,
      customNote: customNote.trim() ? customNote.trim() : undefined,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: currentPos,
      locationName: locInfo.distance < 80 ? locInfo.location.name : `Próximo a ${locInfo.location.name} (${formatDistance(locInfo.distance)})`,
      isInsideCampus: isInsideCampus,
      isInSafeZone: safeCheck.inZone,
      safeZoneName: safeCheck.zone ? safeCheck.zone.name : undefined,
      signalLost: userSignalLost,
      lastSignalTimestamp: lastSignalTimestamp || new Date().toISOString(),
      batteryLevel: batteryLevel,
      userRouteHistory: [...breadcrumbs],
      smsNotificationsSent: smsNotifications,
      securityNotes: [
        safeCheck.inZone
          ? `Alerta acionado dentro de Zona Segura (${safeCheck.zone?.name}). Vigilância local alertada.`
          : 'Alerta emitido pelo aplicativo móvel. Aguardando triagem da Central UFPB.',
      ],
    };

    onSendAlert(newAlert);
  };

  // Alternar perda de sinal GPS
  const handleToggleSignalLoss = () => {
    SoundEffects.playClick();
    if (!userSignalLost) {
      // Verificar se está em zona segura com supressão automática
      if (isInSafeZone && currentSafeZone?.suppressAutoSignalLossAlert) {
        // Sinal perdido dentro de zona segura
      }
      setUserSignalLost(true);
      setLastKnownCoordinate({ ...userCoordinate });
      setLastSignalTimestamp(new Date().toISOString());
    } else {
      // Sinal restabelecido
      setUserSignalLost(false);
      setLastSignalTimestamp(new Date().toISOString());
    }
  };

  // Mover usuário para um local específico do campus (Simulação)
  const handleTeleport = (locId: string) => {
    SoundEffects.playClick();
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
    if (loc) {
      const newCoord = { ...loc.coordinate, accuracy: 5 };
      setUserCoordinate(newCoord);
      if (!userSignalLost) {
        setLastKnownCoordinate(newCoord);
        setLastSignalTimestamp(new Date().toISOString());
      }
      const zoneCheck = checkPointInSafeZone(newCoord, safeZones);
      setBreadcrumbs((prev) => [
        ...prev.slice(-25),
        {
          coordinate: newCoord,
          timestamp: new Date().toISOString(),
          locationName: loc.name,
          isInSafeZone: zoneCheck.inZone,
          safeZoneName: zoneCheck.zone ? zoneCheck.zone.name : undefined,
        },
      ]);
    }
  };

  // Mover para fora do campus
  const handleMoveOutside = () => {
    SoundEffects.playClick();
    const outsideCoord = { lat: -7.1550, lng: -34.8350, accuracy: 12 };
    setUserCoordinate(outsideCoord);
    if (!userSignalLost) {
      setLastKnownCoordinate(outsideCoord);
      setLastSignalTimestamp(new Date().toISOString());
    }
    setBreadcrumbs((prev) => [
      ...prev.slice(-25),
      { coordinate: outsideCoord, timestamp: new Date().toISOString(), locationName: 'Fora do Campus UFPB', isInSafeZone: false },
    ]);
  };

  // Usar GPS real do navegador
  const handleUseRealGps = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      SoundEffects.playClick();
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const realCoord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setUserCoordinate(realCoord);
          if (!userSignalLost) {
            setLastKnownCoordinate(realCoord);
            setLastSignalTimestamp(new Date().toISOString());
          }
          const zoneCheck = checkPointInSafeZone(realCoord, safeZones);
          setBreadcrumbs((prev) => [
            ...prev.slice(-25),
            {
              coordinate: realCoord,
              timestamp: new Date().toISOString(),
              locationName: 'GPS Real do Dispositivo',
              isInSafeZone: zoneCheck.inZone,
              safeZoneName: zoneCheck.zone ? zoneCheck.zone.name : undefined,
            },
          ]);
        },
        (err) => {
          alert(`Não foi possível obter GPS real: ${err.message}. Mantendo localização simulada no Campus I.`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Salvar contatos de emergência
  const handleSaveEmergencyContacts = (newContacts: EmergencyContact[]) => {
    setUserProfile((prev) => ({
      ...prev,
      emergencyContacts: newContacts,
      emergencyContactName: newContacts.length > 0 ? newContacts[0].name : prev.emergencyContactName,
      emergencyContactPhone: newContacts.length > 0 ? newContacts[0].phone : prev.emergencyContactPhone,
    }));
  };

  return (
    <div className="space-y-5 pb-8 max-w-4xl mx-auto text-slate-800">
      
      {/* 1. Card de Identificação e Vínculo Institucional */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#003d71] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-800">{userProfile.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003d71] border border-blue-100">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Matrícula/ID: <span className="text-slate-700 font-mono font-medium">{userProfile.documentNumber}</span> • {userProfile.department}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                <button
                  onClick={() => setIsContactsModalOpen(true)}
                  className="text-[#003d71] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#003d71]" />
                  <span>Contatos de Emergência ({userProfile.emergencyContacts?.length || 1})</span>
                </button>
                <span>•</span>
                <span className="text-slate-600 font-medium">SMS Automático Ativo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setIsContactsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003d71] text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contatos SMS</span>
            </button>
            <button
              onClick={onEditProfile}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Editar Perfil</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Barra de Status de Geolocalização, Zonas de Segurança e Conectividade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Status de Cobertura / Geofence ou Zona Segura */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
          isInSafeZone
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : isInsideCampus 
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-950' 
              : 'bg-rose-50/80 border-rose-200/80 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isInSafeZone
                ? 'bg-emerald-600 text-white'
                : isInsideCampus ? 'bg-blue-100 text-[#003d71]' : 'bg-rose-100 text-rose-700'
            }`}>
              {isInSafeZone ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-slate-800">
                {isInSafeZone ? 'Zona de Segurança' : isInsideCampus ? 'Dentro da UFPB' : 'Fora do Campus'}
              </div>
              <div className="text-[11px] text-slate-600 font-medium truncate max-w-[150px]">
                {isInSafeZone ? currentSafeZone?.name : isInsideCampus ? 'Campus I UFPB' : 'Área externa à UFPB'}
              </div>
            </div>
          </div>
          {isInSafeZone && (
            <span className="text-[9px] uppercase font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full shrink-0">
              Seguro
            </span>
          )}
        </div>

        {/* Status do Sinal de Localização */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
          userSignalLost
            ? 'bg-amber-50/90 border-amber-200 text-amber-900'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${userSignalLost ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-[#003d71]'}`}>
              {userSignalLost ? <WifiOff className="w-5 h-5 animate-pulse" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">
                {userSignalLost ? 'Sinal Interrompido' : 'GPS em Tempo Real'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {userSignalLost ? 'Último ponto fixado' : `Precisão: ±${userCoordinate.accuracy || 5}m`}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleSignalLoss}
            title={userSignalLost ? 'Restabelecer Sinal' : 'Simular Queda de Sinal'}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer font-bold transition-colors"
          >
            {userSignalLost ? 'Restaurar' : 'Cortar'}
          </button>
        </div>

        {/* Local de Referência e Bateria */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2.5 rounded-xl bg-slate-100 text-[#003d71] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs truncate">
              <div className="font-bold text-slate-800 truncate">
                {nearestInfo.location.name}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                A {formatDistance(nearestInfo.distance)} do ponto
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 shrink-0 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Battery className="w-4 h-4 text-emerald-600" />
            <span>{batteryLevel}%</span>
          </div>
        </div>

      </div>

      {/* BANNER INFORMATIVO SE ESTIVER DENTRO DE UMA ZONA DE SEGURANÇA */}
      {isInSafeZone && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-700 text-white rounded-xl text-lg font-bold shrink-0">
              {currentSafeZone?.icon || '🛡️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                  Você está em uma Zona de Segurança Delimitada
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                  {currentSafeZone?.code}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{currentSafeZone?.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {currentSafeZone?.description} <strong>({currentSafeZone?.activeGuardsCount} vigilantes ativos)</strong>. Para evitar falsos disparos, o acionamento de SOS nesta zona requer <strong>pressão contínua de 2 segundos</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ALERTA DE PERDA DE SINAL / ÚLTIMA LOCALIZAÇÃO CONHECIDA */}
      {userSignalLost && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Acesso à Localização Interrompido
                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md font-mono font-bold">
                  SISTEMA DE SEGURANÇA ATIVO
                </span>
              </h4>
              <p className="text-xs text-amber-800/90 mt-1">
                O sinal de GPS foi interrompido. O sistema registrou automaticamente sua <strong>Última Localização Conhecida</strong> ({lastKnownCoordinate?.lat.toFixed(5)}, {lastKnownCoordinate?.lng.toFixed(5)}) em <strong>{new Date(lastSignalTimestamp).toLocaleTimeString('pt-BR')}</strong> como referência imediata de busca para a equipe de vigilância.
                {isInSafeZone && (
                  <span className="block mt-1 font-semibold text-emerald-800">
                    🛡️ Observação: Você estava na Zona Segura ({currentSafeZone?.name}).
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleSignalLoss}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            Reconectar GPS
          </button>
        </div>
      )}

      {/* FEEDBACK DE SMS ENVIADOS AOS CONTATOS */}
      {smsFeedbackList.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs animate-in fade-in">
          <div className="font-bold text-[#003d71] flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-[#003d71]" />
            <span>Notificações SMS de Emergência Transmitidas ({smsFeedbackList.length}):</span>
          </div>
          <div className="space-y-1.5">
            {smsFeedbackList.map((s) => (
              <div key={s.id} className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{s.contactName} ({s.contactPhone})</div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">{s.message}</div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                  SMS Entregue
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CARD DE ALERTA ATIVO (CASO O USUÁRIO TENHA DISPARADO SOS) */}
      {userActiveAlert && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-red-500 text-slate-800 shadow-xl animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-red-600">
                  Chamado de Emergência Ativo
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Protocolo: {userActiveAlert.protocolNumber}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-bold">
                {userActiveAlert.status === 'pendente' && '⏳ Aguardando Despacho'}
                {userActiveAlert.status === 'em_deslocamento' && '🚔 Equipe em Deslocamento'}
                {userActiveAlert.status === 'no_local' && '🛡️ Segurança no Local'}
                {userActiveAlert.status === 'resolvido' && '✓ Atendimento Concluído'}
              </span>
            </div>
          </div>

          {/* Linha do Tempo do Atendimento */}
          <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Emissão</div>
              <div className="font-bold text-slate-800 mt-0.5">
                {new Date(userActiveAlert.createdAt).toLocaleTimeString('pt-BR')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Categoria</div>
              <div className="font-bold text-red-600 mt-0.5 truncate">
                {CATEGORIES.find((c) => c.id === userActiveAlert.category)?.label || userActiveAlert.category}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Referência</div>
              <div className="font-bold text-slate-800 mt-0.5 truncate">
                {userActiveAlert.locationName}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Unidade</div>
              <div className="font-bold text-emerald-700 mt-0.5 truncate">
                {userActiveAlert.assignedUnitName || 'Central UFPB'}
              </div>
            </div>
          </div>

          {userActiveAlert.isInSafeZone && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              <span>Ocorrência em Zona Segura ({userActiveAlert.safeZoneName || 'Campus'}). Prioridade de vigilância local.</span>
            </div>
          )}

          {userActiveAlert.customNote && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic mb-4">
              "Observação enviada: {userActiveAlert.customNote}"
            </div>
          )}

          {userActiveAlert.securityNotes && userActiveAlert.securityNotes.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 mb-4 space-y-1">
              <div className="font-bold text-red-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Mensagem da Vigilância:
              </div>
              {userActiveAlert.securityNotes.map((note, idx) => (
                <div key={idx} className="text-slate-700 text-[11px]">• {note}</div>
              ))}
            </div>
          )}

          {/* Botão Cancelar / Estou Seguro */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-500">
              Mantenha a calma. A equipe de segurança da UFPB está acompanhando suas coordenadas em tempo real.
            </p>
            <button
              onClick={() => {
                SoundEffects.playResolved();
                onCancelAlert(userActiveAlert.id);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Estou Seguro / Cancelar Alerta</span>
            </button>
          </div>

        </div>
      )}

      {/* 5. ÁREA PRINCIPAL: BOTÃO SOS DE EMERGÊNCIA - SLEEK INTERFACE */}
      {!userActiveAlert && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
          
          {/* Subtle Radar Background Overlay */}
          <div className="absolute inset-0 bg-[#f8fafc]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.6 }} />

          {/* Título & Instrução */}
          <div className="relative z-10 max-w-md mx-auto mb-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Botão de Emergência SOS
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isInSafeZone
                ? `Você está em ${currentSafeZone?.name}. Segure o botão pressionado para confirmar o envio.`
                : 'Toque no botão abaixo para transmitir sua localização em tempo real à equipe de segurança da UFPB.'}
            </p>
          </div>

          {/* Seletor de Categoria do Incidente */}
          <div className="relative z-10 max-w-xl mx-auto mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tipo de Ocorrência (Opcional)
            </label>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => {
                const isSel = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      SoundEffects.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSel
                        ? 'bg-[#003d71] text-white border-[#003d71] shadow-sm scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÃO SOS GIGANTE TÁTIL */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            
            {isInSafeZone ? (
              /* MODO ZONA SEGURA: PRESSÃO CONTÍNUA EXIGIDA (LONG PRESS) */
              <div className="flex flex-col items-center gap-3">
                <button
                  id="btn-sos-safezone"
                  onMouseDown={startLongPress}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={startLongPress}
                  onTouchEnd={cancelLongPress}
                  className={`group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 shadow-2xl transition-all duration-200 cursor-pointer select-none ${
                    isPressing
                      ? 'bg-amber-600 border-amber-300 scale-105 shadow-amber-600/60'
                      : 'bg-[#003d71] border-blue-200 hover:bg-[#002b50] shadow-blue-900/30'
                  }`}
                >
                  {/* Barra de progresso circular simulada */}
                  {isPressing && (
                    <div
                      className="absolute inset-0 rounded-full border-4 border-amber-300 pointer-events-none animate-ping opacity-50"
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center text-white">
                    <Lock className="w-6 h-6 mb-1 text-amber-300" />
                    <span className="text-3xl sm:text-4xl font-black tracking-wider drop-shadow-sm">
                      {isPressing ? `${longPressProgress}%` : 'SOS SEGURO'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 mt-1">
                      {isPressing ? 'Mantenha Pressionado' : 'Segure 2s para Ativar'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 text-[9px] text-amber-200 font-medium">
                    Zona Segura Delimitada
                  </div>
                </button>

                {isPressing && (
                  <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-75"
                      style={{ width: `${longPressProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : isCountingDown ? (
              /* Modo Contagem Regressiva de Segurança */
              <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-150">
                <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-red-600 border-4 border-amber-300 shadow-2xl shadow-red-500/50 animate-pulse">
                  <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                    {countdown}
                  </span>
                  <div className="absolute -bottom-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow">
                    Enviando Alerta...
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleCancelCountdown}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Cancelar Envio
                  </button>
                  <button
                    onClick={() => {
                      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                      setIsCountingDown(false);
                      triggerActualAlert();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Enviar Imediatamente
                  </button>
                </div>
              </div>
            ) : (
              /* Botão SOS Normal - Sleek Interface Style */
              <button
                id="btn-sos-trigger"
                onClick={handleStartSos}
                className="group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-red-600 hover:bg-red-700 border-4 border-red-300/40 shadow-2xl shadow-red-500/40 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                {/* Efeito Radar Pulso */}
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl sm:text-5xl font-black tracking-wider drop-shadow-sm">
                    SOS
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-100 mt-1">
                    Acionar Ajuda
                  </span>
                </div>

                {/* Sub-rótulo flutuante */}
                <div className="absolute bottom-3 text-[9px] text-red-200 font-medium tracking-tight">
                  Toque para enviar
                </div>
              </button>
            )}

          </div>

          {/* Nota Opcional do Usuário */}
          <div className="relative z-10 max-w-md mx-auto mt-2 text-xs">
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className="text-slate-500 hover:text-slate-800 underline text-xs transition-colors cursor-pointer font-medium"
              >
                + Adicionar detalhe do local ou situação
              </button>
            ) : (
              <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700">
                  Descreva brevemente sua localização exata ou ocorrência:
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ex: Estou no Bloco C do CCHLA, próximo à lanchonete"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. MAPA DO CAMPUS INTERATIVO COM ROTA, ZONAS SEGURAS E RASTREAMENTO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#003d71]" />
              Mapa do Campus I da UFPB
            </h4>
            <span className="text-slate-500 text-[11px] font-medium">
              Geolocalização, Zonas de Segurança Delimitadas e Rastro Histórico
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrackingConfigBox(!showTrackingConfigBox)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Route className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Configurar Rastreamento ({trackingConfig?.intervalMinutes ?? 2} min)</span>
            </button>
          </div>
        </div>

        {/* Painel expansível de configuração do histórico de localização */}
        {showTrackingConfigBox && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#003d71]" />
                Intervalo de Gravação do Histórico de Localização
              </span>
              <span className="text-slate-500 text-[11px]">
                Pontos gravados na sessão: {breadcrumbs.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5 font-semibold">
                  Gravar localização a cada:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTrackingConfig?.((prev) => ({ ...prev, intervalMinutes: mins }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        (trackingConfig?.intervalMinutes ?? 2) === mins
                          ? 'bg-[#003d71] text-white border-[#003d71]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={trackingConfig?.isEnabled ?? true}
                    onChange={(e) => setTrackingConfig?.((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                    className="rounded text-[#003d71] focus:ring-[#003d71] cursor-pointer"
                  />
                  <span>Rastreamento em segundo plano ativo</span>
                </label>

                <button
                  onClick={() => setBreadcrumbs([])}
                  className="text-red-600 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Limpar Rastro
                </button>
              </div>
            </div>
          </div>
        )}

        <CampusMap
          userCoordinate={userCoordinate}
          userSignalLost={userSignalLost}
          lastKnownCoordinate={lastKnownCoordinate}
          activeAlerts={userActiveAlert ? [userActiveAlert] : []}
          securityUnits={[]}
          breadcrumbs={breadcrumbs}
          safeZones={safeZones}
          showSafeZones={true}
          showBreadcrumbs={true}
          heightClass="h-[380px]"
          isInsideCampus={isInsideCampus}
        />
      </div>

      {/* 7. SIMULADOR DE DESLOCAMENTO NO CAMPUS (Para testes no protótipo) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Simulador de Deslocamento e Zonas Seguras (Protótipo):
          </span>
          <button
            onClick={handleUseRealGps}
            className="text-[11px] text-[#003d71] hover:underline font-semibold cursor-pointer"
          >
            Usar GPS Real do Dispositivo
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CAMPUS_LOCATIONS.filter((l) => l.category !== 'seguranca').slice(0, 7).map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleTeleport(loc.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              📍 Ir para {loc.code}
            </button>
          ))}
          {safeZones.map((sz) => (
            <button
              key={sz.id}
              onClick={() => {
                SoundEffects.playClick();
                setUserCoordinate({ ...sz.center, accuracy: 4 });
                if (!userSignalLost) {
                  setLastKnownCoordinate({ ...sz.center, accuracy: 4 });
                  setLastSignalTimestamp(new Date().toISOString());
                }
                setBreadcrumbs((prev) => [
                  ...prev.slice(-25),
                  { coordinate: sz.center, timestamp: new Date().toISOString(), locationName: sz.name, isInSafeZone: true, safeZoneName: sz.name },
                ]);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{sz.icon}</span>
              <span>Testar {sz.code}</span>
            </button>
          ))}
          <button
            onClick={handleMoveOutside}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            🚫 Sair do Campus
          </button>
        </div>
      </div>

      {/* 8. CONTATOS DE EMERGÊNCIA UNIVERSITÁRIA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-xs">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-600" />
          Telefones Úteis de Emergência
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {EMERGENCY_PHONES.map((phone, idx) => (
            <a
              key={idx}
              href={`tel:${phone.number.replace(/\D/g, '')}`}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#003d71]/40 flex items-center justify-between gap-2 text-slate-700 hover:text-[#003d71] transition-all"
            >
              <div>
                <div className="font-bold text-slate-800 text-xs">{phone.name}</div>
                <div className="text-[11px] text-slate-500 font-medium">{phone.description}</div>
              </div>
              <span className="font-mono font-bold text-red-600 text-xs shrink-0">
                {phone.number}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Modal de Gestão de Contatos de Emergência */}
      <EmergencyContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        contacts={userProfile.emergencyContacts || []}
        onSaveContacts={handleSaveEmergencyContacts}
        onSendTestSms={(c) => {
          const testSms: SmsNotification = {
            id: `sms_test_${Date.now()}`,
            contactName: c.name,
            contactPhone: c.phone,
            message: `[TESTE] GUARDIÃO UFPB: Simulação de alerta SOS para ${c.name}. Usuário: ${userProfile.name}. Local: ${nearestInfo.location.name}.`,
            sentAt: new Date().toISOString(),
            status: 'entregue',
          };
          setSmsFeedbackList((prev) => [testSms, ...prev]);
        }}
      />

    </div>
  );
};

