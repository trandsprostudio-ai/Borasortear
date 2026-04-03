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
    "É hoje!",
    "Quanto mais participares, mais chances tens, sabes né?",
    "Boa sorte! 🍀"
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
    }, 4500);
    return () => clearInterval(timer);
  }, [currentPhrases]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Speech Bubble */}
      <div className="relative mb-3 w-full px-4 flex justify-center min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${index}`}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white text-[#0A0B12] px-4 py-2.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-2 border-purple-500 relative max-w-[240px] md:max-w-[280px]"
          >
            <p className="text-[10px] md:text-[11px] font-black italic text-center uppercase tracking-tight leading-tight">
              {currentPhrases[index]}
            </p>
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinguim SVG Animado */}
      <div className="relative">
        {/* Glow Effect */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-white/10 blur-3xl rounded-full"
        />

        <motion.div 
          animate={{ 
            y: [0, -4, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Body (Black) */}
            <path 
              d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" 
              fill="#0F111A" 
            />

            {/* Fins (Arms) */}
            <motion.path 
              d="M26 45C22 45 18 55 20 70" 
              stroke="#0F111A" strokeWidth="8" strokeLinecap="round"
              animate={{ rotate: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '26px', originY: '45px' }}
            />
            <motion.path 
              d="M74 45C78 45 82 55 80 70" 
              stroke="#0F111A" strokeWidth="8" strokeLinecap="round"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '74px', originY: '45px' }}
            />
            
            {/* White Chest */}
            <path 
              d="M50 25C40 25 32 35 32 50C32 70 38 85 50 85C62 85 68 70 68 50C68 35 60 25 50 25Z" 
              fill="white" 
            />

            {/* Yellow Shirt */}
            <path 
              d="M32 55C32 75 38 85 50 85C62 85 68 75 68 55C58 52 42 52 32 55Z" 
              fill="#FACC15" 
            />

            <text x="50" y="72" fontSize="7" fill="#0F111A" fontWeight="900" textAnchor="middle" style={{ fontStyle: 'italic' }}>BORA?</text>

            {/* Eyes & Blinking */}
            <circle cx="42" cy="35" r="3.5" fill="white" />
            <circle cx="58" cy="35" r="3.5" fill="white" />
            <motion.ellipse 
              cx="42.5" cy="35" rx="2" ry="2" fill="black" 
              animate={{ ry: [2, 0, 2] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
            />
            <motion.ellipse 
              cx="57.5" cy="35" rx="2" ry="2" fill="black" 
              animate={{ ry: [2, 0, 2] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
            />

            {/* Beak */}
            <path d="M50 38L46 44H54L50 38Z" fill="#F97316" />

            {/* Feet */}
            <path d="M42 88C38 88 36 91 40 92C44 93 46 91 42 88Z" fill="#F97316" />
            <path d="M58 88C62 88 64 91 60 92C56 93 54 91 58 88Z" fill="#F97316" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default PenguinMascot;