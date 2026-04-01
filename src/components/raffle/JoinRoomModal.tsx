"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, Loader2, Ticket, Copy, CheckCircle2, Share2, Users, TrendingUp, AlertCircle, DollarSign, PieChart } from 'lucide-react';
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

const JoinRoomModal = ({ isOpen, onClose, room, module, userBalance: initialBalance, userId, onSuccess }: JoinRoomModalProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(initialBalance);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    } else {
      setTicketCode(null);
      setIsJoining(false);
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      const [profileRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('balance').eq('id', userId).single(),
        supabase.from('transactions')
          .select('created_at')
          .eq('user_id', userId)
          .eq('type', 'deposit')
          .eq('status', 'pending')
          .gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
          .limit(1)
      ]);

      if (profileRes.data) {
        setCurrentBalance(profileRes.data.balance);
      }

      if (pendingRes.data && pendingRes.data.length > 0) {
        setIsRestricted(true);
      } else {
        setIsRestricted(false);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleJoin = async () => {
    if (isRestricted || currentBalance < module.price) return;
    
    setIsJoining(true);
    try {
      const { data: currentRoom } = await supabase
        .from('rooms')
        .select('status, current_participants, max_participants')
        .eq('id', room.id)
        .single();

      if (!currentRoom || currentRoom.status !== 'open' || currentRoom.current_participants >= currentRoom.max_participants) {
        toast.error("Esta mesa não está mais disponível.");
        onClose();
        return;
      }

      const { data, error } = await supabase.rpc('join_room_secure', {
        p_room_id: room.id,
        p_user_id: userId,
        p_price: module.price
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setTicketCode(data);
      toast.success("Entrada confirmada!");
      onSuccess();
    } catch (error: any) {
      toast.error("Falha ao entrar na mesa.");
    } finally {
      setIsJoining(false);
    }
  };

  const copyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const totalPool = module.price * room.maxParticipants;
  const prizePerWinner = totalPool * 0.3333;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm p-0 overflow-hidden">
        {loadingData ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Validando Acesso...</p>
          </div>
        ) : isRestricted ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <Clock size={48} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase text-white">VERIFICAÇÃO PENDENTE</h3>
            <p className="text-xs text-white/40 font-bold mb-8 leading-relaxed uppercase tracking-widest">
              Aguarde a validação do seu depósito atual antes de participar de novas mesas.
            </p>
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
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white">
                DETALHES DA MESA
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Preço da Entrada</span>
                  <span className="font-black text-lg text-white">{module.price.toLocaleString()} Kz</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Seu Saldo</span>
                  <span className={`font-black text-lg ${currentBalance < module.price ? 'text-red-500' : 'text-purple-400'}`}>
                    {currentBalance.toLocaleString()} Kz
                  </span>
                </div>
              </div>

              <div className="bg-purple-500/5 rounded-2xl p-5 border border-purple-500/20 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Estimativa de Prêmios</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-white/20 uppercase">1º (33%)</p>
                    <p className="text-[11px] font-black text-green-400">{prizePerWinner.toLocaleString()} Kz</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-white/20 uppercase">2º (33%)</p>
                    <p className="text-[11px] font-black text-blue-400">{prizePerWinner.toLocaleString()} Kz</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-white/20 uppercase">3º (33%)</p>
                    <p className="text-[11px] font-black text-white/40">{prizePerWinner.toLocaleString()} Kz</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[8px] font-bold text-white/20 uppercase leading-tight italic">
                    * Valores baseados em uma mesa 100% preenchida.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handleJoin} 
                disabled={isJoining || currentBalance < module.price} 
                className="w-full premium-gradient h-16 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20"
              >
                {isJoining ? <Loader2 className="animate-spin" /> : 'CONFIRMAR ENTRADA'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="w-full h-12 text-white/20 font-black text-[10px] uppercase tracking-widest"
              >
                Voltar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase text-white">BILHETE ATIVO!</h3>
            
            <div 
              className="bg-white/5 p-6 rounded-3xl border border-purple-500/20 mb-6 relative group cursor-pointer" 
              onClick={() => copyText(ticketCode, "Bilhete copiado!")}
            >
              <p className="text-[9px] font-black text-white/20 uppercase mb-2">Código do Sorteio</p>
              <p className="text-3xl font-black text-purple-400 tracking-[0.3em]">{ticketCode}</p>
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