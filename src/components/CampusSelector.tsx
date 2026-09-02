import React, { useState } from 'react';
import { UfpbCampusId, UfpbCampusInfo } from '../types';
import { UFPB_CAMPI } from '../data/ufpbData';
import { MapPin, Building2, Check, ChevronDown, Phone, Radio, Shield, Navigation } from 'lucide-react';
import { SoundEffects } from '../utils/sound';

interface CampusSelectorProps {
  selectedCampusId: UfpbCampusId;
  onSelectCampus: (campusId: UfpbCampusId) => void;
  compact?: boolean;
}

export const CampusSelector: React.FC<CampusSelectorProps> = ({
  selectedCampusId,
  onSelectCampus,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentCampus = UFPB_CAMPI.find((c) => c.id === selectedCampusId) || UFPB_CAMPI[0];

  const handleSelect = (campus: UfpbCampusInfo) => {
    SoundEffects.playClick();
    onSelectCampus(campus.id);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#003d71] border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Alterar Campus da UFPB"
        >
          <Building2 className="w-3.5 h-3.5 text-[#003d71]" />
          <span className="max-w-[140px] truncate">{currentCampus.shortName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 z-40 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 animate-in fade-in duration-150 text-slate-800">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selecione sua Localidade:
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  Campi Universitários da UFPB
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 pt-1">
                {UFPB_CAMPI.map((campus) => {
                  const isSelected = campus.id === selectedCampusId;
                  return (
                    <button
                      key={campus.id}
                      onClick={() => handleSelect(campus)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-[#003d71] font-bold border border-blue-200 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{campus.shortName}</span>
                          {isSelected && <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 rounded text-[#003d71] font-bold">Atual</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">{campus.city}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#003d71] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003d71] flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Campo de Atuação & Localidade
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">
              Campus Atual da UFPB
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-[#003d71] hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{isOpen ? 'Recolher' : 'Mudar Campus'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Cartão de Informação do Campus Selecionado */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{currentCampus.name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003d71] text-white">
              {currentCampus.code}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-500" /> {currentCampus.city}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600" /> {currentCampus.emergencyRadioChannel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${currentCampus.securityPostPhone.replace(/\D/g, '')}`}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#003d71] text-[11px] font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Phone className="w-3 h-3 text-[#003d71]" />
            <span>{currentCampus.securityPostPhone}</span>
          </a>
        </div>
      </div>

      {/* Grade de Seleção Expandida */}
      {isOpen && (
        <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
          <span className="text-[11px] text-slate-500 font-medium block">
            Selecione em qual polo ou campus você se encontra no momento:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {UFPB_CAMPI.map((campus) => {
              const isSelected = campus.id === selectedCampusId;
              return (
                <div
                  key={campus.id}
                  onClick={() => handleSelect(campus)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-2 border-[#003d71] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{campus.shortName}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {campus.description}
                    </p>
                    <div className="text-[10px] font-mono text-[#003d71] font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      Posto: {campus.securityPostPhone}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#003d71] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
