"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoraIcon from '@/components/layout/BoraIcon';

interface PenguinMascotProps {
  page: 'home' | 'wallet' | 'raffle' | 'profile';
  className?: string;
}

const PenguinMascot = ({ page, className = "" }: PenguinMascotProps) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const messages = {
    home: [
      "Queres triplicar o teu saldo? Escolhe uma mesa!",
      "A sorte favorece os audazes. Bora sortear?",
      "Viste os ganhadores VIP? Podes ser o próximo!",
      "Sabias que ganhas 47% de comissão ao convidar amigos?"
    ],
    raffle: [
      "Esta mesa está quase cheia! Entra agora.",
      "O bilhete premiado pode ser o teu!",
      "Já confirmaste o teu código em Consultar Bilhete?",
      "3 vagas vencedoras nesta mesa. Tens boas chances!"
    ],
    wallet: [
      "O Multicaixa Express é a forma mais rápida de recarregar.",
      "Lembra-te: o bónus é para diversão, o saldo real é para sacar!",
      "Processamos os teus saques em menos de 24h.",
      "Precisas de ajuda com a recarga? Fala com o suporte."
    ],
    profile: [
      "Usa o teu link de afiliado para ganhar sem jogar!",
      "Completa os teus dados para saques mais rápidos.",
      "Ganha bónus vitalícios convidando a tua rede.",
      "O teu código é único. Partilha-o com orgulho!"
    ]
  };

  useEffect(() => {
    const showMessage = () => {
      const pageMessages = messages[page];
      const randomMsg = pageMessages[Math.floor(Math.random() * pageMessages.length)];
      setMessage(randomMsg);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    const timer = setTimeout(showMessage, 3000);
    const interval = setInterval(showMessage, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [page]);

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 flex items-center z-[100] group pointer-events-none ${className}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.8 }}
            className="absolute right-[80px] mr-2 max-w-[180px] sm:max-w-[220px]"
          >
            <div className="bg-white text-[#0A0B12] p-4 rounded-2xl rounded-tr-none shadow-2xl relative border-2 border-purple-500">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-tight leading-tight">
                {message}
              </p>
              {/* Seta do Balão */}
              <div className="absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-white border-r-[10px] border-r-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="pointer-events-auto cursor-help mr-4"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/40 transition-colors" />
          <BoraIcon className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
        </div>
      </motion.div>
    </div>
  );
};

export default PenguinMascot;