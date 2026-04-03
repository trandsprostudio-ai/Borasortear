"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, Trophy, Info, AlertTriangle, Sparkles, Share2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [useBonus, setUseBonus] = useState(true);

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
  
  // Lógica de saldo: Se usar bónus, conta o total. Se não, apenas o real.
  const fundsAvailable = useBonus ? (userBalance + bonusBalance) : userBalance;
  const hasBalance = fundsAvailable >= entryFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <DialogHeader className="mb-6 text-center pt-2">
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Estás pronto?</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">A tua sorte começa nesta mesa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Aviso de Saldo Insuficiente */}
            {!hasBalance && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
                <AlertTriangle size={20} className="shrink-0" />
                <p className="text-[9px] font-black uppercase leading-relaxed">
                  Saldo Insuficiente! Precisas de {entryFee.toLocaleString()} Kz, mas tens apenas {fundsAvailable.toLocaleString()} Kz.
                </p>
              </div>
            )}

            {/* Opção de Bónus */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${useBonus ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/20'}`}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <Label htmlFor="use-bonus" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Usar Saldo de Bónus</Label>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Disponível: {bonusBalance.toLocaleString()} Kz</p>
                </div>
              </div>
              <Switch 
                id="use-bonus" 
                checked={useBonus} 
                onCheckedChange={setUseBonus}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Mesa</p>
                <p className="text-xs font-black text-white uppercase">{moduleName}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Custo de Entrada</p>
                <p className="text-xs font-black text-purple-400">
                  {entryFee.toLocaleString()} Kz
                </p>
              </div>
            </div>

            <div className="bg-purple-600/5 border border-purple-500/20 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase text-purple-400">Prémio Estimado</span>
                </div>
                <span className="text-sm font-black text-white italic">{Math.floor(entryFee * room.max_participants * 0.3333).toLocaleString()} Kz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-white/30 uppercase">Teu Saldo Real</span>
                <span className="text-[9px] font-black text-green-400">{userBalance.toLocaleString()} Kz</span>
              </div>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-3">
                <Share2 size={16} className="text-green-500 shrink-0" />
                <h4 className="text-[10px] font-black uppercase text-green-500">Ganha sempre!</h4>
              </div>
              <p className="text-[9px] font-bold text-white/60 leading-relaxed uppercase">
                Mesmo se não ganhares, <span className="text-green-400">recebes 5% vitalício</span> das vitórias dos teus amigos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8 pb-4">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5"
            >
              VOLTAR
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading || !hasBalance}
              className="h-14 rounded-2xl premium-gradient font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? "A ENTRAR..." : "CONFIRMAR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;