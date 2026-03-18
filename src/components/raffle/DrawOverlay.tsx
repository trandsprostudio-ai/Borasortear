"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface DrawOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  winners: { name: string; prize: string }[];
}

const DrawOverlay = ({ isOpen, onClose, winners }: DrawOverlayProps) => {
  const [stage, setStage] = useState<'suspense' | 'reveal'>('suspense');

  useEffect(() => {
    if (isOpen) {
      setStage('suspense');
      const timer = setTimeout(() => setStage('reveal'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/95 backdrop-blur-xl p-4"
        >
          <div className="max-w-lg w-full text-center">
            {stage === 'suspense' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-t-purple-500 border-r-cyan-400 border-b-amber-500 border-l-transparent rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={48} className="text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-white">
                  SORTEANDO AGORA...
                </h2>
                <p className="text-muted-foreground animate-bounce">Prepare o seu coração! 🍀</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-24 h-24 gold-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40 mb-6"
                  >
                    <Trophy size={48} className="text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"
                  />
                </div>

                <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
                  TEMOS GANHADORES!
                </h2>
                
                <div className="space-y-4 mt-8">
                  {winners.map((winner, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.3 }}
                      className="glass-card p-6 rounded-2xl border-l-4 border-l-green-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                          <Star size={24} fill="currentColor" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">Ganhador</p>
                          <p className="text-xl font-black text-white">@{winner.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Prêmio</p>
                        <p className="text-2xl font-black text-green-400">{winner.prize}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button 
                  onClick={onClose}
                  className="mt-8 w-full h-14 rounded-2xl premium-gradient font-black text-lg shadow-xl shadow-purple-500/20"
                >
                  CONTINUAR TENTANDO
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrawOverlay;