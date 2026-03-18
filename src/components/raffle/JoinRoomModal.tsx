"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
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
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          user_id: userId,
          room_id: room.id
        });

      if (participantError) throw participantError;

      toast.success("Participação confirmada! Boa sorte! 🍀");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Erro ao participar: " + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-3xl max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
            <ShieldCheck size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold">Confirmar Entrada</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Você está entrando na Sala #{room.id.slice(0, 4)} do Módulo {module.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white/5 rounded-2xl p-4 space-y-3 my-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custo de Entrada</span>
            <span className="font-bold text-lg">{module.price} Kz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Seu Saldo Atual</span>
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              <Wallet size={14} />
              <span>{userBalance.toLocaleString()} Kz</span>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo após entrada</span>
            <span className="font-bold text-green-400">{(userBalance - module.price).toLocaleString()} Kz</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-muted-foreground mb-4">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <p>Ao confirmar, o valor será debitado instantaneamente e sua participação será registrada.</p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleJoin}
            disabled={isJoining || userBalance < module.price}
            className="w-full premium-gradient h-12 rounded-xl font-bold text-lg"
          >
            {isJoining ? <Loader2 className="animate-spin" /> : 'Confirmar e Participar'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full h-12 rounded-xl hover:bg-white/5"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomModal;