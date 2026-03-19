"use client";

import React, { useState, useEffect } from 'react';
import { Users, Clock, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Room, Module } from '@/types/raffle';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RoomCardProps {
  room: Room;
  module: Module;
  roomNumber: number;
  onParticipate: (room: Room, module: Module) => void;
}

const RoomCard = ({ room, module, roomNumber, onParticipate }: RoomCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  
  const progress = (room.currentParticipants / room.maxParticipants) * 100;
  const isAlmostFull = progress > 90;

  useEffect(() => {
    const calculateTime = () => {
      const expiry = new Date(room.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        setIsExpired(true);
        return "SORTEANDO...";
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h}h ${m}m ${s}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [room.expiresAt]);

  const handleInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Faça login para convidar!");
      return;
    }
    const inviteUrl = `${window.location.origin}/auth?mode=signup&ref=${session.user.id}&room=${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link da SALA copiado!");
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bg-[#151823] border rounded-xl p-4 flex flex-col justify-between transition-all group relative overflow-hidden ${
        isAlmostFull ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/5 hover:border-purple-500/50'
      }`}
    >
      {isAlmostFull && (
        <div className="absolute -right-8 -top-8 w-20 h-20 bg-amber-500/10 blur-2xl animate-pulse" />
      )}

      <div className="absolute top-0 left-0 bg-purple-600 text-[9px] font-black px-2 py-1 rounded-br-lg z-10">
        MESA {roomNumber}
      </div>

      {isAlmostFull && (
        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1 animate-bounce">
          <Zap size={8} fill="currentColor" /> QUENTE
        </div>
      )}

      <div className="flex justify-between items-start mb-4 pt-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">ID: {room.id.slice(0, 4)}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white italic">{module.price}</span>
            <span className="text-[10px] font-bold text-purple-500">KZ</span>
          </div>
        </div>
        <button 
          onClick={handleInvite}
          className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-tighter">
          <div className="flex items-center gap-1 text-white/40">
            <Users size={12} />
            <span>{room.currentParticipants}/{room.maxParticipants}</span>
          </div>
          <div className={`flex items-center gap-1 ${isExpired ? 'text-purple-500 animate-pulse' : 'text-amber-500'}`}>
            <Clock size={10} />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isAlmostFull ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-purple-600'}`}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            size="sm" 
            disabled={isExpired}
            onClick={() => onParticipate(room, module)}
            className={`font-black text-[11px] uppercase tracking-widest h-10 w-full rounded-lg shadow-lg disabled:opacity-50 transition-all ${
              isAlmostFull ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isExpired ? 'SORTEANDO...' : 'ENTRAR NA MESA'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;