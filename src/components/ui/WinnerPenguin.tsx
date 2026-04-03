"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Star } from 'lucide-react';

const phrases = [
  "O TEMPO ESTÁ QUASE! PREPARA O GRITO! ⏳",
  "HOJE É O TEU DIA DE SORTE! EU SINTO! 🍀",
  "ESTOU A TORCER POR TI, CAMPEÃO! 🐧",
  "ESPERO QUE VENÇAS ESTA MESA! 🏆",
  "A TUA VITÓRIA ESTÁ A CAMINHO... ✨",
  "BILHETE NA MÃO, DINHEIRO NO BOLSO! 💰"
];

const WinnerPenguin = ({ className = "" }: { className?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mb-4">
        {/* Efeito de Brilho */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"
        />

        {/* Pinguim com Animação de Salto */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 md:w-28 md:h-28 z-10"
        >
          {/* Círculo Amarelo */}
          <div className="absolute inset-0 bg-amber-500 rounded-full shadow-lg border-2 border-white/10" />
          
          {/* Boneco */}
          <svg 
            viewBox="0 0 24 24" 
            className="absolute w-[65%] h-[65%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0A0B12]"
            fill="currentColor"
          >
            <circle cx="12" cy="6" r="3.5" />
            <path d="M12 10c-2.5 0-4.5 1.5-4.5 4v2h9v-2c0-2.5-2-4-4.5-4z" />
            <path d="M7.5 16l-2.5 3.5h4l1-3.5M16.5 16l2.5 3.5h-4l-1-3.5" />
          </svg>

          {/* Troféu Flutuante */}
          <motion.div 
            animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -left-1 text-2xl"
          >
            🏆
          </motion.div>
        </motion.div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-[#1A1D29]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl max-w-[200px]"
          >
            {/* Triângulo do Balão de Fala */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-bottom-[8px] border-b-[#1A1D29]/90" />
            
            <p className="text-[9px] font-black italic text-center text-white uppercase tracking-tighter leading-tight">
              "{phrases[index]}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WinnerPenguin;