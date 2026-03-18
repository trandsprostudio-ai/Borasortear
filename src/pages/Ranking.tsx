"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';

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
          <h1 className="text-4xl font-black mb-4">Hall da Fama</h1>
          <p className="text-muted-foreground">Os maiores ganhadores da plataforma BORA SORTEIAR</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end">
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-slate-400/20 border-2 border-slate-400 flex items-center justify-center mb-2 relative">
              <span className="font-bold">CS</span>
              <div className="absolute -top-2 -right-2 bg-slate-400 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
            </div>
            <p className="font-bold text-sm">carla_silva</p>
            <p className="text-xs text-muted-foreground">280.000 Kz</p>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-4 border-yellow-500 flex items-center justify-center mb-4 relative shadow-lg shadow-yellow-500/20">
              <span className="font-bold text-2xl">AM</span>
              <div className="absolute -top-4 -right-4 bg-yellow-500 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">1</div>
              <Trophy className="absolute -top-8 text-yellow-500" size={32} />
            </div>
            <p className="font-bold text-lg">antonio_melo</p>
            <p className="text-sm text-yellow-500 font-bold">450.000 Kz</p>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-2 relative">
              <span className="font-bold">PA</span>
              <div className="absolute -top-2 -right-2 bg-orange-500 text-orange-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
            </div>
            <p className="font-bold text-sm">pedro_angola</p>
            <p className="text-xs text-muted-foreground">150.000 Kz</p>
          </motion.div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaders.map((leader) => (
            <motion.div 
              key={leader.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {leader.rank}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold">
                  {leader.avatar}
                </div>
                <div>
                  <p className="font-bold">@{leader.name}</p>
                  <p className="text-xs text-muted-foreground">{leader.wins} Sorteios Ganhos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{leader.total.toLocaleString()} Kz</p>
                <p className="text-[10px] text-green-400 flex items-center justify-end gap-1">
                  <TrendingUp size={10} /> +12% este mês
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Ranking;