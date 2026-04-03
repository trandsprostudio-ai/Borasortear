"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phrases = [
  "O TEMPO ESTÁ QUASE! PREPARA O GRITO! ⏳",
  "HOJE É O TEU DIA DE SORTE! EU SINTO! 🍀",
  "ESTOU A TORCER POR TI, CAMPEÃO! 🐧",
  "ESPERO QUE VENÇAS ESTA MESA! 🏆",
  "A TUA VITÓRIA ESTÁ A CAMINHO... ✨",
  "BILHETE NA MÃO, DINHEIRO NO BOLSO! 💰"
];

const WinnerPenguin = ({ className = "" }: { className?: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mb-4">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"
        />

        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 md:w-28 md:h-28 z-10"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            <path d="M12 2C8.5 2 6 5 6 9C6 11 6.5 12.5 7.5 14C6.5 16 6 18 6 20C6 21 7 22 12 22C17 22 18 21 18 20C18 18 17.5 16 16.5 14C17.5 12.5 18 11 18 9C18 5 15.5 2 12 2Z" fill="#0A0B12" />
            <path d="M12 11C9.5 11 8.5 13 8.5 16C8.5 19 9.5 21 12 21C14.5 21 15.5 19 15.5 16C15.5 13 14.5 11 12 11Z" fill="white" />
            <circle cx="10" cy="7.5" r="1.2" fill="white" />
            <circle cx="14" cy="7.5" r="1.2" fill="white" />
            <circle cx="10" cy="7.5" r="0.5" fill="black" />
            <circle cx="14" cy="7.5" r="0.5" fill="black" />
            <path d="M12 8.5L11 10H13L12 8.5Z" fill="#F59E0B" />
            <path d="M9 21.5L8 22.5H10L9 21.5Z" fill="#F59E0B" />
            <path d="M15 21.5L14 22.5H16L15 21.5Z" fill="#F59E0B" />
          </svg>

          <motion.div 
            animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-[#1A1D29]/95 border border-white/10 px-4 py-2 rounded-2xl shadow-2xl"
          >
            <p className="text-[9px] font-black italic text-center text-white uppercase tracking-tighter">
              "{phrases[index]}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WinnerPenguin;