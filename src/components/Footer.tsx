import React from 'react';
import { ShieldCheck, Info, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer id="app-footer" className="w-full border-t border-slate-200 bg-white/90 backdrop-blur-md text-slate-500 py-4 px-4 sm:px-6 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Lado Esquerdo: Identificação do Projeto & UFPB */}
        <div className="flex items-center gap-2 text-slate-700">
          <div className="w-6 h-6 rounded-lg bg-[#003d71]/10 text-[#003d71] flex items-center justify-center border border-[#003d71]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-tight text-slate-800">Guardião <span className="text-[#003d71]">UFPB</span></span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" /> Campus I - João Pessoa
          </span>
        </div>

        {/* Centro: Aviso Discreto de Protótipo Conceitual */}
        <div className="text-center text-xs">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
            Protótipo Conceitual • Dados Simulados
          </span>
        </div>

        {/* Lado Direito: Copyright e Autoria Discreta */}
        <div className="flex items-center gap-3">
          <button
            id="btn-about-project"
            onClick={onOpenAbout}
            className="text-xs text-slate-600 hover:text-[#003d71] font-medium transition-colors flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            Sobre o Projeto
          </button>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium tracking-tight">
            © 2026 Priscilla S Cahino. Todos os direitos reservados.
          </span>
        </div>

      </div>
    </footer>
  );
};
