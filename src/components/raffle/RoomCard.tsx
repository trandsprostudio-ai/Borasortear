"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, Trophy, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const RoomCard = ({ room, module, roomNumber, onParticipate }: any) => {
  const [timeLeft, setTimeLeft] = useState("");
  const lastCheck = useRef(0);
  
  const progress = room.maxParticipants > 0 ? (room.currentParticipants / room.maxParticipants) * 100 : 0;
  const isRoomOpen = room.status === 'open';
  const isRoomProcessing = room.status === 'processing';

  useEffect(() => {
    const calculateTime = () => {
      if (isRoomProcessing) return "SORTEANDO...";
      
      const expiry = new Date(room.expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;
      
      if (diff <= 0) {
        // Dispara o check apenas a cada 5 segundos para não sobrecarregar
        if (now - lastCheck.current > 5000) {
          lastCheck.current = now;
          supabase.rpc('check_and_draw_expired_rooms');
        }
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
  }, [room.expiresAt, room.status, isRoomProcessing]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#151823] border-2 rounded-[2.5rem] p-6 relative overflow-hidden transition-all duration-500 ${
        isRoomProcessing ? 'border-purple-500 shadow-[0_0_30px_rgba(124,58,237,0.2)]' : 'border-white/5'
      }`}
    >
      <div className="absolute top-0 left-0 bg-purple-600 text-[10px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-widest z-10">
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
        <div className={isRoomProcessing ? 'animate-bounce text-purple-500' : 'text-white/10'}>
          <Trophy size={24} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end text-[11px] font-black uppercase">
          <div className="flex items-center gap-1.5 text-green-400">
            <DollarSign size={14} />
            <span>POOL: {(module.price * room.maxParticipants).toLocaleString()}</span>
          </div>
          <div className={`flex items-center gap-2 ${isRoomProcessing ? 'text-purple-400 animate-pulse' : 'text-amber-500'}`}>
            <Clock size={14} />
            <span>{timeLeft}</span>
          </div>
        </div>
        
        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${
              isRoomProcessing ? 'bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-blue-500'
            }`}
          />
        </div>

        <Button 
          onClick={() => onParticipate(room, module)}
          disabled={!isRoomOpen || isRoomProcessing}
          className="w-full h-14 rounded-2xl font-black text-lg premium-gradient shadow-lg"
        >
          {isRoomProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} /> SORTEANDO...
            </span>
          ) : 'ENTRAR NA MESA'}
        </Button>
      </div>
    </motion.div>
  );
};

export default RoomCard;