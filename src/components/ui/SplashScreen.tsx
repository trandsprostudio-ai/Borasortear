"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PenguinMascot from './PenguinMascot';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Processando..." }: SplashScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_#00AEEF,_transparent)]" />
      
      <div className="relative z-10 space-y-8 flex flex-col items-center">
        <div className="mb-12 scale-150">
          <PenguinMascot page="home" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#111111]">
              {message}
            </h2>
          </div>
          <p className="text-[10px] font-black text-[#555555]/40 uppercase tracking-[0.3em]">
            Bora Sortear • Segurança em Milhões
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;