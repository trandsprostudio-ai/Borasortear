"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PenguinMascot from './PenguinMascot';

interface SplashScreenProps {
  message?: string;
  isLogout?: boolean;
}

const SplashScreen = ({ message = "Carregando...", isLogout = false }: SplashScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#0A0B12] flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
        
        {isLogout ? (
          <PenguinMascot page="profile" className="mb-8 scale-125" />
        ) : (
          <PenguinMascot page="home" className="mb-8 scale-125" />
        )}
        
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">{message}</h2>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;