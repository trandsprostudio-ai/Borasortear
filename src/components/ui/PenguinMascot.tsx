"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoraIcon from '../layout/BoraIcon';

interface PenguinMascotProps {
  page: 'home' | 'raffle' | 'wallet' | 'profile';
  className?: string;
}

const messages = {
  home: [
    "Olá! Já escolheste a tua mesa de hoje?",
    "Lembra-te: podes triplicar o teu saldo aqui!",
    "Os sorteios são 100% automáticos e justos.",
    "Convida amigos e ganha 1.000 Kz de bónus!"
  ],
  raffle: [
    "Esta mesa está quase cheia! Aproveita.",
    "Boa sorte! O pinguim está a torcer por ti.",
    "Sabias que podes entrar em várias mesas?",
    "Confirma os teus dados antes de entrar."
  ],
  wallet: [
    "Recarregas rápidas via Express e Unitel!",
    "O teu saldo está seguro connosco.",
    "Saques processados em até 24 horas úteis.",
    "Precisas de ajuda com o teu depósito?"
  ],
  profile: [
    "O teu link de convite vale ouro!",
    "Sobe de nível convidando mais amigos.",
    "Mantém o teu número Express sempre atualizado.",
    "És um jogador de elite!"
  ]
};

const PenguinMascot = ({ page, className = "" }: PenguinMascotProps) => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setCurrentMsg((prev) => (prev + 1) % messages[page].length);
        setShowBubble(true);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [page]);

  return (
    <div className={`relative flex flex-col items-end ${className}`}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 mr-1"
          >
            <div className="bg-white text-[#0A0B12] p-2 md:p-3 rounded-2xl rounded-br-none shadow-2xl relative max-w-[120px] md:max-w-[180px]">
              <p className="text-[8px] md:text-[10px] font-black uppercase leading-tight">
                {messages[page][currentMsg]}
              </p>
              <div className="absolute -bottom-1 right-0 w-3 h-3 bg-white rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          y: [0, -5, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="bg-[#1A1D29] p-1.5 md:p-2 rounded-2xl border border-white/10 shadow-2xl">
          <BoraIcon className="w-8 h-8 md:w-12 md:h-12" />
        </div>
        
        {/* Indicador de Status Live */}
        <div className="absolute -top-1 -left-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-[#0A0B12] flex items-center justify-center">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;