"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Loader2, CreditCard, AlertCircle, Smartphone, Banknote, Upload, Globe, Lock, Info, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdrawal';
  user: any;
  currentBalance: number;
}

const TransactionModal = ({ isOpen, onClose, type, user, currentBalance }: TransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'form' | 'details' | 'confirm'>(type === 'deposit' ? 'method' : 'method');
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const depositMethods = [
    { 
      group: "🌍 ÁFRICA",
      methods: [
        { id: 'express', name: 'Multicaixa Express', icon: Smartphone, color: 'text-blue-400', available: true, details: { label: 'Número Express', value: '933 271 690', owner: 'BORA SORTEIAR' } },
        { id: 'unitel', name: 'Unitel Money', icon: Smartphone, color: 'text-orange-400', available: true, details: { label: 'Pagamento de Serviços', entity: '00930', reference: '942259240', owner: 'BORA SORTEIAR' } },
      ]
    },
    { 
      group: "🌐 INTERNACIONAL",
      methods: [
        { id: 'airtm', name: 'Airtm', icon: Globe, color: 'text-blue-500', available: true, details: { label: 'E-mail Airtm', value: 'albertinoramod@gmail.com', notice: 'Este é o e-mail de uma empresa associada. O saldo leva em média 1h para refletir.' } },
      ]
    },
    { 
      group: "🇧🇷 BRASIL",
      methods: [
        { id: 'pix', name: 'PIX', icon: Zap, color: 'text-cyan-400', available: false, message: 'Este método não está disponível no seu país.' },
      ]
    },
    { 
      group: "🇵🇹 PORTUGAL",
      methods: [
        { id: 'mbway', name: 'MB Way', icon: Smartphone, color: 'text-red-400', available: false, message: 'Este método não está disponível no seu país.' },
      ]
    }
  ];

  const withdrawalMethods = [
    { id: 'express', name: 'Multicaixa Express', icon: Smartphone, available: !!profile?.express_number || !!profile?.bank_info },
  ];

  const handleAction = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }

    setLoading(true);
    try {
      let proofUrl = null;

      if (type === 'deposit' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      if (type === 'withdrawal') {
        if (val > currentBalance) {
          toast.error("Saldo insuficiente.");
          setLoading(false);
          return;
        }
        
        const targetAccount = profile?.express_number || profile?.bank_info;
        if (!targetAccount) throw new Error("Dados de saque não cadastrados no perfil.");

        const { error: balanceError } = await supabase.from('profiles').update({ balance: currentBalance - val }).eq('id', user.id);
        if (balanceError) throw balanceError;
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: type,
        amount: val,
        status: 'pending',
        payment_method: type === 'withdrawal' ? `Express: ${profile?.express_number || profile?.bank_info}` : method,
        proof_url: proofUrl
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user.id,
        title: type === 'deposit' ? 'Depósito Solicitado ⏳' : 'Saque Solicitado 💸',
        message: type === 'deposit' 
          ? `Sua recarga de ${val.toLocaleString()} Kz foi enviada para análise.` 
          : `Seu saque de ${val.toLocaleString()} Kz via EXPRESS foi solicitado.`,
        type: 'info'
      });

      if (type === 'deposit') {
        setStep('confirm');
      } else {
        toast.success("Saque solicitado com sucesso!");
        onClose();
      }
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const allDepositMethods = depositMethods.flatMap(g => g.methods);
  const selectedMethodData = allDepositMethods.find(m => m.id === method);

  const handleSelectMethod = (m: any) => {
    if (!m.available) {
      toast.error(m.message);
      return;
    }
    setMethod(m.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep('method');
        setAmount('');
        setMethod('');
        setFile(null);
      }
      onClose();
    }}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden">
        {step === 'method' && (
          <div className="p-8">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Escolha o Método</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40">Selecione como deseja realizar o {type === 'deposit' ? 'depósito' : 'saque'}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar pr-1 mb-8">
              {type === 'deposit' ? (
                depositMethods.map((group) => (
                  <div key={group.group} className="space-y-2">
                    <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">{group.group}</h4>
                    {group.methods.map((m) => (
                      <button 
                        key={m.id}
                        onClick={() => handleSelectMethod(m)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          method === m.id ? 'bg-purple-600 border-purple-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        } ${!m.available ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <m.icon size={20} className={method === m.id ? 'text-white' : m.color} />
                          <span className="font-black text-xs uppercase tracking-widest">{m.name}</span>
                        </div>
                        {method === m.id ? <CheckCircle2 size={18} /> : !m.available && <Lock size={14} className="text-white/20" />}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                withdrawalMethods.map((m) => (
                  <button 
                    key={m.id}
                    disabled={!m.available}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      method === m.id ? 'bg-purple-600 border-purple-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } ${!m.available ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <m.icon size={20} className={method === m.id ? 'text-white' : 'text-blue-400'} />
                      <div className="text-left">
                        <span className="font-black text-xs uppercase tracking-widest block">{m.name}</span>
                        {!m.available && <span className="text-[8px] font-bold text-red-400 uppercase">Não cadastrado no perfil</span>}
                      </div>
                    </div>
                    {method === m.id && <CheckCircle2 size={18} />}
                  </button>
                ))
              )}
            </div>
            
            <Button onClick={() => setStep('form')} disabled={!method} className="w-full h-14 rounded-2xl font-black premium-gradient shadow-lg shadow-purple-500/20">
              PRÓXIMO PASSO
            </Button>
          </div>
        )}

        {step === 'form' && (
          <div className="p-8">
            <DialogHeader className="text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${
                type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {type === 'deposit' ? <ArrowDownLeft size={40} /> : <ArrowUpRight size={40} />}
              </div>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
                {type === 'deposit' ? 'Valor do Depósito' : 'Valor do Saque'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 my-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Quanto deseja {type === 'deposit' ? 'depositar' : 'sacar'}? (Kz)</Label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-white/20 text-xl">Kz</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 rounded-2xl h-16 pl-14 text-2xl font-black"
                  />
                </div>
              </div>
              <Button onClick={() => type === 'deposit' ? setStep('details') : handleAction()} className="w-full h-16 rounded-2xl font-black text-lg premium-gradient">
                {loading ? <Loader2 className="animate-spin" /> : 'CONTINUAR'}
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')} className="w-full text-[10px] font-black uppercase tracking-widest text-white/20">Voltar</Button>
            </div>
          </div>
        )}

        {step === 'details' && type === 'deposit' && selectedMethodData && (
          <div className="p-8">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Dados para Pagamento</DialogTitle>
            </DialogHeader>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-5 mb-6">
              {selectedMethodData.id === 'unitel' ? (
                <>
                  <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(selectedMethodData.details.entity)}>
                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase mb-1">Entidade</p>
                      <p className="text-sm font-black tracking-wider text-purple-400">{selectedMethodData.details.entity}</p>
                    </div>
                    <Copy size={12} className="text-white/10 group-hover:text-white" />
                  </div>
                  <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(selectedMethodData.details.reference)}>
                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase mb-1">Referência</p>
                      <p className="text-sm font-black tracking-wider text-purple-400">{selectedMethodData.details.reference}</p>
                    </div>
                    <Copy size={12} className="text-white/10 group-hover:text-white" />
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(selectedMethodData.details.value)}>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">{selectedMethodData.details.label}</p>
                    <p className="text-sm font-black tracking-wider text-purple-400">{selectedMethodData.details.value}</p>
                  </div>
                  <Copy size={12} className="text-white/10 group-hover:text-white" />
                </div>
              )}
              
              {selectedMethodData.details.owner && (
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase mb-1">Beneficiário</p>
                  <p className="text-[11px] font-bold">{selectedMethodData.details.owner}</p>
                </div>
              )}

              {selectedMethodData.details.notice && (
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 flex gap-2">
                  <Info size={14} className="text-blue-400 shrink-0" />
                  <p className="text-[9px] font-bold text-blue-400 leading-tight">{selectedMethodData.details.notice}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Anexar Comprovativo</Label>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-14 rounded-2xl border-dashed border-white/10 bg-white/5 flex items-center justify-center gap-3 ${file ? 'border-green-500/50 text-green-400' : 'text-white/40'}`}
              >
                {file ? <span className="truncate max-w-[200px]">{file.name}</span> : <><Upload size={20} /> SELECIONAR ARQUIVO</>}
              </Button>
            </div>

            <Button onClick={handleAction} disabled={!file || loading} className="w-full h-16 rounded-2xl font-black text-lg premium-gradient">
              {loading ? <Loader2 className="animate-spin" /> : 'ENVIAR PARA VALIDAÇÃO'}
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">SOLICITAÇÃO ENVIADA</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed uppercase tracking-widest">
              A sua recarga foi solicitada. O comprovativo será validado em até 15 minutos (ou 1h para Airtm).
            </p>
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-purple-600 font-black">ENTENDIDO</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;