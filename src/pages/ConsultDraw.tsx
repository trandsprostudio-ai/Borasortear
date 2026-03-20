"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Trophy, Clock, AlertCircle, CheckCircle2, Loader2, Share2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';

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
        .select('*, rooms(*, modules(*)), profiles(referred_by)')
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (pError) throw pError;

      if (!participant) {
        setError('Código de bilhete não encontrado. Verifique se digitou corretamente.');
        setLoading(false);
        return;
      }

      let winnerInfo = null;
      if (participant.rooms.status === 'finished') {
        const { data: winner } = await supabase
          .from('winners')
          .select('*')
          .eq('user_id', participant.user_id)
          .eq('draw_id', participant.rooms.id)
          .maybeSingle();
        winnerInfo = winner;
      }

      const totalPool = participant.rooms.modules.price * participant.rooms.max_participants;
      const firstPrize = totalPool * 0.33;
      const secondPrize = totalPool * 0.33;
      const platformFee = totalPool * 0.34;
      
      const referralBonus = winnerInfo ? winnerInfo.prize_amount * 0.05 : 0;

      setResult({ 
        ...participant, 
        winner: winnerInfo,
        divisions: {
          total: totalPool,
          first: firstPrize,
          second: secondPrize,
          fee: platformFee,
          referral: referralBonus
        }
      });
    } catch (err: any) {
      setError('Ocorreu um erro ao processar sua busca.');
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
              maxLength={12}
            />
            <Button 
              type="submit" 
              disabled={loading || code.trim().length < 4}
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
              className="space-y-6"
            >
              <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
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
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Valor da Entrada</span>
                    <span className="font-black">{result.rooms.modules.price.toLocaleString()} Kz</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-500" /> Divisão de Prêmios da Mesa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">1º Lugar (33%)</p>
                    <p className="text-xl font-black text-green-400">{result.divisions.first.toLocaleString()} Kz</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">2º Lugar (33%)</p>
                    <p className="text-xl font-black text-blue-400">{result.divisions.second.toLocaleString()} Kz</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">Plataforma (34%)</p>
                    <p className="text-xl font-black text-white/40">{result.divisions.fee.toLocaleString()} Kz</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                    <p className="text-[9px] font-black text-purple-400 uppercase mb-1 flex items-center gap-1">
                      <Share2 size={10} /> Bônus de Indicação (5%)
                    </p>
                    <p className="text-xl font-black text-purple-400">
                      {result.profiles?.referred_by ? `${(result.divisions.first * 0.05).toLocaleString()} Kz` : '0 Kz'}
                    </p>
                  </div>
                </div>
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