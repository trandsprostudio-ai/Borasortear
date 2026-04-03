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
    <div className={`flex flex-col items-center justify-center w-full max-w-[320px] mx-auto ${className}`}>
      {/* Balão de Fala Responsivo */}
      <div className="relative mb-2 w-full px-4 flex justify-center min-h-[70px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="bg-white text-[#0A0B12] px-5 py-3 rounded-[1.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.5)] border-2 border-purple-500 relative max-w-full"
          >
            <p className="text-[10px] md:text-[11px] font-black italic text-center uppercase tracking-tight leading-tight">
              {phrases[index]}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinguim Realista Fofinho */}
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full"
        />

        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-40 h-40 md:w-52 md:h-52 z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Corpo Principal Arredondado */}
            <path 
              d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" 
              fill="#1A1D29" 
            />

            {/* Barbatanas (Braços) Integradas com Movimento Suave */}
            <motion.path 
              d="M26 45C20 45 15 55 18 65" 
              stroke="#1A1D29" strokeWidth="10" strokeLinecap="round"
              animate={{ rotate: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '26px', originY: '45px' }}
            />
            <motion.path 
              d="M74 45C80 45 85 55 82 65" 
              stroke="#1A1D29" strokeWidth="10" strokeLinecap="round"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '74px', originY: '45px' }}
            />
            
            {/* Camisa Amarela com Curvatura */}
            <path 
              d="M28 55C28 75 35 88 50 88C65 88 72 75 72 55C60 52 40 52 28 55Z" 
              fill="#FACC15" 
            />

            {/* Texto BORA? na Camisa */}
            <text 
              x="50" y="75" 
              fontSize="8" fill="#1A1D29" fontWeight="900" textAnchor="middle" 
              style={{ fontStyle: 'italic', letterSpacing: '-0.05em' }}
            >
              BORA?
            </text>

            {/* Peito Branco Fofinho */}
            <path 
              d="M50 58C42 58 38 65 38 75C38 82 42 86 50 86C58 86 62 82 62 75C62 65 58 58 50 58Z" 
              fill="white" 
            />

            {/* Rosto - Olhos Grandes e Fofos */}
            <circle cx="42" cy="35" r="4.5" fill="white" />
            <circle cx="58" cy="35" r="4.5" fill="white" />
            <circle cx="42.5" cy="35" r="2.5" fill="black" />
            <circle cx="57.5" cy="35" r="2.5" fill="black" />
            {/* Brilho nos Olhos */}
            <circle cx="41.5" cy="33.5" r="1" fill="white" />
            <circle cx="56.5" cy="33.5" r="1" fill="white" />

            {/* Bochechas Rosadas */}
            <circle cx="34" cy="42" r="3" fill="#FFB7B7" opacity="0.4" />
            <circle cx="66" cy="42" r="3" fill="#FFB7B7" opacity="0.4" />

            {/* Bico Realista Arredondado */}
            <path d="M50 38L45 44H55L50 38Z" fill="#F97316" />
            <circle cx="50" cy="43" r="1.5" fill="#F97316" />

            {/* Patas Laranja Arredondadas */}
            <circle cx="40" cy="89" r="4" fill="#F97316" />
            <circle cx="60" cy="89" r="4" fill="#F97316" />
          </svg>

          {/* Moedas Flutuantes de Sucesso */}
          <motion.div 
            animate={{ y: [-20, -40], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute top-0 right-4 text-xl"
          >
            💰
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WinnerPenguin;