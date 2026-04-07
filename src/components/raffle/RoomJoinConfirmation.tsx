"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Info, Zap, Wallet, ArrowRight, Star, Gift, Shield } from 'lucide-react';
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

  const isBossRoom = !!room.entry_fee;
  const entryFee = isBossRoom ? Number(room.entry_fee) : Number(room.modules?.price || 0);
  const maxParticipants = isBossRoom ? 0 : Number(room.max_participants || 0);
  const moduleName = isBossRoom ? room.name : (room.modules?.name || 'Mesa');
  
  // Cálculos para Módulos Padrão
  const totalPool = entryFee * maxParticipants;
  const individualPrize = Math.floor(totalPool * 0.3333);
  const platformAmount = totalPool - (individualPrize * 2);

  const isBonusRestricted = isBossRoom || entryFee < 1000;
  const canUseBonus = !isBonusRestricted && bonusBalance >= entryFee;
  const canUseReal = userBalance >= entryFee;
  const hasFunds = useBonus ? canUseBonus : canUseReal;

  const handlePreConfirm = () => {
    if (loading) return;
    if (useBonus && isBonusRestricted) {
      toast.error(isBossRoom ? "Bónus bloqueado para mesas BOSS." : "Módulo indisponível para bónus.");
      return;
    }
    if (!hasFunds) {
      toast.error("Saldo insuficiente!", {
        description: "Recarregue a sua carteira para participar.",
        action: { label: "Recarregar", onClick: () => navigate('/wallet') }
      });
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 pt-12">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Confirmar Bilhete</DialogTitle>
              <div className={`flex items-center gap-2 ${isBossRoom ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'} px-4 py-2 rounded-2xl mt-4 w-max`}>
                <span className={`text-xl font-black italic ${isBossRoom ? 'text-amber-500' : 'text-blue-400'}`}>{moduleName}</span>
                <span className="text-sm font-black text-white">{entryFee.toLocaleString()} Kz</span>
              </div>
            </DialogHeader>

            {!isBossRoom ? (
              <div className="space-y-6 mb-8">
                {/* Estimativa de Prémio Individual */}
                <div className="bg-gradient-to-br from-green-500/20 to-transparent p-6 rounded-[2rem] border border-green-500/20 text-center">
                  <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Podes Ganhar Individualmente</p>
                  <p className="text-3xl font-black italic text-white">{individualPrize.toLocaleString()} <span className="text-sm not-italic opacity-40">Kz</span></p>
                </div>

                {/* Divisão dos 3 Vencedores */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1 mb-2">Divisão da Mesa</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                      <p className="text-[7px] font-black text-amber-500 uppercase mb-1">1º Lugar</p>
                      <p className="text-[10px] font-black text-white">{individualPrize.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                      <p className="text-[7px] font-black text-blue-400 uppercase mb-1">2º Lugar</p>
                      <p className="text-[10px] font-black text-white">{individualPrize.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center opacity-40">
                      <p className="text-[7px] font-black text-white uppercase mb-1">Plataforma</p>
                      <p className="text-[10px] font-black text-white">{platformAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex flex-col items-center text-center">
                  <Shield size={20} className="text-amber-500 mb-2" />
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Status</p>
                  <p className="text-lg font-black text-amber-500 italic uppercase">BOSS</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex flex-col items-center text-center">
                  <Clock size={20} className="text-blue-500 mb-2" />
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Resultado</p>
                  <p className="text-lg font-black text-blue-500 italic uppercase">72H</p>
                </div>
              </div>
            )}

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

            {!isBossRoom && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <Label htmlFor="use-bonus" className="text-xs font-black uppercase tracking-widest cursor-pointer text-white">Usar Saldo Bónus</Label>
                  <p className="text-[8px] font-bold text-white/20 uppercase">Participar com créditos ganhos</p>
                </div>
                <Switch 
                  id="use-bonus" 
                  checked={useBonus} 
                  onCheckedChange={setUseBonus}
                  disabled={isBonusRestricted}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={onClose} className="h-14 rounded-2xl font-black text-xs uppercase border border-white/10 text-white hover:bg-white/5">CANCELAR</Button>
            <Button onClick={handlePreConfirm} className={`h-14 rounded-2xl font-black text-xs uppercase text-white shadow-xl flex items-center justify-center gap-2 ${hasFunds ? 'premium-gradient' : 'bg-white/10'}`}>
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