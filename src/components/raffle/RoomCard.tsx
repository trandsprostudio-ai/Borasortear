"use client";

import React from 'react';
import { Users, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Room, Module } from '@/types/raffle';
import CountdownTimer from './CountdownTimer';

interface RoomCardProps {
  room: Room;
  module: Module;
  onParticipate: (room: Room, module: Module) => void;
}

const RoomCard = ({ room, module, onParticipate }: RoomCardProps) => {
  const progress = (room.currentParticipants / room.maxParticipants) * 100;
  const isAlmostFull = progress > 85;
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-[#151823] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">SALA #{room.id.slice(0, 4)}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white italic">{module.price}</span>
            <span className="text-[10px] font-bold text-purple-500">KZ</span>
          </div>
        </div>
        {isAlmostFull && (
          <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg animate-pulse">
            <Flame size={14} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-tighter">
          <div className="flex items-center gap-1 text-white/40">
            <Users size={12} />
            <span>{room.currentParticipants}/{room.maxParticipants}</span>
          </div>
          <span className={isAlmostFull ? 'text-amber-500' : 'text-purple-500'}>{Math.round(progress)}%</span>
        </div>
        
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isAlmostFull ? 'bg-amber-500' : 'bg-purple-600'}`}
          />
        </div>

        <div className="flex items-center justify-between pt-2 gap-2">
          <CountdownTimer initialSeconds={Math.floor(Math.random() * 300) + 60} />
          <Button 
            size="sm" 
            onClick={() => onParticipate(room, module)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-lg flex-1"
          >
            PARTICIPAR
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;