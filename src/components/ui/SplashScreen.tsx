"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from '../layout/Logo';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Processando..." }: SplashScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-[#0A0B12] flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Logo className="scale-150" />
      </motion.div>

      <div className="space-y-4">
        <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
        <p className="text-white/40 font-black text-xs uppercase tracking-[0.3em] animate-pulse">
          {message}
        </p>
      </div>

      <div className="absolute bottom-12 w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;