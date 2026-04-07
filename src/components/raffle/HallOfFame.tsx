"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const HallOfFame = () => {
  const [index, setIndex] = useState(0);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      // Buscar os 10 últimos vencedores reais (não fantasma)
      const { data, error } = await supabase
        .from('winners')
        .select(`
          id,
          prize_amount,
          draw_id,
          profiles:user_id (
            first_name
          ),
          rooms:draw_id (
            modules (
              name
            )
          )
        `)
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setWinners(data.map(w => ({
          id: w.profiles?.first_name || 'Anónimo',
          amount: w.prize_amount,
          module: w.rooms?.modules?.name || 'Mesa'
        })));
      } else {
        // Fallback se não houver vencedores reais ainda
        setWinners([
          { id: 'Sorteio em Curso', amount: 0, module: 'Bora Sortear' }
        ]);
      }
      setLoading(false);
    };

    fetchWinners();
  }, []);

  useEffect(() => {
    if (winners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % winners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [winners.length]);

  if (loading) {
    return (
      <div className="platinum-gradient rounded-[3rem] h-[450px] flex items-center justify-center border-2 border-[#E5E7EB]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

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
           <span className="text-[8px] font-black text-white uppercase tracking-widest">AO VIVO</span>
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
            <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-[#0A0B12]">
              {winners[index].id.startsWith('Sorteio') ? winners[index].id : `@${winners[index].id}`}
            </h4>
            
            {winners[index].amount > 0 && (
              <div className="inline-flex items-center gap-3 gold-gradient px-6 py-3 rounded-[1.5rem] border border-white/30 shadow-xl shadow-yellow-500/20">
                <TrendingUp size={18} className="text-black" />
                <span className="text-2xl font-black text-black italic tracking-tighter">+{winners[index].amount.toLocaleString()} Kz</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white/40 backdrop-blur-sm border-t border-[#D1D5DB] flex gap-2 justify-center">
        {winners.length > 1 && [...Array(Math.min(5, winners.length))].map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${index % 5 === i ? 'w-8 bg-[#0066FF] shadow-[0_0_8px_#0066FF]' : 'w-2 bg-[#D1D5DB]'}`} />
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;