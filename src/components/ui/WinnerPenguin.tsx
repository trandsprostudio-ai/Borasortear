"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Balão de Fala na Cabeça */}
      <div className="relative mb-2 h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -10 }}
            className="bg-white text-[#0A0B12] px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-2 border-purple-500 relative"
          >
            <p className="text-[10px] font-black italic text-center uppercase tracking-tighter leading-tight whitespace-nowrap">
              {phrases[index]}
            </p>
            {/* Triângulo do Balão (apontando para baixo) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinguim Realista com Camisa Amarela */}
      <div className="relative">
        {/* Brilho de Fundo */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"
        />

        <motion.div 
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, -1, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 z-10"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl">
            {/* Corpo Principal (Preto) */}
            <path 
              d="M12 2C8.5 2 6 5 6 9C6 11 6.5 12.5 7.5 14C6.5 16 6 18 6 20C6 21 7 22 12 22C17 22 18 21 18 20C18 18 17.5 16 16.5 14C17.5 12.5 18 11 18 9C18 5 15.5 2 12 2Z" 
              fill="#0F111A" 
            />
            
            {/* Camisa Amarela (Cobre o peito) */}
            <path 
              d="M7.5 14C6.5 16 6 18 6 20C6 20.5 6.5 21 8 21H16C17.5 21 18 20.5 18 20C18 18 17.5 16 16.5 14C15.5 13 14.5 12.5 12 12.5C9.5 12.5 8.5 13 7.5 14Z" 
              fill="#FACC15" 
            />

            {/* Barriga Branca (Por baixo da camisa) */}
            <path 
              d="M12 15C10.5 15 9.5 16.5 9.5 18.5C9.5 20 10.5 21 12 21C13.5 21 14.5 20 14.5 18.5C14.5 16.5 13.5 15 12 15Z" 
              fill="white" 
            />

            {/* Gola da Camisa */}
            <path d="M12 12.5L10 14H14L12 12.5Z" fill="#EAB308" />

            {/* Olhos Realistas */}
            <circle cx="10" cy="7.5" r="1.5" fill="white" />
            <circle cx="14" cy="7.5" r="1.5" fill="white" />
            <circle cx="10" cy="7.5" r="0.7" fill="black" />
            <circle cx="14" cy="7.5" r="0.7" fill="black" />

            {/* Bico (Laranja) */}
            <path d="M12 8.5L10.5 10.5H13.5L12 8.5Z" fill="#F97316" />

            {/* Patas (Laranja) */}
            <path d="M9 21.5L7.5 22.5H10.5L9 21.5Z" fill="#F97316" />
            <path d="M15 21.5L13.5 22.5H16.5L15 21.5Z" fill="#F97316" />
          </svg>

          {/* Estrela de Vitória */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 text-2xl"
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WinnerPenguin;