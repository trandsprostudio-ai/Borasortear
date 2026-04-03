"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageType = 'home' | 'raffle' | 'logout';

interface PenguinMascotProps {
  page: PageType;
  className?: string;
}

const PHRASES: Record<PageType, string[]> = {
  home: [
    "Bem-vindo! Preparado para tentar a sorte?",
    "Hoje pode ser o seu dia, sinto cheiro do didin!",
    "Prepara o bolso é hoje!",
    "Entra na mesa de 5 mil e ganha mais!",
    "Ganhe até 500.000 kz hoje é seu dia!"
  ],
  raffle: [
    "É agora ou nunca! Vamos com tudo! 🔥",
    "Quanto mais participares, mais chances tens, sabes né?",
    "Boa sorte! 🍀 Acredita no teu bilhete!",
    "Essa mesa está com uma energia incrível! ✨"
  ],
  logout: [
    "Volte sempre!",
    "Vou ter saudades 😄",
    "Até breve, campeão da sorte!"
  ]
};

const PenguinMascot = ({ page, className = "" }: PenguinMascotProps) => {
  const [index, setIndex] = useState(0);
  const currentPhrases = PHRASES[page];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % currentPhrases.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentPhrases]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Speech Bubble Refinado */}
      <div className="relative mb-2 w-full px-4 flex justify-center min-h-[65px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${index}`}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="bg-white text-[#0A0B12] px-4 py-2.5 rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-2 border-purple-500 relative max-w-[220px] md:max-w-[260px]"
          >
            <p className="text-[10px] md:text-[11px] font-black italic text-center uppercase tracking-tight leading-tight">
              {currentPhrases[index]}
            </p>
            {/* Seta do Balão */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mascote Pinguim */}
      <div className="relative">
        {/* Sombra Dinâmica */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 blur-md rounded-full"
        />

        <motion.div 
          animate={{ 
            y: [0, -6, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Corpo (Preto Premium) */}
            <path 
              d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" 
              fill="#1A1D29" 
            />

            {/* Braços com Movimento de Respiração */}
            <motion.path 
              d="M26 45C22 45 18 55 20 70" 
              stroke="#1A1D29" strokeWidth="9" strokeLinecap="round"
              animate={{ rotate: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '26px', originY: '45px' }}
            />
            <motion.path 
              d="M74 45C78 45 82 55 80 70" 
              stroke="#1A1D29" strokeWidth="9" strokeLinecap="round"
              animate={{ rotate: [0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              style={{ originX: '74px', originY: '45px' }}
            />
            
            {/* Peito Branco */}
            <path 
              d="M50 25C40 25 32 35 32 50C32 70 38 85 50 85C62 85 68 70 68 50C68 35 60 25 50 25Z" 
              fill="white" 
            />

            {/* Camisa Amarela 'BORA?' */}
            <path 
              d="M32 55C32 75 38 85 50 85C62 85 68 75 68 55C58 52 42 52 32 55Z" 
              fill="#FACC15" 
            />
            <text x="50" y="72" fontSize="7" fill="#1A1D29" fontWeight="900" textAnchor="middle" style={{ fontStyle: 'italic', letterSpacing: '-0.02em' }}>BORA?</text>

            {/* Olhos e Piscar */}
            <circle cx="42" cy="35" r="4" fill="white" />
            <circle cx="58" cy="35" r="4" fill="white" />
            
            <motion.circle 
              cx="42.5" cy="35" r="2.2" fill="black" 
              animate={{ scaleY: [1, 0, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
              style={{ originY: '35px' }}
            />
            <motion.circle 
              cx="57.5" cy="35" r="2.2" fill="black" 
              animate={{ scaleY: [1, 0, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
              style={{ originY: '35px' }}
            />
            
            {/* Brilho nos Olhos */}
            <circle cx="41.5" cy="33.5" r="0.8" fill="white" opacity="0.8" />
            <circle cx="56.5" cy="33.5" r="0.8" fill="white" opacity="0.8" />

            {/* Bico */}
            <path d="M50 38L45 44H55L50 38Z" fill="#F97316" />

            {/* Patas */}
            <circle cx="40" cy="89" r="3" fill="#F97316" />
            <circle cx="60" cy="89" r="3" fill="#F97316" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default PenguinMascot;