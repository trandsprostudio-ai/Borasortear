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
    <div className="platinum-gradient p-6 rounded-[3rem] relative overflow-hidden group cursor-pointer border-2 border-[#E5E7EB] shadow-xl hover:shadow-2xl hover:border-[#0066FF]/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Sparkles size={12} className="text-[#FFA500]" />
             <span className="text-[9px] font-black text-[#0A0B12]/60 uppercase tracking-widest">Sorteio Ativo</span>
          </div>
          <h3 className="text-xl font-black italic tracking-tighter text-[#0A0B12] uppercase">
            Mesa #{room.id.slice(0, 6)}
          </h3>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#D1D5DB] flex items-center gap-2 shadow-sm">
           <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_8px_#0066FF]" />
           <span className="text-[9px] font-black text-[#0A0B12] uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div className="gold-gradient p-6 rounded-[2.2rem] mb-6 shadow-2xl shadow-yellow-500/30 relative group-hover:scale-[1.03] transition-all duration-500 border border-white/20">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.2rem]" />
        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1.5">Prémio Estimado</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-black text-black italic tracking-tighter">
            {estimatedPrize.toLocaleString()} <span className="text-sm not-italic opacity-60">Kz</span>
          </span>
          <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
            <TrendingUp size={20} className="text-black/60" />
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[1.8rem] border border-white/60 mb-6 shadow-inner">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black text-[#0A0B12]/40 uppercase tracking-widest">Ocupação Real</span>
          <span className="text-[11px] font-black text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{percentage}%</span>
        </div>
        <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-[#E5E7EB] p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full premium-gradient rounded-full shadow-[0_0_10px_rgba(0,102,255,0.4)]"
          />
        </div>
        <div className="flex items-center gap-2 mt-3 ml-1">
            <Users size={14} className="text-[#0066FF]" />
            <span className="text-[10px] font-black text-[#0A0B12]/70 uppercase tracking-tighter">{room.current_participants} de {room.max_participants} Jogadores</span>
        </div>
      </div>

      <Button 
        onClick={(e) => { e.stopPropagation(); onJoin(); }}
        disabled={loading || room.current_participants >= room.max_participants}
        className="w-full h-16 rounded-[1.8rem] premium-gradient text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 hover:brightness-110 transition-all border-none"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <div className="flex items-center gap-2">
            ENTRAR NA MESA
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </div>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;