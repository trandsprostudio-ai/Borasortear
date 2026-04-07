= 1000), simplificando as mensagens informativas e garantindo a exibição clara dos saldos e restrições no formulário de sorteio.">
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
    if (isOpen) {
      fetchBalances();
      setUseBonus(false); // Reset ao abrir
    }
  }, [isOpen]);

  if (!room) return null;

  const entryFee = room.modules.price;
  const maxParts = room.max_participants;
  const estimatedPrize = Math.floor((entryFee * maxParts) * 0.3333);
  
  // Regra: Bónus apenas em módulos de 1000 Kz em diante
  const isBonusRestricted = entryFee < 1000;
  
  const canUseBonus = !isBonusRestricted && bonusBalance >= entryFee;
  const canUseReal = userBalance >= entryFee;
  const hasFunds = useBonus ? canUseBonus : canUseReal;

  const handlePreConfirm = () => {
    if (loading) return;
    
    if (!hasFunds) {
      toast.error("Saldo insuficiente!", {
        description: "Desejas recarregar a tua carteira para continuar?",
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
                <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white pr-20">Confirmar Bilhete</DialogTitle>
                <div className="flex flex-col items-start mt-4">
                  <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20">
                    <span className="text-xl font-black italic text-blue-400">{room.modules.name}</span>
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
                {/* Informação Estática sobre Bónus */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                  <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-white/40 uppercase leading-tight">
                    Caso não tenhas saldo real suficiente, podes utilizar o teu saldo de bónus para participar em mesas a partir de 1.000 Kz.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-2xl border transition-all ${!useBonus ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Real</p>
                    <p className={`text-sm font-black italic ${userBalance < entryFee ? 'text-red-400' : 'text-white'}`}>{userBalance.toLocaleString()} Kz</p>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all ${useBonus ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Saldo Bónus</p>
                    <p className={`text-sm font-black italic ${bonusBalance < entryFee ? 'text-red-400' : 'text-white'}`}>{bonusBalance.toLocaleString()} Kz</p>
                  </div>
                </div>

                {/* Seletor de Bónus com Restrição Visível */}
                {isBonusRestricted ? (
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <p className="text-[9px] font-black text-red-400 uppercase leading-tight text-center">
                      O saldo de bónus não está disponível para este módulo. Disponível apenas em mesas de 1.000 Kz ou mais.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label htmlFor="use-bonus" className="text-xs font-black uppercase tracking-widest cursor-pointer text-white">Usar Saldo Bónus</Label>
                      <p className="text-[8px] font-bold text-white/20 uppercase">Participar com créditos</p>
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
              CANCELAR
            </Button>
            <Button 
              onClick={handlePreConfirm}
              className={`h-14 rounded-2xl font-black text-xs uppercase text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                hasFunds ? 'premium-gradient shadow-blue-600/20' : 'bg-white/10 border border-white/10'
              }`}
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