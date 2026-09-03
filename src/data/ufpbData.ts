import {
  CampusLocation,
  EmergencyAlert,
  SecurityPatrolUnit,
  UserProfile,
  SafeZone,
  LocationTrackingConfig,
  UfpbCampusInfo,
  UfpbCampusId,
  EmergencyPhotoSnapshot,
} from '../types';

export const DEFAULT_TRACKING_CONFIG: LocationTrackingConfig = {
  isEnabled: true,
  intervalMinutes: 2,
  autoLogRoutes: true,
};

// ==========================================
// CAMPI DA UNIVERSIDADE FEDERAL DA PARAÍBA (UFPB)
// ==========================================
export const UFPB_CAMPI: UfpbCampusInfo[] = [
  {
    id: 'campus_1_joao_pessoa',
    name: 'Campus I - João Pessoa (Castelo Branco)',
    shortName: 'Campus I (João Pessoa)',
    code: 'CAMPUS-I',
    city: 'João Pessoa - PB',
    center: { lat: -7.1398, lng: -34.8456 },
    radiusMeters: 1400,
    zoom: 16,
    description: 'Cidade Universitária Castelo Branco, Reitoria, Centros Acadêmicos (CT, CCEN, CCHLA, CCS, CCJ, CE, CBIOTEC) e HULW.',
    securityPostPhone: '(83) 3216-7100',
    emergencyRadioChannel: 'Canal 01 - Central PU',
    bounds: [
      [-7.1320, -34.8480],
      [-7.1330, -34.8385],
      [-7.1390, -34.8360],
      [-7.1475, -34.8400],
      [-7.1480, -34.8490],
      [-7.1420, -34.8520],
      [-7.1350, -34.8510],
    ],
  },
  {
    id: 'campus_2_areia',
    name: 'Campus II - Areia (Centro de Ciências Agrárias - CCA)',
    shortName: 'Campus II (Areia)',
    code: 'CAMPUS-II',
    city: 'Areia - PB (Brejo Paraibano)',
    center: { lat: -6.9696, lng: -35.7001 },
    radiusMeters: 950,
    zoom: 16,
    description: 'Centro de Ciências Agrárias (CCA), Fazenda Experimental Chã do Jardim, Hospital Veterinário e Reserva Ecológica Mata do Pau-Ferro.',
    securityPostPhone: '(83) 3362-2300',
    emergencyRadioChannel: 'Canal 04 - Vigilância CCA',
    bounds: [
      [-6.9630, -35.7050],
      [-6.9640, -35.6950],
      [-6.9750, -35.6940],
      [-6.9760, -35.7060],
    ],
  },
  {
    id: 'campus_3_bananeiras',
    name: 'Campus III - Bananeiras (CCHSA & CAVN)',
    shortName: 'Campus III (Bananeiras)',
    code: 'CAMPUS-III',
    city: 'Bananeiras - PB',
    center: { lat: -6.7570, lng: -35.6322 },
    radiusMeters: 900,
    zoom: 16,
    description: 'Centro de Ciências Humanas, Sociais e Agrárias (CCHSA) e Colégio Agrícola Vidal de Negreiros (CAVN).',
    securityPostPhone: '(83) 3367-1200',
    emergencyRadioChannel: 'Canal 05 - Segurança CCHSA',
    bounds: [
      [-6.7510, -35.6370],
      [-6.7520, -35.6260],
      [-6.7630, -35.6260],
      [-6.7640, -35.6380],
    ],
  },
  {
    id: 'campus_4_litoral_norte',
    name: 'Campus IV - Litoral Norte (Mamanguape & Rio Tinto - CCAE)',
    shortName: 'Campus IV (Litoral Norte)',
    code: 'CAMPUS-IV',
    city: 'Rio Tinto & Mamanguape - PB',
    center: { lat: -6.8042, lng: -35.0805 }, // Polo Rio Tinto
    radiusMeters: 1100,
    zoom: 16,
    description: 'Centro de Ciências Aplicadas e Educação (CCAE) com unidade em Rio Tinto (Design, TI, Antropologia) e Mamanguape (Ecologia, Administração, Pedagogia).',
    securityPostPhone: '(83) 3291-4500',
    emergencyRadioChannel: 'Canal 06 - Posto CCAE',
    bounds: [
      [-6.7980, -35.0870],
      [-6.7990, -35.0740],
      [-6.8110, -35.0730],
      [-6.8120, -35.0880],
    ],
  },
  {
    id: 'campus_5_mangabeira',
    name: 'Unidade Mangabeira - João Pessoa (CEAR & CTDR)',
    shortName: 'Unidade Mangabeira',
    code: 'CAMPUS-MANG',
    city: 'João Pessoa - PB (Zona Sul)',
    center: { lat: -7.1705, lng: -34.8490 },
    radiusMeters: 750,
    zoom: 16,
    description: 'Centro de Energias Alternativas e Renováveis (CEAR) e Centro de Tecnologia e Desenvolvimento Regional (CTDR).',
    securityPostPhone: '(83) 3216-7290',
    emergencyRadioChannel: 'Canal 07 - Vigilância CEAR',
    bounds: [
      [-7.1660, -34.8540],
      [-7.1660, -34.8440],
      [-7.1750, -34.8440],
      [-7.1750, -34.8540],
    ],
  },
];

// Coordenadas Centrais da UFPB - Campus I (Padrão para retrocompatibilidade)
export const UFPB_CAMPUS_CENTER = UFPB_CAMPI[0].center;
export const UFPB_CAMPUS_BOUNDS = UFPB_CAMPI[0].bounds!;

// ==========================================
// FOTO DE EVIDÊNCIA DE DEMONSTRAÇÃO
// ==========================================
export const createSampleEvidencePhoto = (
  protocol: string,
  victimName: string,
  lat: number,
  lng: number,
  campusName: string
): EmergencyPhotoSnapshot => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
    </defs>
    <rect width="640" height="480" fill="url(#bg)" />
    <!-- Grid tática -->
    <line x1="0" y1="240" x2="640" y2="240" stroke="#38bdf8" stroke-width="1" opacity="0.2" />
    <line x1="320" y1="0" x2="320" y2="480" stroke="#38bdf8" stroke-width="1" opacity="0.2" />
    <circle cx="320" cy="220" r="130" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4" />
    <circle cx="320" cy="220" r="70" fill="none" stroke="#ef4444" stroke-width="1" opacity="0.3" />
    <!-- Silhueta da Pessoa (Câmera Frontal) -->
    <circle cx="320" cy="185" r="48" fill="#475569" opacity="0.8" />
    <path d="M 220 320 C 220 250, 420 250, 420 320 Z" fill="#334155" opacity="0.8" />
    <!-- Mira Tática Central -->
    <line x1="300" y1="220" x2="340" y2="220" stroke="#ef4444" stroke-width="2" />
    <line x1="320" y1="200" x2="320" y2="240" stroke="#ef4444" stroke-width="2" />
    <!-- Tarja Superior de Emergência -->
    <rect width="640" height="46" fill="#dc2626" />
    <text x="20" y="28" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">🚨 GUARDIÃO UFPB • FOTO NO ACIONAMENTO DO SOS</text>
    <text x="480" y="28" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">${protocol}</text>
    <!-- Tarja Inferior com Telemetria e Localização -->
    <rect y="390" width="640" height="90" fill="#020617" opacity="0.95" />
    <line x1="0" y1="390" x2="640" y2="390" stroke="#334155" stroke-width="1" />
    <text x="20" y="415" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold">📍 COORDENADAS: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)} • ${campusName}</text>
    <text x="20" y="438" fill="#f8fafc" font-family="sans-serif" font-size="12">VÍTIMA: ${victimName} • CÂMERA FRONTAL INSTANTÂNEA</text>
    <text x="20" y="462" fill="#94a3b8" font-family="monospace" font-size="11">CERTIFICAÇÃO FORENSE: SHA-256 EVIDÊNCIA DIGITAL • DISPOSITIVO AUTORIZADO</text>
    <!-- Selo lateral -->
    <rect x="470" y="60" width="150" height="34" rx="6" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1" />
    <text x="485" y="81" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="bold">EVIDÊNCIA GRAVADA</text>
  </svg>`;

  return {
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    capturedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    source: 'camera_frontal',
    latitude: lat,
    longitude: lng,
    protocolNumber: protocol,
  };
};

// ==========================================
// ZONAS SEGURAS (TODOS OS CAMPI)
// ==========================================
export const CAMPUS_SAFE_ZONES: SafeZone[] = [
  // --- CAMPUS I (João Pessoa) ---
  {
    id: 'zone_pu_reitoria',
    campusId: 'campus_1_joao_pessoa',
    name: 'Zona Segura 01 - Reitoria & Central PU',
    code: 'ZS-REITORIA',
    description: 'Área com câmeras de alta definição 24h, vigilância presencial e iluminação contínua.',
    center: { lat: -7.1385, lng: -34.8455 },
    radiusMeters: 130,
    icon: '🛡️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 4,
    securityFeatures: ['Posto Central da Vigilância', 'Câmeras Speed Dome 360°', 'Totem de Comunicação Direta', 'Iluminação LED Reforçada'],
  },
  {
    id: 'zone_bc_vivencia',
    campusId: 'campus_1_joao_pessoa',
    name: 'Zona Segura 02 - Biblioteca Central & RU',
    code: 'ZS-BC-RU',
    description: 'Complexo de alta circulação com posto fixo de segurança, vigilantes patrimoniais e controle de acesso.',
    center: { lat: -7.1402, lng: -34.8454 },
    radiusMeters: 120,
    icon: '🏛️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 3,
    securityFeatures: ['Posto Fixo do RU', 'Vigilância 24h na BC', 'Área de Alta Circulação', 'Botão Físico de Pânico no Balcão'],
  },
  {
    id: 'zone_guarita_castelo',
    campusId: 'campus_1_joao_pessoa',
    name: 'Zona Segura 03 - Guarita Castelo Branco (Entrada Principal)',
    code: 'ZS-GUARITA-01',
    description: 'Guarita de acesso com controle veicular 24h, cancelas e suporte imediato de viaturas.',
    center: { lat: -7.1332, lng: -34.8485 },
    radiusMeters: 90,
    icon: '🚔',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Cancelas de Triagem Veicular', 'Rádio Base Integrado PM/UFPB', 'Iluminação de Amplo Espectro'],
  },
  {
    id: 'zone_guarita_bancarios',
    campusId: 'campus_1_joao_pessoa',
    name: 'Zona Segura 04 - Guarita Bancários / Praça da Paz',
    code: 'ZS-GUARITA-02',
    description: 'Posto de segurança no acesso sul do campus, próximo ao CCHLA e saída dos Bancários.',
    center: { lat: -7.1468, lng: -34.8412 },
    radiusMeters: 90,
    icon: '👮',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Cabine Blindada de Vigilância', 'Refletores Perimetrais', 'Ponto Base de Motopatrulhas'],
  },

  // --- CAMPUS II (Areia - CCA) ---
  {
    id: 'zone_cca_central',
    campusId: 'campus_2_areia',
    name: 'Zona Segura CCA - Prédio Central & Diretoria',
    code: 'ZS-CCA-CENTRAL',
    description: 'Prédio histórico do CCA, Guarita de Entrada e Pátio da Administração com segurança 24h.',
    center: { lat: -6.9696, lng: -35.7001 },
    radiusMeters: 110,
    icon: '🛡️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 3,
    securityFeatures: ['Posto Central CCA', 'Monitoramento por Câmeras', 'Comunicação Rádio Direta'],
  },
  {
    id: 'zone_cca_hosp_vet',
    campusId: 'campus_2_areia',
    name: 'Zona Segura CCA - Hospital Veterinário Universitário',
    code: 'ZS-CCA-HV',
    description: 'Área com plantão veterinário 24h, recepção iluminada e posto patrimonial.',
    center: { lat: -6.9720, lng: -35.6980 },
    radiusMeters: 95,
    icon: '🐾',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Plantão 24 horas', 'Câmeras Perimetrais', 'Interfone de Emergência'],
  },

  // --- CAMPUS III (Bananeiras - CCHSA) ---
  {
    id: 'zone_cchsa_central',
    campusId: 'campus_3_bananeiras',
    name: 'Zona Segura CCHSA - Prédio Principal & CAVN',
    code: 'ZS-CCHSA-ADM',
    description: 'Centro administrativo de Bananeiras, pátio central do Colégio Agrícola e vigilância contínua.',
    center: { lat: -6.7570, lng: -35.6322 },
    radiusMeters: 120,
    icon: '🛡️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Vigilância Patrimonial', 'Controle de Acesso Escolar CAVN', 'Totem de Segurança'],
  },

  // --- CAMPUS IV (Litoral Norte - CCAE) ---
  {
    id: 'zone_ccae_riotinto',
    campusId: 'campus_4_litoral_norte',
    name: 'Zona Segura CCAE - Polo Rio Tinto',
    code: 'ZS-CCAE-RT',
    description: 'Prédio histórico da Fábrica Rio Tinto, biblioteca setorial e guarita com câmeras.',
    center: { lat: -6.8042, lng: -35.0805 },
    radiusMeters: 100,
    icon: '🛡️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Guarita Central', 'Controle Biométrico', 'Rádio com Central de Segurança'],
  },

  // --- CAMPUS V (Mangabeira - CEAR & CTDR) ---
  {
    id: 'zone_cear_mangabeira',
    campusId: 'campus_5_mangabeira',
    name: 'Zona Segura CEAR - Bloco Central & Guarita Mangabeira',
    code: 'ZS-CEAR-MANG',
    description: 'Complexo de laboratórios do CEAR/CTDR com guarita 24h na entrada da Rua dos Escoteiros.',
    center: { lat: -7.1705, lng: -34.8490 },
    radiusMeters: 90,
    icon: '🛡️',
    requiresLongPress: true,
    suppressAutoSignalLossAlert: true,
    activeGuardsCount: 2,
    securityFeatures: ['Guarita Blindada', 'Portão Eletrônico com Monitoramento', 'Refletores Led'],
  },
];

// ==========================================
// PONTOS DE REFERÊNCIA & LOCAIS
// ==========================================
export const CAMPUS_LOCATIONS: CampusLocation[] = [
  // --- CAMPUS I (João Pessoa) ---
  {
    id: 'loc_reitoria',
    campusId: 'campus_1_joao_pessoa',
    name: 'Reitoria e Praça da Paz',
    code: 'REIT',
    category: 'administrativo',
    coordinate: { lat: -7.1388, lng: -34.8450, accuracy: 5 },
    description: 'Prédio da Reitoria, Praça da Paz, Bancos e Administração Central',
    isCovered: true,
  },
  {
    id: 'loc_cchla',
    campusId: 'campus_1_joao_pessoa',
    name: 'CCHLA - Centro de Ciências Humanas, Letras e Artes',
    code: 'CCHLA',
    category: 'academico',
    coordinate: { lat: -7.1445, lng: -34.8432, accuracy: 6 },
    description: 'Blocos de aulas, auditórios 411/412 e bosque de integração',
    isCovered: true,
  },
  {
    id: 'loc_ct',
    campusId: 'campus_1_joao_pessoa',
    name: 'CT - Centro de Tecnologia',
    code: 'CT',
    category: 'academico',
    coordinate: { lat: -7.1448, lng: -34.8486, accuracy: 4 },
    description: 'Laboratórios de Engenharia, STI, blocos de Mecânica e Civil',
    isCovered: true,
  },
  {
    id: 'loc_ccen',
    campusId: 'campus_1_joao_pessoa',
    name: 'CCEN - Centro de Ciências Exatas e da Natureza',
    code: 'CCEN',
    category: 'academico',
    coordinate: { lat: -7.1372, lng: -34.8438, accuracy: 5 },
    description: 'Departamentos de Computação, Matemática, Física e Química',
    isCovered: true,
  },
  {
    id: 'loc_ccs',
    campusId: 'campus_1_joao_pessoa',
    name: 'CCS - Centro de Ciências da Saúde',
    code: 'CCS',
    category: 'saude',
    coordinate: { lat: -7.1360, lng: -34.8495, accuracy: 5 },
    description: 'Cursos de Medicina, Enfermagem, Farmácia e Odontologia',
    isCovered: true,
  },
  {
    id: 'loc_hulw',
    campusId: 'campus_1_joao_pessoa',
    name: 'Hospital Universitário Lauro Wanderley (HULW)',
    code: 'HULW',
    category: 'saude',
    coordinate: { lat: -7.1340, lng: -34.8492, accuracy: 4 },
    description: 'Hospital Escola, Pronto Atendimento e Ambulatórios Especializados',
    isCovered: true,
  },
  {
    id: 'loc_bc',
    campusId: 'campus_1_joao_pessoa',
    name: 'Biblioteca Central (BC)',
    code: 'BC',
    category: 'academico',
    coordinate: { lat: -7.1396, lng: -34.8445, accuracy: 4 },
    description: 'Salas de estudo individual e em grupo, acervo geral',
    isCovered: true,
  },
  {
    id: 'loc_ru',
    campusId: 'campus_1_joao_pessoa',
    name: 'Restaurante Universitário (RU) & Centro de Vivência',
    code: 'RU',
    category: 'servico',
    coordinate: { lat: -7.1408, lng: -34.8462, accuracy: 4 },
    description: 'Alimentação discente, agências bancárias e comércios locais',
    isCovered: true,
  },
  {
    id: 'loc_ccj',
    campusId: 'campus_1_joao_pessoa',
    name: 'CCJ - Centro de Ciências Jurídicas (Direito)',
    code: 'CCJ',
    category: 'academico',
    coordinate: { lat: -7.1420, lng: -34.8475, accuracy: 5 },
    description: 'Complexo de salas de Direito, tribunal do júri simulado',
    isCovered: true,
  },
  {
    id: 'loc_ce',
    campusId: 'campus_1_joao_pessoa',
    name: 'CE - Centro de Educação',
    code: 'CE',
    category: 'academico',
    coordinate: { lat: -7.1415, lng: -34.8435, accuracy: 6 },
    description: 'Pedagogia, auditórios e programas de pós-graduação',
    isCovered: true,
  },
  {
    id: 'loc_central_seguranca',
    campusId: 'campus_1_joao_pessoa',
    name: 'Central de Segurança Universitária (PU)',
    code: 'CENTRAL-PU',
    category: 'seguranca',
    coordinate: { lat: -7.1382, lng: -34.8465, accuracy: 3 },
    description: 'Prefeitura Universitária / Central Integrada de Monitoramento UFPB',
    isCovered: true,
  },

  // --- CAMPUS II (Areia - CCA) ---
  {
    id: 'loc_cca_diretoria',
    campusId: 'campus_2_areia',
    name: 'Prédio Central e Diretoria do CCA',
    code: 'CCA-DIR',
    category: 'administrativo',
    coordinate: { lat: -6.9696, lng: -35.7001, accuracy: 4 },
    description: 'Diretoria do CCA, Auditório e Secretaria Acadêmica em Areia',
    isCovered: true,
  },
  {
    id: 'loc_cca_ru',
    campusId: 'campus_2_areia',
    name: 'Restaurante Universitário - CCA Areia',
    code: 'CCA-RU',
    category: 'servico',
    coordinate: { lat: -6.9705, lng: -35.6995, accuracy: 4 },
    description: 'Restaurante dos discentes e área de convivência',
    isCovered: true,
  },
  {
    id: 'loc_cca_hosp_vet',
    campusId: 'campus_2_areia',
    name: 'Hospital Veterinário de Areia',
    code: 'CCA-HV',
    category: 'saude',
    coordinate: { lat: -6.9720, lng: -35.6980, accuracy: 5 },
    description: 'Clínica e cirurgia de pequenos e grandes animais',
    isCovered: true,
  },
  {
    id: 'loc_cca_guarita',
    campusId: 'campus_2_areia',
    name: 'Posto de Vigilância / Guarita CCA',
    code: 'CCA-SEG',
    category: 'seguranca',
    coordinate: { lat: -6.9685, lng: -35.7012, accuracy: 3 },
    description: 'Acesso principal pela Rodovia PB-079',
    isCovered: true,
  },

  // --- CAMPUS III (Bananeiras - CCHSA) ---
  {
    id: 'loc_cchsa_predio',
    campusId: 'campus_3_bananeiras',
    name: 'Prédio Central CCHSA & CAVN',
    code: 'CCHSA-DIR',
    category: 'administrativo',
    coordinate: { lat: -6.7570, lng: -35.6322, accuracy: 4 },
    description: 'Diretoria do CCHSA, laboratórios e biblioteca setorial',
    isCovered: true,
  },
  {
    id: 'loc_cchsa_ru',
    campusId: 'campus_3_bananeiras',
    name: 'Restaurante Universitário de Bananeiras',
    code: 'CCHSA-RU',
    category: 'servico',
    coordinate: { lat: -6.7578, lng: -35.6315, accuracy: 4 },
    description: 'Refeitório dos estudantes do CCHSA e CAVN',
    isCovered: true,
  },
  {
    id: 'loc_cchsa_seguranca',
    campusId: 'campus_3_bananeiras',
    name: 'Posto de Segurança Central CCHSA',
    code: 'CCHSA-SEG',
    category: 'seguranca',
    coordinate: { lat: -6.7562, lng: -35.6330, accuracy: 3 },
    description: 'Base de vigilância patrimonial de Bananeiras',
    isCovered: true,
  },

  // --- CAMPUS IV (Litoral Norte - CCAE) ---
  {
    id: 'loc_ccae_bloco_rt',
    campusId: 'campus_4_litoral_norte',
    name: 'CCAE - Bloco Principal Rio Tinto',
    code: 'CCAE-RT',
    category: 'academico',
    coordinate: { lat: -6.8042, lng: -35.0805, accuracy: 4 },
    description: 'Cursos de Design, Sistemas de Informação e Antropologia',
    isCovered: true,
  },
  {
    id: 'loc_ccae_mamanguape',
    campusId: 'campus_4_litoral_norte',
    name: 'CCAE - Unidade Mamanguape',
    code: 'CCAE-MMP',
    category: 'academico',
    coordinate: { lat: -6.8375, lng: -35.1275, accuracy: 5 },
    description: 'Cursos de Pedagogia, Secretariado, Letras e Ecologia',
    isCovered: true,
  },
  {
    id: 'loc_ccae_seguranca',
    campusId: 'campus_4_litoral_norte',
    name: 'Guarita de Segurança CCAE Rio Tinto',
    code: 'CCAE-SEG',
    category: 'seguranca',
    coordinate: { lat: -6.8035, lng: -35.0815, accuracy: 3 },
    description: 'Vigilância 24h na entrada da unidade Rio Tinto',
    isCovered: true,
  },

  // --- CAMPUS V (Mangabeira - CEAR & CTDR) ---
  {
    id: 'loc_cear_central',
    campusId: 'campus_5_mangabeira',
    name: 'CEAR - Centro de Energias Renováveis',
    code: 'CEAR-BLOCO',
    category: 'academico',
    coordinate: { lat: -7.1705, lng: -34.8490, accuracy: 4 },
    description: 'Laboratórios de Engenharia Elétrica, Solar e Renováveis',
    isCovered: true,
  },
  {
    id: 'loc_ctdr_central',
    campusId: 'campus_5_mangabeira',
    name: 'CTDR - Centro de Tecnologia e Desenv. Regional',
    code: 'CTDR-BLOCO',
    category: 'academico',
    coordinate: { lat: -7.1712, lng: -34.8482, accuracy: 4 },
    description: 'Biotecnologia, Alimentos e Gastronomia em Mangabeira',
    isCovered: true,
  },
  {
    id: 'loc_cear_guarita',
    campusId: 'campus_5_mangabeira',
    name: 'Guarita de Entrada CEAR/CTDR Mangabeira',
    code: 'MANG-SEG',
    category: 'seguranca',
    coordinate: { lat: -7.1698, lng: -34.8496, accuracy: 3 },
    description: 'Posto de controle veicular e pedestres',
    isCovered: true,
  },
];

// ==========================================
// UNIDADES DE SEGURANÇA E RONDAS
// ==========================================
export const INITIAL_SECURITY_UNITS: SecurityPatrolUnit[] = [
  // Campus I
  {
    id: 'unit_v1',
    campusId: 'campus_1_joao_pessoa',
    name: 'Viatura Ronda 01',
    code: 'V-01',
    type: 'viatura',
    status: 'disponivel',
    coordinate: { lat: -7.1385, lng: -34.8460, accuracy: 4 },
    sector: 'Setor Central / Reitoria / Biblioteca (Campus I)',
    officers: ['Agente Carlos Silva', 'Agente Marcos Lima'],
    contactRadio: 'Canal 01 (Central PU)',
  },
  {
    id: 'unit_m1',
    campusId: 'campus_1_joao_pessoa',
    name: 'Motopatrulha Alfa',
    code: 'MOTO-01',
    type: 'motopatrulha',
    status: 'disponivel',
    coordinate: { lat: -7.1440, lng: -34.8450, accuracy: 3 },
    sector: 'Setor Sul / CCHLA / CT (Campus I)',
    officers: ['Agente Fernando Dias'],
    contactRadio: 'Canal 02 (Rondas Rápidas)',
  },
  {
    id: 'unit_m2',
    campusId: 'campus_1_joao_pessoa',
    name: 'Motopatrulha Bravo',
    code: 'MOTO-02',
    type: 'motopatrulha',
    status: 'disponivel',
    coordinate: { lat: -7.1350, lng: -34.8470, accuracy: 3 },
    sector: 'Setor Norte / CCS / CCEN / HULW (Campus I)',
    officers: ['Agente Rafael Gomes'],
    contactRadio: 'Canal 02 (Rondas Rápidas)',
  },
  {
    id: 'unit_posto_ru',
    campusId: 'campus_1_joao_pessoa',
    name: 'Posto Fixo RU / Vivência',
    code: 'PF-RU',
    type: 'posto_fixo',
    status: 'disponivel',
    coordinate: { lat: -7.1408, lng: -34.8462, accuracy: 2 },
    sector: 'Restaurante Universitário e Centro de Vivência',
    officers: ['Vigilante Juliana Costa'],
    contactRadio: 'Canal 03 (Postos Fixos)',
  },

  // Campus II (Areia)
  {
    id: 'unit_cca_v1',
    campusId: 'campus_2_areia',
    name: 'Viatura Ronda Areia (CCA)',
    code: 'V-CCA',
    type: 'viatura',
    status: 'disponivel',
    coordinate: { lat: -6.9698, lng: -35.7005, accuracy: 4 },
    sector: 'Perímetro CCA / Hospital Veterinário / Fazenda',
    officers: ['Vigilante Josivaldo Santos', 'Vigilante Severino Dantas'],
    contactRadio: 'Canal 04 (Vigilância CCA)',
  },

  // Campus III (Bananeiras)
  {
    id: 'unit_cchsa_m1',
    campusId: 'campus_3_bananeiras',
    name: 'Motopatrulha CCHSA Bananeiras',
    code: 'MOTO-BAN',
    type: 'motopatrulha',
    status: 'disponivel',
    coordinate: { lat: -6.7572, lng: -35.6325, accuracy: 3 },
    sector: 'Área Acadêmica e Alojamentos CCHSA / CAVN',
    officers: ['Agente Tiago Meireles'],
    contactRadio: 'Canal 05 (Segurança Bananeiras)',
  },

  // Campus IV (Litoral Norte)
  {
    id: 'unit_ccae_v1',
    campusId: 'campus_4_litoral_norte',
    name: 'Ronda Móvel CCAE Litoral Norte',
    code: 'V-CCAE',
    type: 'viatura',
    status: 'disponivel',
    coordinate: { lat: -6.8040, lng: -35.0810, accuracy: 4 },
    sector: 'Unidade Rio Tinto / Mamanguape',
    officers: ['Agente Marcelo Bezerra', 'Agente Danilo Cruz'],
    contactRadio: 'Canal 06 (CCAE)',
  },

  // Campus V (Mangabeira)
  {
    id: 'unit_cear_v1',
    campusId: 'campus_5_mangabeira',
    name: 'Viatura Ronda CEAR/CTDR',
    code: 'V-CEAR',
    type: 'viatura',
    status: 'disponivel',
    coordinate: { lat: -7.1702, lng: -34.8492, accuracy: 4 },
    sector: 'Setor Mangabeira / Laboratórios de Energia',
    officers: ['Vigilante Jorge Santana'],
    contactRadio: 'Canal 07 (Vigilância CEAR)',
  },
];

// Perfil de usuário padrão
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_ufpb_001',
  name: 'Mariana Medeiros de Albuquerque',
  documentNumber: '20220104892', // Matrícula UFPB
  role: 'estudante',
  phone: '(83) 99876-5432',
  email: 'mariana.albuquerque@academico.ufpb.br',
  emergencyContactName: 'Cláudia Medeiros (Mãe)',
  emergencyContactPhone: '(83) 98712-3344',
  emergencyContactRelation: 'Mãe',
  emergencyContacts: [
    {
      id: 'c_1',
      name: 'Cláudia Medeiros (Mãe)',
      phone: '(83) 98712-3344',
      relation: 'Mãe',
      isNotifySms: true,
    },
    {
      id: 'c_2',
      name: 'Lucas Eduardo (Namorado)',
      phone: '(83) 99123-8899',
      relation: 'Cônjuge',
      isNotifySms: true,
    },
    {
      id: 'c_3',
      name: 'Central de Segurança UFPB',
      phone: '(83) 3216-7100',
      relation: 'Segurança Institucional',
      isNotifySms: true,
    },
  ],
  department: 'Centro de Tecnologia (CT) - Engenharia de Produção',
  medicalNotes: 'Alérgica a dipirona. Asmática leve (usa bombinha). Tipo sanguíneo O+.',
  registeredAt: '2026-03-01T08:00:00Z',
  avatarSeed: 'Mariana',
  preferredCampusId: 'campus_1_joao_pessoa',
};

// ==========================================
// ALERTAS INICIAIS (COM FOTO DE EVIDÊNCIA DO SOS)
// ==========================================
export const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'alert_001',
    protocolNumber: 'SOS-2026-0482',
    campusId: 'campus_1_joao_pessoa',
    campusName: 'Campus I - João Pessoa (Castelo Branco)',
    userId: 'user_sim_02',
    userProfile: {
      id: 'user_sim_02',
      name: 'Lucas Cavalcanti de Moura',
      documentNumber: '20230089120',
      role: 'estudante',
      phone: '(83) 98123-9988',
      email: 'lucas.cavalcanti@academico.ufpb.br',
      emergencyContactName: 'Roberto Cavalcanti (Pai)',
      emergencyContactPhone: '(83) 99111-2233',
      emergencyContactRelation: 'Pai',
      emergencyContacts: [
        { id: 'c_lucas_1', name: 'Roberto Cavalcanti (Pai)', phone: '(83) 99111-2233', relation: 'Pai', isNotifySms: true },
        { id: 'c_lucas_2', name: 'Ana Beatriz (Namorada)', phone: '(83) 98877-6655', relation: 'Cônjuge', isNotifySms: true },
      ],
      department: 'CCHLA - Letras',
      registeredAt: '2026-02-15T14:30:00Z',
    },
    category: 'perseguicao_suspeito',
    customNote: 'Indivíduo em atitude suspeita me seguindo na trilha escura atrás do bloco do CCHLA sentido Bancários.',
    status: 'em_deslocamento',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    location: {
      lat: -7.1455,
      lng: -34.8428,
      accuracy: 6,
    },
    locationName: 'Trilha do Bosque CCHLA (Setor Sul)',
    isInsideCampus: true,
    isInSafeZone: false,
    signalLost: false,
    lastSignalTimestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    batteryLevel: 68,
    assignedUnitId: 'unit_m1',
    assignedUnitName: 'Motopatrulha Alfa',
    responseTimeMinutes: 2,
    photoSnapshot: createSampleEvidencePhoto(
      'SOS-2026-0482',
      'Lucas Cavalcanti',
      -7.1455,
      -34.8428,
      'Campus I - CCHLA'
    ),
    smsNotificationsSent: [
      {
        id: 'sms_01',
        contactName: 'Roberto Cavalcanti (Pai)',
        contactPhone: '(83) 99111-2233',
        message: 'GUARDIÃO UFPB: Alerta SOS acionado por Lucas em Trilha do Bosque CCHLA (-7.14550, -34.84280). Foto e localização anexadas para segurança.',
        sentAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        status: 'entregue',
      },
    ],
    userRouteHistory: [
      { coordinate: { lat: -7.1420, lng: -34.8475 }, timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), locationName: 'CCJ - Direito' },
      { coordinate: { lat: -7.1445, lng: -34.8432 }, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), locationName: 'CCHLA Bloco Central' },
      { coordinate: { lat: -7.1455, lng: -34.8428 }, timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(), locationName: 'Trilha do Bosque CCHLA' },
    ],
    securityNotes: ['Chamado assumido pelo Agente Fernando Dias. Tempo estimado de chegada: 2 minutos. Foto de evidência verificada pela central.'],
  },
  {
    id: 'alert_002',
    protocolNumber: 'SOS-2026-0480',
    campusId: 'campus_1_joao_pessoa',
    campusName: 'Campus I - João Pessoa (Castelo Branco)',
    userId: 'user_sim_03',
    userProfile: {
      id: 'user_sim_03',
      name: 'Prof. Dra. Helena Sampaio',
      documentNumber: 'SIAPE 1984210',
      role: 'docente',
      phone: '(83) 98844-5566',
      email: 'helena.sampaio@ct.ufpb.br',
      emergencyContactName: 'Dr. Paulo Sampaio (Esposo)',
      emergencyContactPhone: '(83) 99900-1122',
      emergencyContactRelation: 'Cônjuge',
      emergencyContacts: [
        { id: 'c_helena_1', name: 'Dr. Paulo Sampaio (Esposo)', phone: '(83) 99900-1122', relation: 'Cônjuge', isNotifySms: true },
      ],
      department: 'CT - Depto de Engenharia Civil',
      registeredAt: '2026-01-10T09:00:00Z',
    },
    category: 'saude_desmaio',
    customNote: 'Estudante passou mal e desmaiou na sala 204 do Bloco F do CT.',
    status: 'no_local',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    location: {
      lat: -7.1448,
      lng: -34.8486,
      accuracy: 4,
    },
    locationName: 'CT - Centro de Tecnologia (Bloco F)',
    isInsideCampus: true,
    isInSafeZone: false,
    signalLost: false,
    lastSignalTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    batteryLevel: 91,
    assignedUnitId: 'unit_v1',
    assignedUnitName: 'Viatura Ronda 01',
    responseTimeMinutes: 3,
    photoSnapshot: createSampleEvidencePhoto(
      'SOS-2026-0480',
      'Helena Sampaio',
      -7.1448,
      -34.8486,
      'Campus I - CT'
    ),
    smsNotificationsSent: [
      {
        id: 'sms_02',
        contactName: 'Dr. Paulo Sampaio (Esposo)',
        contactPhone: '(83) 99900-1122',
        message: 'GUARDIÃO UFPB: Alerta SOS acionado por Helena em CT - Centro de Tecnologia (-7.14480, -34.84860). Segurança no local.',
        sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'entregue',
      },
    ],
    userRouteHistory: [
      { coordinate: { lat: -7.1388, lng: -34.8450 }, timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), locationName: 'Reitoria' },
      { coordinate: { lat: -7.1448, lng: -34.8486 }, timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), locationName: 'CT Bloco F' },
    ],
    securityNotes: ['Viatura no local. SAMU acionado via protocolo 8847. Paciente consciente.'],
  },
  {
    id: 'alert_003',
    protocolNumber: 'SOS-2026-0479',
    campusId: 'campus_1_joao_pessoa',
    campusName: 'Campus I - João Pessoa (Castelo Branco)',
    userId: 'user_sim_04',
    userProfile: {
      id: 'user_sim_04',
      name: 'Gabriel Albuquerque Ramos',
      documentNumber: '20240129033',
      role: 'estudante',
      phone: '(83) 99655-4433',
      email: 'gabriel.ramos@academico.ufpb.br',
      emergencyContactName: 'Aline Ramos (Irmã)',
      emergencyContactPhone: '(83) 98112-9900',
      emergencyContactRelation: 'Irmã',
      emergencyContacts: [
        { id: 'c_gabriel_1', name: 'Aline Ramos (Irmã)', phone: '(83) 98112-9900', relation: 'Irmã', isNotifySms: true },
      ],
      department: 'CCEN - Ciência da Computação',
      registeredAt: '2026-03-01T10:00:00Z',
    },
    category: 'urgencia_geral',
    customNote: 'Sinal interrompido subitamente após acionamento próximo à saída da mata do CCEN.',
    status: 'pendente',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    location: {
      lat: -7.1378,
      lng: -34.8410,
      accuracy: 15,
    },
    locationName: 'Mata do CCEN / Próximo ao Herbário',
    isInsideCampus: true,
    isInSafeZone: false,
    signalLost: true,
    lastSignalTimestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    batteryLevel: 14,
    photoSnapshot: createSampleEvidencePhoto(
      'SOS-2026-0479',
      'Gabriel Ramos',
      -7.1378,
      -34.8410,
      'Campus I - Mata CCEN'
    ),
    smsNotificationsSent: [
      {
        id: 'sms_03',
        contactName: 'Aline Ramos (Irmã)',
        contactPhone: '(83) 98112-9900',
        message: 'GUARDIÃO UFPB: Alerta SOS com QUEDA DE SINAL para Gabriel. Última coordenada conhecida: Mata do CCEN (-7.13780, -34.84100). Foto gravada no servidor.',
        sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        status: 'entregue',
      },
    ],
    userRouteHistory: [
      { coordinate: { lat: -7.1396, lng: -34.8445 }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), locationName: 'Biblioteca Central' },
      { coordinate: { lat: -7.1372, lng: -34.8438 }, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), locationName: 'CCEN Química' },
      { coordinate: { lat: -7.1378, lng: -34.8410 }, timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), locationName: 'Mata do CCEN / Herbário' },
    ],
    securityNotes: ['ATENÇÃO: Sinal de GPS e dados perdido. Última coordenada fixada como referência de busca. Foto de momento do SOS disponível.'],
  },
  {
    id: 'alert_005_areia',
    protocolNumber: 'SOS-2026-0483',
    campusId: 'campus_2_areia',
    campusName: 'Campus II - Areia (CCA)',
    userId: 'user_sim_areia',
    userProfile: {
      id: 'user_sim_areia',
      name: 'Matheus Henrique de Oliveira',
      documentNumber: '20230114002',
      role: 'estudante',
      phone: '(83) 98788-2211',
      email: 'matheus.oliveira@cca.ufpb.br',
      emergencyContactName: 'Valéria Oliveira (Mãe)',
      emergencyContactPhone: '(83) 99122-4455',
      emergencyContactRelation: 'Mãe',
      department: 'CCA - Agronomia',
      registeredAt: '2026-02-20T08:00:00Z',
    },
    category: 'urgencia_geral',
    customNote: 'Queda de moto no acesso de terra próximo aos currais do CCA Areia.',
    status: 'pendente',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    location: {
      lat: -6.9715,
      lng: -35.6990,
      accuracy: 5,
    },
    locationName: 'Pista de Acesso aos Currais (CCA Areia)',
    isInsideCampus: true,
    isInSafeZone: false,
    signalLost: false,
    lastSignalTimestamp: new Date().toISOString(),
    batteryLevel: 55,
    photoSnapshot: createSampleEvidencePhoto(
      'SOS-2026-0483',
      'Matheus Henrique',
      -6.9715,
      -35.6990,
      'Campus II - Areia'
    ),
    securityNotes: ['Alerta recebido pelo posto de Areia. Viatura V-CCA notificada.'],
  },
];

export const EMERGENCY_PHONES = [
  { name: 'Central de Segurança UFPB (Campus I - Castelo Branco)', number: '(83) 3216-7100', description: 'Monitoramento 24h Campus I' },
  { name: 'Segurança Campus II (Areia - CCA)', number: '(83) 3362-2300', description: 'Vigilância 24h Brejo' },
  { name: 'Segurança Campus III (Bananeiras - CCHSA)', number: '(83) 3367-1200', description: 'Vigilância CCHSA/CAVN' },
  { name: 'Segurança Campus IV (Litoral Norte - CCAE)', number: '(83) 3291-4500', description: 'CCAE Rio Tinto / Mamanguape' },
  { name: 'Segurança Campus V (Mangabeira - CEAR/CTDR)', number: '(83) 3216-7290', description: 'Monitoramento Mangabeira' },
  { name: 'Ronda Móvel UFPB (WhatsApp)', number: '(83) 98800-7100', description: 'Atendimento e envio de localização' },
  { name: 'Polícia Militar da Paraíba', number: '190', description: 'Emergência policial' },
  { name: 'SAMU Paraíba', number: '192', description: 'Atendimento médico e ambulância' },
  { name: 'Corpo de Bombeiros', number: '193', description: 'Resgate, primeiros socorros e incêndio' },
  { name: 'DEAM - Delegacia da Mulher PB', number: '(83) 3218-5324', description: 'Atendimento especializado à mulher' },
];
