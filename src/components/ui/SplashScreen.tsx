"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/layout/Logo';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Carregando..." }: SplashScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-[#0A0B12] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <Logo className="scale-150 mb-8" />
        
        <div className="relative w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          />
        </div>
        
        <p className="mt-6 text-white/40 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;