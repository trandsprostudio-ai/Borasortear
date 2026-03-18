"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2rem] max-w-md">
        {step === 'form' ? (
          <>
            <DialogHeader className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {type === 'deposit' ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
              </div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {type === 'deposit' ? 'Depositar Saldo' : 'Solicitar Saque'}
              </DialogTitle>
              <DialogDescription className="text-white/40 font-bold text-xs uppercase tracking-widest">
                {type === 'deposit' ? 'Adicione fundos para continuar jogando' : 'Resgate seus prêmios acumulados'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Valor (Kz)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-white/20">Kz</span>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 text-xl font-black"
                  />
                </div>
                {type === 'withdrawal' && (
                  <p className="text-[10px] font-bold text-white/20 text-right">Disponível: {currentBalance.toLocaleString()} Kz</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map((v) => (
                  <button 
                    key={v}
                    onClick={() => setAmount(v.toString())}
                    className="h-10 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 text-[10px] font-black transition-all"
                  >
                    +{v} Kz
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleAction}
                disabled={loading || !amount}
                className={`w-full h-14 rounded-2xl font-black text-lg ${
                  type === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'premium-gradient'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : type === 'deposit' ? 'GERAR DADOS DE PAGAMENTO' : 'CONFIRMAR SAQUE'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-2xl text-white/40 font-black text-xs uppercase tracking-widest">
                Cancelar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2">DADOS PARA DEPÓSITO</h3>
            <p className="text-sm text-white/40 font-bold mb-8">
              Transfira o valor de <span className="text-white">{parseFloat(amount).toLocaleString()} Kz</span> para os dados abaixo e anexe o comprovante no suporte se necessário.
            </p>

            <div className="space-y-3 text-left mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 relative group">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">IBAN (BAI)</p>
                <p className="text-sm font-black text-white">AO06 0040 0000 1234 5678 9012 3</p>
                <button 
                  onClick={() => copyToClipboard('AO06004000001234567890123')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Beneficiário</p>
                <p className="text-sm font-black text-white">BORA SORTEIAR LTDA</p>
              </div>
            </div>

            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg">
              JÁ REALIZEI O PAGAMENTO
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;