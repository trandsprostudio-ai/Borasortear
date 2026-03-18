"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  winners: { name: string; prize: string; position: number }[];
  roomInfo?: string;
}

const DrawOverlay = ({ isOpen, onClose, winners, roomInfo }: DrawOverlayProps) => {
  const [stage, setStage] = useState<'suspense' | 'reveal'>('suspense');

  useEffect(() => {
    if (isOpen) {
      setStage('suspense');
      const timer = setTimeout(() => setStage('reveal'), 4000);
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/98 backdrop-blur-2xl p-4"
        >
          <div className="max-w-lg w-full text-center relative">
            <button onClick={onClose} className="absolute -top-12 right-0 text-white/40 hover:text-white">
              <X size={24} />
            </button>

            {stage === 'suspense' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-8 border-t-purple-500 border-r-amber-500 border-b-cyan-400 border-l-transparent rounded-full shadow-[0_0_50px_rgba(124,58,237,0.3)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={64} className="text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic tracking-tighter text-white">
                    SORTEANDO...
                  </h2>
                  <p className="text-purple-400 font-black uppercase tracking-[0.3em] text-xs animate-bounce">
                    {roomInfo || "MESA FINALIZADA"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-28 h-28 gold-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40 mb-4"
                  >
                    <Trophy size={56} className="text-white" />
                  </motion.div>
                </div>

                <h2 className="text-4xl font-black text-white tracking-tighter italic">
                  TEMOS GANHADORES!
                </h2>
                
                <div className="space-y-3 mt-6">
                  {winners.map((winner, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.4 }}
                      className={`glass-card p-4 rounded-xl border-l-4 flex items-center justify-between ${
                        idx === 0 ? 'border-l-amber-500 bg-amber-500/5' : 
                        idx === 1 ? 'border-l-slate-400 bg-slate-400/5' : 'border-l-orange-500 bg-orange-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                          idx === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'
                        }`}>
                          {idx + 1}º
                        </div>
                        <div className="text-left">
                          <p className="text-xl font-black text-white">@{winner.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-green-400">{winner.prize}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button 
                  onClick={onClose}
                  className="mt-8 w-full h-14 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-lg shadow-xl shadow-purple-900/40"
                >
                  CONTINUAR JOGANDO
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