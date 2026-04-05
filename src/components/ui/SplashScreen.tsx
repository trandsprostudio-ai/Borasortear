"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PenguinMascot from './PenguinMascot';

interface SplashScreenProps {
  message: string;
}

const SplashScreen = ({ message }: SplashScreenProps) => {
  // Verifica se é uma mensagem de saída (Logout)
  const isLogout = message.toLowerCase().includes('saindo') || message.toLowerCase().includes('exit');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0A0B12] bg-opacity-95 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center">
        {isLogout ? (
          <div className="mb-12 scale-125">
            <PenguinMascot page="logout" />
          </div>
        ) : (
          <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-8" />
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">{message}</h2>
          <div className="flex gap-1 justify-center">
            <motion.div 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
            />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
            />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
            />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">Bora Sortear • Tecnologia de Sorteios</p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;