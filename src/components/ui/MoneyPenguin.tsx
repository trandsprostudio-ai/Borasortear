"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Sparkles } from 'lucide-react';

const phrases = [
  "CADA CONVITE É UM PASSO PARA O TOPO! 🚀",
  "A TUA REDE É O TEU IMPÉRIO. COMEÇA AGORA! 💰",
  "QUEM PARTILHA, MULTIPLICA! 💎",
  "O PRÓXIMO VENCEDOR PODE VIR DO TEU LINK! 👑",
  "TRANSFORMA A TUA REDE EM LUCRO PASSIVO! 💸",
  "BORA FATURAR JUNTOS! 🐧✨"
];

const MoneyPenguin = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-hidden">
      <div className="relative">
        {/* Notas a voar/serem contadas */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, x: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              y: -120, 
              x: (i % 2 === 0 ? 50 : -50), 
              opacity: [0, 1, 0],
              rotate: 360 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeOut"
            }}
            className="absolute text-green-500 z-0"
          >
            <Banknote size={24} />
          </motion.div>
        ))}

        {/* Círculo de Brilho */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"
        />

        {/* Pinguim (Baseado no BoraIcon, mas em versão Grande) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 z-10"
        >
          {/* Círculo Amarelo */}
          <div className="absolute inset-0 bg-amber-500 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] border-4 border-white/20" />
          
          {/* Boneco */}
          <svg 
            viewBox="0 0 24 24" 
            className="absolute w-[70%] h-[70%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0A0B12]"
            fill="currentColor"
          >
            <circle cx="12" cy="6" r="3.5" />
            <path d="M12 10c-2.5 0-4.5 1.5-4.5 4v2h9v-2c0-2.5-2-4-4.5-4z" />
            <path d="M7.5 16l-2.5 3.5h4l1-3.5M16.5 16l2.5 3.5h-4l-1-3.5" />
          </svg>

          {/* Dinheiro na mão do boneco */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-3xl"
          >
            💰
          </motion.div>
        </motion.div>
      </div>

      <div className="h-20 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bora Expandir</span>
              <Sparkles size={16} />
            </div>
            <h4 className="text-lg md:text-xl font-black italic tracking-tighter text-white uppercase max-w-sm">
              {phrases[index]}
            </h4>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoneyPenguin;