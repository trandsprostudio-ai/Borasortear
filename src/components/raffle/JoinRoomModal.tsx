"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  module: any;
  user: any;
}

const JoinRoomModal = ({ isOpen, onClose, room, module, user }: JoinRoomModalProps) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user && isOpen) {
      const fetchBalance = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        if (data) setBalance(data.balance);
      };
      fetchBalance();
    }
  }, [user, isOpen]);

  const handleJoin = async () => {
    if (!user) return;
    if (balance < module.price) {
      showError("Saldo insuficiente para participar.");
      return;
    }

    setLoading(true);
    try {
      // 1. Registrar participação
      const { error: partError } = await supabase
        .from('participants')
        .insert({ user_id: user.id, room_id: room.id });

      if (partError) throw partError;

      // 2. Atualizar saldo do perfil
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - module.price })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // 3. Incrementar participantes na sala
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ current_participants: room.current_participants + 1 })
        .eq('id', room.id);

      if (roomError) throw roomError;

      showSuccess("Participação confirmada! Boa sorte!");
      onClose();
    } catch (err: any) {
      showError(err.message || "Erro ao participar da sala.");
    } finally {
      setLoading(false);
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
            Você está prestes a entrar na Sala #{room?.id?.slice(0, 4)} do Módulo {module?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white/5 rounded-2xl p-4 space-y-3 my-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Custo de Entrada</span>
            <span className="font-bold text-lg">{module?.price} Kz</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Seu Saldo Atual</span>
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              <Wallet size={14} />
              <span>{balance.toLocaleString()} Kz</span>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo após entrada</span>
            <span className="font-bold text-green-400">{(balance - (module?.price || 0)).toLocaleString()} Kz</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-muted-foreground mb-4">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <p>Ao confirmar, o valor será debitado instantaneamente e sua participação será registrada de forma irreversível.</p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleJoin}
            disabled={loading || balance < (module?.price || 0)}
            className="w-full premium-gradient h-12 rounded-xl font-bold text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirmar e Participar"}
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