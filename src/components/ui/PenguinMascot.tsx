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
      {/* Balão de Fala Inteligente - Alinhado à direita para crescer para a esquerda */}
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
            {/* Seta do Balão alinhada com o corpo do pinguim */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-purple-500/10" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pinguim Premium SVG */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 relative"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2235" />
              <stop offset="100%" stopColor="#0A0B12" />
            </linearGradient>
          </defs>

          {/* Sombra Dinâmica */}
          <ellipse cx="50" cy="94" rx="20" ry="4" fill="black" opacity="0.15" />
          
          {/* Nadadeira Esquerda */}
          <motion.path 
            d="M25 55C15 55 8 60 8 70C8 80 18 75 25 70" 
            stroke="#0A0B12" strokeWidth="9" strokeLinecap="round"
            animate={{ rotate: [-15, 15, -15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "25px", originY: "55px" }}
          />
          
          {/* Nadadeira Direita */}
          <motion.path 
            d="M75 55C85 55 92 60 92 70C92 80 82 75 75 70" 
            stroke="#0A0B12" strokeWidth="9" strokeLinecap="round"
            animate={{ rotate: [15, -15, 15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "75px", originY: "55px" }}
          />

          {/* Corpo */}
          <ellipse cx="50" cy="55" rx="36" ry="42" fill="url(#bodyGradient)" />
          
          {/* Peito Branco */}
          <ellipse cx="50" cy="62" rx="24" ry="30" fill="white" />
          
          {/* Bochechas Rosadas */}
          <circle cx="35" cy="45" r="5" fill="#FFB6C1" opacity="0.4" />
          <circle cx="65" cy="45" r="5" fill="#FFB6C1" opacity="0.4" />

          {/* Olhos Expressivos */}
          <circle cx="40" cy="38" r="5" fill="white" />
          <circle cx="60" cy="38" r="5" fill="white" />
          <circle cx="40" cy="38" r="2.5" fill="black" />
          <circle cx="60" cy="38" r="2.5" fill="black" />
          <circle cx="41.5" cy="36.5" r="1" fill="white" />
          <circle cx="61.5" cy="36.5" r="1" fill="white" />
          
          {/* Bico Estilizado */}
          <path d="M50 52L40 42H60L50 52Z" fill="#F97316" />
          <path d="M50 52L45 47H55L50 52Z" fill="#EA580C" />

          {/* Laço de Cavalheiro (Bowtie) */}
          <path d="M42 56L50 60L58 56L58 64L50 60L42 64V56Z" fill="#7C3AED" />
          <circle cx="50" cy="60" r="2.5" fill="#C084FC" />
          
          {/* Pés */}
          <rect x="35" y="86" width="12" height="6" rx="3" fill="#FACC15" />
          <rect x="53" y="86" width="12" height="6" rx="3" fill="#FACC15" />
        </svg>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;