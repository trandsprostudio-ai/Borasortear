"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Trophy, Clock, AlertCircle, CheckCircle2, Loader2, Share2, TrendingUp, Hash, Users, XCircle, ShieldCheck, User } from 'lucide-react';
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
      // Busca a participação e os dados da sala
      const { data: participant, error: pError } = await supabase
        .from('participants')
        .select(`*, rooms (*, modules (*))`)
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (pError) throw pError;
      
      if (!participant) {
        setError('Bilhete não encontrado. Verifica o código e tenta novamente.');
        setLoading(false);
        return;
      }

      // Busca o nome do jogador para confirmar que o bilhete é dele
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', participant.user_id)
        .maybeSingle();
      
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

      setResult({ ...participant, profiles: profile, winner: winnerInfo });
    } catch (err: any) {
      setError('Ocorreu um erro na busca. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!result) return null;
    const status = result.rooms.status;
    
    if (status === 'open' || status === 'processing') {
      return {
        title: 'SORTEIO EM CURSO',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        icon: <Clock className="text-purple-400" size={40} />,
        message: 'Aguarde o encerramento da mesa para ver se foi premiado.'
      };
    }
    
    if (result.winner) {
      return {
        title: 'VOCÊ GANHOU!',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        icon: <Trophy className="text-green-400" size={40} />,
        message: `Parabéns! O prémio de ${Number(result.winner.prize_amount).toLocaleString()} Kz já foi creditado.`
      };
    }
    
    return {
      title: 'NÃO PREMIADO',
      color: 'text-white/40',
      bg: 'bg-white/5',
      icon: <XCircle className="text-white/20" size={40} />,
      message: 'Não foi desta vez. Tente a sua sorte numa nova mesa!'
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 pt-28">
        <div className="flex flex-col items-center mb-10">
          <PenguinMascot page="raffle" className="scale-75 mb-4" />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-center">Consultar Bilhete</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest text-center mt-2">Validação de resultados em tempo real</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={24} />
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="CÓDIGO DO BILHETE"
              className="bg-white/5 border-white/10 h-16 pl-14 pr-32 rounded-2xl text-xl font-black tracking-[0.2em]"
              maxLength={12}
            />
            <Button type="submit" disabled={loading || code.trim().length < 4} className="absolute right-2 top-2 bottom-2 premium-gradient rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">
              {loading ? <Loader2 className="animate-spin" /> : 'VERIFICAR'}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 text-xs font-bold text-center uppercase tracking-widest"
            >
              <AlertCircle className="mx-auto mb-2" size={24} />
              {error}
            </motion.div>
          )}

          {result && statusInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="space-y-6"
            >
              {/* Confirmação de Entrada no Sistema */}
              <div className="bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-2xl flex items-center justify-center gap-3">
                <ShieldCheck className="text-green-500" size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Entrada Confirmada e Validada</span>
              </div>

              <div className={`glass-card rounded-[2.5rem] border-white/5 p-8 text-center ${statusInfo.bg}`}>
                <div className="mb-6 flex justify-center">{statusInfo.icon}</div>
                <h2 className={`text-4xl font-black italic tracking-tighter uppercase mb-2 ${statusInfo.color}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">{result.ticket_code}</p>
                <p className="text-xs font-bold text-white/60 leading-relaxed max-w-xs mx-auto uppercase">
                  {statusInfo.message}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-3xl border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">Jogador</p>
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-white/40" />
                    <span className="text-[11px] font-black uppercase truncate">
                      {result.profiles?.first_name || 'Usuário'}
                    </span>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">Mesa</p>
                  <p className="text-[11px] font-black uppercase italic">{result.rooms.modules.name}</p>
                  <p className="text-[8px] font-bold text-white/20">ID: #{result.rooms.id.slice(0,8)}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">Participação</p>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-purple-400" />
                    <span className="text-[11px] font-black">{result.rooms.current_participants}/{result.rooms.max_participants}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => {setResult(null); setCode('');}}
                className="w-full text-[9px] font-black text-white/20 uppercase tracking-widest h-12"
              >
                Nova Consulta
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default ConsultDraw;