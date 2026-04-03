"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Trophy, Clock, AlertCircle, CheckCircle2, Loader2, Share2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import PenguinMascot from '@/components/ui/PenguinMascot';

const ConsultDraw = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data: participant, error: pError } = await supabase
        .from('participants')
        .select(`*, rooms (*, modules (*))`)
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (pError) throw pError;
      if (!participant) {
        setError('Código não encontrado. Verifica se digitaste corretamente.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', participant.user_id).single();
      
      let winnerInfo = null;
      if (participant.rooms.status === 'finished') {
        const { data: winner } = await supabase.from('winners').select('*').eq('user_id', participant.user_id).eq('draw_id', participant.rooms.id).maybeSingle();
        winnerInfo = winner;
      }

      setResult({ ...participant, profiles: profile, winner: winnerInfo });
    } catch (err: any) {
      setError('Erro ao processar busca.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 pt-28">
        <div className="flex flex-col items-center mb-10">
          <PenguinMascot page="raffle" className="scale-75 mb-4" />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-center">Consultar Bilhete</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest text-center mt-2">Vê o teu resultado em tempo real</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={24} />
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="EX: A1B2C3D4"
              className="bg-white/5 border-white/10 h-16 pl-14 pr-32 rounded-2xl text-xl font-black tracking-[0.2em]"
              maxLength={12}
            />
            <Button type="submit" disabled={loading || code.trim().length < 4} className="absolute right-2 top-2 bottom-2 premium-gradient rounded-xl px-6 font-black">
              {loading ? <Loader2 className="animate-spin" /> : 'BUSCAR'}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && <motion.div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold text-center">{error}</motion.div>}
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-[2.5rem] border-white/5 p-8">
               <div className="text-center">
                  <h2 className={`text-3xl font-black italic mb-2 ${result.winner ? 'text-green-400' : 'text-white/40'}`}>
                    {result.winner ? 'VOCÊ GANHOU!' : 'SORTEIO ENCERRADO'}
                  </h2>
                  <p className="font-black text-purple-400 tracking-widest">{result.ticket_code}</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default ConsultDraw;