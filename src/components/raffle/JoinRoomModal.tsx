"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, AlertCircle, Loader2, Ticket, CheckCircle2, Copy } from 'lucide-react';
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

  const handleJoin = async () => {
    if (userBalance < module.price) {
      toast.error("Saldo insuficiente! Recarregue sua carteira.");
      return;
    }

    setIsJoining(true);
    try {
      // 1. Deduzir saldo do perfil
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - module.price })
        .eq('id', userId);

      if (balanceError) throw balanceError;

      // 2. Registrar participação
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

  const copyCode = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      toast.success("Código copiado!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm">
        {!ticketCode ? (
          <>
            <DialogHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                <ShieldCheck size={32} />
              </div>
              <DialogTitle className="text-2xl font-bold italic tracking-tighter">CONFIRMAR ENTRADA</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                Mesa #{room.id.slice(0, 4)} • Módulo {module.name}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-white/5 rounded-2xl p-4 space-y-3 my-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Custo de Entrada</span>
                <span className="font-black text-lg">{module.price.toLocaleString()} Kz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Seu Saldo Atual</span>
                <div className="flex items-center gap-1 text-purple-400 font-black">
                  <Wallet size={14} />
                  <span>{userBalance.toLocaleString()} Kz</span>
                </div>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Saldo após entrada</span>
                <span className="font-black text-green-400">{(userBalance - module.price).toLocaleString()} Kz</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-white/20 font-bold mb-4 uppercase tracking-tighter">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <p>O valor será debitado instantaneamente e sua participação será registrada.</p>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleJoin}
                disabled={isJoining || userBalance < module.price}
                className="w-full premium-gradient h-14 rounded-2xl font-black text-lg"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'CONFIRMAR E ENTRAR'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full h-12 rounded-2xl hover:bg-white/5 font-black text-xs text-white/20 uppercase tracking-widest"
              >
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
            <p className="text-xs text-white/40 font-bold mb-8 uppercase tracking-widest">
              Guarde seu código para consultar o sorteio
            </p>

            <div className="bg-white/5 p-6 rounded-3xl border border-purple-500/20 relative group mb-8">
              <p className="text-[9px] font-black text-white/20 uppercase mb-2 tracking-widest">Código do Bilhete</p>
              <p className="text-3xl font-black text-purple-400 tracking-[0.3em]">{ticketCode}</p>
              <button 
                onClick={copyCode}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Copy size={18} />
              </button>
            </div>

            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg">
              ENTENDIDO
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomModal;