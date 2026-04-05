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
      {/* Balão de Fala - Deslocado para a esquerda para não sair da tela */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          className="absolute bottom-full mb-4 left-1/2 -translate-x-[92%] sm:-translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-white text-[#0A0B12] px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/20 w-[160px] sm:w-[180px] text-center relative">
            <p className="text-[10px] font-black uppercase tracking-tight leading-tight">
              {currentPhrases[index]}
            </p>
            {/* Seta do Balão - Ajustada para a nova posição (92%) no mobile */}
            <div className="absolute -bottom-1.5 left-[92%] sm:left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-purple-500/20" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pinguim - Posição mantida conforme solicitado */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          <ellipse cx="50" cy="94" rx="22" ry="4" fill="black" opacity="0.1" />
          <rect x="34" y="84" width="14" height="8" rx="4" fill="#F97316" />
          <rect x="52" y="84" width="14" height="8" rx="4" fill="#F97316" />
          <rect x="36" y="82" width="10" height="6" rx="3" fill="#FACC15" />
          <rect x="54" y="82" width="10" height="6" rx="3" fill="#FACC15" />

          <motion.path 
            d="M20 50C12 50 12 65 20 65" 
            stroke="#3B82F6" strokeWidth="10" strokeLinecap="round"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "20px", originY: "50px" }}
          />
          <motion.path 
            d="M80 50C88 50 88 65 80 65" 
            stroke="#3B82F6" strokeWidth="10" strokeLinecap="round"
            animate={{ rotate: [8, -8, 8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "80px", originY: "50px" }}
          />

          <ellipse cx="50" cy="50" rx="34" ry="42" fill="url(#bodyGradient)" />
          <ellipse cx="50" cy="58" rx="22" ry="28" fill="white" />
          <circle cx="40" cy="35" r="5" fill="white" />
          <circle cx="60" cy="35" r="5" fill="white" />
          <circle cx="40" cy="35" r="2.5" fill="black" />
          <circle cx="60" cy="35" r="2.5" fill="black" />
          <path d="M50 48L42 39H58L50 48Z" fill="#F97316" />
          <path d="M44 52L50 56L56 52V60L50 56L44 60V52Z" fill="#7C3AED" />
          <circle cx="50" cy="56" r="2" fill="#C084FC" />
        </svg>
      </motion.div>
    </div>
  );