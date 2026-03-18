"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Crown, Loader2, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import FloatingNav from '@/components/layout/FloatingNav';

const Leaderboard = () => {
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Maiores Ganhadores (Soma de prêmios)
      const { data: winners } = await supabase
        .from('winners')
        .select('user_id, prize_amount, profiles(first_name, last_name)')
        .order('prize_amount', { ascending: false });

      if (winners) {
        // Agrupar por usuário (simulação de agregação já que o Supabase client é limitado em GROUP BY complexo)
        const grouped = winners.reduce((acc: any, curr: any) => {
          const id = curr.user_id;
          if (!acc[id]) {
            acc[id] = { 
              name: `${curr.profiles?.first_name || 'Jogador'}`, 
              total: 0,
              count: 0
            };
          }
          acc[id].total += Number(curr.prize_amount);
          acc[id].count += 1;
          return acc;
        }, {});
        
        setTopWinners(Object.values(grouped).sort((a: any, b: any) => b.total - a.total).slice(0, 10));
      }

      // Principais Indicadores (Quem mais convidou)
      const { data: referrers } = await supabase
        .from('profiles')
        .select('referred_by, id')
        .not('referred_by', 'is', null);

      if (referrers) {
        const counts = referrers.reduce((acc: any, curr: any) => {
          const id = curr.referred_by;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

        // Buscar nomes dos referrers
        const ids = Object.keys(counts);
        const { data: profiles } = await supabase.from('profiles').select('id, first_name').in('id', ids);
        
        const formatted = profiles?.map(p => ({
          name: p.first_name,
          count: counts[p.id]
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        
        setTopReferrers(formatted || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Hall da Fama</span>
            <Star size={14} className="text-amber-500 fill-amber-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">Ranking de Elite</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Os jogadores que estão dominando as mesas do BORA SORTEIAR</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top 3 Podium */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-amber-500" size={24} />
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Maiores Ganhadores</h2>
            </div>

            <div className="space-y-4">
              {topWinners.map((winner: any, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`glass-card p-6 rounded-3xl border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-all ${
                    idx === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      idx === 0 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' :
                      idx === 1 ? 'bg-slate-400 text-black' :
                      idx === 2 ? 'bg-orange-500 text-black' : 'bg-white/5 text-white/40'
                    }`}>
                      {idx === 0 ? <Crown size={24} /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-black italic tracking-tighter uppercase">@{winner.name}</h4>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{winner.count} Vitórias Acumuladas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Faturado</p>
                    <p className={`text-2xl font-black italic ${idx === 0 ? 'text-amber-500' : 'text-green-400'}`}>
                      {winner.total.toLocaleString()} <span className="text-xs not-italic opacity-60">Kz</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <section className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-purple-500" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Top Indicadores</h3>
              </div>
              <div className="space-y-6">
                {topReferrers.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">
                        {i + 1}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter">@{ref.name}</span>
                    </div>
                    <span className="text-purple-500 font-black text-sm">{ref.count} Amigos</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
              <TrendingUp className="text-blue-500 mb-4" size={32} />
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Estatísticas</h3>
              <p className="text-sm text-white/40 font-bold mb-6">A plataforma já distribuiu mais de 15.000.000 Kz em prêmios este mês.</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/20">Taxa de Retorno</span>
                  <span className="text-green-400">90%</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 w-[90%]" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Leaderboard;