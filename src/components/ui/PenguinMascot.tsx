"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PenguinMascotProps {
  page: 'home' | 'raffle' | 'logout';
  className?: string;
}

const phrases = {
  home: [
    "Bem-vindo! Preparado para tentar a sorte?",
    "No Bora sempre tem vencedores...",
    "Aqui a vitória é real..",
    "3 vencedores por mesa e tu podes ser um deles!",
    "Seleciona o teu módulo e mesa e ganha no Bora Sortear!",
    "Hoje pode ser o teu dia, sinto cheiro de din-din!",
    "Prepara o bolso que hoje tem!"
  ],
  raffle: [
    "Bora que bora!",
    "Quanto mais participares, mais chances tens!",
    "Boa sorte! 🍀"
  ],
  logout: [
    "Volta sempre!",
    "Vou ter saudades 😄",
    "Até breve, campeão da sorte!"
  ]
};

const PenguinMascot = ({ page, className = "" }: PenguinMascotProps) => {
  const [index, setIndex] = useState(0);
  const currentPhrases = phrases[page] || phrases.home;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % currentPhrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentPhrases]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Balão de Fala */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute -top-16 mb-4 z-10"
        >
          <div className="bg-white text-[#0A0B12] px-4 py-2 rounded-2xl shadow-xl border border-white/20 relative min-w-[140px] max-w-[200px] text-center">
            <p className="text-[10px] font-black uppercase tracking-tight leading-tight">
              {currentPhrases[index]}
            </p>
            {/* Seta do Balão */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pinguim SVG com Braços */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 drop-shadow-2xl"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corpo Principal */}
          <ellipse cx="50" cy="55" rx="35" ry="40" fill="#0A0B12" />
          
          {/* Barriga Branca */}
          <ellipse cx="50" cy="62" rx="22" ry="28" fill="white" />
          
          {/* Braço Esquerdo */}
          <motion.path 
            d="M20 50C15 50 5 55 5 65C5 75 15 70 20 65" 
            stroke="#0A0B12" 
            strokeWidth="8" 
            strokeLinecap="round"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Braço Direito */}
          <motion.path 
            d="M80 50C85 50 95 55 95 65C95 75 85 70 80 65" 
            stroke="#0A0B12" 
            strokeWidth="8" 
            strokeLinecap="round"
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Olhos */}
          <circle cx="40" cy="35" r="4" fill="white" />
          <circle cx="60" cy="35" r="4" fill="white" />
          <circle cx="40" cy="35" r="2" fill="black" />
          <circle cx="60" cy="35" r="2" fill="black" />
          
          {/* Bico */}
          <path d="M50 48L42 40H58L50 48Z" fill="#F97316" />
          
          {/* Pés */}
          <ellipse cx="38" cy="88" rx="8" ry="4" fill="#FACC15" />
          <ellipse cx="62" cy="88" rx="8" ry="4" fill="#FACC15" />
        </svg>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;