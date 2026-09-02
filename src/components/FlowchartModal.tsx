import React, { useState } from 'react';
import {
  GitMerge,
  Smartphone,
  Camera,
  MapPin,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Eye,
  X,
  Building2,
  Layers,
  FileCheck,
} from 'lucide-react';

interface FlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowchartModal: React.FC<FlowchartModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      tag: 'FASE 1: ACESSO & IDENTIFICAÇÃO',
      title: 'Identificação Institucional e Permissões',
      actor: 'Discente / Servidor(a)',
      icon: Smartphone,
      color: 'bg-blue-600',
      description:
        'O usuário realiza o acesso com matrícula SIGAA/UFPB, cadastra contatos de confiança para SMS de emergência e concede permissão de localização e câmera.',
      details: [
        'Vínculo acadêmico validado com centro de ensino',
        'Contatos de emergência cadastrados para alerta SMS',
        'Seleção flexível do Campus da UFPB (João Pessoa, Areia, Bananeiras, Litoral Norte, Mangabeira)',
      ],
    },
    {
      step: 2,
      tag: 'FASE 2: MONITORAMENTO PASSIVO',
      title: 'Zonas Seguras & Georreferenciamento Preventivo',
      actor: 'Módulo de Telemetria GPS',
      icon: MapPin,
      color: 'bg-emerald-600',
      description:
        'O sistema mapeia o deslocamento do usuário em segundo plano (breadcrumbs). Detecta se o discente está em Zonas de Segurança Delimitadas ou em áreas externas.',
      details: [
        'Gravação configurável do rastro de deslocamento',
        'Detecção inteligente de Zonas Seguras (Safe Zones) no campus selecionado',
        'Fixação automática da Última Localização Conhecida caso ocorra perda de sinal ou bateria baixa',
      ],
    },
    {
      step: 3,
      tag: 'FASE 3: GATILHO DE EMERGÊNCIA',
      title: 'Acionamento do Botão de Pânico SOS',
      actor: 'Usuário em Situação de Risco',
      icon: AlertTriangle,
      color: 'bg-red-600',
      description:
        'Ao tocar no botão de SOS (ou segurar por 2 segundos em Zonas Seguras), o protocolo de urgência é disparado com contagem de cancelamento rápido.',
      details: [
        'Botão tátil com feedback sonoro e háptico',
        'Prevenção contra falsos disparos com trava de 2s em áreas de alta circulação',
        'Categorização rápida (ameaça, saúde, perseguição, área escura)',
      ],
    },
    {
      step: 4,
      tag: 'FASE 4: CAPTURA VISUAL & METADADOS',
      title: 'Foto Autorizada Instantânea + Coordenadas',
      actor: 'Câmera do Celular & Sensores',
      icon: Camera,
      color: 'bg-purple-600',
      description:
        'No exato momento do acionamento do SOS, o aplicativo tira uma foto com a câmera do celular (frontal ou traseira) e grava as coordenadas geográficas exatas.',
      details: [
        'Captura imediata sem necessidade de enquadramento complexo',
        'Carimbo forense digital: Protocolo, Lat/Lng, Data/Hora e Nível de Bateria',
        'Disparo de SMS automático aos familiares com link de resgate',
      ],
    },
    {
      step: 5,
      tag: 'FASE 5: TRANSMISSÃO TÁTICA',
      title: 'Envio Imediato para a Central de Segurança Multi-Campi',
      actor: 'Rede Universitária / Central PU',
      icon: Radio,
      color: 'bg-amber-600',
      description:
        'Os dados do chamado — incluindo a imagem da ocorrência e a posição geográfica viva (ou último local conhecido) — chegam em tempo real à equipe de segurança.',
      details: [
        'Alerta sonoro na central com sirene de prioridade máxima',
        'Exibição da foto da vítima e do entorno no painel de despacho',
        'Direcionamento para o campus específico da UFPB onde ocorreu o fato',
      ],
    },
    {
      step: 6,
      tag: 'FASE 6: DESPACHO & RESGATE',
      title: 'Despacho da Ronda e Atendimento no Local',
      actor: 'Viaturas / Motopatrulhas / Vigilantes',
      icon: ShieldCheck,
      color: 'bg-[#003d71]',
      description:
        'A central despacha a viatura mais próxima com rota calculada. A equipe chega ao local munida da foto e do histórico de passos da vítima.',
      details: [
        'Comunicação via rádio na frequência do respectivo campus',
        'Status operacional atualizado em tempo real (Em deslocamento -> No local -> Concluído)',
        'Vítima pode sinalizar "Estou Seguro" ou acompanhar a aproximação da equipe',
      ],
    },
    {
      step: 7,
      tag: 'FASE 7: AUDITORIA & REGISTRO',
      title: 'Auditoria Forense e Relatório Operacional',
      actor: 'Comissão de Segurança Universitária',
      icon: FileCheck,
      color: 'bg-slate-700',
      description:
        'Cada chamado fica arquivado com protocolo único, foto preservada e coordenadas para subsidiar melhorias na iluminação, patrulhamento e inquéritos.',
      details: [
        'Exportação de planilhas CSV para estatísticas',
        'Identificação de pontos críticos de iluminação e segurança',
        'Preservação probatória com carimbo de tempo inviolável',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-flowchart"
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Topo do Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#003d71] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Arquitetura de Processos
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Fluxograma Geral do Projeto Guardião UFPB
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Mapeamento de ponta a ponta: do disparo do botão SOS com foto no celular ao resgate tático nos campi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Fluxograma com Linha do Tempo e Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#003d71] shrink-0" />
              <div>
                <strong>Atuação Integrada em Todos os Campi da UFPB:</strong> João Pessoa (Campus I), Areia (Campus II), Bananeiras (Campus III), Litoral Norte (Campus IV) e Mangabeira (Campus V).
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#003d71] bg-white px-3 py-1 rounded-xl border border-blue-200 shrink-0">
              Protocolo Tático 2026
            </span>
          </div>

          <div className="relative space-y-4 pt-2">
            {steps.map((s, idx) => {
              const IconComp = s.icon;
              const isExpanded = activeStep === s.step;

              return (
                <div key={s.step} className="relative group">
                  {/* Linha conectora vertical */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-[-16px] w-0.5 bg-slate-200 -z-0" />
                  )}

                  <div
                    onClick={() => setActiveStep(isExpanded ? null : s.step)}
                    className={`relative z-10 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isExpanded
                        ? 'bg-white border-[#003d71] shadow-md ring-2 ring-[#003d71]/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}
                        >
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {s.tag}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                              Ator: {s.actor}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                            {s.step}. {s.title}
                          </h3>
                        </div>
                      </div>

                      <span className="text-xs text-[#003d71] font-bold self-end sm:self-center">
                        {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {s.description}
                    </p>

                    {/* Detalhes expansíveis */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in">
                        {s.details.map((item, dIdx) => (
                          <div
                            key={dIdx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Clique em qualquer etapa para visualizar os requisitos técnicos e operacionais.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white font-bold transition-all cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
