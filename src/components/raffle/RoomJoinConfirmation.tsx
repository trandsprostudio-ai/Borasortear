"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, AlertTriangle, Share2, TrendingUp, Wallet, Gift, DollarSign, Trophy, Users, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PenguinMascot from '@/components/ui/PenguinMascot';

interface RoomJoinConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: any;
  loading: boolean;
}

const RoomJoinConfirmation = ({ isOpen, onClose, onConfirm, room, loading }: RoomJoinConfirmationProps) => {
  const [userBalance, setUserBalance] = useState<number>(0);
  const [bonusBalance, setBonusBalance] = useState<number>(0);
  const [useBonus, setUseBonus] = useState(false);

  useEffect(() => {
    const fetchBalances = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('balance, bonus_balance').eq('id', session.user.id).single();
        if (data) {
          setUserBalance(Number(data.balance));
          setBonusBalance(Number(data.bonus_balance || 0));
        }
      }
    };
    if (isOpen) fetchBalances();
  }, [isOpen]);

  if (!room) return null;

  const moduleName = room.modules.name.replace('M', 'Módulo ');
  const entryFee = room.modules.price;
  const estimatedPrize = Math.floor((entryFee * room.max_participants) * 0.333);
  
  const fundsAvailable = useBonus ? (userBalance + bonusBalance) : userBalance;
  const isInvalidSelection = (useBonus && bonusBalance <= 0) || (fundsAvailable < entryFee);
  const hasBalance = !isInvalidSelection;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="flex justify-center mb-4">
            <PenguinMascot page="raffle" className="scale-75" />
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Confirmar Entrada</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verifica as tuas chances antes de sortear</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Destaque de Ganhadores e Incentivo */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-2xl flex flex-col items-center text-center">
                <Users size={16} className="text-green-500 mb-1" />
                <p className="text-[8px] font-black text-green-500 uppercase leading-tight">3 Vencedores <br />por Sala</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex flex-col items-center text-center">
                <TrendingUp size={16} className="text-blue-400 mb-1" />
                <p className="text-[8px] font-black text-blue-400 uppercase leading-tight">5% Vitalício <br />por Indicado</p>
              </div>
            </div>

            {/* Aviso de Saldo Insuficiente */}
            {!hasBalance && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertTriangle size={20} className="shrink-0" />
                <p className="text-[9px] font-black uppercase leading-relaxed">
                  {useBonus && bonusBalance <= 0 
                    ? "Não tens saldo de bónus disponível."
                    : `Saldo Insuficiente! Precisas de ${entryFee.toLocaleString()} Kz.`
                  }
                </p>
              </div>
            )}

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={12} className="text-white/40" />
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Teu Saldo</p>
                </div>
                <p className="text-sm font-black text-white italic">{userBalance.toLocaleString()} Kz</p>
              </div>
              <div className="bg-purple-600/10 p-4 rounded-2xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={12} className="text-purple-400" />
                  <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Teu Prémio</p>
                </div>
                <p className="text-sm font-black text-purple-400 italic">{estimatedPrize.toLocaleString()} Kz</p>
              </div>
            </div>

            {/* Opção de Bónus */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <Gift size={14} className="text-purple-400" />
                  <Label htmlFor="use-bonus" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Usar Bónus</Label>
                </div>
                <p className="text-[8px] font-bold text-white/20 uppercase">Tens {bonusBalance.toLocaleString()} Kz</p>
              </div>
              <Switch 
                id="use-bonus" 
                checked={useBonus} 
                onCheckedChange={setUseBonus}
                className="data-[state=checked]:bg-purple-600 scale-90"
              />
            </div>

            {/* Detalhes da Mesa */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
               <div>
                  <p className="text-[8px] font-black text-white/20 uppercase mb-0.5">Mesa Selecionada</p>
                  <p className="text-xs font-black text-white uppercase">{moduleName}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/20 uppercase mb-0.5">Custo Entrada</p>
                  <p className="text-xs font-black text-purple-400">{entryFee.toLocaleString()} Kz</p>
               </div>
            </div>

            {/* Incentivo de Afiliado */}
            <div className="bg-purple-600/5 border border-purple-500/10 p-3 rounded-xl">
              <p className="text-[8px] font-bold text-white/40 uppercase text-center leading-relaxed">
                Incentiva a entrada de colegas e ganha <span className="text-purple-400">5% vitalício</span> sobre os prémios que eles ganharem nesta mesa!
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3 mt-6 pb-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/5"
            >
              VOLTAR
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading || !hasBalance}
              className="h-12 rounded-xl premium-gradient font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
            >
              {loading ? "..." : "CONFIRMAR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;