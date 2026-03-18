"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Trophy, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';

const ConsultDraw = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Buscar participação pelo código
      const { data: participant, error: pError } = await supabase
        .from('participants')
        .select('*, rooms(*, modules(*))')
        .eq('ticket_code', code.toUpperCase())
        .single();

      if (pError || !participant) {
        setError('Código de bilhete não encontrado. Verifique e tente novamente.');
        return;
      }

      // Se a sala estiver finalizada, buscar se este usuário ganhou
      let winnerInfo = null;
      if (participant.rooms.status === 'finished') {
        const { data: winner } = await supabase
          .from('winners')
          .select('*')
          .eq('user_id', participant.user_id)
          .eq('draw_id', participant.rooms.id) // Usando room_id como draw_id por simplicidade no schema atual
          .single();
        winnerInfo = winner;
      }

      setResult({ ...participant, winner: winnerInfo });
    } catch (err) {
      setError('Ocorreu um erro na busca.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 pt-28">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-4 italic tracking-tighter uppercase">Consultar Bilhete</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Insira o código de 8 dígitos gerado na sua participação</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={24} />
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: A1B2C3D4"
              className="bg-white/5 border-white/10 h-16 pl-14 pr-32 rounded-2xl text-xl font-black tracking-[0.2em] focus:border-purple-500/50 transition-all"
              maxLength={8}
            />
            <Button 
              type="submit" 
              disabled={loading || code.length < 4}
              className="absolute right-2 top-2 bottom-2 premium-gradient rounded-xl px-6 font-black"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'BUSCAR'}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[2.5rem] overflow-hidden border-white/5"
            >
              <div className={`p-8 text-center ${
                result.winner ? 'bg-green-500/10' : result.rooms.status === 'finished' ? 'bg-white/5' : 'bg-blue-500/10'
              }`}>
                {result.winner ? (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                      <Trophy size={40} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-green-400 mb-1">VOCÊ GANHOU!</h2>
                    <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Prêmio de {result.winner.prize_amount.toLocaleString()} Kz</p>
                  </>
                ) : result.rooms.status === 'finished' ? (
                  <>
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-white/40 mb-1">SORTEIO ENCERRADO</h2>
                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Não foi desta vez. Tente novamente!</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                      <Clock size={40} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-blue-400 mb-1">MESA EM ABERTO</h2>
                    <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Aguardando preenchimento da mesa</p>
                  </>
                )}
              </div>

              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Código do Bilhete</span>
                  <span className="font-black text-purple-400 tracking-widest">{result.ticket_code}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mesa / Módulo</span>
                  <span className="font-black">#{result.rooms.id.slice(0, 8)} / {result.rooms.modules.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Valor da Entrada</span>
                  <span className="font-black">{result.rooms.modules.price.toLocaleString()} Kz</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Data da Entrada</span>
                  <span className="font-black text-white/60">{new Date(result.created_at).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
};

export default ConsultDraw;