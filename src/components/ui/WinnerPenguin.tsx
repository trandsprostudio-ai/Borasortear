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
    <div className={`flex flex-col items-center justify-center w-full max-w-[280px] mx-auto ${className}`}>
      {/* Balão de Fala Responsivo */}
      <div className="relative mb-4 w-full px-2 flex justify-center min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="bg-white text-[#0A0B12] px-4 py-2.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] border-2 border-purple-500 relative max-w-full"
          >
            <p className="text-[10px] md:text-[11px] font-black italic text-center uppercase tracking-tight leading-tight break-words">
              {phrases[index]}
            </p>
            {/* Triângulo do Balão */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinguim Animado */}
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"
        />

        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-36 h-36 md:w-48 md:h-48 z-10"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Braço Esquerdo Animado */}
            <motion.path 
              d="M6 12C4 13 3 15 3 17" 
              stroke="#0F111A" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              animate={{ rotate: [0, -15, 0], x: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "6px", originY: "12px" }}
            />

            {/* Braço Direito Animado (Acenando) */}
            <motion.path 
              d="M18 12C20 11 22 9 22 7" 
              stroke="#0F111A" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              animate={{ rotate: [0, 20, 0], y: [0, -2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "18px", originY: "12px" }}
            />

            {/* Corpo Principal (Preto) */}
            <path 
              d="M12 2C8.5 2 6 5 6 9C6 11 6.5 12.5 7.5 14C6.5 16 6 18 6 20C6 21 7 22 12 22C17 22 18 21 18 20C18 18 17.5 16 16.5 14C17.5 12.5 18 11 18 9C18 5 15.5 2 12 2Z" 
              fill="#0F111A" 
            />
            
            {/* Camisa Amarela */}
            <path 
              d="M7.5 14C6.5 16 6 18 6 20C6 20.5 6.5 21 8 21H16C17.5 21 18 20.5 18 20C18 18 17.5 16 16.5 14C15.5 13 14.5 12.5 12 12.5C9.5 12.5 8.5 13 7.5 14Z" 
              fill="#FACC15" 
            />

            {/* Texto na Camisa */}
            <text 
              x="12" 
              y="17" 
              fontSize="1.8" 
              fill="#0F111A" 
              fontWeight="900" 
              textAnchor="middle" 
              style={{ fontStyle: 'italic' }}
            >
              BORA?
            </text>

            {/* Barriga Branca Pequena */}
            <circle cx="12" cy="19.5" r="1.5" fill="white" />

            {/* Olhos */}
            <circle cx="10" cy="7.5" r="1.5" fill="white" />
            <circle cx="14" cy="7.5" r="1.5" fill="white" />
            <circle cx="10" cy="7.5" r="0.8" fill="black" />
            <circle cx="14" cy="7.5" r="0.8" fill="black" />

            {/* Bico */}
            <path d="M12 8.5L10.5 10.5H13.5L12 8.5Z" fill="#F97316" />

            {/* Patas */}
            <path d="M9 21.5L7.5 22.5H10.5L9 21.5Z" fill="#F97316" />
            <path d="M15 21.5L13.5 22.5H16.5L15 21.5Z" fill="#F97316" />
          </svg>

          {/* Efeito de Brilho na Estrela */}
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WinnerPenguin;