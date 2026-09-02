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
  UfpbCampusId,
  EmergencyPhotoSnapshot,
} from '../types';
import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, EMERGENCY_PHONES, DEFAULT_TRACKING_CONFIG, UFPB_CAMPI } from '../data/ufpbData';
import { findNearestCampusLocation, formatDistance, generateProtocolNumber, checkPointInSafeZone, getCampusById } from '../utils/geo';
import { SoundEffects } from '../utils/sound';
import { captureEmergencyPhoto, generateEmergencyEvidenceCanvas } from '../utils/camera';
import { CampusMap } from './CampusMap';
import { EmergencyContactsModal } from './EmergencyContactsModal';
import { CampusSelector } from './CampusSelector';
import { PhotoEvidenceModal } from './PhotoEvidenceModal';
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
  Camera,
  RotateCw,
  Eye,
  Shield,
  Building2,
  LogOut,
  Loader2,
  Compass,
  Footprints,
  Lightbulb,
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
  selectedCampusId?: UfpbCampusId;
  onSelectCampus?: (campusId: UfpbCampusId) => void;
  onLogout?: () => void;
  isOffline?: boolean;
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
  selectedCampusId = 'campus_1_joao_pessoa',
  onSelectCampus = () => {},
  onLogout,
  isOffline = false,
}: UserAppProps) => {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('urgencia_geral');
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  
  // Câmera & Evidência de Foto
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [inspectedPhoto, setInspectedPhoto] = useState<EmergencyPhotoSnapshot | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Modais e Configurações
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [showTrackingConfigBox, setShowTrackingConfigBox] = useState(false);
  const [smsFeedbackList, setSmsFeedbackList] = useState<SmsNotification[]>([]);

  // Estado de Carregamento para Rota Segura (Loading / Spinner)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [safeRoutePolyline, setSafeRoutePolyline] = useState<GeoCoordinate[] | null>(null);
  const [safeRouteTargetName, setSafeRouteTargetName] = useState<string>('');
  const [safeRouteDistance, setSafeRouteDistance] = useState<number>(0);
  const [safeRouteMinutes, setSafeRouteMinutes] = useState<number>(0);

  // Estado de Carregamento para SOS (Loading / Spinner / Progresso)
  const [isTransmittingSos, setIsTransmittingSos] = useState(false);
  const [sosProgressStage, setSosProgressStage] = useState<string>('');
  const [sosProgressPercent, setSosProgressPercent] = useState<number>(0);

  // Campus Atual
  const currentCampus = getCampusById(selectedCampusId);

  // Lógica de Zona Segura (Safe Zone)
  const currentSafeZoneCheck = checkPointInSafeZone(
    userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate,
    safeZones,
    selectedCampusId
  );
  const isInSafeZone = currentSafeZoneCheck.inZone;
  const currentSafeZone = currentSafeZoneCheck.zone;

  // Lógica de Pressionar e Segurar (Long Press) para Zonas Seguras
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const longPressIntervalRef = useRef<number | null>(null);

  // Contagem regressiva normal do SOS
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownTimerRef = useRef<number | null>(null);

  // Ponto de referência mais próximo
  const nearestInfo = findNearestCampusLocation(
    userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate,
    selectedCampusId
  );

  // Simulação de Nível de Bateria Real
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-expect-error - navigator.getBattery experimental API
      navigator.getBattery?.().then((battery: { level: number }) => {
        setBatteryLevel(Math.round(battery.level * 100));
      }).catch(() => {
        setBatteryLevel(85);
      });
    }
  }, []);

  // Iniciar SOS com contagem de 3 segundos
  const handleStartSos = () => {
    SoundEffects.playClick();
    setIsCountingDown(true);
    setCountdown(3);

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

  // Cancelar Contagem Regressiva
  const handleCancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsCountingDown(false);
    setCountdown(3);
    SoundEffects.playClick();
  };

  // Long Press para Zonas Seguras
  const startLongPress = () => {
    if (!isInSafeZone) return;
    setIsPressing(true);
    setLongPressProgress(0);
    SoundEffects.playClick();

    const startTime = Date.now();
    const duration = 2000;

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

  // Cálculo de Rota Segura com Estado de Carregamento Explícito
  const handleGenerateSafeRoute = () => {
    SoundEffects.playClick();
    setIsCalculatingRoute(true);

    const currentPos = userSignalLost && lastKnownCoordinate ? lastKnownCoordinate : userCoordinate;

    // Encontrar a zona segura ou posto do campus mais próximo
    const campusZones = safeZones.filter((sz) => !sz.campusId || sz.campusId === selectedCampusId);
    let targetZone = campusZones[0];
    let minDistance = 999999;

    campusZones.forEach((sz) => {
      const d = Math.hypot(sz.center.lat - currentPos.lat, sz.center.lng - currentPos.lng);
      if (d < minDistance) {
        minDistance = d;
        targetZone = sz;
      }
    });

    // Simular processamento do grafo viário com feedback visual
    setTimeout(() => {
      if (!targetZone) {
        setIsCalculatingRoute(false);
        return;
      }

      // Interpolação de 4 pontos no trajeto para contornar vias
      const latMid1 = currentPos.lat + (targetZone.center.lat - currentPos.lat) * 0.35 + 0.0002;
      const lngMid1 = currentPos.lng + (targetZone.center.lng - currentPos.lng) * 0.35 - 0.0001;
      const latMid2 = currentPos.lat + (targetZone.center.lat - currentPos.lat) * 0.70 - 0.0001;
      const lngMid2 = currentPos.lng + (targetZone.center.lng - currentPos.lng) * 0.70 + 0.0002;

      const polyline: GeoCoordinate[] = [
        currentPos,
        { lat: latMid1, lng: lngMid1 },
        { lat: latMid2, lng: lngMid2 },
        targetZone.center,
      ];

      // Distância aproximada em metros (1 grau ~ 111.000m)
      const approxMeters = Math.round(minDistance * 111000);
      const estMinutes = Math.max(1, Math.round(approxMeters / 75)); // ~75m por minuto a pé

      setSafeRoutePolyline(polyline);
      setSafeRouteTargetName(targetZone.name);
      setSafeRouteDistance(approxMeters);
      setSafeRouteMinutes(estMinutes);
      setIsCalculatingRoute(false);
      SoundEffects.playSuccess();
    }, 850);
  };

  const handleClearSafeRoute = () => {
    SoundEffects.playClick();
    setSafeRoutePolyline(null);
    setSafeRouteTargetName('');
  };

  // Disparo efetivo do Alerta SOS com captura de foto e indicador de carregamento
  const triggerActualAlert = async () => {
    SoundEffects.playSosTriggered();
    setIsCapturing(true);
    setIsTransmittingSos(true);
    setSosProgressStage('📸 Capturando foto instantânea e gerando evidência pericial...');
    setSosProgressPercent(25);

    // Efeito visual de Flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

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
    const locInfo = findNearestCampusLocation(currentPos, selectedCampusId);
    const safeCheck = checkPointInSafeZone(currentPos, safeZones, selectedCampusId);
    const protocol = generateProtocolNumber();

    // Etapa 1: Foto
    let photoSnapshot: EmergencyPhotoSnapshot;
    try {
      photoSnapshot = await captureEmergencyPhoto({
        coordinate: currentPos,
        protocolNumber: protocol,
        facingMode: cameraFacing,
        userName: userProfile.name,
        campusName: currentCampus.shortName,
      });
    } catch {
      photoSnapshot = generateEmergencyEvidenceCanvas({
        coordinate: currentPos,
        protocolNumber: protocol,
        userName: userProfile.name,
        campusName: currentCampus.shortName,
      });
    }

    // Etapa 2: Telemetria
    setSosProgressStage('📍 Empacotando telemetria GPS, bateria e rastro tático...');
    setSosProgressPercent(60);
    await new Promise((r) => setTimeout(r, 400));

    // Etapa 3: Notificação SMS
    setSosProgressStage('📱 Disparando notificações SMS para contatos de emergência...');
    setSosProgressPercent(85);

    const smsNotifications: SmsNotification[] = [];
    const contactsToNotify = userProfile.emergencyContacts?.filter((c) => c.isNotifySms) || [];

    if (contactsToNotify.length > 0) {
      contactsToNotify.forEach((contact) => {
        smsNotifications.push({
          id: `sms_${Date.now()}_${contact.id}`,
          contactName: contact.name,
          contactPhone: contact.phone,
          message: `GUARDIÃO UFPB: Alerta SOS acionado por ${userProfile.name} em ${locInfo.location.name} (${currentCampus.shortName}). Foto instantânea e coordenadas enviadas à Segurança Universitária.`,
          sentAt: new Date().toISOString(),
          status: 'entregue',
        });
      });
      setSmsFeedbackList(smsNotifications);
    }

    // Etapa 4: Conexão com Central
    setSosProgressStage('🚨 Conectando chamado prioritário com a Central de Segurança da UFPB...');
    setSosProgressPercent(100);
    await new Promise((r) => setTimeout(r, 500));

    setIsCapturing(false);
    setIsTransmittingSos(false);

    const newAlert: EmergencyAlert = {
      id: `alert_${Date.now()}`,
      protocolNumber: protocol,
      campusId: selectedCampusId,
      campusName: currentCampus.name,
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
      photoSnapshot: photoSnapshot,
      smsNotificationsSent: smsNotifications,
      securityNotes: [
        `[${new Date().toLocaleTimeString('pt-BR')}] Chamado SOS emitido no ${currentCampus.shortName}. Imagem instantânea transmitida para a equipe de segurança.`,
        safeCheck.inZone
          ? `Alerta dentro de Zona Segura (${safeCheck.zone?.name}). Posto local alertado.`
          : 'Alerta emitido pelo discente. Central em prontidão.',
      ],
    };

    onSendAlert(newAlert);
  };

  // Alternar perda de sinal GPS
  const handleToggleSignalLoss = () => {
    SoundEffects.playClick();
    if (!userSignalLost) {
      setUserSignalLost(true);
      setLastKnownCoordinate({ ...userCoordinate });
      setLastSignalTimestamp(new Date().toISOString());
    } else {
      setUserSignalLost(false);
      setLastSignalTimestamp(new Date().toISOString());
    }
  };

  // Mudar de Campus
  const handleSelectCampus = (newCampusId: UfpbCampusId) => {
    SoundEffects.playClick();
    onSelectCampus(newCampusId);
  };

  // Mover usuário para um local específico do campus (Simulação)
  const handleTeleport = (locId: string) => {
    SoundEffects.playClick();
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
    if (!loc) return;

    setUserCoordinate({ ...loc.coordinate, accuracy: 5 });
    if (!userSignalLost) {
      setLastKnownCoordinate({ ...loc.coordinate, accuracy: 5 });
      setLastSignalTimestamp(new Date().toISOString());
    }

    const zoneCheck = checkPointInSafeZone(loc.coordinate, safeZones, selectedCampusId);

    setBreadcrumbs((prev) => [
      ...prev.slice(-25),
      {
        coordinate: loc.coordinate,
        timestamp: new Date().toISOString(),
        locationName: loc.name,
        isInSafeZone: zoneCheck.inZone,
        safeZoneName: zoneCheck.zone ? zoneCheck.zone.name : undefined,
      },
    ]);
  };

  // Mover para fora do campus
  const handleMoveOutside = () => {
    SoundEffects.playClick();
    const outsideCoord = {
      lat: currentCampus.center.lat + 0.025,
      lng: currentCampus.center.lng + 0.025,
      accuracy: 15,
    };
    setUserCoordinate(outsideCoord);
    if (!userSignalLost) {
      setLastKnownCoordinate(outsideCoord);
      setLastSignalTimestamp(new Date().toISOString());
    }
    setBreadcrumbs((prev) => [
      ...prev.slice(-25),
      { coordinate: outsideCoord, timestamp: new Date().toISOString(), locationName: `Fora do ${currentCampus.shortName}`, isInSafeZone: false },
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
          const zoneCheck = checkPointInSafeZone(realCoord, safeZones, selectedCampusId);
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
          alert(`Não foi possível obter GPS real: ${err.message}. Mantendo localização simulada no ${currentCampus.shortName}.`);
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

  // Alternar Câmera Frontal / Traseira
  const toggleCameraFacing = () => {
    SoundEffects.playClick();
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Locais filtrados do campus atual para o simulador
  const campusLocations = CAMPUS_LOCATIONS.filter((l) => !l.campusId || l.campusId === selectedCampusId);

  return (
    <div className="space-y-5 pb-8 max-w-4xl mx-auto text-slate-800 relative">
      
      {/* Alerta de Modo Offline Detectado pela API do Navegador */}
      {isOffline && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md flex items-start gap-3 animate-in fade-in">
          <div className="p-2 bg-amber-600 rounded-xl shrink-0">
            <WifiOff className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>Modo Offline Ativado (Sem Conexão com a Internet)</span>
              <span className="text-[10px] bg-white/20 uppercase tracking-widest px-2 py-0.5 rounded-full font-black">
                Rede Indisponível
              </span>
            </div>
            <p className="text-amber-100 leading-relaxed font-medium">
              Sua telemetria GPS e registros de emergência serão retidos no armazenamento seguro local. Caso precise de auxílio imediato, utilize o botão de ligação direta abaixo para contatar a Segurança UFPB (153) ou Polícia Militar (190) via linha telefônica.
            </p>
          </div>
        </div>
      )}

      {/* Overlay com Indicador de Carregamento Explícito para Envio do SOS */}
      {isTransmittingSos && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner relative">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Transmitindo SOS de Emergência</h3>
              <p className="text-xs text-slate-500 font-medium">
                Por favor, não feche o aplicativo enquanto conectamos a equipe.
              </p>
            </div>

            {/* Barra de Progresso com Percentual */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{sosProgressPercent}% Concluído</span>
                <span className="text-red-600 font-semibold uppercase tracking-wider text-[10px]">Urgência Máxima</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${sosProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Etapa Específica */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 font-medium flex items-center gap-2.5 text-left">
              <Loader2 className="w-4 h-4 animate-spin text-red-600 shrink-0" />
              <span className="leading-relaxed">{sosProgressStage}</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Protocolo sendo registrado nos servidores do Guardião UFPB
            </div>
          </div>
        </div>
      )}

      {/* Flash de Câmera na Tela ao Acionar SOS */}
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* 1. SELEÇÃO DE CAMPUS DA UFPB (EXPANDINDO O CAMPO DE ATUAÇÃO ALÉM DO CASTELO BRANCO) */}
      <CampusSelector
        selectedCampusId={selectedCampusId}
        onSelectCampus={handleSelectCampus}
      />

      {/* 2. Card de Identificação e Vínculo Institucional */}
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

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
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
            {onLogout && (
              <button
                onClick={onLogout}
                title="Encerrar sessão no Guardião UFPB"
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Deslogar</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Barra de Status de Geolocalização, Zonas de Segurança e Conectividade */}
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
                {isInSafeZone ? 'Zona de Segurança' : isInsideCampus ? currentCampus.shortName : 'Fora do Campus'}
              </div>
              <div className="text-[11px] text-slate-600 font-medium truncate max-w-[150px]">
                {isInSafeZone ? currentSafeZone?.name : isInsideCampus ? currentCampus.city : 'Área externa à UFPB'}
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

      {/* BANNER SE ESTIVER DENTRO DE UMA ZONA DE SEGURANÇA */}
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
                {currentSafeZone?.description} <strong>({currentSafeZone?.activeGuardsCount} vigilantes ativos)</strong>. O acionamento nesta zona requer <strong>pressão contínua de 2 segundos</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA DE PERDA DE SINAL / ÚLTIMA LOCALIZAÇÃO CONHECIDA */}
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
                  ÚLTIMO LOCAL FIXADO
                </span>
              </h4>
              <p className="text-xs text-amber-800/90 mt-1">
                O sinal de GPS foi interrompido. O sistema registrou automaticamente sua <strong>Última Localização Conhecida</strong> ({lastKnownCoordinate?.lat.toFixed(5)}, {lastKnownCoordinate?.lng.toFixed(5)}) em <strong>{new Date(lastSignalTimestamp).toLocaleTimeString('pt-BR')}</strong> junto ao {currentCampus.shortName} como referência imediata de resgate.
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
        <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-red-500 text-slate-800 shadow-xl animate-in fade-in space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-red-600 flex items-center gap-1.5">
                  <span>Chamado de Emergência Ativo</span>
                  <span className="text-slate-400">•</span>
                  <span>{userActiveAlert.campusName || currentCampus.shortName}</span>
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

          {/* EVIDÊNCIA FOTOGRÁFICA ENVIADA COM O SOS */}
          {userActiveAlert.photoSnapshot && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => {
                    setInspectedPhoto(userActiveAlert.photoSnapshot || null);
                    setIsPhotoModalOpen(true);
                  }}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0 cursor-pointer group shadow"
                >
                  <img
                    src={userActiveAlert.photoSnapshot.dataUrl}
                    alt="Foto momento do SOS"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
                    <Camera className="w-3.5 h-3.5" />
                    <span>FOTO ENVIADA À EQUIPE DE SEGURANÇA</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Imagem registrada no momento do acionamento
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    A Central de Segurança já recebeu esta imagem juntamente com o seu último local conhecido para despacho tático.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectedPhoto(userActiveAlert.photoSnapshot || null);
                  setIsPhotoModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ampliar Imagem</span>
              </button>
            </div>
          )}

          {/* Linha do Tempo do Atendimento */}
          <div className="py-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
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

          {userActiveAlert.customNote && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
              "Observação enviada: {userActiveAlert.customNote}"
            </div>
          )}

          {userActiveAlert.securityNotes && userActiveAlert.securityNotes.length > 0 && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
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
              A equipe de segurança da UFPB está com suas coordenadas e foto em mãos.
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

      {/* 5. ÁREA PRINCIPAL: BOTÃO SOS DE EMERGÊNCIA */}
      {!userActiveAlert && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
          
          <div className="absolute inset-0 bg-[#f8fafc]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.6 }} />

          {/* Título & Instrução */}
          <div className="relative z-10 max-w-md mx-auto mb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Botão de Emergência SOS
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isInSafeZone
                ? `Você está em ${currentSafeZone?.name} (${currentCampus.shortName}). Segure o botão para confirmar o envio.`
                : `Acione o botão para transmitir imediatamente sua foto e localização ao vivo para a equipe de segurança do ${currentCampus.shortName}.`}
            </p>
          </div>

          {/* INDICADOR DE AUTORIZAÇÃO DA CÂMERA */}
          <div className="relative z-10 max-w-md mx-auto mb-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2 text-left">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#003d71] flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-slate-800">
                  Foto Autorizada com SOS
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Captura instantânea via câmera {cameraFacing === 'user' ? 'Frontal' : 'Traseira'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleCameraFacing}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#003d71] text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
              title="Alternar entre câmera frontal e traseira"
            >
              <RotateCw className="w-3 h-3 text-[#003d71]" />
              <span>{cameraFacing === 'user' ? 'Frontal' : 'Traseira'}</span>
            </button>
          </div>

          {/* Seletor de Categoria do Incidente */}
          <div className="relative z-10 max-w-xl mx-auto mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tipo de Ocorrência
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
              /* MODO ZONA SEGURA */
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
                  {isPressing && (
                    <div className="absolute inset-0 rounded-full border-4 border-amber-300 pointer-events-none animate-ping opacity-50" />
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
                    📸 Foto + Localização
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
              /* Modo Contagem Regressiva */
              <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-150">
                <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-red-600 border-4 border-amber-300 shadow-2xl shadow-red-500/50 animate-pulse">
                  <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                    {countdown}
                  </span>
                  <div className="absolute -bottom-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow">
                    📸 Capturando Foto & Local...
                  </div>
                </div>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleCancelCountdown}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                      setIsCountingDown(false);
                      triggerActualAlert();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Disparar Agora
                  </button>
                </div>
              </div>
            ) : (
              /* Botão SOS Normal */
              <button
                id="btn-sos-trigger"
                onClick={handleStartSos}
                disabled={isCapturing}
                className="group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-red-600 hover:bg-red-700 border-4 border-red-300/40 shadow-2xl shadow-red-500/40 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl sm:text-5xl font-black tracking-wider drop-shadow-sm">
                    SOS
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-100 mt-1">
                    Acionar Ajuda
                  </span>
                </div>

                <div className="absolute bottom-3 text-[9px] text-red-200 font-medium tracking-tight flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Foto + Localização</span>
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
                  placeholder="Ex: Estou no bloco central, próximo à lanchonete"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
                />
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. MAPA DO CAMPUS INTERATIVO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#003d71]" />
              Mapa de Monitoramento • {currentCampus.name}
            </h4>
            <span className="text-slate-500 text-[11px] font-medium">
              Geolocalização tática, Zonas Seguras e rastro de deslocamento
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Traçar Rota Segura */}
            {!safeRoutePolyline ? (
              <button
                onClick={handleGenerateSafeRoute}
                disabled={isCalculatingRoute}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                {isCalculatingRoute ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculando Rota...</span>
                  </>
                ) : (
                  <>
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Traçar Rota Segura</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleClearSafeRoute}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>✕ Limpar Rota</span>
              </button>
            )}

            <button
              onClick={() => setShowTrackingConfigBox(!showTrackingConfigBox)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Route className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Configurar Rastreamento ({trackingConfig?.intervalMinutes ?? 2} min)</span>
            </button>
          </div>
        </div>

        {/* Indicador de Carregamento Explícito para Geração de Rota (Spinner + Barra de Progresso) */}
        {isCalculatingRoute && (
          <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[#003d71] font-bold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#003d71]" />
                Calculando Rota Segura Monitorada...
              </span>
              <span className="text-[11px] bg-blue-100 text-[#003d71] px-2 py-0.5 rounded-md font-mono font-bold">
                Mapeando Grafo
              </span>
            </div>
            <div className="w-full bg-blue-200/70 rounded-full h-2 overflow-hidden">
              <div className="bg-[#003d71] h-2 rounded-full w-full animate-pulse"></div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Cruzando vias com iluminação LED reforçada, câmeras ativas da UFPB e proximidade de guaritas de vigilância armada no {currentCampus.shortName}...
            </p>
          </div>
        )}

        {/* Resumo da Rota Segura Ativa no Mapa */}
        {safeRoutePolyline && !isCalculatingRoute && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                  <span>Rota Segura Ativa: {safeRouteTargetName}</span>
                  <span className="text-[9px] uppercase font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    100% Monitorada
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5 flex items-center gap-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5" />
                    Distância: ~{safeRouteDistance} metros
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Tempo a pé: ~{safeRouteMinutes} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Vias Iluminadas
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearSafeRoute}
              className="text-emerald-800 hover:text-emerald-950 underline font-bold text-[11px] cursor-pointer self-end sm:self-center shrink-0"
            >
              Concluir Rota
            </button>
          </div>
        )}

        {/* Painel expansível de configuração */}
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
          selectedCampusId={selectedCampusId}
          safeRoutePolyline={safeRoutePolyline}
          safeRouteDestinationName={safeRouteTargetName}
        />
      </div>

      {/* 7. SIMULADOR DE DESLOCAMENTO NO CAMPUS ATUAL (Protótipo) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Simulador de Posição no {currentCampus.shortName}:
          </span>
          <button
            onClick={handleUseRealGps}
            className="text-[11px] text-[#003d71] hover:underline font-semibold cursor-pointer"
          >
            Usar GPS Real do Dispositivo
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {campusLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleTeleport(loc.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              📍 {loc.code}
            </button>
          ))}

          {safeZones
            .filter((sz) => !sz.campusId || sz.campusId === selectedCampusId)
            .map((sz) => (
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
            🚫 Fora do Campus
          </button>
        </div>
      </div>

      {/* 8. CONTATOS DE EMERGÊNCIA UNIVERSITÁRIA DO CAMPUS ATUAL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-600" />
            Telefones de Emergência • {currentCampus.name}
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Rádio Vigilância: {currentCampus.emergencyRadioChannel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Posto do Campus Atual */}
          <a
            href={`tel:${currentCampus.securityPostPhone.replace(/\D/g, '')}`}
            className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 hover:border-[#003d71] flex items-center justify-between gap-2 text-slate-800 transition-all shadow-xs"
          >
            <div>
              <div className="font-extrabold text-[#003d71] text-xs">Guarita Central ({currentCampus.shortName})</div>
              <div className="text-[11px] text-slate-600 font-medium">Posto de Segurança Local</div>
            </div>
            <span className="font-mono font-extrabold text-[#003d71] text-xs shrink-0">
              {currentCampus.securityPostPhone}
            </span>
          </a>

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
            message: `[TESTE] GUARDIÃO UFPB: Simulação de alerta SOS para ${c.name}. Usuário: ${userProfile.name}. Campus: ${currentCampus.shortName}. Local: ${nearestInfo.location.name}.`,
            sentAt: new Date().toISOString(),
            status: 'entregue',
          };
          setSmsFeedbackList((prev) => [testSms, ...prev]);
        }}
      />

      {/* Modal de Exibição da Foto de Evidência */}
      {inspectedPhoto && (
        <PhotoEvidenceModal
          isOpen={isPhotoModalOpen}
          onClose={() => {
            setIsPhotoModalOpen(false);
            setInspectedPhoto(null);
          }}
          photoSnapshot={inspectedPhoto}
          victimName={userActiveAlert?.userProfile.name || userProfile.name}
          protocolNumber={userActiveAlert?.protocolNumber}
          locationName={userActiveAlert?.locationName}
        />
      )}

    </div>
  );
};
