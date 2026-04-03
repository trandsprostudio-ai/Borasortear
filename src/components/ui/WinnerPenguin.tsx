"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phrases = [
  "O TEMPO ESTÁ QUASE! ⏳",
  "HOJE É O TEU DIA! 🍀",
  "FORÇA, CAMPEÃO! 🐧",
  "BOA SORTE NA MESA! 🏆",
  "A VITÓRIA VEM... ✨",
  "BILHETE NA MÃO! 💰"
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
      {/* Balão de Fala Compacto */}
      <div className="relative mb-1 w-full px-6 flex justify-center min-h-[50px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            className="bg-white text-[#0A0B12] px-3 py-1.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-purple-500/30 relative max-w-full"
          >
            <p className="text-[9px] md:text-[10px] font-black italic text-center uppercase tracking-tighter leading-tight whitespace-nowrap">
              {phrases[index]}
            </p>
            {/* Triângulo do Balão */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pinguim Realista Preto e Branco */}
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-white/10 blur-3xl rounded-full"
        />

        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-36 h-36 md:w-44 md:h-44 z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Corpo Principal (Preto) */}
            <path 
              d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" 
              fill="#0F111A" 
            />

            {/* Barbatanas Realistas (Presas ao corpo, animação de leve) */}
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
            
            {/* Peito Branco Realista */}
            <path 
              d="M50 25C40 25 32 35 32 50C32 70 38 85 50 85C62 85 68 70 68 50C68 35 60 25 50 25Z" 
              fill="white" 
            />

            {/* Camisa Amarela (Sobreposta ao peito) */}
            <path 
              d="M32 55C32 75 38 85 50 85C62 85 68 75 68 55C58 52 42 52 32 55Z" 
              fill="#FACC15" 
            />

            {/* Texto BORA? na Camisa */}
            <text 
              x="50" y="72" 
              fontSize="7" fill="#0F111A" fontWeight="900" textAnchor="middle" 
              style={{ fontStyle: 'italic', letterSpacing: '-0.02em' }}
            >
              BORA?
            </text>

            {/* Rosto */}
            <circle cx="42" cy="35" r="3.5" fill="white" />
            <circle cx="58" cy="35" r="3.5" fill="white" />
            <circle cx="42.5" cy="35" r="2" fill="black" />
            <circle cx="57.5" cy="35" r="2" fill="black" />
            {/* Brilho nos Olhos */}
            <circle cx="41.8" cy="34" r="0.8" fill="white" />
            <circle cx="56.8" cy="34" r="0.8" fill="white" />

            {/* Bico Realista */}
            <path d="M50 38L46 44H54L50 38Z" fill="#F97316" />
            <circle cx="50" cy="43.5" r="1.2" fill="#F97316" />

            {/* Patas Laranja */}
            <path d="M42 88C38 88 36 91 40 92C44 93 46 91 42 88Z" fill="#F97316" />
            <path d="M58 88C62 88 64 91 60 92C56 93 54 91 58 88Z" fill="#F97316" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default WinnerPenguin;