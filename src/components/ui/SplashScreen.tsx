"use client";

import React from 'react';
import { motion } from 'framer-motion';
import BoraIcon from '../layout/BoraIcon';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Carregando..." }: SplashScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0B12] backdrop-blur-xl"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <BoraIcon className="w-24 h-24" />
        </motion.div>
        
        {/* Efeito de Pulso ao Redor */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse -z-10" />
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase mb-2">
          BORA SORTEIAR
        </h2>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] animate-pulse">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;