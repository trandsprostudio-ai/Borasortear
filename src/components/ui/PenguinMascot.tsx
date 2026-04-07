"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Ticket, Clock, Zap, Star, PartyPopper } from 'lucide-react';

export type PenguinState = "idle" | "waiting" | "drawing" | "winner" | "not_winner" | "loading";
export type PenguinPage = "home" | "raffle" | "logout" | "wallet";

interface PenguinMascotProps {
  state?: PenguinState;
  page?: PenguinPage;
  message?: string;
  className?: string;
}

const PenguinMascot = ({ 
  state = "idle", 
  page = "home", 
  message, 
  className = "" 
}: PenguinMascotProps) => {
  const [isJumping, setIsJumping] = useState(false);

  // Sistema de Frases Dinâmicas
  const phrases = useMemo(() => {
    const p = {
      home: [
        "Bem-vindo! Preparado para tentar a sorte?",
        "Hoje vai ser o seu dia!",
        "Participe e ganhe prémios incríveis!",
        "Prepara o bolso, tá a cheirar a din din! 💰"
      ],
      raffle: [
        "Bora!",
        "Quanto mais participar, mais chances tem!",
        "Boa sorte, hoje é o seu dia! 🍀"
      ],
      logout: [
        "Volte sempre!",
        "Vou ter saudades 😄",
        "Até breve, campeão da sorte!"
      ],
      wallet: [
        "A tua sorte está a crescer!",
        "Dinheiro no bolso, sorriso no rosto!",
        "O próximo prémio está à tua espera!"
      ]
    };
    return p[page] || p.home;
  }, [page]);

  const [currentPhrase, setCurrentPhrase] = useState(message || phrases[0]);

  useEffect(() => {
    if (message) {
      setCurrentPhrase(message);
      return;
    }
    
    const interval = setInterval(() => {
      if (state === "idle") {
        const next = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrentPhrase(next);
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [phrases, state, message]);

  const colors = {
    black: "#1E1E1E",
    white: "#FFFFFF",
    orange: "#FFA500",
    gold: "#FFD700",
    blue: "#00AEEF"
  };

  const handleInteraction = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
  };

  return (
    <div 
      className={`fixed bottom-28 right-6 z-[99] flex flex-col items-center pointer-events-none ${className}`}
    >
      {/* Balão de Fala (Sempre visível na tela) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhrase}
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.8 }}
          className="absolute bottom-24 right-0 bg-white border-2 border-[#E5E7EB] px-4 py-2 rounded-2xl shadow-2xl z-20 min-w-[150px] max-w-[200px] text-center pointer-events-auto"
        >
          <p className="text-[9px] font-black uppercase tracking-tight text-[#1E1E1E] leading-tight">
            {state === "drawing" ? "A girar a sorte... 🎰" : 
             state === "winner" ? "GANHASTE! 🎉" :
             state === "loading" ? "A analisar..." : currentPhrase}
          </p>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b-2 border-r-2 border-[#E5E7EB] rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Corpo do Pinguim (Menor e flutuante) */}
      <motion.div
        animate={{ 
          y: isJumping ? -20 : [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          y: isJumping ? { type: "spring", stiffness: 500, damping: 15 } : { repeat: Infinity, duration: 4, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
        }}
        onClick={handleInteraction}
        className="relative w-20 h-20 cursor-pointer pointer-events-auto"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
          {/* Corpo Principal */}
          <motion.ellipse 
            cx="50" cy="65" rx="35" ry="32" 
            fill={colors.black} 
            animate={state === "drawing" ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          
          {/* Peito Branco */}
          <ellipse cx="50" cy="70" rx="22" ry="25" fill={colors.white} />
          
          {/* Cabeça */}
          <circle cx="50" cy="35" r="22" fill={colors.black} />
          
          {/* Olhos Expressivos */}
          <g>
            <circle cx="42" cy="35" r="4" fill={colors.white} />
            <circle cx="58" cy="35" r="4" fill={colors.white} />
            <motion.circle 
              cx="42" cy="35" r="2" 
              fill="black" 
              animate={state === "loading" ? { x: [0, 1, -1, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <motion.circle 
              cx="58" cy="35" r="2" 
              fill="black" 
              animate={state === "loading" ? { x: [0, 1, -1, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </g>

          {/* Bico */}
          <path d="M50 42L45 48H55L50 42Z" fill={colors.orange} />

          {/* Asas */}
          <motion.path 
            d="M15 55Q5 65 15 75" stroke={colors.black} strokeWidth="8" strokeLinecap="round" 
            animate={state === "winner" ? { rotate: [0, -40, 0], y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
          />
          <motion.path 
            d="M85 55Q95 65 85 75" stroke={colors.black} strokeWidth="8" strokeLinecap="round" 
            animate={state === "winner" ? { rotate: [0, 40, 0], y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
          />

          {/* Patas */}
          <rect x="38" y="90" width="8" height="4" fill={colors.orange} rx="2" />
          <rect x="54" y="90" width="8" height="4" fill={colors.orange} rx="2" />

          {/* Moeda Flutuante (Somente em idle/winner) */}
          <AnimatePresence>
            {(state === "idle" || state === "winner") && (
              <motion.g 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }} 
                transition={{ y: { repeat: Infinity, duration: 2 } }}
              >
                <circle cx="85" cy="40" r="8" fill={colors.gold} stroke="#B8860B" strokeWidth="1" />
                <text x="82" y="44" fontSize="8" fontWeight="bold" fill="#B8860B">Kz</text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;