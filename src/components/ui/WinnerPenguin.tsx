"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  "A sorte está do teu lado! 🍀",
  "Bora faturar uns Kz? 💰",
  "Hoje cheira a prémio! 🏆",
  "Já imaginas o saldo a subir? 🚀",
  "3 vencedores por sala... tu és o próximo!",
  "Sente a energia da vitória! ✨",
  "O prémio está quase a cair! 💸",
  "Confia na tua intuição! 🧠",
  "Bora dar um show nesta mesa! 🎭",
  "O pinguim traz sorte, aproveita! 🐧"
];

const WinnerPenguin = ({ className = "w-32 h-32", showSpeech = true }: { className?: string, showSpeech?: boolean }) => {
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    if (!showSpeech) return;
    const interval = setInterval(() => {
      setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [showSpeech]);

  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      {/* Sombra Dinâmica */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-0 w-20 h-3 bg-black rounded-full blur-md" 
      />
      
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [-1, 1, -1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative cursor-pointer"
      >
        {/* CORPO (Forma de Pera Suave) */}
        <div className="w-20 h-24 bg-gradient-to-b from-[#1a1a1a] to-[#000] rounded-[3rem] relative shadow-2xl border border-white/5">
          
          {/* BARRIGA (Efeito 3D) */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-14 h-18 bg-gradient-to-b from-white to-[#f0f0f0] rounded-t-[2.5rem] rounded-b-[1.5rem] shadow-inner" />
          
          {/* FATO AMARELO (Veste Premium) */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg rotate-45 shadow-lg border border-amber-300/30 flex items-center justify-center overflow-hidden">
            <div className="w-1 h-8 bg-amber-200/20 -rotate-45" />
          </div>
          
          {/* GRAVATA BORBOLETA */}
          <div className="absolute top-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
            <div className="w-2 h-2 bg-amber-900 rounded-sm rotate-45" />
            <div className="w-1 h-1 bg-amber-400 rounded-full z-10" />
            <div className="w-2 h-2 bg-amber-900 rounded-sm -rotate-45" />
          </div>
        </div>

        {/* CABEÇA */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-18 h-18 bg-gradient-to-b from-[#222] to-[#111] rounded-full shadow-lg">
          
          {/* OLHOS (Expressivos) */}
          <div className="absolute top-6 left-3.5 flex gap-5">
            {[1, 2].map((i) => (
              <motion.div 
                key={i}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.92, 0.94, 1] }}
                className="w-4 h-5 bg-white rounded-full relative flex items-center justify-center overflow-hidden border border-black/10"
              >
                <div className="w-2.5 h-3 bg-black rounded-full absolute bottom-0.5">
                  <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5 opacity-80" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* BICO (Fofo) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-5 h-4 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-md">
            <div className="w-full h-[1px] bg-black/10 mt-2" />
          </div>
        </div>

        {/* ASAS (Gesto de Celebração) */}
        <motion.div 
          animate={{ rotate: [10, 40, 10] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 -left-4 w-7 h-12 bg-[#1a1a1a] rounded-full origin-top -rotate-12 shadow-md" 
        />
        <motion.div 
          animate={{ rotate: [-10, -40, -10] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 -right-4 w-7 h-12 bg-[#1a1a1a] rounded-full origin-top rotate-12 shadow-md" 
        />

        {/* PÉS (Grandes e Fofos) */}
        <div className="absolute -bottom-1 -left-1 w-7 h-4 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full shadow-sm" />
        <div className="absolute -bottom-1 -right-1 w-7 h-4 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full shadow-sm" />
      </motion.div>

      {/* BALÃO DE FALA (Motivador) */}
      <AnimatePresence mode="wait">
        {showSpeech && (
          <motion.div 
            key={phrase}
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -20 }}
            className="absolute -top-16 -right-24 md:-right-32 bg-white text-[#0A0B12] px-4 py-3 rounded-2xl font-black text-[9px] uppercase leading-tight shadow-[0_10px_40px_rgba(255,255,255,0.1)] border-2 border-amber-400 min-w-[120px] max-w-[150px] text-center z-50"
          >
            {phrase}
            {/* Seta do balão */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-r-2 border-b-2 border-amber-400 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WinnerPenguin;