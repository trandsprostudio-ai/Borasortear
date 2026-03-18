"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import { Loader2 } from 'lucide-react';

const SplashScreen = ({ message = "Autenticando..." }: { message?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0A0B12] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <Logo className="scale-150 mb-12" />
        
        <div className="relative w-48 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 premium-gradient"
          />
        </div>
        
        <div className="flex items-center gap-2 text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">
          <Loader2 size={12} className="animate-spin" />
          {message}
        </div>
      </motion.div>
      
      <div className="absolute bottom-12 text-white/10 text-[10px] font-bold tracking-widest uppercase">
        Bora Sorteiar • Sistema de Segurança Ativo
      </div>
    </motion.div>
  );
};

export default SplashScreen;