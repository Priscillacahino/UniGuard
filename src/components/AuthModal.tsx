import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { SoundEffects } from '../utils/sound';
import {
  Shield,
  Lock,
  Mail,
  User,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export type AuthMode = 'login' | 'forgot_password' | 'reset_password' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentProfile,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Campos de Login
  const [loginEmail, setLoginEmail] = useState(currentProfile.email || 'mariana.albuquerque@academico.ufpb.br');
  const [loginPassword, setLoginPassword] = useState('ufpb2026');
  const [showPassword, setShowPassword] = useState(false);
  
  // Campos de Recuperação de Senha
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [generatedResetToken, setGeneratedResetToken] = useState<string | null>(null);

  // Campos de Redefinição de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // Campos de Cadastro / Registro
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('estudante');
  const [registerDoc, setRegisterDoc] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerDept, setRegisterDept] = useState('');
  const [registerPass, setRegisterPass] = useState('');
  const [registerConfirmPass, setRegisterConfirmPass] = useState('');
  const [registerContactName, setRegisterContactName] = useState('');
  const [registerContactPhone, setRegisterContactPhone] = useState('');

  // Loading geral de submissão
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Resetar mensagens ao trocar de tela
  useEffect(() => {
    setStatusMessage(null);
  }, [mode]);

  if (!isOpen) return null;

  // ==========================================
  // VALIDAÇÕES EM TEMPO REAL (INLINE VALIDATION)
  // ==========================================
  const isValidUfpbEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      emailRegex.test(trimmed) &&
      (trimmed.endsWith('@academicos.ufpb.br') || trimmed.endsWith('@academico.ufpb.br') || trimmed.endsWith('@ufpb.br'))
    );
  };

  const isPasswordStrongEnough = (pass: string) => pass.length >= 6;

  // Validação Login
  const isLoginEmailValid = isValidUfpbEmail(loginEmail);
  const isLoginPassValid = isPasswordStrongEnough(loginPassword);
  const isLoginFormValid = isLoginEmailValid && isLoginPassValid;

  // Validação Esqueci Senha
  const isForgotEmailValid = isValidUfpbEmail(forgotEmail);

  // Validação Redefinir Senha
  const isNewPassValid = isPasswordStrongEnough(newPassword);
  const isConfirmPassMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isResetFormValid = isNewPassValid && isConfirmPassMatch;

  // Validação Cadastro
  const isRegNameValid = registerName.trim().length >= 3;
  const isRegDocValid = registerDoc.trim().length >= 4;
  const isRegEmailValid = isValidUfpbEmail(registerEmail);
  const isRegPhoneValid = registerPhone.replace(/\D/g, '').length >= 10;
  const isRegPassValid = isPasswordStrongEnough(registerPass);
  const isRegConfirmPassMatch = registerPass.length > 0 && registerPass === registerConfirmPass;
  const isRegisterFormValid =
    isRegNameValid &&
    isRegDocValid &&
    isRegEmailValid &&
    isRegPhoneValid &&
    isRegPassValid &&
    isRegConfirmPassMatch;

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginFormValid) return;

    SoundEffects.playClick();
    setIsLoading(true);
    setStatusMessage(null);

    // Simula validação com delay realista
    setTimeout(() => {
      setIsLoading(false);
      SoundEffects.playSuccess();
      const updatedProfile: UserProfile = {
        ...currentProfile,
        email: loginEmail,
      };
      onLoginSuccess(updatedProfile);
    }, 700);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isForgotEmailValid) return;

    SoundEffects.playClick();
    setIsSendingReset(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsSendingReset(false);
      setResetSentSuccess(true);
      const token = `tok_${Math.random().toString(36).substring(2, 10)}`;
      setGeneratedResetToken(token);
      SoundEffects.playNotification();
    }, 1100);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResetFormValid) return;

    SoundEffects.playClick();
    setIsResetting(true);

    setTimeout(() => {
      setIsResetting(false);
      setResetCompleted(true);
      SoundEffects.playSuccess();
    }, 900);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisterFormValid) return;

    SoundEffects.playClick();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      SoundEffects.playSuccess();

      const newProfile: UserProfile = {
        id: `user_${Date.now()}`,
        name: registerName,
        documentNumber: registerDoc,
        role: registerRole,
        phone: registerPhone,
        email: registerEmail,
        department: registerDept || 'Centro de Ensino UFPB',
        emergencyContactName: registerContactName || 'Familiar / Contato',
        emergencyContactPhone: registerContactPhone || registerPhone,
        emergencyContactRelation: 'Contato Principal',
        emergencyContacts: registerContactName
          ? [
              {
                id: `c_${Date.now()}`,
                name: registerContactName,
                phone: registerContactPhone,
                relation: 'Familiar',
                isNotifySms: true,
              },
            ]
          : currentProfile.emergencyContacts,
        registeredAt: new Date().toISOString(),
      };

      onLoginSuccess(newProfile);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-auth-flow"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[92vh]"
      >
        {/* TOPO COM IDENTIDADE VISUAL INSTITUCIONAL */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#003d71] text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Guardião <span className="text-[#003d71]">UFPB</span>
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100/70 text-[#003d71]">
                  Acesso Institucional
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Segurança, Foto no SOS & Telemetria em Todos os Campi
              </p>
            </div>
          </div>

          {/* Botão de Voltar / Fechar se tiver onClose disponível */}
          {onClose && (
            <button
              onClick={() => {
                SoundEffects.playClick();
                onClose();
              }}
              title="Voltar / Fechar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* MENSAGEM DE STATUS GERAL */}
        {statusMessage && (
          <div
            className={`mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* CORPO PRINCIPAL COM SCROLL */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* ============================================================ */}
          {/* 1. TELA DE LOGIN                                             */}
          {/* ============================================================ */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#003d71] tracking-wider">
                  Entrar no Sistema
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Autenticação Universitária
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Utilize seu e-mail institucional (@academicos.ufpb.br ou @ufpb.br) para acessar.
                </p>
              </div>

              {/* Campo E-mail Institucional */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  E-mail Institucional UFPB *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.nome@academicos.ufpb.br"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      loginEmail.length > 0 && !isLoginEmailValid
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                        : loginEmail.length > 0 && isLoginEmailValid
                        ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    } focus:outline-none`}
                  />
                  {loginEmail.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {isLoginEmailValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Validação inline em tempo real */}
                {loginEmail.length > 0 && !isLoginEmailValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    O e-mail deve pertencer ao domínio @academicos.ufpb.br ou @ufpb.br
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Senha de Acesso *
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      loginPassword.length > 0 && !isLoginPassValid
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                        : loginPassword.length > 0 && isLoginPassValid
                        ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                    } focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Validação inline de senha */}
                {loginPassword.length > 0 && !isLoginPassValid && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    A senha deve ter no mínimo 6 caracteres.
                  </p>
                )}

                {/* LINK DISCRETO: ESQUECI MINHA SENHA (CONFORME SOLICITADO) */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      SoundEffects.playClick();
                      setForgotEmail(loginEmail && isValidUfpbEmail(loginEmail) ? loginEmail : '');
                      setResetSentSuccess(false);
                      setMode('forgot_password');
                    }}
                    className="text-[11px] text-slate-500 hover:text-[#003d71] font-semibold hover:underline cursor-pointer transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>

              {/* BOTÃO DE ENTRAR (DESABILITADO ENQUANTO NÃO VALIDAR) */}
              <button
                type="submit"
                disabled={!isLoginFormValid || isLoading}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isLoginFormValid && !isLoading
                    ? 'bg-[#003d71] hover:bg-[#002b50] text-white cursor-pointer hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Guardião UFPB</span>
                  </>
                )}
              </button>

              {/* Rodapé do Login: Criar conta */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Primeiro acesso na plataforma?</span>
                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setMode('register');
                  }}
                  className="font-extrabold text-[#003d71] hover:underline cursor-pointer"
                >
                  Cadastre-se aqui
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* 2. TELA: ESQUECI MINHA SENHA                                 */}
          {/* ============================================================ */}
          {mode === 'forgot_password' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setMode('login');
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-xs uppercase font-extrabold text-[#003d71] tracking-wider">
                    Recuperação de Acesso
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Esqueceu sua senha?
                  </h3>
                </div>
              </div>

              {!resetSentSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Informe seu <strong>E-mail Institucional</strong> cadastrado. Enviaremos um link seguro para a redefinição da sua senha.
                  </p>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      E-mail Institucional (@academicos.ufpb.br ou @ufpb.br) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.nome@academicos.ufpb.br"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          forgotEmail.length > 0 && !isForgotEmailValid
                            ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                            : forgotEmail.length > 0 && isForgotEmailValid
                            ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                        } focus:outline-none`}
                      />
                      {forgotEmail.length > 0 && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {isForgotEmailValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {forgotEmail.length > 0 && !isForgotEmailValid && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        O e-mail precisa conter o domínio institucional da UFPB.
                      </p>
                    )}
                  </div>

                  {/* BOTÃO COM ESTADO DE CARREGAMENTO (SPINNER) E DESABILITADO SE INVÁLIDO */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        SoundEffects.playClick();
                        setMode('login');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Voltar ao Login
                    </button>

                    <button
                      type="submit"
                      disabled={!isForgotEmailValid || isSendingReset}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isForgotEmailValid && !isSendingReset
                          ? 'bg-[#003d71] hover:bg-[#002b50] text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                      }`}
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Enviando link de recuperação...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Enviar Link de Recuperação</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* FEEDBACK DE SUCESSO EXATO CONFORME SOLICITADO */
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>E-mail de Recuperação Disparado!</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Se o e-mail informado estiver cadastrado, um link de recuperação foi enviado para a sua caixa de entrada.
                    </p>
                  </div>

                  {/* SIMULADOR DE E-MAIL INSTITUCIONAL RECEBIDO */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5 font-bold text-blue-400">
                        <Mail className="w-3.5 h-3.5" /> Caixa de Entrada UFPB (Simulação)
                      </span>
                      <span>Agora</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">De: seguranca@ufpb.br (Guardião UFPB)</div>
                      <div className="text-slate-400 text-[11px]">Para: {forgotEmail}</div>
                      <div className="mt-2 text-slate-300">
                        Você solicitou a redefinição de senha para sua conta do Guardião UFPB. Clique no link seguro abaixo para criar sua nova senha:
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        SoundEffects.playClick();
                        setMode('reset_password');
                        setNewPassword('');
                        setConfirmPassword('');
                        setResetCompleted(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir: guardiao-ufpb.ufpb.br/redefinir-senha?token={generatedResetToken}</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        SoundEffects.playClick();
                        setMode('login');
                      }}
                      className="text-xs text-[#003d71] font-bold hover:underline cursor-pointer"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. TELA: REDEFINIR SENHA                                      */}
          {/* ============================================================ */}
          {mode === 'reset_password' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Página Segura • Token Validado
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Criar Nova Senha
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Informe e confirme sua nova senha para reestabelecer o acesso institucional.
                </p>
              </div>

              {!resetCompleted ? (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Nova Senha */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Nova Senha *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          newPassword.length > 0 && !isNewPassValid
                            ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                            : newPassword.length > 0 && isNewPassValid
                            ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                        } focus:outline-none`}
                      />
                    </div>

                    {newPassword.length > 0 && !isNewPassValid && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        A nova senha deve ter no mínimo 6 caracteres.
                      </p>
                    )}
                  </div>

                  {/* Confirmação da Senha */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Confirme a Nova Senha *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          confirmPassword.length > 0 && !isConfirmPassMatch
                            ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                            : confirmPassword.length > 0 && isConfirmPassMatch
                            ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-600'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#003d71]'
                        } focus:outline-none`}
                      />
                      {confirmPassword.length > 0 && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {isConfirmPassMatch ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {confirmPassword.length > 0 && !isConfirmPassMatch && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        As senhas não coincidem.
                      </p>
                    )}
                  </div>

                  {/* BOTÃO DE CONFIRMAR REDEFINIÇÃO */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        SoundEffects.playClick();
                        setMode('login');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={!isResetFormValid || isResetting}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isResetFormValid && !isResetting
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                      }`}
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Atualizando senha...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Salvar Nova Senha</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* FEEDBACK CONFORME SOLICITADO: Senha alterada com sucesso! Clique aqui para fazer login */
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-emerald-900">
                      Senha alterada com sucesso!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Sua credencial foi atualizada no banco institucional com criptografia.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      SoundEffects.playClick();
                      setLoginPassword(newPassword);
                      setMode('login');
                    }}
                    className="w-full py-3 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white font-extrabold text-xs shadow transition-all cursor-pointer"
                  >
                    Clique aqui para fazer login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. TELA: CADASTRO INSTITUCIONAL (COM BOTÃO DE VOLTAR)        */}
          {/* ============================================================ */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-[#003d71] tracking-wider">
                    Primeiro Acesso
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Cadastro de Discente / Servidor
                  </h3>
                </div>

                {/* BOTÃO DE VOLTAR NO CADASTRO CONFORME SOLICITADO */}
                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setMode('login');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Nome */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Ex: Lucas Gabriel da Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                  {registerName.length > 0 && !isRegNameValid && (
                    <p className="text-[10px] text-rose-600 font-medium">Informe ao menos 3 caracteres.</p>
                  )}
                </div>

                {/* Vínculo */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Vínculo na UFPB *</label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  >
                    <option value="estudante">Estudante (Graduação / Pós)</option>
                    <option value="docente">Docente / Professor(a)</option>
                    <option value="tecnico">Técnico-Administrativo</option>
                    <option value="terceirizado">Prestador de Serviço</option>
                    <option value="visitante">Comunidade Externa</option>
                  </select>
                </div>

                {/* Matrícula / SIAPE */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Matrícula / SIAPE *</label>
                  <input
                    type="text"
                    required
                    value={registerDoc}
                    onChange={(e) => setRegisterDoc(e.target.value)}
                    placeholder="Ex: 20240012345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#003d71]"
                  />
                  {registerDoc.length > 0 && !isRegDocValid && (
                    <p className="text-[10px] text-rose-600 font-medium">Matrícula obrigatória.</p>
                  )}
                </div>

                {/* E-mail Institucional */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700">E-mail Institucional *</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="usuario@academicos.ufpb.br"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                  {registerEmail.length > 0 && !isRegEmailValid && (
                    <p className="text-[10px] text-rose-600 font-medium">
                      Obrigatório sufixo @academicos.ufpb.br ou @ufpb.br
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="(83) 99999-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                </div>

                {/* Setor Habitual */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Centro Habitual</label>
                  <input
                    type="text"
                    value={registerDept}
                    onChange={(e) => setRegisterDept(e.target.value)}
                    placeholder="Ex: CT, CCHLA, CCS..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Criar Senha *</label>
                  <input
                    type="password"
                    required
                    value={registerPass}
                    onChange={(e) => setRegisterPass(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                  {registerPass.length > 0 && !isRegPassValid && (
                    <p className="text-[10px] text-rose-600 font-medium">Mínimo 6 caracteres.</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Confirmar Senha *</label>
                  <input
                    type="password"
                    required
                    value={registerConfirmPass}
                    onChange={(e) => setRegisterConfirmPass(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71]"
                  />
                  {registerConfirmPass.length > 0 && !isRegConfirmPassMatch && (
                    <p className="text-[10px] text-rose-600 font-medium">As senhas não coincidem.</p>
                  )}
                </div>

                {/* Contato de Emergência para SMS */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Contato de Emergência para Notificação Automática por SMS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={registerContactName}
                      onChange={(e) => setRegisterContactName(e.target.value)}
                      placeholder="Nome (Ex: Mãe / Pai / Cônjuge)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#003d71]"
                    />
                    <input
                      type="tel"
                      value={registerContactPhone}
                      onChange={(e) => setRegisterContactPhone(e.target.value)}
                      placeholder="Telefone com DDD (Ex: 83 98888-0000)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#003d71]"
                    />
                  </div>
                </div>
              </div>

              {/* BOTÕES COM VOLTAR E CADASTRAR DESABILITADO SE INVÁLIDO */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setMode('login');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Voltar ao Login
                </button>

                <button
                  type="submit"
                  disabled={!isRegisterFormValid || isLoading}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isRegisterFormValid && !isLoading
                      ? 'bg-[#003d71] hover:bg-[#002b50] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span>Concluir Cadastro & Entrar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
