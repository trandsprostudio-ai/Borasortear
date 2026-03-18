"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Loader2, CreditCard, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const handleAction = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }

    if (type === 'withdrawal' && val > currentBalance) {
      toast.error("Saldo insuficiente para este saque.");
      return;
    }

    setLoading(true);
    try {
      // Se for saque, deduzimos o saldo IMEDIATAMENTE (escrow)
      // Se o admin rejeitar, o saldo é devolvido.
      if (type === 'withdrawal') {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: currentBalance - val })
          .eq('id', user.id);
        
        if (balanceError) throw balanceError;
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: type,
        amount: val,
        status: 'pending',
        payment_method: type === 'deposit' ? 'IBAN/Transferência' : 'Conta Bancária Cadastrada'
      });

      if (error) throw error;

      if (type === 'deposit') {
        setStep('confirm');
      } else {
        toast.success("Solicitação de saque enviada! Processaremos em até 24h.");
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
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep('form');
        setAmount('');
      }
      onClose();
    }}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden">
        {step === 'form' ? (
          <div className="p-8">
            <DialogHeader className="text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${
                type === 'deposit' ? 'bg-green-500/20 text-green-400 shadow-green-500/10' : 'bg-purple-500/20 text-purple-400 shadow-purple-500/10'
              }`}>
                {type === 'deposit' ? <ArrowDownLeft size={40} /> : <ArrowUpRight size={40} />}
              </div>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
                {type === 'deposit' ? 'Depositar' : 'Sacar'}
              </DialogTitle>
              <DialogDescription className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
                {type === 'deposit' ? 'Adicione fundos à sua conta' : 'Resgate seus prêmios acumulados'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Valor do {type === 'deposit' ? 'Depósito' : 'Saque'} (Kz)</Label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-white/20 text-xl">Kz</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 rounded-2xl h-16 pl-14 text-2xl font-black focus:border-purple-500/50 transition-all"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-white/20 uppercase">Saldo Atual</span>
                  <span className="text-[10px] font-black text-purple-400">{currentBalance.toLocaleString()} Kz</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1000, 5000, 10000].map((v) => (
                  <button 
                    key={v}
                    onClick={() => setAmount(v.toString())}
                    className="h-12 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 text-[11px] font-black transition-all hover:bg-white/10"
                  >
                    +{v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAction}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className={`w-full h-16 rounded-2xl font-black text-lg shadow-2xl ${
                  type === 'deposit' ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20' : 'premium-gradient shadow-purple-900/20'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : type === 'deposit' ? 'GERAR DADOS DE PAGAMENTO' : 'CONFIRMAR SOLICITAÇÃO'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-2xl text-white/20 hover:text-white font-black text-[10px] uppercase tracking-widest">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-400 shadow-2xl shadow-green-500/10">
              <CheckCircle2 size={56} />
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter mb-3 uppercase">DADOS DE DEPÓSITO</h3>
            <p className="text-sm text-white/40 font-bold mb-10 leading-relaxed">
              Transfira <span className="text-white font-black">{parseFloat(amount).toLocaleString()} Kz</span> para os dados abaixo. O saldo será creditado após aprovação.
            </p>

            <div className="space-y-4 text-left mb-10">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 relative group hover:border-purple-500/30 transition-all">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1 tracking-widest">IBAN (BANCO BAI)</p>
                <p className="text-sm font-black text-white tracking-wider">AO06 0040 0000 1234 5678 9012 3</p>
                <button 
                  onClick={() => copyToClipboard('AO06004000001234567890123')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1 tracking-widest">Beneficiário</p>
                <p className="text-sm font-black text-white">BORA SORTEIAR SERVIÇOS LTDA</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-[10px] text-white/20 font-bold mb-8 text-left bg-white/5 p-4 rounded-xl">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <p>Após a transferência, o sistema identificará seu depósito automaticamente ou você pode enviar o comprovante ao suporte.</p>
            </div>

            <Button onClick={onClose} className="w-full h-16 rounded-2xl bg-white text-black hover:bg-gray-200 font-black text-lg shadow-2xl shadow-white/10">
              JÁ REALIZEI O PAGAMENTO
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;