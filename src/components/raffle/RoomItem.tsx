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
    <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group">
      {/* Detalhe de luxo superior */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#f0f0f0]" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles size={12} className="text-amber-500" />
             <span className="text-[9px] font-black text-[#111111] uppercase tracking-[0.2em]">Mesa Ativa</span>
          </div>
          <h3 className="text-base font-black italic tracking-tighter text-[#111111] uppercase">
            Sorteio #{room.id.slice(0, 6)}
          </h3>
        </div>
        <div className="bg-[#f0f0f0] px-3 py-1.5 rounded-full border border-[#e5e7eb] flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-[#111111] uppercase">Tempo Real</span>
        </div>
      </div>

      {/* Caixa de Prémio Ouro */}
      <div className="gold-gradient p-5 rounded-[1.5rem] mb-6 shadow-lg shadow-amber-500/10 border border-white/20 animate-shimmer">
        <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-1">Prémio de Vencedor</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-black italic tracking-tighter">
            {estimatedPrize.toLocaleString()} <span className="text-xs not-italic opacity-50">Kz</span>
          </span>
          <TrendingUp size={20} className="text-black/20" />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#111111]/20" />
            <span className="text-[10px] font-black text-[#111111] uppercase">{room.current_participants}/{room.max_participants} Jogadores</span>
          </div>
          <span className={cn(
            "text-[10px] font-black",
            percentage > 80 ? "text-amber-600" : "text-[#111111]/40"
          )}>{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-[#f0f0f0] rounded-full overflow-hidden border border-[#e5e7eb]">
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
        className="w-full h-12 rounded-xl premium-gradient text-white border-none font-black text-[11px] uppercase tracking-[0.1em] group/btn shadow-xl shadow-black/10 active:scale-[0.98] transition-transform"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>
            PARTICIPAR NO SORTEIO
            <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;