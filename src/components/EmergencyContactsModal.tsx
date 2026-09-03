import React, { useState } from 'react';
import { EmergencyContact } from '../types';
import { Plus, Trash2, Phone, User, MessageSquare, Check, AlertCircle } from 'lucide-react';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onSaveContacts: (contacts: EmergencyContact[]) => void;
  onSendTestSms?: (contact: EmergencyContact) => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onSaveContacts,
  onSendTestSms,
}) => {
  const [contactList, setContactList] = useState<EmergencyContact[]>(contacts || []);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Familiar');
  const [newNotifySms, setNewNotifySms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setErrorMsg('Informe o nome e o telefone do contato de emergência.');
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      relation: newRelation,
      isNotifySms: newNotifySms,
    };

    const updated = [...contactList, newContact];
    setContactList(updated);
    setNewName('');
    setNewPhone('');
    setErrorMsg('');
  };

  const handleRemoveContact = (id: string) => {
    setContactList(contactList.filter((c) => c.id !== id));
  };

  const handleToggleNotify = (id: string) => {
    setContactList(
      contactList.map((c) => (c.id === id ? { ...c, isNotifySms: !c.isNotifySms } : c))
    );
  };

  const handleSaveAndClose = () => {
    onSaveContacts(contactList);
    onClose();
  };

  const triggerTestSms = (c: EmergencyContact) => {
    if (onSendTestSms) {
      onSendTestSms(c);
      setTestSentMsg(`Simulação de SMS disparada para ${c.name} (${c.phone})`);
      setTimeout(() => setTestSentMsg(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="modal-emergency-contacts"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003d71] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Contatos de Emergência</h2>
              <p className="text-xs text-slate-500 font-medium">
                Pessoas de confiança que receberão SMS com sua localização exata ao acionar o SOS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {testSentMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSentMsg}</span>
          </div>
        )}

        {/* Form to add new contact */}
        <form onSubmit={handleAddContact} className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5 text-[#003d71]" /> Adicionar Novo Contato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="sm:col-span-1">
              <label className="block text-slate-600 font-semibold mb-1">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Cláudia Medeiros"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] font-medium"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-600 font-semibold mb-1">Telefone (DDD + Número)</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="(83) 98888-0000"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] font-medium"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-600 font-semibold mb-1">Grau de Relação</label>
              <select
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#003d71] font-medium cursor-pointer"
              >
                <option value="Mãe / Pai">Mãe / Pai</option>
                <option value="Irmão / Irmã">Irmão / Irmã</option>
                <option value="Cônjuge / Parceiro(a)">Cônjuge / Parceiro(a)</option>
                <option value="Amigo(a) / Colega">Amigo(a) / Colega</option>
                <option value="Coordenação / Setor">Coordenação / Setor</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={newNotifySms}
                onChange={(e) => setNewNotifySms(e.target.checked)}
                className="rounded text-[#003d71] focus:ring-[#003d71] cursor-pointer"
              />
              <span>Disparar SMS de emergência automaticamente ao acionar SOS</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#003d71] hover:bg-[#002b50] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {errorMsg && (
            <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </div>
          )}
        </form>

        {/* Contacts List */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <span>Contatos Salvos ({contactList.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">SMS integrado</span>
          </div>

          {contactList.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Nenhum contato de emergência cadastrado. Adicione seus contatos para que recebam alertas automáticos via SMS.
            </div>
          ) : (
            contactList.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {c.relation}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">{c.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleNotify(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      c.isNotifySms
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                    title="Alternar envio de SMS automático"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {c.isNotifySms ? 'SMS Ativo' : 'SMS Desativado'}
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerTestSms(c)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-[#003d71] border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    Testar SMS
                  </button>

                  <button
                    onClick={() => handleRemoveContact(c.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="Remover contato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500 text-[11px]">
            * O SMS incluirá suas coordenadas e link direto para o mapa de monitoramento UFPB.
          </div>
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 rounded-xl bg-[#003d71] hover:bg-[#002b50] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Salvar Contatos
          </button>
        </div>
      </div>
    </div>
  );
};
