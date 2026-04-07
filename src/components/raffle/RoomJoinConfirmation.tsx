"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Info, Zap, Wallet, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    if (isOpen) {
      fetchBalances();
      setUseBonus(false);
    }
  }, [isOpen]);

  if (!room) return null;

  const entryFee = room.modules.price;
  const isBonusRestricted = entryFee < 1000;
  
  const canUseBonus = !isBonusRestricted && bonusBalance >= entryFee;
  const canUseReal = userBalance >= entryFee;
  const hasFunds = useBonus ? canUseBonus : canUseReal;

  const handlePreConfirm = () => {
    if (loading) return;
    
    if (useBonus && isBonusRestricted) {
      toast.error("O saldo de bónus não é válido para este módulo (Mínimo 1.000 Kz).");
      return;
    }

    if (!hasFunds) {
      toast.error("Saldo insuficiente!", {
        description: "Recarregue a sua carteira para continuar.",
        action: { label: "Recarregar", onClick: () => navigate('/wallet') }
      });
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col h-full max-h-[85vh] md:max-h-[80vh]">
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 pt-12">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Confirmar Bilhete</DialogTitle>
              <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 mt-4 w-max">
                <span className="text-xl font-black text-blue-400">{room.modules.name}</span>
                <span className="text-sm font-black text-white">{entryFee.toLocaleString()} Kz</span>
              </div>
            </DialogHeader>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3 mb-6">
              <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[10px] font-bold text-white/40 uppercase leading-tight">
                Caso não tenhas saldo real suficiente, podes utilizar o teu saldo de bónus para participar em mesas a partir de 1.000 Kz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-4 rounded-2xl border transition-all ${!useBonus ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Real</p>
                <p className="text-sm font-black italic text-white">{userBalance.toLocaleString()} Kz</p>
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${useBonus ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Bónus</p>
                <p className="text-sm font-black italic text-white">{bonusBalance.toLocaleString()} Kz</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <Label htmlFor="use-bonus" className="text-xs font-black uppercase tracking-widest cursor-pointer text-white">Usar Saldo Bónus</Label>
                <p className="text-[8px] font-bold text-white/20 uppercase">
                  {isBonusRestricted ? "Indisponível para este módulo" : "Participar com créditos"}
                </p>
              </div>
              <Switch 
                id="use-bonus" 
                checked={useBonus} 
                onCheckedChange={setUseBonus}
                disabled={isBonusRestricted}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={onClose} className="h-14 rounded-2xl font-black text-xs uppercase border border-white/10 text-white">
              CANCELAR
            </Button>
            <Button 
              onClick={handlePreConfirm}
              className={`h-14 rounded-2xl font-black text-xs uppercase text-white shadow-xl flex items-center justify-center gap-2 ${
                hasFunds ? 'premium-gradient' : 'bg-white/10'
              }`}
            >
              {loading ? <Zap className="animate-pulse w-4 h-4" /> : hasFunds ? <ArrowRight size={16} /> : <Wallet size={16} />}
              <span>{hasFunds ? "CONFIRMAR" : "RECARREGAR"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;