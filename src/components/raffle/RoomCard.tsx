"use client";

import React, { useState, useEffect } from 'react';
import { Users, Clock, Share2, Trophy, TrendingUp, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, Module } from '@/types/raffle';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
  module: Module;
  roomNumber: number;
  onParticipate: (room: Room, module: Module) => void;
}

const RoomCard = ({ room, module, roomNumber, onParticipate }: RoomCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  
  const progress = room.maxParticipants > 0 ? (room.currentParticipants / room.maxParticipants) * 100 : 0;
  const isAlmostFull = progress > 80;
  
  const isRoomOpen = room.status === 'open';
  const isRoomProcessing = room.status === 'processing';
  const isRoomFinished = room.status === 'finished';

  useEffect(() => {
    const calculateTime = () => {
      if (!isRoomOpen) {
        if (isRoomProcessing) return "SORTEANDO...";
        if (isRoomFinished) return "ENCERRADO";
        return "FINALIZADO";
      }

      const expiry = new Date(room.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        return "FINALIZANDO...";
      }

      if (diff < 30 * 60 * 1000) {
        setIsUrgent(true);
      } else {
        setIsUrgent(false);
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h}h ${m}m ${s}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [room.expiresAt, isRoomOpen, isRoomProcessing, isRoomFinished]);

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`bg-[#151823] border-2 rounded-[2.5rem] p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
        isAlmostFull && isRoomOpen ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/5 hover:border-purple-500/40'
      }`}
    >
      <div className="absolute top-0 left-0 bg-purple-600 text-[10px] font-black px-4 py-1.5 rounded-br-2xl z-10 uppercase tracking-widest">
        MESA {roomNumber}
      </div>

      <div className="absolute top-0 right-0 flex items-center gap-2 px-4 py-1.5 rounded-bl-2xl z-10">
        {isRoomOpen && (
          <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <Radio size={10} className="text-red-500 animate-pulse" />
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
          </div>
        )}
        {isRoomProcessing && (
          <div className="bg-purple-600/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">SORTEANDO</span>
          </div>
        )}
        {isRoomFinished && (
          <div className="bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20">
            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">ENCERRADO</span>
          </div>
        )}
        {isAlmostFull && isRoomOpen && (
          <div className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
            <TrendingUp size={10} /> QUENTE
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mb-6 pt-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">ID: {room.id.slice(0, 6)}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic tracking-tighter">{module.price.toLocaleString()}</span>
            <span className="text-sm font-black text-purple-500 uppercase">Kz</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-purple-400 transition-colors">
          <Trophy size={24} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-white/40">
            <Users size={14} />
            <span>{room.currentParticipants} / {room.maxParticipants}</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors duration-300 ${
            isRoomFinished ? 'text-green-500' : 
            isRoomProcessing ? 'text-purple-500' : 
            isUrgent ? 'text-red-500 animate-pulse' : 'text-amber-500'
          }`}>
            <Clock size={14} />
            <AnimatePresence mode="wait">
              <motion.span
                key={timeLeft}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {timeLeft}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full transition-all duration-1000 ${
              isAlmostFull && isRoomOpen ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-purple-600 to-blue-500'
            }`}
          />
        </div>

        <Button 
          onClick={() => onParticipate(room, module)}
          disabled={!isRoomOpen}
          className={`w-full h-14 rounded-2xl font-black text-lg uppercase tracking-tighter italic transition-all active:scale-95 ${
            isRoomOpen 
              ? isAlmostFull 
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20' 
                : 'premium-gradient text-white shadow-lg shadow-purple-500/20'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isRoomProcessing ? 'SORTEANDO...' : isRoomFinished ? 'ENCERRADO' : 'SORTEAR'}
        </Button>
      </div>
    </motion.div>
  );
};

export default RoomCard;