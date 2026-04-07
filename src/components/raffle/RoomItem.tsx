"use client";

import React from 'react';
import { Users, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
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
    <div className="glass-card p-5 rounded-[1.5rem] relative overflow-hidden transition-all hover:border-blue-500/30">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-[#555555]/40 uppercase tracking-[0.2em]">MESA DISPONÍVEL</span>
          <h3 className="text-sm font-black italic tracking-tighter text-[#111111]">#{room.id.slice(0, 6)}</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-[#E8F5E9] px-2 py-1 rounded-full border border-[#C8E6C9]">
          <div className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-[#2E7D32] uppercase">Aberto</span>
        </div>
      </div>

      <div className="bg-[#f5f5f5] p-3 rounded-xl border border-[#e0e0e0] mb-4">
        <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Prémio Estimado</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-[#111111] italic">{estimatedPrize.toLocaleString()} <span className="text-[10px] not-italic opacity-30">Kz</span></span>
          <TrendingUp size={14} className="text-blue-600/40" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-end">
          <span className="text-[9px] font-bold text-[#555555] uppercase tracking-widest">{room.current_participants}/{room.max_participants} Jogadores</span>
          <span className={cn(
            "text-[9px] font-black uppercase",
            percentage > 80 ? "text-red-500" : "text-[#555555]/40"
          )}>{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#e0e0e0] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full premium-gradient"
          />
        </div>
      </div>

      <Button 
        onClick={onJoin}
        disabled={loading || room.current_participants >= room.max_participants}
        className="w-full h-10 rounded-xl premium-gradient text-white border-none font-black text-[10px] uppercase tracking-[0.1em] group/btn shadow-md"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          <>
            SORTEAR AGORA
            <ArrowRight size={12} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;