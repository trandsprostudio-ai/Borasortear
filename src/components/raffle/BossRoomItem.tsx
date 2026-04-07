"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTimeRemaining } from '@/utils/date-utils';

interface BossRoomItemProps {
  room: any;
  participantCount: number;
  onJoin: () => void;
  loading?: boolean;
}

const BossRoomItem = ({ room, onJoin, loading }: BossRoomItemProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(room.expires_at));
    }, 1000);
    return () => clearInterval(timer);
  }, [room.expires_at]);

  return (
    <div className="relative group">
      {/* Efeito de Brilho Externo */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-[2.5rem] opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-[#0A0B12] p-6 md:p-8 rounded-[2.5rem] border-2 border-amber-500/30 overflow-hidden shadow-2xl">
        {/* Background Decorativo */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield size={120} className="text-amber-500" />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">MESA PREMIUM BOSS</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase">{room.name}</h3>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Ativa</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-transparent p-6 rounded-[2rem] border border-amber-500/10 mb-6 shadow-inner">
          <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] mb-2">Prémio Estimado</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none">
              {Number(room.estimated_prize).toLocaleString()}
            </span>
            <span className="text-sm font-black text-amber-500 mb-1">KZ</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-amber-500" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">O sorteio encerra em:</span>
            </div>
            <p className="text-sm font-black text-white tracking-[0.1em]">{timeLeft || "72:00:00"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Entrada Mínima</span>
            <span className="text-lg font-black text-white italic">{Number(room.entry_fee).toLocaleString()} Kz</span>
          </div>
          
          <Button 
            onClick={onJoin}
            disabled={loading}
            className="w-full h-16 rounded-[1.8rem] bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 transition-all border-none"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="flex items-center gap-2">
                ENTRAR AGORA <ArrowRight size={18} />
              </div>
            )}
          </Button>
          
          <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-widest">
            🛡️ Apenas Saldo Real • Bónus Bloqueado
          </p>
        </div>
      </div>
    </div>
  );
};

export default BossRoomItem;