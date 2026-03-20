"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, Loader2, Ticket, Copy, CheckCircle2, Share2, Users, TrendingUp } from 'lucide-react';
import { Module, Room } from '@/types/raffle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  module: Module;
  userBalance: number;
  userId: string;
  onSuccess: () => void;
}

const JoinRoomModal = ({ isOpen, onClose, room, module, userBalance, userId, onSuccess }: JoinRoomModalProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen && userId) {
      checkPendingTransactions();
    }
  }, [isOpen, userId]);

  const checkPendingTransactions = async () => {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .gt('created_at', fifteenMinsAgo)
      .limit(1);

    if (data && data.length > 0) {
      setIsRestricted(true);
      const createdAt = new Date(data[0].created_at).getTime();
      const diff = Math.ceil((15 * 60 * 1000 - (Date.now() - createdAt)) / 1000);
      setCooldownTime(diff > 0 ? diff : 0);
    } else {
      setIsRestricted(false);
    }
  };

  const handleJoin = async () => {
    if (isRestricted) return;
    if (userBalance < module.price) {
      toast.error("Saldo insuficiente!");
      return;
    }
    setIsJoining(true);
    try {
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - module.price })
        .eq('id', userId);
      if (balanceError) throw balanceError;

      const { data, error: participantError } = await supabase
        .from('participants')
        .insert({ user_id: userId, room_id: room.id })
        .select('ticket_code')
        .single();

      if (participantError) throw participantError;
      setTicketCode(data.ticket_code);
      toast.success("Participação confirmada!");
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao entrar na sala: " + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  const copyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const formatCooldown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxPrizeEstimate = (module.price * room.maxParticipants) * 0.33;
  const inviteLink = `${window.location.origin}/?room=${room.id}&ref=${userId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm p-0 overflow-hidden">
        {isRestricted ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <Clock size={48} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">VERIFICAÇÃO EM CURSO</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed uppercase tracking-widest">
              Aguarde a validação do seu último depósito para participar de novas mesas.
            </p>
            <div className="bg-white/5 p-4 rounded-2xl mb-8">
              <p className="text-[10px] font-black text-white/20 uppercase mb-1">Tempo Restante</p>
              <p className="text-2xl font-black text-amber-500">{formatCooldown(cooldownTime)}</p>
            </div>
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white/5 text-white font-black">
              ENTENDIDO
            </Button>
          </div>
        ) : !ticketCode ? (
          <div className="p-8">
            <DialogHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                <ShieldCheck size={32} />
              </div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                CONFIRMAR ENTRADA
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Custo da Mesa</span>
                  <span className="font-black text-lg">{module.price.toLocaleString()} Kz</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Seu Saldo</span>
                  <span className="font-black text-purple-400">{userBalance.toLocaleString()} Kz</span>
                </div>
              </div>

              <div className="bg-green-500/5 rounded-2xl p-5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Estimativa de Prêmio</span>
                </div>
                <p className="text-2xl font-black text-white italic tracking-tighter">
                  Até {maxPrizeEstimate.toLocaleString()} <span className="text-xs not-italic opacity-40">Kz</span>
                </p>
                <p className="text-[8px] font-bold text-white/20 uppercase mt-2 leading-tight">
                  * Valor estimado com base na lotação máxima da sala (1/3 do total). O ganho real depende do número final de participantes.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleJoin} 
                disabled={isJoining || userBalance < module.price} 
                className="w-full premium-gradient h-16 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'SORTEAR AGORA'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="w-full h-12 text-white/20 font-black text-[10px] uppercase tracking-widest"
              >
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">BILHETE GERADO!</h3>
            
            <div 
              className="bg-white/5 p-6 rounded-3xl border border-purple-500/20 mb-6 relative group cursor-pointer" 
              onClick={() => copyText(ticketCode, "Código do bilhete copiado!")}
            >
              <p className="text-[9px] font-black text-white/20 uppercase mb-2">Seu Código de Sorteio</p>
              <p className="text-3xl font-black text-purple-400 tracking-[0.3em]">{ticketCode}</p>
              <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy size={14} className="text-purple-500" />
              </div>
            </div>

            <div className="bg-purple-600/10 p-6 rounded-3xl border border-purple-500/20 mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users size={16} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Acelere o Sorteio</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 mb-4 leading-relaxed">
                Convide amigos para esta mesa! Quanto mais rápido a sala encher, mais cedo sai o resultado.
              </p>
              <Button 
                variant="outline"
                onClick={() => copyText(inviteLink, "Link de convite da mesa copiado!")}
                className="w-full h-12 rounded-xl border-purple-500/30 bg-purple-500/5 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Share2 size={14} /> COPIAR LINK DA MESA
              </Button>
            </div>

            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest">
              FECHAR E ACOMPANHAR
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomModal;