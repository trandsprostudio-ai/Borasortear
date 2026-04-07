"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoraIcon from '../layout/BoraIcon';

interface PenguinMascotProps {
  page: 'home' | 'raffle' | 'wallet' | 'profile';
  state?: 'idle' | 'happy' | 'waiting';
  className?: string;
}

const PHRASES = {
  home: ["Bora sortear?", "A sorte está no ar!", "Já viste as novas mesas?", "Hoje é o teu dia!"],
  raffle: ["Aposta com confiança!", "Este prémio é gigante!", "Vais ganhar, eu sinto!", "Confirma o teu bilhete!"],
  wallet: ["Saldo é poder!", "Recarrega e joga!", "Saques rápidos aqui!", "Gere a tua banca."],
  profile: ["Olha só esse campeão!", "O teu perfil é VIP!", "Convida amigos e ganha!", "Estatísticas de mestre."]
};

const PenguinMascot = ({ page, state = 'idle', className = "" }: PenguinMascotProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % PHRASES[page].length);
        setShowBubble(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [page]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Balão de Fala */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-16 bg-white border-2 border-blue-100 px-4 py-2 rounded-2xl shadow-xl z-20 whitespace-nowrap"
          >
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-tight">
              {PHRASES[page][phraseIndex]}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corpo do Pinguim */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <BoraIcon className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl" />
        
        {/* Sombra */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/10 rounded-full blur-sm" />
      </motion.div>
    </div>
  );
};

export default PenguinMascot;