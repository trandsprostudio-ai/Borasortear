"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Loader2, CreditCard, AlertCircle, Smartphone, Banknote, Upload } from 'lucide-react';
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
  const [step, setStep] = useState<'form' | 'method' | 'confirm'>('form');

  const depositMethods = [
    { id: 'iban', name: 'Transferência (IBAN)', icon: Banknote, color: 'text-blue-400' },
    { id: 'afrimoney', name: 'Afrimoney', icon: Smartphone, color: 'text-yellow-400' },
    { id: 'unitel', name: 'Unitel Money', icon: Smartphone, color: 'text-orange-400' },
    { id: 'paypay', name: 'PayPay', icon: Smartphone, color: 'text-blue-500' },
  ];

  const withdrawalMethods = [
    { id: 'iban', name: 'Transferência Bancária', icon: Banknote },
    { id: 'express', name: 'Multicaixa Express', icon: CreditCard },
  ];

  const handleNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }
    setStep('method');
  };

  const handleAction = async () => {
    const val = parseFloat(amount);
    setLoading(true);
    try {
      if (type === 'withdrawal') {
        if (val > currentBalance) {
          toast.error("Saldo insuficiente.");
          setLoading(false);
          return;
        }
        // Escrow: Deduzir saldo imediatamente
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: currentBalance - val })
          .eq('id', user.id);
        
        if (balanceError) throw balanceError;

        toast.info("O seu saque está em atualização, por favor aguarde um instante.");
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: type,
        amount: val,
        status: 'pending',
        payment_method: method
      });

      if (error) throw error;

      if (type === 'deposit') {
        setStep('confirm');
      } else {
        onClose();
      }
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep('form');
        setAmount('');
        setMethod('');
      }
      onClose();
    }}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden">
        {step === 'form' && (
          <div className="p-8">
            <DialogHeader className="text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${
                type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {type === 'deposit' ? <ArrowDownLeft size={40} /> : <ArrowUpRight size={40} />}
              </div>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
                {type === 'deposit' ? 'Depositar' : 'Sacar'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 my-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Valor (Kz)</Label>
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
              <Button onClick={handleNext} className="w-full h-16 rounded-2xl font-black text-lg premium-gradient">
                CONTINUAR
              </Button>
            </div>
          </div>
        )}

        {step === 'method' && (
          <div className="p-8">
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 text-center">Escolha o Método</h3>
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
            <Button 
              onClick={handleAction} 
              disabled={!method || loading}
              className="w-full h-14 rounded-2xl font-black premium-gradient"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR'}
            </Button>
          </div>
        )}

        {step === 'confirm' && type === 'deposit' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">SOLICITAÇÃO ENVIADA</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed">
              A sua recarga foi solicitada com sucesso. Para validação e evitar que o crédito não seja atualizado dentro do prazo, envie sempre o seu comprovativo.
            </p>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left space-y-4 mb-8">
              {method === 'iban' ? (
                <>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">IBAN (BANCO BAI)</p>
                    <p className="text-sm font-black">AO06 0040 0000 1234 5678 9012 3</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">Beneficiário</p>
                    <p className="text-sm font-black">BORA SORTEIAR SERVIÇOS LTDA</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">Número da Carteira</p>
                    <p className="text-sm font-black">933 271 690</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">Entidade</p>
                    <p className="text-sm font-black uppercase">{method}</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button className="w-full h-14 rounded-2xl bg-purple-600 font-black flex items-center justify-center gap-2">
                <Upload size={18} /> ENVIAR COMPROVATIVO
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full h-12 text-white/20 font-black text-[10px] uppercase">
                FECHAR
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;