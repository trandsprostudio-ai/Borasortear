"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lista de IDs simulados seguindo o padrão de 8 caracteres da plataforma (MD5 substring)
const MOCK_IDS = [
  "A8F2E4D1", "B9C1A0E2", "F4D2B8A3", "E7A1C9B0", "D2B8F4A1",
  "C1E9A0B2", "A0F2D8E4", "B4C1E9A2", "F1D7A0B3", "E2B8C4F1",
  "D9A1B0E2", "C4F2A8D1", "B7E1C9A0", "A2D8B4F1", "F9C1E0A2",
  "E1D7B0A3", "D4F2C8E1", "C7A1B9D0", "B2E8F4C1", "A9D1C0B2",
  "F2A8E4D1", "E9C1A0E2", "D4D2B8A3", "C7A1C9B0", "B2B8F4A1",
  "A1E9A0B2", "F0F2D8E4", "E4C1E9A2", "D1D7A0B3", "C2B8C4F1",
  "B9A1B0E2", "A4F2A8D1", "F7E1C9A0", "E2D8B4F1", "D9C1E0A2",
  "C1D7B0A3", "B4F2C8E1", "A7A1B9D0", "F2E8F4C1", "E9D1C0B2",
  "D2A8E4D1", "C9C1A0E2", "B4D2B8A3", "A7A1C9B0", "F2B8F4A1",
  "E1E9A0B2", "D0F2D8E4", "C4C1E9A2", "B1D7A0B3", "A2B8C4F1"
];

const MODULES = ["M100", "M200", "M500", "M1000", "M2000", "M5000", "BOSS"];

const HallOfFame = () => {
  const [index, setIndex] = useState(0);
  const [displayWinners, setDisplayWinners] = useState<any[]>([]);

  const generateRandomWinner = () => {
    const id = MOCK_IDS[Math.floor(Math.random() * MOCK_IDS.length)];
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    const isAbsurd = Math.random() < 0.15; // 15% de chance de prémio alto
    let amount = isAbsurd ? Math.floor(Math.random() * 40000) + 10000 : Math.floor(Math.random() * 4700) + 300;
    return { id, amount, module };
  };

  useEffect(() => {
    setDisplayWinners([generateRandomWinner()]);
    const timer = setInterval(() => {
      setIndex(prev => prev + 1);
      setDisplayWinners(prev => [generateRandomWinner(), ...prev].slice(0, 10));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentWinner = displayWinners[0] || { id: "---", amount: 0, module: "..." };

  return (
    <div className="platinum-gradient rounded-[3rem] overflow-hidden h-[450px] flex flex-col relative border-2 border-[#E5E7EB] shadow-2xl">
      <div className="p-7 border-b border-[#D1D5DB] bg-white/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-[#FFA500]" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A0B12]">Ganhadores VIP</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full border border-blue-400">
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
           <span className="text-[8px] font-black text-white uppercase tracking-widest">AO VIVO</span>
        </div>
      </div>
      
      <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="p-10 text-center"
          >
            <div className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
              <Award size={40} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-[#0066FF] uppercase tracking-[0.4em] mb-3 bg-blue-50 inline-block px-4 py-1 rounded-full">{currentWinner.module}</p>
            <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-[#0A0B12]">@{currentWinner.id}</h4>
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-[1.5rem] border ${currentWinner.amount >= 10000 ? 'bg-[#FF4500] text-white' : 'gold-gradient text-black'}`}>
              <TrendingUp size={18} />
              <span className="text-2xl font-black italic">+{currentWinner.amount.toLocaleString()} Kz</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HallOfFame;