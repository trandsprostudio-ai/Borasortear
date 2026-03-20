"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Zap } from 'lucide-react';

interface Winner {
  id: string;
  profiles: { first_name: string };
  prize_amount: number;
  position: number;
}

interface WinnersCarouselProps {
  winners: Winner[];
}

const WinnersCarousel = ({ winners }: WinnersCarouselProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (winners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [winners.length]);

  if (winners.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-white/10 font-black text-xs uppercase tracking-widest">Aguardando os próximos resultados...</p>
      </div>
    );
  }

  const current = winners[index];

  return (
    <div className="relative h-32 w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="absolute inset-0 flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 border border-white/10">
                <span className="text-xl font-black italic">{current.profiles?.first_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black shadow-lg border-2 border-[#0A0B12]">
                <Trophy size={14} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Top Ganhador</span>
                <div className="flex gap-0.5">
                  <Zap size={8} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
              <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">
                @{current.profiles?.first_name || 'Usuário'}
              </h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Posição: {current.position}º Lugar no Sorteio
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Prêmio Faturado</p>
            <p className="text-3xl font-black text-green-400 italic tracking-tighter">
              {current.prize_amount.toLocaleString()} <span className="text-sm not-italic opacity-60">Kz</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {winners.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? 'w-6 bg-purple-500' : 'w-1.5 bg-white/10'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default WinnersCarousel;