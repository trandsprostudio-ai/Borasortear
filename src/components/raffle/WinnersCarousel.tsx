"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Hash } from 'lucide-react';

interface Winner {
  id: string;
  profiles: { first_name: string };
  prize_amount: number;
  position: number;
}

interface WinnersCarouselProps {
  winners: Winner[];
}

const WinnersCarousel = ({ winners: initialWinners }: WinnersCarouselProps) => {
  const [index, setIndex] = useState(0);

  const displayWinners = useMemo(() => {
    if (initialWinners && initialWinners.length > 0) return initialWinners;

    const modules = [16500, 33000, 82500, 66000, 132000, 41250];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: `fake-${i}`,
      profiles: { 
        first_name: Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
      },
      prize_amount: modules[Math.floor(Math.random() * modules.length)],
      position: Math.random() > 0.5 ? 1 : 2
    }));
  }, [initialWinners]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayWinners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [displayWinners.length]);

  const current = displayWinners[index];

  return (
    <div className="relative h-28 md:h-32 w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.id}-${index}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5"
        >
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Hash size={20} className="md:size-6" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 md:w-7 md:h-7 bg-amber-500 rounded-lg flex items-center justify-center text-black shadow-lg border-2 border-[#0A0B12]">
                <Trophy size={10} className="md:size-3" />
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest truncate">Sorteio Confirmado</span>
                <Star size={8} className="text-amber-500 fill-amber-500 shrink-0" />
              </div>
              <h4 className="text-base md:text-xl font-black italic tracking-tighter text-white uppercase truncate">
                #{current.profiles.first_name}
              </h4>
              <p className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">
                ID DO BILHETE
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Ganhou</p>
            <p className="text-lg md:text-3xl font-black text-green-400 italic tracking-tighter">
              {current.prize_amount.toLocaleString()} <span className="text-[10px] md:text-sm not-italic opacity-60">Kz</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WinnersCarousel;