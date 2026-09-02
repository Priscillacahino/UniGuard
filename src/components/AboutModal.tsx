import React from 'react';
import { Shield, MapPin, Radio, WifiOff, Users, AlertTriangle, CheckCircle2, X, FileText } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-about-guardiao"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003d71] border border-blue-100 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Guardião UFPB
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sistema de Apoio à Segurança e Geolocalização Universitária
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
          
          {/* Apresentação */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium">
            <p>
              O <strong>Guardião UFPB</strong> é um projeto em desenvolvimento com o objetivo de contribuir diretamente para a segurança de estudantes, professores, servidores técnico-administrativos e visitantes dentro do campus da Universidade Federal da Paraíba (UFPB).
            </p>
          </div>

          {/* Pilares Funcionais */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Como Funciona o Sistema
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-[#003d71] h-fit">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">1. Identificação & Acesso</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Cadastro rápido com vínculo institucional, contatos de emergência e autorização de geolocalização.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 h-fit">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">2. Geofencing no Campus</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Reconhecimento automático da presença do usuário dentro dos limites territoriais do Campus I.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600 h-fit">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">3. Botão SOS de Emergência</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Disparo instantâneo com envio da localização em tempo real e nível de bateria para a segurança.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 h-fit">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">4. Monitoramento de Queda de Sinal</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Caso a conexão seja interrompida, o sistema trava e destaca a <strong>última localização conhecida</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Painel da Segurança */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
            <Radio className="w-5 h-5 text-[#003d71] shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-900">Painel Operacional da Segurança</h4>
              <p className="text-slate-600 mt-0.5 font-medium">
                A equipe de segurança dispõe de uma central em tempo real para despachar motopatrulhas e viaturas, orientando buscas com base nas últimas coordenadas registradas.
              </p>
            </div>
          </div>

          {/* Aviso Legal & Protótipo */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aviso de Protótipo Conceitual</span>
            </div>
            <p className="font-medium leading-relaxed">
              Atualmente, o Guardião UFPB é um protótipo conceitual para fins acadêmicos e de pesquisa. Os dados, simulações e localizações apresentados são simulações interativas e não possuem integração ativa com serviços oficiais de segurança pública neste ambiente demonstrativo.
            </p>
          </div>

          {/* Autoria e Direitos Autorais */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <FileText className="w-3.5 h-3.5 text-[#003d71]" />
              <span>Autoria e Concepção do Projeto</span>
            </div>
            <div className="text-slate-600 font-semibold">
              © 2026 Priscilla S Cahino. Todos os direitos reservados.
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
