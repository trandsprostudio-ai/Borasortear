"use client";

import React from 'react';
import { Users, Timer, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Room, Module } from '@/types/raffle';

interface RoomCardProps {
  room: Room;
  module: Module;
}

const RoomCard = ({ room, module }: RoomCardProps) => {
  const progress = (room.currentParticipants / room.maxParticipants) * 100;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-5 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-3">
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
          room.status === 'aberta' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {room.status}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-sm text-muted-foreground font-medium mb-1">Sala #{room.id.slice(0, 4)}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{module.price}</span>
          <span className="text-xs font-medium text-muted-foreground">Kz</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users size={14} />
              <span>{room.currentParticipants}/{room.maxParticipants}</span>
            </div>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/5" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer size={14} className="text-blue-400" />
            <span>04:22:15</span>
          </div>
          
          <Button size="sm" className="premium-gradient border-0 rounded-xl px-4 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
            Participar
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;