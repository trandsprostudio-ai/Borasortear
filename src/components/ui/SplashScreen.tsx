"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '../layout/Logo';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Carregando a sua sorte..." }: SplashScreenProps) => {
  useEffect(() => {
    // Adiciona a classe ao body para esconder o footer e bloquear scroll
    document.body.classList.add('splash-active');
    document.body.style.overflow = 'hidden';

    return () => {
      // Remove ao desmontar
      document.body.classList.remove('splash-active');
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0B12]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <Logo className="scale-125 md:scale-150 mb-12" />
        
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          />
        </div>
        
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 animate-pulse text-center px-4">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;