export type UserRole = 'estudante' | 'docente' | 'tecnico' | 'terceirizado' | 'visitante';

export type AccessRole = 'user' | 'operator';

export type AlertReceiptStatus = 'aguardando_central' | 'recebido_pela_central';

export type AuditEventType =
  | 'alert_created'
  | 'alert_received'
  | 'alert_viewed'
  | 'alert_status_changed'
  | 'alert_cancelled_by_user'
  | 'evidence_uploaded';

export type UfpbCampusId = 
  | 'campus_1_joao_pessoa'
  | 'campus_2_areia'
  | 'campus_3_bananeiras'
  | 'campus_4_litoral_norte'
  | 'campus_5_mangabeira';

export interface UfpbCampusInfo {
  id: UfpbCampusId;
  name: string;
  shortName: string;
  code: string;
  city: string;
  center: GeoCoordinate;
  bounds?: [number, number][];
  radiusMeters: number;
  zoom: number;
  description: string;
  securityPostPhone: string;
  emergencyRadioChannel: string;
}

export interface EmergencyPhotoSnapshot {
  dataUrl: string; // Base64 data URL da foto capturada
  capturedAt: string;
  source: 'camera_frontal' | 'camera_traseira' | 'camera_automatica' | 'simulacao_evidencia';
  deviceInfo?: string;
  latitude?: number;
  longitude?: number;
  protocolNumber?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isNotifySms: boolean;
}

export interface UserProfile {
  id: string;
  /** Instituição autorizadora do perfil; nunca deve ser confiada ao cliente sem validar a membership. */
  institutionId?: string;
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
  registeredAt: string;
  avatarSeed?: string;
  preferredCampusId?: UfpbCampusId;
}

/**
 * Perfil mínimo persistido junto ao alerta.
 * Campos de contato/identificação são opcionais porque o backend confiável
 * aplica minimização de dados e pode gravar apenas o necessário à operação.
 */
export interface AlertUserProfile {
  id: string;
  institutionId?: string;
  name: string;
  role: UserRole;
  registeredAt: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContacts?: EmergencyContact[];
  department?: string;
  avatarSeed?: string;
  preferredCampusId?: UfpbCampusId;
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
  campusId?: UfpbCampusId;
  name: string;
  code: string;
  category: 'academico' | 'administrativo' | 'seguranca' | 'servico' | 'saude';
  coordinate: GeoCoordinate;
  description: string;
  isCovered: boolean;
}

export interface SafeZone {
  id: string;
  campusId?: UfpbCampusId;
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
  status: 'simulado' | 'enviado' | 'entregue' | 'falha';
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

export interface FirestoreTimestampLike {
  seconds: number;
  nanoseconds: number;
}

export interface EmergencyAlert {
  id: string;
  /** Partição de segurança: todo alerta pertence a uma única instituição. */
  institutionId: string;
  protocolNumber: string;
  userId: string;
  userProfile: AlertUserProfile;
  category: EmergencyCategory;
  customNote?: string;
  status: AlertStatus;
  receiptStatus?: AlertReceiptStatus;
  centralReceiptAt?: string;
  centralReceiptByUid?: string;
  /** Timestamp usado pela política TTL do Firestore; não é exibido ao usuário. */
  retentionExpiresAt?: string | FirestoreTimestampLike;
  createdAt: string;
  updatedAt: string;
  
  // Identificação do Campus
  campusId?: UfpbCampusId;
  campusName?: string;

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
  
  // Evidência Fotográfica do momento do acionamento
  photoSnapshot?: EmergencyPhotoSnapshot;

  // Notificações SMS aos contatos
  smsNotificationsSent?: SmsNotification[];
  
  // Segurança
  assignedUnitId?: string;
  assignedUnitName?: string;
  securityNotes?: string[];
  resolvedAt?: string;
  responseTimeMinutes?: number;
}

export interface AuditEvent {
  id: string;
  institutionId: string;
  alertId: string;
  actorUid: string;
  actorType: AccessRole;
  eventType: AuditEventType;
  createdAt: string;
  retentionExpiresAt?: string | FirestoreTimestampLike;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface SecurityPatrolUnit {
  id: string;
  campusId?: UfpbCampusId;
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
