"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Trophy, Timer, Search, Wallet, Sparkles, Coins } from 'lucide-react';

export type MascotState = "idle" | "waiting" | "drawing" | "winner" | "not_winner" | "loading";
export type MascotPage = "home" | "raffle" | "wallet" | "logout" | "profile";

interface PenguinMascotProps {
  state?: MascotState;
  page?: MascotPage;
  className?: string;
}

const PenguinMascot = ({ state = "idle", page = "home", className = "" }: PenguinMascotProps) => {
  const [message, setMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // Sistema de Frases Dinâmicas
  const getMessage = () => {
    if (state === "loading") return "Estou a analisar as probabilidades...";
    if (state === "drawing") return "O suspense é real! Quem será?";
    if (state === "winner") return "PARABÉNS! Temos um novo campeão!";
    if (state === "not_winner") return "Quase! A próxima mesa pode ser a tua.";
    if (state === "waiting") return "Quase lá... as mesas estão a encher!";

    const homePhrases = [
      "Bem-vindo! Preparado para tentar a sorte?",
      "Hoje é o seu dia!",
      "Participe nos sorteios e ganhe prémios incríveis!",
      "Prepara o bolso, tá a cheirar a din din! 💰",
      "Bora!",
      "Quanto mais participar, mais chances tem!",
      "Boa sorte, hoje é seu dia! 🍀"
    ];

    const logoutPhrases = [
      "Volte sempre!",
      "Vou ter saudades 😄",
      "Até breve, campeão da sorte!"
    ];

    if (page === "logout") return logoutPhrases[Math.floor(Math.random() * logoutPhrases.length)];
    if (page === "home") return homePhrases[Math.floor(Math.random() * homePhrases.length)];
    
    return "Bora ganhar?";
  };

  useEffect(() => {
    setMessage(getMessage());
    // Mudar frase aleatória na home a cada 8 segundos se estiver idle
    if (state === "idle" && page === "home") {
      const interval = setInterval(() => setMessage(getMessage()), 8000);
      return () => clearInterval(interval);
    }
  }, [state, page]);

  return (
    <div className={`fixed bottom-24 right-4 z-[100] flex flex-col items-end pointer-events-none ${className}`}>
      {/* Balão de Fala Responsivo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="mb-4 mr-2 bg-white border-2 border-[#00AEEF]/20 p-3 rounded-[1.5rem] rounded-br-none shadow-xl max-w-[180px] pointer-events-auto"
        >
          <p className="text-[10px] font-black uppercase text-[#1E1E1E] leading-tight tracking-tight text-center">
            {message}
          </p>
          {/* Triângulo do Balão */}
          <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-r-2 border-b-2 border-[#00AEEF]/10 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Mascote Pinguim */}
      <motion.div
        className="relative cursor-pointer pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ y: -20 }}
        animate={
          state === "drawing" ? { x: [0, -2, 2, -2, 2, 0] } :
          state === "loading" ? { opacity: [1, 0.7, 1] } : 
          {}
        }
        transition={
          state === "drawing" ? { repeat: Infinity, duration: 0.2 } :
          state === "loading" ? { repeat: Infinity, duration: 1 } : 
          {}
        }
      >
        <svg width="80" height="90" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
          {/* Corpo */}
          <motion.ellipse 
            cx="50" cy="65" rx="35" ry="40" 
            fill="#1E1E1E" 
            animate={state === "winner" ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          
          {/* Barriga */}
          <ellipse cx="50" cy="72" rx="25" ry="30" fill="white" />
          
          {/* Cabeça */}
          <circle cx="50" cy="35" r="25" fill="#1E1E1E" />
          
          {/* Olhos Expressivos */}
          <g>
            <circle cx="42" cy="35" r="4" fill="white" />
            <circle cx="58" cy="35" r="4" fill="white" />
            <motion.circle 
              cx="42" cy="35" r="2" fill="black"
              animate={state === "loading" ? { scaleY: [1, 0.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.circle 
              cx="58" cy="35" r="2" fill="black"
              animate={state === "loading" ? { scaleY: [1, 0.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </g>

          {/* Bico */}
          <path d="M45 42L50 50L55 42H45Z" fill="#FFA500" />

          {/* Asas / Braços */}
          <motion.path 
            d="M20 60C15 65 10 75 15 80" 
            stroke="#1E1E1E" strokeWidth="8" strokeLinecap="round" 
            animate={state === "winner" ? { rotate: [0, -30, 0] } : {}}
          />
          <motion.path 
            d="M80 60C85 65 90 75 85 80" 
            stroke="#1E1E1E" strokeWidth="8" strokeLinecap="round" 
            animate={state === "winner" ? { rotate: [0, 30, 0] } : {}}
          />

          {/* Pés */}
          <path d="M40 100C35 100 32 105 35 108" stroke="#FFA500" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 100C65 100 68 105 65 108" stroke="#FFA500" strokeWidth="4" strokeLinecap="round" />

          {/* Acessório de Estado */}
          <AnimatePresence>
            {state === "waiting" && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <rect x="70" y="30" width="15" height="10" rx="2" fill="#FFD700" transform="rotate(-15 70 30)" />
                <text x="72" y="38" fontSize="6" fontWeight="bold" fill="#1E1E1E" transform="rotate(-15 70 30)">WIN</text>
              </motion.g>
            )}
            {state === "idle" && (
              <motion.circle 
                cx="80" cy="50" r="6" 
                fill="#FFD700" 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ filter: "drop-shadow(0 0 5px #FFD700)" }}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* Efeitos de Partícula para Vencedor */}
        {state === "winner" && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute -top-4 -left-4 text-yellow-400"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PenguinMascot;