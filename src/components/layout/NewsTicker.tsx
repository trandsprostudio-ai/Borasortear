"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

const NewsTicker = () => {
  const news = [
    "JOGADOR @USER_9283 GANHOU 3.000 KZ NO M1000",
    "NOVA MESA M5000 ABERTA - 2 LUGARES DISPONÍVEIS",
    "SAQUE DE 15.000 KZ PROCESSADO PARA @RAMOS_92",
    "BÓNUS DE AFILIADO DE 500 KZ CREDITADO PARA @LUCAS_KING",
    "JOGADOR @ANNA_BI GANHOU 600 KZ NO M200",
    "SISTEMA DE SORTEIOS OPERANDO A 100% DE VELOCIDADE",
    "JOGADOR @FELIX_22 GANHOU 1.500 KZ NO M500",
  ];

  return (
    <div className="w-full bg-purple-600/10 border-y border-white/5 py-2 overflow-hidden whitespace-nowrap flex items-center">
      <div className="flex items-center px-4 shrink-0 gap-2 border-r border-white/10 mr-4">
        <TrendingUp size={12} className="text-purple-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">ATIVIDADE AO VIVO</span>
      </div>
      
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 items-center"
      >
        {[...news, ...news].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Zap size={10} className="text-amber-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{item}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default NewsTicker;