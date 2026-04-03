"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WinnerPenguin = ({ className = "w-24 h-24" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Sombra no chão */}
      <div className="absolute bottom-0 w-16 h-2 bg-black/10 rounded-full blur-sm" />
      
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Corpo do Pinguim (Base Preta) */}
        <div className="w-16 h-20 bg-[#1A1A1A] rounded-[2rem] relative overflow-hidden border-2 border-white/5">
          {/* Barriga Branca */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 bg-white rounded-t-full" />
          
          {/* Fato Amarelo (Colete/Gravata) */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-lg rotate-45 shadow-lg" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2 h-4 bg-amber-500 rounded-full" />
        </div>

        {/* Cabeça */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#1A1A1A] rounded-full">
          {/* Olhos */}
          <div className="absolute top-5 left-3 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-black rounded-full" />
          </div>
          <div className="absolute top-5 right-3 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-black rounded-full" />
          </div>
          {/* Bico */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-orange-500 rounded-full rotate-180" />
        </div>

        {/* Asas (Braços) animadas */}
        <motion.div 
          animate={{ rotate: [20, 60, 20] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute top-10 -left-3 w-6 h-10 bg-[#1A1A1A] rounded-full origin-top" 
        />
        <motion.div 
          animate={{ rotate: [-20, -60, -20] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute top-10 -right-3 w-6 h-10 bg-[#1A1A1A] rounded-full origin-top" 
        />

        {/* Pés */}
        <div className="absolute -bottom-1 left-2 w-5 h-3 bg-orange-500 rounded-full" />
        <div className="absolute -bottom-1 right-2 w-5 h-3 bg-orange-500 rounded-full" />
        
        {/* Balão de Incentivo */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -top-12 -right-16 bg-amber-400 text-[#0A0B12] px-3 py-1 rounded-xl font-black text-[8px] uppercase whitespace-nowrap shadow-xl"
        >
          VAIS VENCER! 💰
          <div className="absolute -bottom-1 left-2 w-2 h-2 bg-amber-400 rotate-45" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WinnerPenguin;