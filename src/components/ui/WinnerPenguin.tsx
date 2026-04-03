"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  "Bora ganhar hoje? 💰",
  "A tua sorte começa aqui! 🍀",
  "3 vencedores, um podes ser tu! 🏆",
  "Prepara o bolso, o prémio vem! 💸",
  "Confia, a próxima mesa é tua! ✨",
  "Sente o cheiro da vitória? 🐧"
];

const WinnerPenguin = ({ className = "w-32 h-32", showSpeech = true }: { className?: string, showSpeech?: boolean }) => {
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    if (!showSpeech) return;
    const interval = setInterval(() => {
      setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }, 4500);
    return () => clearInterval(interval);
  }, [showSpeech]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className} select-none`}>
      {/* Balão de Fala - Posicionado acima do pinguim com margem de segurança */}
      <AnimatePresence mode="wait">
        {showSpeech && (
          <motion.div 
            key={phrase}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            className="absolute bottom-full mb-6 bg-white text-[#0A0B12] px-4 py-3 rounded-2xl font-black text-[9px] md:text-[10px] uppercase leading-tight shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-amber-400 min-w-[140px] max-w-[180px] text-center z-[100]"
          >
            {phrase}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-amber-400 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full pointer-events-auto"
      >
        <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
          {/* Sombra no chão */}
          <ellipse cx="100" cy="225" rx="50" ry="10" fill="black" fillOpacity="0.3" />
          
          {/* Corpo Principal (Preto) */}
          <path d="M50 140C50 80 150 80 150 140C150 210 130 230 100 230C70 230 50 210 50 140Z" fill="#1A1A1A" />
          
          {/* T-Shirt Amarela */}
          <path d="M55 130C55 110 145 110 145 130C145 180 135 210 100 210C65 210 55 180 55 130Z" fill="#FBBF24" />
          
          {/* Texto Bora? na T-Shirt */}
          <text x="100" y="165" fontSize="22" fontWeight="900" fill="black" textAnchor="middle" style={{ fontStyle: 'italic', fontFamily: 'Arial Black' }}>Bora?</text>
          
          {/* Máscara do Rosto */}
          <path d="M55 85C55 50 145 50 145 85C145 120 130 125 100 125C70 125 55 120 55 85Z" fill="#1A1A1A" />
          <ellipse cx="100" cy="88" rx="42" ry="35" fill="white" />
          
          {/* Pupilas Animadas */}
          <motion.g
            animate={{ 
              scaleY: [1, 1, 0.1, 1, 1],
              x: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              times: [0, 0.9, 0.92, 0.94, 1] 
            }}
          >
            <circle cx="82" cy="85" r="7" fill="black" />
            <circle cx="118" cy="85" r="7" fill="black" />
            <circle cx="80" cy="83" r="2.5" fill="white" />
            <circle cx="116" cy="83" r="2.5" fill="white" />
          </motion.g>

          {/* Bico (Laranja) */}
          <path d="M92 100L100 112L108 100H92Z" fill="#F97316" />
          
          {/* Asas */}
          <motion.path 
            animate={{ rotate: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            d="M50 135C30 135 25 160 45 175" stroke="#1A1A1A" strokeWidth="12" strokeLinecap="round" 
            style={{ originX: "50px", originY: "135px" }}
          />
          <motion.path 
            animate={{ rotate: [0, -20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            d="M150 135C170 135 175 160 155 175" stroke="#1A1A1A" strokeWidth="12" strokeLinecap="round" 
            style={{ originX: "150px", originY: "135px" }}
          />

          {/* Pés */}
          <ellipse cx="78" cy="225" rx="14" ry="7" fill="#F97316" />
          <ellipse cx="122" cy="225" rx="14" ry="7" fill="#F97316" />
        </svg>
      </motion.div>
    </div>
  );
};

export default WinnerPenguin;