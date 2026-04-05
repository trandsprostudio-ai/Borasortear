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
    "Seleciona o teu módulo e mesa e ganha no Bora!",
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
      {/* Balão de Fala Inteligente */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          className="absolute bottom-full mb-6 right-0 z-50 pointer-events-none"
        >
          <div className="bg-white text-[#0A0B12] px-5 py-3 rounded-2xl shadow-2xl border-2 border-purple-500/20 relative w-[180px] text-center">
            <p className="text-[10px] font-black uppercase tracking-tight leading-tight">
              {currentPhrases[index]}
            </p>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-purple-500/10" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pinguim em Azul Claro Vibrante */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 relative"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Sombra no chão */}
          <ellipse cx="50" cy="94" rx="18" ry="3" fill="black" opacity="0.1" />
          
          {/* Nadadeira Esquerda - Azul Claro */}
          <motion.path 
            d="M28 58C22 58 18 61 18 66C18 71 24 70 28 66" 
            stroke="#3B82F6" strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "28px", originY: "58px" }}
          />
          
          {/* Nadadeira Direita - Azul Claro */}
          <motion.path 
            d="M72 58C78 58 82 61 82 66C82 71 76 70 72 66" 
            stroke="#3B82F6" strokeWidth="7" strokeLinecap="round"
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "72px", originY: "58px" }}
          />

          {/* Corpo Azul Claro */}
          <ellipse cx="50" cy="55" rx="36" ry="42" fill="url(#bodyGradient)" />
          
          {/* Peito Branco */}
          <ellipse cx="50" cy="62" rx="24" ry="30" fill="white" />
          
          {/* Bochechas Rosadas */}
          <circle cx="35" cy="45" r="4" fill="#FFB6C1" opacity="0.3" />
          <circle cx="65" cy="45" r="4" fill="#FFB6C1" opacity="0.3" />

          {/* Olhos Expressivos */}
          <circle cx="40" cy="38" r="5" fill="white" />
          <circle cx="60" cy="38" r="5" fill="white" />
          <circle cx="40" cy="38" r="2.5" fill="black" />
          <circle cx="60" cy="38" r="2.5" fill="black" />
          <circle cx="41.5" cy="36.5" r="1" fill="white" />
          <circle cx="61.5" cy="36.5" r="1" fill="white" />
          
          {/* Bico */}
          <path d="M50 52L42 43H58L50 52Z" fill="#F97316" />
          <path d="M50 52L46 48H54L50 52Z" fill="#EA580C" />

          {/* Laço de Cavalheiro */}
          <path d="M44 56L50 60L56 56V64L50 60L44 64V56Z" fill="#7C3AED" />
          <circle cx="50" cy="60" r="2" fill="#C084FC" />
          
          {/* Pés */}
          <rect x="36" y="86" width="10" height="5" rx="2.5" fill="#FACC15" />
          <rect x="54" y="86" width="10" height="5" rx="2.5" fill="#FACC15" />
        </svg>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;