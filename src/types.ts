export type UserRole = 'estudante' | 'docente' | 'tecnico' | 'terceirizado' | 'visitante';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isNotifySms: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  documentNumber: string; // Matrícula / SIAPE / CPF
  role: UserRole;
  phone: string;
  email: string;
  emergencyContactName: string; // Contato principal para compatibilidade
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContacts?: EmergencyContact[]; // Lista completa de contatos de emergência
  department: string; // ex: Centro de Tecnologia (CT), CCHLA, CCEN, etc.
  medicalNotes?: string;
  registeredAt: string;
  avatarSeed?: string;
}

export interface GeoCoordinate {
  lat: number;
  lng: number;
  accuracy?: number; // em metros
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  category: 'academico' | 'administrativo' | 'seguranca' | 'servico' | 'saude';
  coordinate: GeoCoordinate;
  description: string;
  isCovered: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  code: string;
  description: string;
  center: GeoCoordinate;
  radiusMeters: number; // Raio em metros
  icon: string;
  requiresLongPress: boolean;
  suppressAutoSignalLossAlert: boolean;
  activeGuardsCount: number;
  securityFeatures: string[];
}

export interface LocationTrackingConfig {
  isEnabled: boolean;
  intervalMinutes: number; // Intervalo configurável em minutos (ex: 1, 2, 5, 10, 15)
  lastRecordedAt?: string;
  autoLogRoutes: boolean;
}

export interface SmsNotification {
  id: string;
  contactName: string;
  contactPhone: string;
  message: string;
  sentAt: string;
  status: 'enviado' | 'entregue' | 'falha';
}

export type EmergencyCategory = 
  | 'urgencia_geral'
  | 'violencia_ameaca'
  | 'saude_desmaio'
  | 'perseguicao_suspeito'
  | 'acidente_queda'
  | 'area_escura_risco'
  | 'furto_roubo';

export type AlertStatus = 'pendente' | 'em_deslocamento' | 'no_local' | 'resolvido' | 'cancelado_usuario';

export interface EmergencyAlert {
  id: string;
  protocolNumber: string;
  userId: string;
  userProfile: UserProfile;
  category: EmergencyCategory;
  customNote?: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  
  // Localização e Rastreamento
  location: GeoCoordinate;
  locationName: string;
  isInsideCampus: boolean;
  isInSafeZone?: boolean;
  safeZoneName?: string;
  signalLost: boolean;
  lastSignalTimestamp: string;
  batteryLevel?: number;
  
  // Rota Histórica registrada no momento do acionamento
  userRouteHistory?: BreadcrumbPoint[];
  
  // Notificações SMS aos contatos
  smsNotificationsSent?: SmsNotification[];
  
  // Segurança
  assignedUnitId?: string;
  assignedUnitName?: string;
  securityNotes?: string[];
  resolvedAt?: string;
  responseTimeMinutes?: number;
}

export interface SecurityPatrolUnit {
  id: string;
  name: string;
  code: string;
  type: 'viatura' | 'motopatrulha' | 'ronda_a_pe' | 'posto_fixo';
  status: 'disponivel' | 'em_ocorrencia' | 'indisponivel';
  coordinate: GeoCoordinate;
  sector: string;
  currentAlertId?: string;
  officers: string[];
  contactRadio: string;
}

export interface BreadcrumbPoint {
  coordinate: GeoCoordinate;
  timestamp: string;
  locationName?: string;
  batteryLevel?: number;
  isInSafeZone?: boolean;
  safeZoneName?: string;
}

