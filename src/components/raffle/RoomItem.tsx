"use client";

import React from 'react';
import { Users, Clock, ArrowRight, Loader2, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoomItemProps {
  room: any;
  onJoin: () => void;
  loading?: boolean;
}

const RoomItem = ({ room, onJoin, loading }: RoomItemProps) => {
  const percentage = Math.round((room.current_participants / room.max_participants) * 100);
  
  // Prémio estimado: 33.3% do total arrecadado quando cheia
  const estimatedPrize = Math.floor((room.modules.price * room.max_participants) * 0.333);

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Users size={80} />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">MESA ATIVA</p>
          <h3 className="text-xl font-black italic tracking-tighter">#{room.id.slice(0, 8)}</h3>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <Globe size={12} className="text-green-500" />
          <span className="text-[10px] font-black text-green-500 uppercase">Online</span>
        </div>
      </div>

      <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Prémio de 1º Lugar</p>
          <p className="text-xl font-black text-white italic">{estimatedPrize.toLocaleString()} <span className="text-[10px] not-italic opacity-40">Kz</span></p>
        </div>
        <TrendingUp size={24} className="text-purple-500/30" />
      </div>

      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{room.current_participants}</span>
            <span className="text-sm font-bold text-white/20">/ {room.max_participants}</span>
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            percentage > 80 ? "text-red-400 animate-pulse" : "text-white/40"
          )}>
            {percentage}% PREENCHIDO
          </span>
        </div>
        
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <Button 
        onClick={onJoin}
        disabled={loading || room.current_participants >= room.max_participants}
        className="w-full h-14 rounded-2xl premium-gradient font-black text-sm uppercase tracking-widest relative z-10 group/btn overflow-hidden"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            ENTRAR NA MESA
            <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </div>
  );
};

export default RoomItem;