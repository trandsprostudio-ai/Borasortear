"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PenguinMascot from './PenguinMascot';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen = ({ message = "Processando..." }: SplashScreenProps) => {
  const isLogout = message.toLowerCase().includes('sair') || message.toLowerCase().includes('saindo');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0B12]/95 backdrop-blur-xl"
    >
      <div className="relative flex flex-col items-center">
        {/* Mascote exclusiva para Logout */}
        {isLogout ? (
          <PenguinMascot page="logout" className="mb-8 scale-125" />
        ) : (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] shadow-[0_0_50px_rgba(124,58,237,0.3)] flex items-center justify-center mb-8"
          >
            <span className="text-4xl">💰</span>
          </motion.div>
        )}

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl font-black italic tracking-tighter uppercase text-white"
        >
          {message}
        </motion.p>
        
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              className="w-1.5 h-1.5 bg-purple-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;