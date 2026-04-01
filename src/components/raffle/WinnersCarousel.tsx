"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';

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
  const [displayWinners, setDisplayWinners] = useState<Winner[]>([]);

  // Dados fictícios baseados nos módulos (33% do pool total)
  const fakeWinners: Winner[] = [
    { id: 'f1', profiles: { first_name: 'António' }, prize_amount: 16500, position: 1 },
    { id: 'f2', profiles: { first_name: 'Isabel' }, prize_amount: 33000, position: 1 },
    { id: 'f3', profiles: { first_name: 'Mauro' }, prize_amount: 82500, position: 1 },
    { id: 'f4', profiles: { first_name: 'Cláudia' }, prize_amount: 66000, position: 1 },
    { id: 'f5', profiles: { first_name: 'Ricardo' }, prize_amount: 33000, position: 2 },
    { id: 'f6', profiles: { first_name: 'Sandra' }, prize_amount: 13200, position: 1 },
  ];

  useEffect(() => {
    // Se tivermos vencedores reais, usamos eles. Se não, usamos os fictícios.
    if (initialWinners && initialWinners.length > 0) {
      setDisplayWinners(initialWinners);
    } else {
      setDisplayWinners(fakeWinners);
    }
  }, [initialWinners]);

  useEffect(() => {
    if (displayWinners.length <= 1) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayWinners.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [displayWinners.length]);

  if (displayWinners.length === 0) return null;

  const current = displayWinners[index];

  return (
    <div className="relative h-32 w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.id}-${index}`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent rounded-3xl border border-white/5"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 border border-white/10 overflow-hidden">
                <motion.span 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  key={current.profiles?.first_name}
                  className="text-2xl font-black italic"
                >
                  {current.profiles?.first_name?.charAt(0) || 'U'}
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <motion.div 
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black shadow-lg border-2 border-[#0A0B12]"
              >
                <Trophy size={14} />
              </motion.div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Último Resultado</span>
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} size={8} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>
              <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">
                @{current.profiles?.first_name || 'Usuário'}
              </h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Posição: {current.position}º Lugar na Mesa
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Prémio Faturado</p>
            <motion.p 
              key={current.prize_amount}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl font-black text-green-400 italic tracking-tighter"
            >
              {current.prize_amount.toLocaleString()} <span className="text-sm not-italic opacity-60">Kz</span>
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {displayWinners.slice(0, 6).map((_, i) => (
          <motion.div 
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