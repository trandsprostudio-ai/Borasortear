"use client";

import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, TrendingUp, Radio, Loader2, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, Module } from '@/types/raffle';
import { supabase } from '@/integrations/supabase/client';

const RoomCard = ({ room, module, roomNumber, onParticipate }: any) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isDrawDispatched, setIsDrawDispatched] = useState(false);
  
  const progress = room.maxParticipants > 0 ? (room.currentParticipants / room.maxParticipants) * 100 : 0;
  const isRoomOpen = room.status === 'open';
  const isRoomProcessing = room.status === 'processing';

  // Função isolada para disparar o sorteio de forma segura
  const dispatchDraw = async () => {
    if (isDrawDispatched || !isRoomOpen) return;
    
    setIsDrawDispatched(true);
    try {
      const { error } = await supabase.rpc('check_and_draw_expired_rooms');
      if (error) {
        console.error("Erro no sorteio automático:", error);
        setIsDrawDispatched(false);
      }
    } catch (err) {
      console.error("Falha ao comunicar com o servidor:", err);
      setIsDrawDispatched(false);
    }
  };

  useEffect(() => {
    const calculateTime = () => {
      // Se a sala já está sendo sorteada no banco
      if (isRoomProcessing) return "SORTEANDO...";
      if (!isRoomOpen) return "FINALIZADO";

      const expiry = new Date(room.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      
      // Se o tempo acabou
      if (diff <= 0) {
        dispatchDraw();
        return "SORTEANDO...";
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h}h ${m}m ${s}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [room.expiresAt, isRoomOpen, isRoomProcessing, isDrawDispatched, room.id]);

  return (
    <motion.div 
      className={`bg-[#151823] border-2 rounded-[2.5rem] p-6 relative overflow-hidden transition-colors ${
        isRoomProcessing || timeLeft === "SORTEANDO..." ? 'border-purple-500/40 shadow-xl' : 'border-white/5'
      }`}
    >
      <div className="absolute top-0 left-0 bg-purple-600 text-[10px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-widest">
        MESA {roomNumber}
      </div>

      <div className="flex justify-between items-start mb-6 pt-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/20 uppercase mb-1">ID: {room.id.slice(0, 6)}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic tracking-tighter">{module.price.toLocaleString()}</span>
            <span className="text-sm font-black text-purple-500">Kz</span>
          </div>
        </div>
        <Trophy size={24} className={isRoomProcessing ? 'text-purple-500 animate-bounce' : 'text-white/10'} />
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end text-[11px] font-black uppercase">
          <span className="text-green-400">POOL: {(module.price * room.maxParticipants).toLocaleString()} Kz</span>
          <div className={`flex items-center gap-2 ${timeLeft === "SORTEANDO..." ? 'text-purple-400 animate-pulse' : 'text-amber-500'}`}>
            <Clock size={14} />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${
              isRoomProcessing ? 'bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-blue-500'
            }`}
          />
        </div>

        <Button 
          onClick={() => onParticipate(room, module)}
          disabled={!isRoomOpen || timeLeft === "SORTEANDO..." || isRoomProcessing}
          className="w-full h-14 rounded-2xl font-black text-lg premium-gradient"
        >
          {(isRoomProcessing || timeLeft === "SORTEANDO...") ? (
            <>
              <Loader2 className="animate-spin mr-2" /> SORTEANDO...
            </>
          ) : 'SORTEAR'}
        </Button>
      </div>
    </motion.div>
  );
};

export default RoomCard;