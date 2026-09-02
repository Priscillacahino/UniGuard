import React from 'react';
import { EmergencyPhotoSnapshot } from '../types';
import { Camera, Download, ExternalLink, ShieldAlert, X } from 'lucide-react';

interface PhotoEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoSnapshot?: EmergencyPhotoSnapshot;
  victimName?: string;
  protocolNumber?: string;
  locationName?: string;
}

export const PhotoEvidenceModal: React.FC<PhotoEvidenceModalProps> = ({
  isOpen,
  onClose,
  photoSnapshot,
  victimName,
  protocolNumber,
  locationName,
}) => {
  if (!isOpen || !photoSnapshot) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoSnapshot.dataUrl;
    link.download = `EVIDENCIA_${protocolNumber || 'SOS'}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const capturedDate = new Date(photoSnapshot.capturedAt);
  const mapsUrl = photoSnapshot.latitude && photoSnapshot.longitude
    ? `https://www.google.com/maps?q=${photoSnapshot.latitude},${photoSnapshot.longitude}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="modal-photo-evidence"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                  Evidência Instantânea
                </span>
                <span className="font-mono text-xs text-slate-400 font-bold">
                  {protocolNumber || photoSnapshot.protocolNumber || 'SOS-UFPB'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Foto Registrada no Acionamento do SOS
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Imagem Central */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-inner max-h-[50vh]">
            <img
              src={photoSnapshot.dataUrl}
              alt="Evidência fotográfica de emergência"
              className="w-full h-auto object-contain max-h-[50vh]"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-red-500/40 text-[10px] font-bold text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>CAPTURA MOMENTO DO SOS</span>
            </div>
          </div>

          {/* Ficha de Metadados da Evidência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vítima / Solicitante:</span>
              <span className="font-bold text-slate-200">{victimName || 'Usuário Cadastrado'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Data & Hora do Disparo:</span>
              <span className="font-mono text-slate-200">
                {capturedDate.toLocaleDateString('pt-BR')} às {capturedDate.toLocaleTimeString('pt-BR')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Local Informado:</span>
              <span className="text-slate-200 truncate block">{locationName || 'Campus UFPB'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Origem da Imagem:</span>
              <span className="text-emerald-400 font-semibold capitalize">
                {photoSnapshot.source.replace('_', ' ')}
              </span>
            </div>

            {photoSnapshot.latitude && photoSnapshot.longitude && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Geolocalização Fixada:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    Lat: {photoSnapshot.latitude.toFixed(6)}, Lng: {photoSnapshot.longitude.toFixed(6)}
                  </span>
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#38bdf8] hover:underline font-bold text-[11px]"
                  >
                    <span>Ver no Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Esta imagem foi autorizada pelo discente/servidor no momento do acionamento emergencial do botão SOS, sendo transmitida instantaneamente à Central de Segurança Universitária da UFPB para identificação visual e despacho tático das viaturas.
            </p>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Protocolo Certificado UFPB
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Imagem</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
