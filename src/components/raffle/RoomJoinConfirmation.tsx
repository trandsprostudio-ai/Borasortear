"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Info, Zap, Star, Wallet, ArrowRight } from 'lucide-react';
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
    if (isOpen) fetchBalances();
  }, [isOpen]);

  if (!room) return null;

  const entryFee = room.modules.price;
  const maxParts = room.max_participants;
  const estimatedPrize = Math.floor((entryFee * maxParts) * 0.3333);
  const isBonusRestricted = entryFee < 500;
  
  const canUseBonus = !isBonusRestricted && bonusBalance >= entryFee;
  const canUseReal = userBalance >= entryFee;
  const hasFunds = useBonus ? canUseBonus : canUseReal;

  const handlePreConfirm = () => {
    if (loading) return;
    
    if (!hasFunds) {
      toast.error("Saldo insuficiente!", {
        description: "Desejas recarregar a tua carteira agora?",
        action: {
          label: "Recarregar",
          onClick: () => navigate('/wallet')
        }
      });
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col h-full max-h-[85vh] md:max-h-[80vh]">
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <ScrollArea className="flex-1 w-full">
            <div className="p-6 md:p-8 pt-12">
              <DialogHeader className="mb-6 text-left">
                <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white pr-20">Confirmar Entrada</DialogTitle>
                <div className="flex flex-col items-start mt-4">
                  <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-2xl border border-purple-500/20">
                    <span className="text-xl font-black italic text-purple-400">{room.modules.name}</span>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <span className="text-sm font-black text-white">{entryFee.toLocaleString()} Kz</span>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Trophy size={18} className="text-green-600 mb-1" />
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Prémio Individual</p>
                  <p className="text-lg font-black text-green-600 italic">~{estimatedPrize.toLocaleString()} Kz</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Users size={18} className="text-blue-600 mb-1" />
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Ganhadores</p>
                  <p className="text-lg font-black text-blue-600 italic">3 Vagas</p>
                </div>
              </div>

              <div className="space-y-4 pb-6">
                <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
                  <Star size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-amber-500 uppercase leading-tight">Incentivo de Convite</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">Ganha 47% de comissão no 1º depósito de quem convidares!</p>
                  </div>
                </div>

                {useBonus && (
                  <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-start gap-3">
                    <Info size={18} className="text-purple-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] font-black text-purple-600 uppercase leading-tight">
                      MODO SIMULAÇÃO: Estás a usar bónus. Não serás elegível para o prémio real.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Real</p>
                    <p className={`text-sm font-black italic ${userBalance < entryFee && !useBonus ? 'text-red-400' : 'text-white'}`}>{userBalance.toLocaleString()} Kz</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Bónus</p>
                    <p className={`text-sm font-black italic ${bonusBalance < entryFee && useBonus ? 'text-red-400' : 'text-white'}`}>{bonusBalance.toLocaleString()} Kz</p>
                  </div>
                </div>

                {!isBonusRestricted && (bonusBalance >= entryFee) && (
                  <div className="bg-purple-600/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label htmlFor="use-bonus" className="text-xs font-black uppercase tracking-widest cursor-pointer text-white">Usar Saldo Bónus</Label>
                      <p className="text-[8px] font-bold text-white/20 uppercase">Jogar sem risco</p>
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
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-sm relative z-50">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="h-14 rounded-2xl font-black text-xs uppercase border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              VOLTAR
            </Button>
            <Button 
              onClick={handlePreConfirm}
              className="h-14 rounded-2xl premium-gradient font-black text-xs uppercase text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Zap className="animate-pulse w-4 h-4" />
                  <span>PROCESSANDO...</span>
                </>
              ) : (
                <>
                  {hasFunds ? <ArrowRight size={16} /> : <Wallet size={16} />}
                  <span>{hasFunds ? "CONFIRMAR" : "RECARREGAR"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;