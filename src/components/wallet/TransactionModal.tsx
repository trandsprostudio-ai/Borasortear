"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Loader2, CreditCard, AlertCircle, Smartphone, Banknote, Upload, FileText, Image as ImageIcon, Info } from 'lucide-react';
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
  const [step, setStep] = useState<'method' | 'form' | 'details' | 'confirm'>(type === 'deposit' ? 'method' : 'form');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const depositMethods = [
    { id: 'iban', name: 'Transferência (IBAN)', icon: Banknote, color: 'text-blue-400', details: { label: 'IBAN (BANCO BAI)', value: 'AO06 0040 0000 1234 5678 9012 3', owner: 'BORA SORTEIAR SERVIÇOS LTDA' } },
    { id: 'afrimoney', name: 'Afrimoney', icon: Smartphone, color: 'text-yellow-400', details: { label: 'Número Afrimoney', value: '933 271 690', owner: 'BORA SORTEIAR' } },
    { id: 'unitel', name: 'Unitel Money', icon: Smartphone, color: 'text-orange-400', details: { label: 'Número Unitel Money', value: '933 271 690', owner: 'BORA SORTEIAR' } },
    { id: 'paypay', name: 'PayPay', icon: Smartphone, color: 'text-blue-500', details: { label: 'Número PayPay', value: '933 271 690', owner: 'BORA SORTEIAR' } },
  ];

  const withdrawalMethods = [
    { id: 'iban', name: 'Transferência Bancária', icon: Banknote },
    { id: 'express', name: 'Multicaixa Express', icon: CreditCard },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 2MB.");
      return;
    }
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Formato inválido. Use PDF ou PNG.");
      return;
    }
    setFile(selectedFile);
  };

  const handleNextFromMethod = () => {
    if (!method) {
      toast.error("Selecione um método de pagamento.");
      return;
    }
    setStep('form');
  };

  const handleNextFromForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }
    if (type === 'deposit') {
      setStep('details');
    } else {
      handleAction();
    }
  };

  const handleAction = async () => {
    const val = parseFloat(amount);
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
        const { error: balanceError } = await supabase.from('profiles').update({ balance: currentBalance - val }).eq('id', user.id);
        if (balanceError) throw balanceError;
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: type,
        amount: val,
        status: 'pending',
        payment_method: method,
        proof_url: proofUrl
      });

      if (error) throw error;

      if (type === 'deposit') {
        setStep('confirm');
      } else {
        toast.info("O seu saque está em atualização, por favor aguarde um instante.");
        onClose();
      }
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData = depositMethods.find(m => m.id === method);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep(type === 'deposit' ? 'method' : 'form');
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
            <div className="grid grid-cols-1 gap-3 mb-8">
              {(type === 'deposit' ? depositMethods : withdrawalMethods).map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    method === m.id ? 'bg-purple-600 border-purple-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.icon size={20} className={method === m.id ? 'text-white' : (m as any).color || 'text-white/40'} />
                    <span className="font-black text-xs uppercase tracking-widest">{m.name}</span>
                  </div>
                  {method === m.id && <CheckCircle2 size={18} />}
                </button>
              ))}
            </div>
            <Button onClick={handleNextFromMethod} disabled={!method} className="w-full h-14 rounded-2xl font-black premium-gradient">
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
              <Button onClick={handleNextFromForm} className="w-full h-16 rounded-2xl font-black text-lg premium-gradient">
                CONTINUAR
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')} className="w-full text-[10px] font-black uppercase tracking-widest text-white/20">Voltar</Button>
            </div>
          </div>
        )}

        {step === 'details' && type === 'deposit' && selectedMethodData && (
          <div className="p-8">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Dados para Pagamento</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40">Realize a transferência para os dados abaixo</DialogDescription>
            </DialogHeader>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 mb-6">
              <div>
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">{selectedMethodData.details.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black tracking-wider">{selectedMethodData.details.value}</p>
                  <button onClick={() => { navigator.clipboard.writeText(selectedMethodData.details.value); toast.success("Copiado!"); }} className="text-purple-500 hover:text-purple-400">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Beneficiário</p>
                <p className="text-sm font-black">{selectedMethodData.details.owner}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex gap-3">
                <Info className="text-purple-500 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase tracking-tight">
                  O envio do comprovativo é necessário para validarmos sua transação com segurança. Verificação automática em até 15 minutos.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Anexar Comprovativo (PDF/PNG/JPG)</Label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-14 rounded-2xl border-dashed border-white/10 bg-white/5 flex items-center justify-center gap-3 ${file ? 'border-green-500/50 text-green-400' : 'text-white/40'}`}
                >
                  {file ? (
                    <>
                      {file.type.includes('pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} /> SELECIONAR COMPROVATIVO
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleAction} 
              disabled={!file || loading}
              className="w-full h-16 rounded-2xl font-black text-lg premium-gradient"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'ENVIAR PARA VALIDAÇÃO'}
            </Button>
            <Button variant="ghost" onClick={() => setStep('form')} className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-white/20">Voltar</Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">SOLICITAÇÃO ENVIADA</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed uppercase tracking-widest">
              A sua recarga foi solicitada com sucesso. O comprovativo será validado em até 15 minutos pela nossa equipe.
            </p>
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-purple-600 font-black">
              ENTENDIDO
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;