"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, AlertCircle, Loader2, Ticket, CheckCircle2, Copy, Clock } from 'lucide-react';
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
    
    const { data, error } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .gt('created_at', fifteenMinsAgo)
      .order('created_at', { ascending: false })
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

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setIsRestricted(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  const handleJoin = async () => {
    if (isRestricted) {
      toast.error("Aguarde a verificação do seu depósito para participar.");
      return;
    }

    if (userBalance < module.price) {
      toast.error("Saldo insuficiente! Recarregue sua carteira.");
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
        .insert({
          user_id: userId,
          room_id: room.id
        })
        .select('ticket_code')
        .single();

      if (participantError) throw participantError;

      setTicketCode(data.ticket_code);
      toast.success("Participação confirmada! Boa sorte! 🍀");
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao participar: " + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  const formatCooldown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm">
        {isRestricted ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <Clock size={48} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">VERIFICAÇÃO EM CURSO</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed uppercase tracking-widest">
              Enquanto a verificação acontece, você não pode participar nos sorteios. Aguarde a validação do seu comprovativo.
            </p>
            <div className="bg-white/5 p-4 rounded-2xl mb-8">
              <p className="text-[10px] font-black text-white/20 uppercase mb-1">Tempo Restante Estimado</p>
              <p className="text-2xl font-black text-amber-500">{formatCooldown(cooldownTime)}</p>
            </div>
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white/5 text-white font-black">
              ENTENDIDO
            </Button>
          </div>
        ) : !ticketCode ? (
          <>
            <DialogHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                <ShieldCheck size={32} />
              </div>
              <DialogTitle className="text-2xl font-bold italic tracking-tighter">CONFIRMAR ENTRADA</DialogTitle>
            </DialogHeader>

            <div className="bg-white/5 rounded-2xl p-4 space-y-3 my-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Custo</span>
                <span className="font-black text-lg">{module.price.toLocaleString()} Kz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Saldo</span>
                <span className="font-black text-purple-400">{userBalance.toLocaleString()} Kz</span>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleJoin}
                disabled={isJoining || userBalance < module.price}
                className="w-full premium-gradient h-14 rounded-2xl font-black text-lg"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'CONFIRMAR E ENTRAR'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full h-12 text-white/20 font-black text-[10px] uppercase">
                Cancelar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">ENTRADA CONFIRMADA!</h3>
            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/20 mb-8">
              <p className="text-[9px] font-black text-white/20 uppercase mb-2">Código do Bilhete</p>
              <p className="text-3xl font-black text-purple-400 tracking-[0.3em]">{ticketCode}</p>
            </div>
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white text-black font-black">
              FECHAR
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomModal;