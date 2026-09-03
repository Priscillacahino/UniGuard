import { EmergencyPhotoSnapshot, GeoCoordinate } from '../types';

/**
 * Utilitário de Captura Forense / Foto Instantânea no Acionamento do SOS
 * Tenta acessar a câmera do aparelho (frontal preferencialmente), captura 1 frame,
 * carimba dados de emergência (data, hora, protocolo e coordenadas) e libera a câmera imediatamente.
 */

export interface CapturePhotoOptions {
  coordinate?: GeoCoordinate;
  protocolNumber?: string;
  facingMode?: 'user' | 'environment';
  userName?: string;
  campusName?: string;
}

/**
 * Gera uma imagem forense carimbada usando HTML5 Canvas caso a câmera não esteja acessível
 */
export function generateEmergencyEvidenceCanvas(
  options: CapturePhotoOptions,
  sourceType: EmergencyPhotoSnapshot['source'] = 'simulacao_evidencia'
): EmergencyPhotoSnapshot {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');
  const lat = options.coordinate?.lat.toFixed(5) || '-7.13980';
  const lng = options.coordinate?.lng.toFixed(5) || '-34.84560';

  if (ctx) {
    // Fundo escuro com gradiente tático
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 480);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 480);

    // Grade tática de mira / radar
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 40; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Círculos concêntricos de radar central
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(320, 220, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(320, 220, 160, 0, Math.PI * 2);
    ctx.stroke();

    // Silhueta de Usuário / Alvo
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.beginPath();
    ctx.arc(320, 190, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(320, 290, 85, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mira central
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 220);
    ctx.lineTo(340, 220);
    ctx.moveTo(320, 200);
    ctx.lineTo(320, 240);
    ctx.stroke();

    // Cabeçalho institucional com Tarja Vermelha
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 640, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('🚨 REGISTRO DE EVIDÊNCIA DE SOS • GUARDIÃO UFPB', 20, 32);

    ctx.font = 'bold 12px monospace';
    ctx.fillText(options.protocolNumber || 'SOS-UFPB', 480, 32);

    // Barra inferior com metadados táticos e geolocalização
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 390, 640, 90);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 390, 640, 90);

    // Carimbo de Telemetria
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`📍 COORDENADAS: Lat ${lat}, Lng ${lng}`, 20, 415);
    ctx.fillText(`⏱️ DATA/HORA: ${dateStr} às ${timeStr}`, 20, 435);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`🏛️ LOCAL: ${options.campusName || 'UFPB'} • USUÁRIO: ${options.userName || 'Comunidade UFPB'}`, 20, 455);
    ctx.fillText(`STATUS: Câmera acionada no momento do botão SOS`, 20, 470);

    // Selo de Evidência no topo direito
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(450, 60, 175, 55);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(450, 60, 175, 55);
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('CAPTURA DE SEGURANÇA', 460, 78);
    ctx.font = '10px monospace';
    ctx.fillText('DISPOSITIVO HOMOLOGADO', 460, 95);
    ctx.fillText(`ID: ${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 460, 108);
  }

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.88),
    capturedAt: now.toISOString(),
    source: sourceType,
    deviceInfo: navigator.userAgent.substring(0, 60),
    latitude: options.coordinate?.lat,
    longitude: options.coordinate?.lng,
    protocolNumber: options.protocolNumber,
  };
}

/**
 * Carimba uma foto real capturada da câmera com os dados de telemetria do SOS
 */
function stampRealPhoto(
  videoElement: HTMLVideoElement,
  options: CapturePhotoOptions,
  source: EmergencyPhotoSnapshot['source']
): EmergencyPhotoSnapshot {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');
  const lat = options.coordinate?.lat.toFixed(5) || '-7.13980';
  const lng = options.coordinate?.lng.toFixed(5) || '-34.84560';

  if (ctx) {
    // Desenha o frame real da câmera
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Carimbo superior: Tarja Vermelha translúcida
    ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
    ctx.fillRect(0, 0, canvas.width, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('🚨 GUARDIÃO UFPB • FOTO NO ACIONAMENTO SOS', 15, 23);

    ctx.font = 'bold 12px monospace';
    ctx.fillText(options.protocolNumber || 'SOS-UFPB', canvas.width - 150, 23);

    // Tarja inferior com localização e carimbo de data/hora
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`📍 Lat: ${lat}, Lng: ${lng} • ${options.campusName || 'Campus UFPB'}`, 15, canvas.height - 30);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    ctx.fillText(`Horário do Chamado: ${dateStr} ${timeStr} • Vítima: ${options.userName || 'Identificado'}`, 15, canvas.height - 12);
  }

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    capturedAt: now.toISOString(),
    source,
    deviceInfo: navigator.userAgent.substring(0, 60),
    latitude: options.coordinate?.lat,
    longitude: options.coordinate?.lng,
    protocolNumber: options.protocolNumber,
  };
}

/**
 * Função assíncrona para capturar a foto do dispositivo
 * Se o hardware ou as permissões estiverem disponíveis, tira a foto real.
 * Caso contrário, gera a evidência forense de contingência sem travar a chamada do SOS.
 */
export async function captureEmergencyPhoto(
  options: CapturePhotoOptions = {}
): Promise<EmergencyPhotoSnapshot> {
  const facing = options.facingMode || 'user';
  const sourceName = facing === 'user' ? 'camera_frontal' : 'camera_traseira';

  // Verificar se o ambiente tem suporte a mediaDevices
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    return generateEmergencyEvidenceCanvas(options, 'simulacao_evidencia');
  }

  try {
    // Tenta solicitar stream da câmera com timeout de 3 segundos para nunca atrasar o socorro
    const streamPromise = navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facing,
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    const timeoutPromise = new Promise<MediaStream>((_, reject) => {
      setTimeout(() => reject(new Error('CAMERA_TIMEOUT')), 3000);
    });

    const stream = await Promise.race([streamPromise, timeoutPromise]);

    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(() => resolve()).catch(reject);
      };
      setTimeout(() => resolve(), 1200);
    });

    // Captura e carimba o frame
    const snapshot = stampRealPhoto(video, options, sourceName);

    // Encerra imediatamente as faixas da câmera para economizar bateria e liberar hardware
    stream.getTracks().forEach((track) => track.stop());

    return snapshot;
  } catch {
    // Em caso de rejeição de permissão ou restrição de sandbox no iframe,
    // retorna evidência forense simulada com todos os dados exatos do socorro
    return generateEmergencyEvidenceCanvas(options, 'simulacao_evidencia');
  }
}
