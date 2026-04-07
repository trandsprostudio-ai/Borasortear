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
    <div className="glass-card p-6 rounded-[2.5rem] bg-white relative overflow-hidden group cursor-pointer border-[#F3F4F6]">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Sparkles size={12} className="text-[#FFA500]" />
             <span className="text-[9px] font-black text-[#0A0B12] uppercase tracking-widest">Sorteio Ativo</span>
          </div>
          <h3 className="text-lg font-black italic tracking-tighter text-[#0A0B12] uppercase">
            Mesa #{room.id.slice(0, 6)}
          </h3>
        </div>
        <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-full border border-[#D1D5DB] flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-[#0A0B12] uppercase">Live</span>
        </div>
      </div>

      <div className="gold-gradient p-5 rounded-[1.8rem] mb-6 shadow-xl shadow-yellow-500/20 relative group-hover:scale-[1.02] transition-transform">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]" />
        <p className="text-[9px] font-black text-black/60 uppercase tracking-widest mb-1">Prémio Estimado</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-black italic tracking-tighter">
            {estimatedPrize.toLocaleString()} <span className="text-xs not-italic opacity-60">Kz</span>
          </span>
          <TrendingUp size={20} className="text-black/30" />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-[#0A0B12] uppercase opacity-40">Ocupação</span>
          <span className="text-[10px] font-black text-[#0066FF]">{percentage}%</span>
        </div>
        <div className="h-2.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden border border-[#E5E7EB]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full premium-gradient"
          />
        </div>
        <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0066FF]" />
            <span className="text-[10px] font-bold text-[#0A0B12]/70">{room.current_participants} de {room.max_participants} Jogadores</span>
        </div>
      </div>

      <Button 
        onClick={(e) => { e.stopPropagation(); onJoin(); }}
        disabled={loading || room.current_participants >= room.max_participants}
        className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            ENTRAR NA MESA
            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;