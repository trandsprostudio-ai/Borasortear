"use client";

import React from 'react';
import { Users, ArrowRight, Loader2, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RoomItemProps {
  room: any;
  onJoin: () => void;
  loading?: boolean;
}

const RoomItem = ({ room, onJoin, loading }: RoomItemProps) => {
  const percentage = Math.round((room.current_participants / room.max_participants) * 100);
  const estimatedPrize = Math.floor((room.modules.price * room.max_participants) * 0.333);

  return (
    <div className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] bg-[#F3F4F6] relative overflow-hidden group cursor-pointer">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Sparkles size={12} className="text-amber-500" />
             <span className="text-[9px] font-black text-[#111111] uppercase tracking-widest">Sorteio Ativo</span>
          </div>
          <h3 className="text-lg font-black italic tracking-tighter text-[#111111] uppercase">
            Mesa #{room.id.slice(0, 6)}
          </h3>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full border border-[#D1D5DB] flex items-center gap-2 shadow-sm">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-[#111111] uppercase">Disponível</span>
        </div>
      </div>

      <div className="gold-gradient p-5 rounded-[1.5rem] mb-6 shadow-md border border-white/20 animate-shimmer">
        <p className="text-[9px] font-black text-black/50 uppercase tracking-widest mb-1">Prémio Estimado</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-black italic tracking-tighter">
            {estimatedPrize.toLocaleString()} <span className="text-xs not-italic opacity-50">Kz</span>
          </span>
          <TrendingUp size={20} className="text-black/20" />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-[#111111] uppercase opacity-40">Participação</span>
          <span className="text-[10px] font-black text-blue-600">{percentage}%</span>
        </div>
        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#D1D5DB]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full premium-gradient"
          />
        </div>
        <div className="flex items-center gap-2">
            <Users size={14} className="text-[#111111]/40" />
            <span className="text-[10px] font-bold text-[#111111]/60">{room.current_participants} de {room.max_participants} Jogadores</span>
        </div>
      </div>

      <Button 
        onClick={(e) => { e.stopPropagation(); onJoin(); }}
        disabled={loading || room.current_participants >= room.max_participants}
        className="w-full h-12 rounded-xl premium-gradient text-white font-black text-[11px] uppercase tracking-widest group/btn active:scale-95 transition-all shadow-md"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            ENTRAR NA MESA
            <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;