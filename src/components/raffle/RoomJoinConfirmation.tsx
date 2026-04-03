"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, Trophy, Info, AlertTriangle, Sparkles, Share2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RoomJoinConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: any;
  loading: boolean;
}

const RoomJoinConfirmation = ({ isOpen, onClose, onConfirm, room, loading }: RoomJoinConfirmationProps) => {
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
        if (data) setUserBalance(Number(data.balance));
      }
    };
    if (isOpen) fetchBalance();
  }, [isOpen]);

  if (!room) return null;

  const moduleName = room.modules.name.replace('M', 'Módulo ');
  const entryFee = room.modules.price;
  const prizePool = entryFee * room.max_participants;
  const estimatedPrize = Math.floor(prizePool * 0.3333);
  const hasBalance = userBalance >= entryFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8 text-center pt-4">
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Estás pronto?</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">A tua sorte começa nesta mesa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            {!hasBalance && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertTriangle size={20} className="shrink-0" />
                <p className="text-[9px] font-black uppercase leading-relaxed">
                  Saldo Insuficiente! Precisas de {entryFee.toLocaleString()} Kz, mas tens apenas {userBalance.toLocaleString()} Kz.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Mesa</p>
                <p className="text-xs font-black text-white uppercase">{moduleName}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Custo de Entrada</p>
                <p className={hasBalance ? "text-xs font-black text-green-400" : "text-xs font-black text-red-400"}>
                  {entryFee.toLocaleString()} Kz
                </p>
              </div>
            </div>

            {/* Informação sobre Prémio Estimado e Divisão */}
            <div className="bg-purple-600/5 border border-purple-500/20 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase text-purple-400">Prémio Estimado</span>
                </div>
                <span className="text-sm font-black text-white italic">{estimatedPrize.toLocaleString()} Kz</span>
              </div>
              <p className="text-[8px] font-bold text-white/30 uppercase leading-relaxed">
                * Estimativa baseada no preenchimento total da sala ({room.max_participants} jogadores). A premiação final depende do número real de participantes no momento do sorteio.
              </p>
            </div>

            {/* Secção de Incentivo a Convites e Afiliados */}
            <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <Share2 size={16} className="text-green-500 shrink-0" />
                <h4 className="text-[10px] font-black uppercase text-green-500">Ganha sempre, ganha mais!</h4>
              </div>
              <p className="text-[9px] font-bold text-white/60 leading-relaxed uppercase">
                Convida amigos para preencher a mesa mais rápido! Lembra-te: Mesmo que não ganhes esta rodada, <span className="text-green-400">ganhas 5% de comissão vitalícia</span> sobre cada prémio que os teus amigos ganharem.
              </p>
            </div>

            <div className="bg-purple-500/5 p-5 rounded-2xl border border-purple-500/10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase text-white/40">Sorteio Automático</span>
                </div>
                <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-green-400">ATIVO</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[9px] font-bold text-white/40 uppercase">Vagas Preenchidas</span>
                <span className="text-[9px] font-black">{room.current_participants} / {room.max_participants}</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500"
                  style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
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
              {loading ? "A ENTRAR..." : "CONFIRMAR ENTRADA"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;