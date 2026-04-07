= 500).">
"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Wallet, Gift, Trophy, Users, Info } from 'lucide-react';
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

  const entryFee = room.modules.price;
  const isBonusRestricted = entryFee < 500;
  
  // Lógica de validação de saldo
  const canUseBonus = !isBonusRestricted && bonusBalance >= entryFee;
  const canUseReal = userBalance >= entryFee;
  
  const hasFunds = useBonus ? canUseBonus : canUseReal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 pt-10">
          <div className="flex justify-center mb-4">
            <PenguinMascot page="raffle" className="scale-75" />
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">Confirmar Entrada</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Aviso de Bónus Simulado */}
            {useBonus && (
              <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-purple-400 mt-0.5 shrink-0" />
                <p className="text-[10px] font-black text-purple-400 uppercase leading-tight">
                  ENTRADA COM BÓNUS: Este bilhete é uma SIMULAÇÃO. Não serás elegível para ganhar prémios reais.
                </p>
              </div>
            )}

            {/* Restrição de Bónus */}
            {isBonusRestricted && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-black text-amber-500 uppercase leading-tight">
                  Bónus bloqueado para este módulo. Utiliza saldo real para mesas inferiores a 500 Kz.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Saldo Real</p>
                <p className="text-base font-black italic">{userBalance.toLocaleString()} Kz</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Saldo Bónus</p>
                <p className="text-base font-black italic">{bonusBalance.toLocaleString()} Kz</p>
              </div>
            </div>

            {!isBonusRestricted && bonusBalance >= entryFee && (
              <div className="bg-purple-600/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex flex-col">
                  <Label htmlFor="use-bonus" className="text-xs font-black uppercase tracking-widest cursor-pointer">Usar Saldo Bónus</Label>
                  <p className="text-[8px] font-bold text-white/20 uppercase">Modo Simulação</p>
                </div>
                <Switch 
                  id="use-bonus" 
                  checked={useBonus} 
                  onCheckedChange={setUseBonus}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <Button variant="ghost" onClick={onClose} className="h-14 rounded-xl font-black text-xs uppercase">VOLTAR</Button>
            <Button 
              onClick={onConfirm}
              disabled={loading || !hasFunds}
              className="h-14 rounded-xl premium-gradient font-black text-xs uppercase"
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