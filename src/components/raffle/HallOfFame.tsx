"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lista de 50 IDs Fictícios para o Hall da Fama
const MOCK_IDS = [
  "USER_9283", "ID_1102", "PLAYER_442", "LUANDA_99", "BOSS_777", 
  "VIP_8293", "MIL_2024", "ACE_910", "X_PLAYER", "KING_123",
  "USER_881", "ID_5521", "PLAYER_007", "WIN_444", "MEGA_99",
  "USER_721", "ID_9901", "PLAYER_662", "STAR_AO", "GOLD_22",
  "USER_112", "ID_2231", "PLAYER_882", "LUCK_99", "ELITE_01",
  "USER_331", "ID_4421", "PLAYER_222", "TOP_AO", "WINNER_1",
  "USER_551", "ID_6621", "PLAYER_442", "BEST_22", "PRO_99",
  "USER_991", "ID_1121", "PLAYER_662", "LUCKY_7", "BOSS_99",
  "USER_221", "ID_3321", "PLAYER_882", "KING_AO", "ACE_01",
  "USER_441", "ID_5521", "PLAYER_002", "STAR_22", "ID_8891"
];

const MODULES = ["M100", "M200", "M500", "M1000", "M2000", "M5000", "BOSS"];

const HallOfFame = () => {
  const [index, setIndex] = useState(0);
  const [displayWinners, setDisplayWinners] = useState<any[]>([]);

  const generateRandomWinner = () => {
    const id = MOCK_IDS[Math.floor(Math.random() * MOCK_IDS.length)];
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    const isAbsurd = Math.random() < 0.15;
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