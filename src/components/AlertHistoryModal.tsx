import React, { useState } from 'react';
import { EmergencyAlert } from '../types';
import { Clock, Search, Calendar, MapPin, CheckCircle2, User, Phone, Shield, FileText, ArrowUpDown, Filter, Download } from 'lucide-react';

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
      (statusFilter === 'ativos' && alert.status !== 'resolvido' && alert.status !== 'cancelado_usuario');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Estatísticas do Histórico
  const total = alerts.length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolvido' || a.status === 'cancelado_usuario').length;
  const safeZoneCount = alerts.filter((a) => a.isInSafeZone).length;

  // Exportar relatório em CSV (Simulado)
  const handleExportCsv = () => {
    const headers = 'Protocolo,Nome,Matrícula,Categoria,Data,Hora,Localização,Latitude,Longitude,Status,Zona Segura\n';
    const rows = filteredAlerts
      .map((a) => {
        const d = new Date(a.createdAt);
        return `"${a.protocolNumber}","${a.userProfile.name}","${a.userProfile.documentNumber}","${a.category}","${d.toLocaleDateString('pt-BR')}","${d.toLocaleTimeString('pt-BR')}","${a.locationName.replace(/"/g, '""')}","${a.location.lat}","${a.location.lng}","${a.status}","${a.isInSafeZone ? 'Sim' : 'Não'}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_alertas_guardiao_ufpb_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-alert-history"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
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
                Registro completo de ocorrências para análise de tempos de resposta e padrões de risco no campus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Baixar planilha CSV para análise estatística"
            >
              <Download className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-100 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total de Acionamentos:</span>
            <span className="font-extrabold text-slate-900 text-sm">{total}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Ocorrências Resolvidas:</span>
            <span className="font-extrabold text-emerald-700 text-sm">{resolvedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Em Zonas de Segurança:</span>
            <span className="font-extrabold text-blue-700 text-sm">{safeZoneCount}</span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2.5 items-center justify-between bg-white text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, usuário, local..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71] cursor-pointer font-medium"
            >
              <option value="todos">Status: Todos</option>
              <option value="ativos">Status: Em Aberto</option>
              <option value="resolvidos">Status: Resolvidos</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#003d71] cursor-pointer font-medium"
            >
              <option value="todas">Categorias: Todas</option>
              <option value="urgencia_geral">Urgência Geral</option>
              <option value="violencia_ameaca">Violência ou Ameaça</option>
              <option value="perseguicao_suspeito">Perseguição / Suspeito</option>
              <option value="saude_desmaio">Saúde ou Desmaio</option>
              <option value="area_escura_risco">Área Escura / Risco</option>
            </select>
          </div>
        </div>

        {/* Tabela de Alertas */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum registro de alerta encontrado com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => {
                const createdAtDate = new Date(alert.createdAt);
                const isSignalLost = alert.signalLost;

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 font-mono">
                          {alert.protocolNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {alert.userProfile.role}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003d71]">
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

                      {alert.smsNotificationsSent && alert.smsNotificationsSent.length > 0 && (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          ✓ {alert.smsNotificationsSent.length} SMS de emergência disparados para contatos cadastrados
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end justify-between shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
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

                      {onSelectAlertToInspect && (
                        <button
                          onClick={() => {
                            onSelectAlertToInspect(alert);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#003d71] hover:bg-[#002b50] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Ver no Mapa & Rota
                        </button>
                      )}
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
            Mostrando {filteredAlerts.length} de {alerts.length} registros no banco de dados.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
