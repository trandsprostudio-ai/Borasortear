"use client";

import React, { useState } from 'react';
import { Users, ArrowRight, Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CountdownTimer from './CountdownTimer';
import JoinRoomModal from './JoinRoomModal';
import { supabase } from '@/integrations/supabase/client';

interface RoomCardProps {
  room: any;
  module: any;
  user?: any;
  onAuthRequired?: () => void;
}

const RoomCard = ({ room, module, user, onAuthRequired }: RoomCardProps) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const progress = (room.current_participants / room.max_participants) * 100;
  const isAlmostFull = progress > 85;
  
  const handleParticipate = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    setIsJoinModalOpen(true);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.03,
          boxShadow: "0 0 30px rgba(124, 58, 237, 0.2)"
        }}
        className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 blur-[80px] group-hover:bg-purple-600/20 transition-colors" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                SALA #{room.id.slice(0, 4)}
              </span>
              {isAlmostFull && (
                <span className="flex items-center gap-0.5 bg-amber-500/20 text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  <Flame size={10} /> ÚLTIMAS VAGAS
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tracking-tight">{module.price}</span>
              <span className="text-sm font-bold text-purple-400">Kz</span>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
            <Zap size={20} className="text-purple-400 group-hover:fill-purple-400 transition-all" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-black tracking-tight">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={14} className="text-cyan-400" />
                <span>{room.current_participants.toLocaleString()} / {room.max_participants.toLocaleString()}</span>
              </div>
              <span className={isAlmostFull ? 'text-amber-500' : 'text-purple-400'}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isAlmostFull ? 'gold-gradient' : 'premium-gradient'
                } ${progress > 90 ? 'animate-pulse-glow' : ''}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <CountdownTimer initialSeconds={Math.max(0, Math.floor((new Date(room.expires_at).getTime() - Date.now()) / 1000))} />
            
            <Button 
              size="sm" 
              onClick={handleParticipate}
              className="premium-gradient border-0 rounded-xl px-5 font-bold shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all active:scale-95"
            >
              Participar
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      <JoinRoomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        room={room} 
        module={module} 
        user={user}
      />
    </>
  );
};

export default RoomCard;