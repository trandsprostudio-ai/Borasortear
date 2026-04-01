"use client";

import React from 'react';
import { Trophy, Star } from 'lucide-react';

const HallOfFame = () => {
  // Gerar 50 IDs fictícios
  const winners = Array.from({ length: 50 }, (_, i) => ({
    id: `USER_${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + (i % 26))}`,
    amount: [300, 600, 1500, 3000, 6000, 15000][Math.floor(Math.random() * 6)],
    module: ["M100", "M200", "M500", "M1000", "M2000", "M5000"][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden h-[400px] flex flex-col">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Hall da Fama</h3>
        </div>
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Últimas 24h</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
        {winners.map((w, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Star size={12} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/80">{w.id}</p>
                <p className="text-[8px] font-bold text-white/20 uppercase">{w.module}</p>
              </div>
            </div>
            <span className="text-[11px] font-black text-green-400">+{w.amount} KZ</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;