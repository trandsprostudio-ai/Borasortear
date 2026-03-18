"use client";

import React, { useState, useEffect } from 'react';
import { Users, Zap, Flame, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Room, Module } from '@/types/raffle';

interface RoomCardProps {
  room: Room;
  module: Module;
  roomNumber: number;
  onParticipate: (room: Room, module: Module) => void;
}

const RoomCard = ({ room, module, roomNumber, onParticipate }: RoomCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const progress = (room.currentParticipants / room.maxParticipants) * 100;
  const isAlmostFull = progress > 90;

  // Cálculo do prêmio com base nos participantes atuais (ex: 90% do valor arrecadado)
  const currentPrizePool = module.price * room.currentParticipants * 0.9;

  useEffect(() => {
    const calculateTime = () => {
      const expiry = new Date(room.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) return "SORTEANDO...";
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${h}h ${m}m ${s}s`;
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [room.expiresAt]);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-[#151823] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 bg-purple-600 text-[9px] font-black px-2 py-1 rounded-br-lg z-10">
        MESA {roomNumber}
      </div>

      <div className="flex justify-between items-start mb-4 pt-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">ID: {room.id.slice(0, 4)}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white italic">{module.price}</span>
            <span className="text-[10px] font-bold text-purple-500">KZ</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
            <Clock size={10} />
            <span>{timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-tighter">
          <div className="flex items-center gap-1 text-white/40">
            <Users size={12} />
            <span>{room.currentParticipants}/{room.maxParticipants}</span>
          </div>
          <span className={isAlmostFull ? 'text-amber-500' : 'text-purple-500'}>{Math.round(progress)}%</span>
        </div>
        
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isAlmostFull ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-purple-600'}`}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase">
            <span>Prêmio Acumulado:</span>
            <span className="text-green-400 font-black">
              {currentPrizePool > 0 ? currentPrizePool.toLocaleString() : "0"} Kz
            </span>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => onParticipate(room, module)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] uppercase tracking-widest h-10 w-full rounded-lg shadow-lg shadow-purple-900/20 group-hover:scale-[1.02] transition-transform"
          >
            ENTRAR NA MESA
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;