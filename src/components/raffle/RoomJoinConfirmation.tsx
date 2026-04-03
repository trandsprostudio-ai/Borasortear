"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, DollarSign, ArrowRight, ShieldCheck, Info } from 'lucide-react';

interface RoomJoinConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: any;
  loading: boolean;
}

const RoomJoinConfirmation = ({ isOpen, onClose, onConfirm, room, loading }: RoomJoinConfirmationProps) => {
  if (!room) return null;

  const moduleName = room.modules.name.replace('M', 'Módulo ');
  const entryFee = room.modules.price;
  const prizePool = entryFee * room.max_participants;
  const firstPrize = Math.floor(prizePool * 0.3333);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-md p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-purple-500 border border-purple-500/20">
              <LayoutGrid size={40} />
            </div>
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Detalhes da Mesa</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Confirme os dados antes de entrar no sorteio</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Módulo</p>
                <p className="text-sm font-black text-white uppercase">{moduleName}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Entrada</p>
                <p className="text-sm font-black text-green-400">{entryFee.toLocaleString()} Kz</p>
              </div>
            </div>

            <div className="bg-purple-500/5 p-5 rounded-2xl border border-purple-500/10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase text-white/40">Participantes</span>
                </div>
                <span className="text-sm font-black">{room.current_participants} / {room.max_participants}</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-green-500/60 uppercase tracking-widest mb-1">Prémio de 1º Lugar</p>
                <p className="text-xl font-black text-green-400 italic">~ {firstPrize.toLocaleString()} Kz</p>
              </div>
              <ShieldCheck size={32} className="text-green-500/20" />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mb-8">
            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-amber-500/80 leading-relaxed uppercase">
              Ao confirmar, o valor da entrada será debitado do seu saldo. O sorteio ocorre assim que a mesa estiver cheia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-white/5"
            >
              CANCELAR
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading}
              className="h-14 rounded-2xl premium-gradient font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/20"
            >
              {loading ? "PROCESSANDO..." : "CONFIRMAR"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinConfirmation;