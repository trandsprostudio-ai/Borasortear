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
        "Participe nos sorteios e ganhe prémios incríveis!",
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
    
    // Ciclo de frases aleatórias a cada 8 segundos se estiver em idle
    const interval = setInterval(() => {
      if (state === "idle") {
        const next = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrentPhrase(next);
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [phrases, state, message]);

  // Cores da Identidade
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
      className={`relative flex flex-col items-center ${className}`}
      onClick={handleInteraction}
    >
      {/* Balão de Fala */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhrase}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="absolute -top-20 bg-white border-2 border-[#E5E7EB] px-5 py-3 rounded-2xl shadow-xl z-20 min-w-[180px] max-w-[240px] text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-tight text-[#1E1E1E]">
            {state === "drawing" ? "A girar a sorte... 🎰" : 
             state === "winner" ? "PARABÉNS! GANHASTE! 🎉" :
             state === "loading" ? "A analisar os dados..." : currentPhrase}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#E5E7EB] rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Corpo do Pinguim (SVG Dinâmico) */}
      <motion.div
        animate={isJumping ? { y: -20, scaleY: 1.1 } : { y: 0, scaleY: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="relative w-32 h-32 cursor-pointer"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
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
          
          {/* Chapéu 🎩 */}
          <motion.g initial={{ y: -5 }} animate={{ y: 0 }}>
            <rect x="35" y="10" width="30" height="15" fill={colors.black} rx="2" />
            <rect x="30" y="22" width="40" height="4" fill={colors.blue} rx="1" />
          </motion.g>

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

          {/* Acessório Dinâmico (Moeda ou Bilhete) */}
          <AnimatePresence>
            {state === "waiting" && (
              <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <rect x="70" y="45" width="20" height="12" fill={colors.blue} rx="2" />
                <Ticket x="72" y="47" size={16} color="white" />
              </motion.g>
            )}
            {(state === "idle" || state === "winner") && (
              <motion.g 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }} 
                transition={{ y: { repeat: Infinity, duration: 2 } }}
              >
                <circle cx="85" cy="40" r="10" fill={colors.gold} stroke="#B8860B" strokeWidth="1" />
                <text x="82" y="44" fontSize="10" fontWeight="bold" fill="#B8860B">Kz</text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Efeitos Especiais (Confetes para Winner) */}
        {state === "winner" && (
          <motion.div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: -50 - Math.random() * 50, 
                  x: (Math.random() - 0.5) * 100 
                }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: [colors.gold, colors.blue, colors.orange][i % 3] }}
              />
            ))}
          </motion.div>
        )}

        {/* Suspense Spinner (Drawing) */}
        {state === "drawing" && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute -right-4 top-0 w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"
          />
        )}
      </motion.div>
    </div>
  );
};

export default PenguinMascot;