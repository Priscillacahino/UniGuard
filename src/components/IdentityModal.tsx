import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  User,
  Phone,
  HeartHandshake,
  MapPin,
  Check,
  Shield,
  AlertCircle,
  ArrowLeft,
  X,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { SoundEffects } from '../utils/sound';

interface IdentityModalProps {
  isOpen: boolean;
  onSave: (profile: UserProfile, grantLocation: boolean) => void;
  onClose?: () => void;
  initialProfile: UserProfile;
  isFirstTime?: boolean;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  onSave,
  onClose,
  initialProfile,
  isFirstTime = false,
}) => {
  const [formData, setFormData] = useState<UserProfile>(initialProfile);
  const [allowLocation, setAllowLocation] = useState(true);

  if (!isOpen) return null;

  // ==========================================
  // VALIDAÇÕES EM TEMPO REAL (INLINE VALIDATION)
  // ==========================================
  const isNameValid = formData.name.trim().length >= 3;
  const isDocValid = formData.documentNumber.trim().length >= 4;
  const rawPhone = formData.phone.replace(/\D/g, '');
  const isPhoneValid = rawPhone.length >= 10;
  
  const isValidUfpbEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      regex.test(trimmed) &&
      (trimmed.endsWith('@academicos.ufpb.br') ||
        trimmed.endsWith('@academico.ufpb.br') ||
        trimmed.endsWith('@ufpb.br'))
    );
  };
  const isEmailValid = isValidUfpbEmail(formData.email || '');

  // Formulário válido somente se todos os campos obrigatórios atenderem aos critérios
  const isFormValid = isNameValid && isDocValid && isPhoneValid && isEmailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    SoundEffects.playSuccess();
    onSave(formData, allowLocation);
  };

  const handleCancel = () => {
    SoundEffects.playClick();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-identity-onboarding"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003d71] border border-blue-100 flex items-center justify-center shrink-0">
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

          {/* BOTÃO DE VOLTAR NO TOPO CASO NÃO HAJA ALTERAÇÕES */}
          {onClose && (
            <button
              onClick={handleCancel}
              title="Voltar sem alterar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#003d71]" /> Dados Pessoais & Vínculo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nome Completo */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-slate-600 font-semibold">Nome Completo *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mariana Medeiros de Albuquerque"
                    className={`w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-medium focus:outline-none ${
                      formData.name.length > 0 && !isNameValid
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : formData.name.length > 0 && isNameValid
                        ? 'border-emerald-300 bg-emerald-50/20 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    }`}
                  />
                  {formData.name.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isNameValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.name.length > 0 && !isNameValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> Informe ao menos 3 letras.
                  </p>
                )}
              </div>

              {/* Vínculo na UFPB */}
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">Vínculo na UFPB *</label>
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

              {/* Matrícula / SIAPE */}
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">Matrícula / SIAPE / CPF *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="Ex: 20220104892"
                    className={`w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-mono font-medium focus:outline-none ${
                      formData.documentNumber.length > 0 && !isDocValid
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : formData.documentNumber.length > 0 && isDocValid
                        ? 'border-emerald-300 bg-emerald-50/20 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    }`}
                  />
                  {formData.documentNumber.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isDocValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.documentNumber.length > 0 && !isDocValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> Digite uma matrícula ou documento válido (min. 4 dígitos).
                  </p>
                )}
              </div>

              {/* E-mail Institucional */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-slate-600 font-semibold">E-mail Institucional (@academicos.ufpb.br ou @ufpb.br) *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@academicos.ufpb.br"
                    className={`w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-medium focus:outline-none ${
                      formData.email.length > 0 && !isEmailValid
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : formData.email.length > 0 && isEmailValid
                        ? 'border-emerald-300 bg-emerald-50/20 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    }`}
                  />
                  {formData.email.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isEmailValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.email.length > 0 && !isEmailValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> O e-mail deve pertencer ao domínio @academicos.ufpb.br ou @ufpb.br
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">Telefone / WhatsApp *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(83) 99999-0000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-medium focus:outline-none ${
                      formData.phone.length > 0 && !isPhoneValid
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                        : formData.phone.length > 0 && isPhoneValid
                        ? 'border-emerald-300 bg-emerald-50/20 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    }`}
                  />
                  {formData.phone.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isPhoneValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.phone.length > 0 && !isPhoneValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> Digite um telefone com DDD (mínimo 10 dígitos).
                  </p>
                )}
              </div>

              {/* Centro Habitual */}
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">Centro / Setor Habitual</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: CT, CCHLA, Reitoria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Contato de Emergência */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-500" /> Contato de Emergência Principal (SMS Automático)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nome do Contato</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Ex: Maria (Mãe)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Telefone do Contato</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="(83) 98888-1111"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Parentesco</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  placeholder="Ex: Mãe / Cônjuge"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs font-medium"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] text-xs font-medium"
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
                  Permite identificar sua presença nos campi da UFPB e enviar sua posição exata para a equipe de vigilância em caso de emergência ou perda de sinal.
                </p>
              </label>
            </div>
          </div>

          {/* BOTÕES DE VOLTAR E SALVAR (DESABILITADO ENQUANTO INVÁLIDO) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* BOTÃO DE VOLTAR NO CADASTRO CONFORME SOLICITADO */}
            {onClose && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar sem Alterar</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 ${
                isFormValid
                  ? 'bg-[#003d71] hover:bg-[#002b50] text-white cursor-pointer hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isFirstTime ? 'Confirmar Identificação e Iniciar' : 'Salvar Alterações'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
