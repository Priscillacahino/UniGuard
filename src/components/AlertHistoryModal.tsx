import React, { useState } from 'react';
import { EmergencyAlert, EmergencyPhotoSnapshot, UfpbCampusId } from '../types';
import { UFPB_CAMPI } from '../data/ufpbData';
import { getCampusById } from '../utils/geo';
import { PhotoEvidenceModal } from './PhotoEvidenceModal';
import {
  Clock,
  Search,
  MapPin,
  Camera,
  Download,
  Building2,
  Eye,
  X,
} from 'lucide-react';

interface AlertHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: EmergencyAlert[];
  onSelectAlertToInspect?: (alert: EmergencyAlert) => void;
}

export const AlertHistoryModal: React.FC<AlertHistoryModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectAlertToInspect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [campusFilter, setCampusFilter] = useState<'todas' | UfpbCampusId>('todas');

  // Modal de Foto Ampliada
  const [photoToView, setPhotoToView] = useState<{
    photo: EmergencyPhotoSnapshot;
    victimName: string;
    protocol: string;
    location: string;
  } | null>(null);

  if (!isOpen) return null;

  // Filtragem dos alertas
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.userProfile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.customNote && alert.customNote.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'todas' || alert.category === categoryFilter;
    
    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'resolvidos' && (alert.status === 'resolvido' || alert.status === 'cancelado_usuario')) ||
      (statusFilter === 'com_foto' && !!alert.photoSnapshot) ||
      (statusFilter === 'ativos' && alert.status !== 'resolvido' && alert.status !== 'cancelado_usuario');

    const matchesCampus = campusFilter === 'todas' || (alert.campusId || 'campus_1_joao_pessoa') === campusFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesCampus;
  });

  // Estatísticas do Histórico
  const totalWithPhoto = alerts.filter((a) => !!a.photoSnapshot).length;

  // Exportar relatório em CSV com suporte a Campus e Foto
  const handleExportCsv = () => {
    const headers = 'Protocolo,Campus,Nome,Matrícula,Categoria,Data,Hora,Localização,Latitude,Longitude,Status,Zona Segura,Foto Registrada\n';
    const rows = filteredAlerts
      .map((a) => {
        const d = new Date(a.createdAt);
        const campus = getCampusById(a.campusId);
        return `"${a.protocolNumber}","${campus.shortName}","${a.userProfile.name}","${a.userProfile.documentNumber}","${a.category}","${d.toLocaleDateString('pt-BR')}","${d.toLocaleTimeString('pt-BR')}","${a.locationName.replace(/"/g, '""')}","${a.location.lat}","${a.location.lng}","${a.status}","${a.isInSafeZone ? 'Sim' : 'Não'}","${a.photoSnapshot ? 'Sim' : 'Não'}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_guardiao_ufpb_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-alert-history"
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003d71] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#003d71] text-white px-2 py-0.5 rounded-full">
                  Auditoria & Padrões
                </span>
                <h2 className="text-base font-extrabold text-slate-900">Histórico de Acionamentos SOS</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Registro de ocorrências em todos os campi com fotos e telemetria de localização.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Baixar planilha CSV com dados auditáveis"
            >
              <Download className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, nome da vítima, matrícula ou local..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
            />
          </div>

          {/* Filtro por Campus */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-[#003d71]" />
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todas">Todos os Campi</option>
              {UFPB_CAMPI.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativos">Em Atendimento</option>
            <option value="com_foto">Com Foto Anexada ({totalWithPhoto})</option>
            <option value="resolvidos">Concluídos</option>
          </select>

          {/* Filtro por Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="urgencia_geral">Urgência Geral</option>
            <option value="violencia_ameaca">Violência / Ameaça</option>
            <option value="perseguicao_suspeito">Perseguição / Suspeito</option>
            <option value="saude_desmaio">Saúde / Desmaio</option>
            <option value="area_escura_risco">Área Escura / Risco</option>
          </select>
        </div>

        {/* Tabela / Lista de Alertas */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum registro de alerta encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const createdAtDate = new Date(alert.createdAt);
                const isSignalLost = alert.signalLost;
                const campus = getCampusById(alert.campusId);

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Miniatura da foto se houver */}
                    {alert.photoSnapshot && (
                      <div
                        onClick={() =>
                          setPhotoToView({
                            photo: alert.photoSnapshot!,
                            victimName: alert.userProfile.name,
                            protocol: alert.protocolNumber,
                            location: alert.locationName,
                          })
                        }
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-black border border-slate-300 shrink-0 cursor-pointer group shadow-xs"
                        title="Clique para ampliar a foto do momento do SOS"
                      >
                        <img
                          src={alert.photoSnapshot.dataUrl}
                          alt="Foto SOS"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center font-mono py-0.5">
                          📸 Foto
                        </span>
                      </div>
                    )}

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 font-mono">
                          {alert.protocolNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003d71] border border-blue-100">
                          {campus.shortName}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {alert.userProfile.role}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {alert.category.replace('_', ' ').toUpperCase()}
                        </span>
                        {alert.isInSafeZone && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            🛡️ Zona Segura ({alert.safeZoneName || 'Campus'})
                          </span>
                        )}
                        {isSignalLost && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            ⚠️ Sinal Perdido
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>{alert.userProfile.name}</span>
                        <span className="text-slate-400 text-xs font-normal">
                          (Matrícula: {alert.userProfile.documentNumber})
                        </span>
                      </div>

                      <div className="text-slate-600 flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{alert.locationName}</span>
                        <span className="text-slate-400 font-mono">
                          ({alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)})
                        </span>
                      </div>

                      {alert.customNote && (
                        <div className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-md border border-slate-100">
                          "{alert.customNote}"
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:items-end justify-between shrink-0 gap-2 border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="text-right">
                        <div className="text-[11px] font-mono text-slate-500">
                          {createdAtDate.toLocaleDateString('pt-BR')} • {createdAtDate.toLocaleTimeString('pt-BR')}
                        </div>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            alert.status === 'resolvido'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : alert.status === 'cancelado_usuario'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {alert.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.photoSnapshot && (
                          <button
                            onClick={() =>
                              setPhotoToView({
                                photo: alert.photoSnapshot!,
                                victimName: alert.userProfile.name,
                                protocol: alert.protocolNumber,
                                location: alert.locationName,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3 text-[#003d71]" />
                            <span>Ver Foto</span>
                          </button>
                        )}

                        {onSelectAlertToInspect && (
                          <button
                            onClick={() => {
                              onSelectAlertToInspect(alert);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#003d71] hover:bg-[#002b50] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Ver no Mapa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
          <span className="text-slate-500 font-medium">
            Mostrando {filteredAlerts.length} de {alerts.length} registros no histórico.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Exibição da Foto */}
      {photoToView && (
        <PhotoEvidenceModal
          isOpen={true}
          onClose={() => setPhotoToView(null)}
          photoSnapshot={photoToView.photo}
          victimName={photoToView.victimName}
          protocolNumber={photoToView.protocol}
          locationName={photoToView.location}
        />
      )}
    </div>
  );
};
