"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HallOfFame = () => {
  const [index, setIndex] = useState(0);
  
  const winners = Array.from({ length: 50 }, (_, i) => ({
    id: `USER_${Math.floor(Math.random() * 9000) + 1000}${String.fromCharCode(65 + (i % 26))}`,
    amount: [300, 600, 1500, 3000, 6000, 15000][Math.floor(Math.random() * 6)],
    module: ["M100", "M200", "M500", "M1000", "M2000", "M5000"][Math.floor(Math.random() * 6)]
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [winners.length]);

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden h-[400px] flex flex-col relative bg-white border-[#e0e0e0]">
      <div className="p-6 border-b border-[#e0e0e0] bg-[#f8fbff] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111111]">Ganhadores VIP</h3>
        </div>
        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest animate-pulse">LIVE</span>
      </div>
      
      <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_#00AEEF,_transparent)]" />
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="p-8 text-center"
          >
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Award size={32} className="text-white" />
            </div>
            
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{winners[index].module}</p>
            <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">@{winners[index].id}</h4>
            
            <div className="inline-flex items-center gap-2 bg-[#E8F5E9] px-4 py-2 rounded-xl border border-[#C8E6C9]">
              <TrendingUp size={14} className="text-[#2E7D32]" />
              <span className="text-lg font-black text-[#2E7D32]">+{winners[index].amount.toLocaleString()} Kz</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 bg-[#f8fbff] border-t border-[#e0e0e0] flex gap-1 justify-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${index % 5 === i ? 'w-4 bg-blue-600' : 'w-1 bg-[#e0e0e0]'}`} />
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;