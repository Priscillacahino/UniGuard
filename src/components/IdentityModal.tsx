import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { User, Phone, HeartHandshake, Building, MapPin, Check, Shield, AlertCircle } from 'lucide-react';

interface IdentityModalProps {
  isOpen: boolean;
  onSave: (profile: UserProfile, grantLocation: boolean) => void;
  initialProfile: UserProfile;
  isFirstTime?: boolean;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  onSave,
  initialProfile,
  isFirstTime = false,
}) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [allowLocation, setAllowLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.documentNumber.trim() || !formData.phone.trim()) {
      setErrorMsg('Por favor, preencha os campos obrigatórios (Nome, Matrícula/Documento e Telefone).');
      return;
    }
    setErrorMsg('');
    onSave(formData, allowLocation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-identity-onboarding"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800"
      >
        {/* Cabeçalho */}
        <div className="flex items-start gap-4 mb-6 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003d71] border border-blue-100 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#003d71]">
              {isFirstTime ? 'Primeira Utilização' : 'Perfil do Usuário'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isFirstTime ? 'Identificação do Usuário UFPB' : 'Atualizar Dados de Identificação'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Suas informações são utilizadas exclusivamente pela equipe de segurança em situações de alerta.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#003d71]" /> Dados Pessoais & Vínculo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Mariana Medeiros"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Vínculo na UFPB *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs cursor-pointer font-medium"
                >
                  <option value="estudante">Estudante (Graduação / Pós)</option>
                  <option value="docente">Docente / Professor(a)</option>
                  <option value="tecnico">Técnico-Administrativo</option>
                  <option value="terceirizado">Prestador de Serviço / Terceirizado</option>
                  <option value="visitante">Visitante / Comunidade Externa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Matrícula / SIAPE / CPF *</label>
                <input
                  type="text"
                  required
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="Ex: 20220104892"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(83) 99999-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Centro / Setor Habitual</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: CT, CCHLA, Reitoria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Contato de Emergência */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-500" /> Contato de Emergência (Familiar / Amigo)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nome do Contato</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Ex: Maria (Mãe)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Telefone do Contato</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="(83) 98888-1111"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Parentesco</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  placeholder="Ex: Mãe / Cônjuge"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Observações Médicas */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-slate-600 mb-1 font-semibold">
              Observações Médicas Relevantes (opcional - alergias, tipo sanguíneo, etc.)
            </label>
            <input
              type="text"
              value={formData.medicalNotes || ''}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              placeholder="Ex: Diabético, Alergia a medicamentos..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#003d71] text-xs font-medium"
            />
          </div>

          {/* Autorização de Localização (Geolocalização) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <input
                id="check-allow-geo"
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#003d71] focus:ring-[#003d71] cursor-pointer"
              />
              <label htmlFor="check-allow-geo" className="cursor-pointer text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Autorizo o acesso e monitoramento da geolocalização do dispositivo
                </span>
                <p className="text-slate-500 mt-1 font-medium leading-relaxed">
                  Permite identificar sua presença no Campus I da UFPB e enviar sua posição exata para a equipe de vigilância em caso de emergência ou perda de sinal.
                </p>
              </label>
            </div>
          </div>

          {/* Botão de Conclusão */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isFirstTime ? 'Confirmar Identificação e Iniciar' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
