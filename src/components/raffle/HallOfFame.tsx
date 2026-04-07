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
    <div className="platinum-gradient rounded-[3rem] overflow-hidden h-[450px] flex flex-col relative border-2 border-[#E5E7EB] shadow-2xl">
      <div className="p-7 border-b border-[#D1D5DB] bg-white/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFA500]/10 rounded-xl flex items-center justify-center border border-[#FFA500]/20">
            <Trophy size={18} className="text-[#FFA500]" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A0B12]">Ganhadores VIP</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full border border-blue-400">
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
           <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#0066FF,_transparent)]" />
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="p-10 text-center"
          >
            <div className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/30 border border-white/10 rotate-3">
              <Award size={40} className="text-white" />
            </div>
            
            <p className="text-[10px] font-black text-[#0066FF] uppercase tracking-[0.4em] mb-3 bg-blue-50 inline-block px-4 py-1 rounded-full border border-blue-100">{winners[index].module}</p>
            <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-[#0A0B12]">@{winners[index].id}</h4>
            
            <div className="inline-flex items-center gap-3 gold-gradient px-6 py-3 rounded-[1.5rem] border border-white/30 shadow-xl shadow-yellow-500/20">
              <TrendingUp size={18} className="text-black" />
              <span className="text-2xl font-black text-black italic tracking-tighter">+{winners[index].amount.toLocaleString()} Kz</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white/40 backdrop-blur-sm border-t border-[#D1D5DB] flex gap-2 justify-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${index % 5 === i ? 'w-8 bg-[#0066FF] shadow-[0_0_8px_#0066FF]' : 'w-2 bg-[#D1D5DB]'}`} />
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;