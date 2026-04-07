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
    <div 
      onClick={onJoin}
      className="platinum-gradient p-4 md:p-5 rounded-[2.5rem] relative overflow-hidden group cursor-pointer border-2 border-[#E5E7EB] shadow-xl hover:shadow-2xl hover:border-[#0066FF]/30 transition-all duration-500"
    >
      {/* Header Compacto */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
             <Sparkles size={10} className="text-[#FFA500]" />
             <span className="text-[8px] font-black text-[#0A0B12]/60 uppercase tracking-widest">Sorteio Ativo</span>
          </div>
          <h3 className="text-lg font-black italic tracking-tighter text-[#0A0B12] uppercase">
            Mesa #{room.id.slice(0, 6)}
          </h3>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D1D5DB] flex items-center gap-2 shadow-sm">
           <div className="w-1.5 h-1.5 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_6px_#0066FF]" />
           <span className="text-[8px] font-black text-[#0A0B12] uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Bloco de Prémio Otimizado */}
      <div className="gold-gradient p-4 rounded-[1.8rem] mb-3 shadow-lg shadow-yellow-500/20 relative group-hover:scale-[1.02] transition-all duration-500 border border-white/20">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.8rem]" />
        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">Prémio Estimado</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-black italic tracking-tighter leading-none">
            {estimatedPrize.toLocaleString()} <span className="text-[10px] not-italic opacity-60">Kz</span>
          </span>
          <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <TrendingUp size={16} className="text-black/60" />
          </div>
        </div>
      </div>

      {/* Barra de Progresso Compacta */}
      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[1.5rem] border border-white/60 mb-4 shadow-inner">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[9px] font-black text-[#0A0B12]/40 uppercase tracking-widest">Ocupação</span>
          <span className="text-[10px] font-black text-[#0066FF] bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100">{percentage}%</span>
        </div>
        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#E5E7EB] p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full premium-gradient rounded-full shadow-[0_0_8px_rgba(0,102,255,0.3)]"
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2 ml-0.5">
            <Users size={12} className="text-[#0066FF]" />
            <span className="text-[9px] font-black text-[#0A0B12]/70 uppercase tracking-tighter">{room.current_participants} de {room.max_participants} Jogadores</span>
        </div>
      </div>

      {/* Botão Ajustado */}
      <Button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onJoin(); 
        }}
        disabled={loading}
        className="w-full h-14 rounded-[1.5rem] premium-gradient text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-blue-600/20 active:scale-95 hover:brightness-110 transition-all border-none"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <div className="flex items-center gap-2">
            ENTRAR NA MESA
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
          </div>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;