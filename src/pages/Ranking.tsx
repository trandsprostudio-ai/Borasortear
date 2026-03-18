"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';

const Ranking = () => {
  const leaders = [
    { rank: 1, name: 'antonio_melo', wins: 12, total: 450000, avatar: 'AM' },
    { rank: 2, name: 'carla_silva', wins: 8, total: 280000, avatar: 'CS' },
    { rank: 3, name: 'pedro_angola', wins: 7, total: 150000, avatar: 'PA' },
    { rank: 4, name: 'maria_j', wins: 5, total: 95000, avatar: 'MJ' },
    { rank: 5, name: 'lucas_v', wins: 4, total: 82000, avatar: 'LV' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">Hall da Fama</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Os maiores ganhadores da plataforma BORA SORTEIAR</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end max-w-2xl mx-auto">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-400/10 border border-slate-400/30 flex items-center justify-center mb-3 relative">
              <span className="font-black text-slate-400">CS</span>
              <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-900 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">2º</div>
            </div>
            <p className="font-black text-[10px] uppercase text-white/60">carla_silva</p>
            <p className="text-xs font-black text-slate-400">280.000 Kz</p>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mb-4 relative shadow-2xl shadow-amber-500/20">
              <span className="font-black text-2xl text-amber-500">AM</span>
              <div className="absolute -top-4 -right-4 bg-amber-500 text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg">1º</div>
              <Trophy className="absolute -top-10 text-amber-500 animate-bounce" size={32} />
            </div>
            <p className="font-black text-sm uppercase text-white">antonio_melo</p>
            <p className="text-lg font-black text-amber-500">450.000 Kz</p>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-3 relative">
              <span className="font-black text-orange-500">PA</span>
              <div className="absolute -top-2 -right-2 bg-orange-500 text-black w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">3º</div>
            </div>
            <p className="font-black text-[10px] uppercase text-white/60">pedro_angola</p>
            <p className="text-xs font-black text-orange-500">150.000 Kz</p>
          </motion.div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaders.map((leader, idx) => (
            <motion.div 
              key={leader.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4 rounded-2xl flex items-center justify-between border-white/5 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20">
                  #{leader.rank}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center font-black text-xs">
                  {leader.avatar}
                </div>
                <div>
                  <p className="font-black text-sm">@{leader.name}</p>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{leader.wins} Sorteios Ganhos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-green-400">{leader.total.toLocaleString()} Kz</p>
                <p className="text-[9px] text-white/20 font-bold flex items-center justify-end gap-1 uppercase">
                  <TrendingUp size={10} className="text-green-400" /> +12% este mês
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Ranking;