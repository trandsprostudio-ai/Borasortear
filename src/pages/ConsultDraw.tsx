"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Trophy, Clock, AlertCircle, Loader2, Users, XCircle, ShieldCheck, User, Shield } from 'lucide-react';
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
      // 1. Procurar em participantes normais
      const { data: participant } = await supabase
        .from('participants')
        .select(`*, rooms (*, modules (*))`)
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (participant) {
        const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', participant.user_id).maybeSingle();
        let winnerInfo = null;
        if (participant.rooms.status === 'finished') {
          const { data: winner } = await supabase.from('winners').select('*').eq('user_id', participant.user_id).eq('draw_id', participant.rooms.id).maybeSingle();
          winnerInfo = winner;
        }
        setResult({ ...participant, profiles: profile, winner: winnerInfo, type: 'standard' });
        setLoading(false);
        return;
      }

      // 2. Procurar em participações BOSS
      const { data: bossParticipant } = await supabase
        .from('boss_participants')
        .select(`*, boss_rooms (*)`)
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (bossParticipant) {
        const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', bossParticipant.user_id).maybeSingle();
        let winnerInfo = null;
        if (bossParticipant.boss_rooms.status === 'finalizado') {
          const { data: winner } = await supabase.from('winners').select('*').eq('user_id', bossParticipant.user_id).eq('draw_id', bossParticipant.room_id).maybeSingle();
          winnerInfo = winner;
        }
        setResult({ ...bossParticipant, profiles: profile, winner: winnerInfo, type: 'boss' });
        setLoading(false);
        return;
      }

      setError('Bilhete não encontrado. Verifica o código e tenta novamente.');
    } catch (err: any) {
      setError('Ocorreu um erro na busca.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!result) return null;
    const isBoss = result.type === 'boss';
    const status = isBoss ? result.boss_rooms.status : result.rooms.status;
    const isFinished = isBoss ? status === 'finalizado' : status === 'finished';

    if (!isFinished) {
      return {
        title: 'SORTEIO EM CURSO',
        color: isBoss ? 'text-amber-500' : 'text-blue-600',
        bg: isBoss ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-50 border-blue-100',
        icon: isBoss ? <Shield className="text-amber-500" size={40} /> : <Clock className="text-blue-600" size={40} />,
        message: 'Aguarde o encerramento da mesa para ver se foi premiado.'
      };
    }
    
    if (result.winner) {
      return {
        title: 'VOCÊ GANHOU!',
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-100',
        icon: <Trophy className="text-green-600" size={40} />,
        message: `Parabéns! O prémio de ${Number(result.winner.prize_amount).toLocaleString()} Kz já foi creditado.`
      };
    }

    return {
      title: 'NÃO PREMIADO',
      color: isBoss ? 'text-white/20' : 'text-[#555555]/60',
      bg: isBoss ? 'bg-[#0A0B12] border-white/5' : 'bg-[#F3F4F6] border-[#D1D5DB]',
      icon: <XCircle className={isBoss ? "text-white/5" : "text-[#111111]/20"} size={40} />,
      message: 'Não foi desta vez. Tente a sua sorte numa nova mesa!'
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-28 pb-20">
        <div className="flex flex-col items-center mb-10">
          <PenguinMascot page="raffle" className="scale-75 mb-4" />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-center">Consultar Bilhete</h1>
        </div>

        <form onSubmit={handleSearch} className="relative mb-12">
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/20" size={24} />
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="CÓDIGO DO BILHETE"
              className="bg-[#F3F4F6] border-[#D1D5DB] h-16 pl-14 pr-32 rounded-2xl text-xl font-black tracking-[0.2em]"
              maxLength={15}
            />
            <Button type="submit" disabled={loading || code.trim().length < 4} className="absolute right-2 top-2 bottom-2 premium-gradient rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-white">
              {loading ? <Loader2 className="animate-spin" /> : 'VERIFICAR'}
            </Button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 text-xs font-bold text-center uppercase">
              <AlertCircle className="mx-auto mb-2" size={24} />
              {error}
            </motion.div>
          )}

          {result && statusInfo && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className={`glass-card rounded-[2.5rem] p-8 text-center border-2 ${statusInfo.bg} ${result.type === 'boss' ? 'text-white' : ''}`}>
                <div className="mb-6 flex justify-center">{statusInfo.icon}</div>
                <h2 className={`text-4xl font-black italic tracking-tighter uppercase mb-2 ${statusInfo.color}`}>{statusInfo.title}</h2>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-6 ${result.type === 'boss' ? 'text-white/20' : 'text-[#555555]/40'}`}>{result.ticket_code}</p>
                <p className={`text-xs font-bold leading-relaxed max-w-xs mx-auto uppercase ${result.type === 'boss' ? 'text-white/40' : 'text-[#555555]/80'}`}>{statusInfo.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`glass-card p-6 rounded-3xl border-[#D1D5DB] ${result.type === 'boss' ? 'bg-[#0A0B12] border-white/5 text-white' : ''}`}>
                  <p className="text-[8px] font-black text-[#555555]/40 uppercase mb-1">Jogador</p>
                  <div className="flex items-center gap-2"><User size={12} className="text-[#111111]/40" /><span className="text-[11px] font-black uppercase truncate">{result.profiles?.first_name || 'Usuário'}</span></div>
                </div>
                <div className={`glass-card p-6 rounded-3xl border-[#D1D5DB] ${result.type === 'boss' ? 'bg-[#0A0B12] border-white/5 text-white' : ''}`}>
                  <p className="text-[8px] font-black text-[#555555]/40 uppercase mb-1">Mesa</p>
                  <p className="text-[11px] font-black uppercase italic">{result.type === 'boss' ? result.boss_rooms.name : result.rooms.modules.name}</p>
                </div>
                <div className={`glass-card p-6 rounded-3xl border-[#D1D5DB] ${result.type === 'boss' ? 'bg-[#0A0B12] border-white/5 text-white' : ''}`}>
                  <p className="text-[8px] font-black text-[#555555]/40 uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <Shield size={12} className={result.type === 'boss' ? "text-amber-500" : "text-blue-600"} />
                    <span className="text-[11px] font-black uppercase">
                      {result.type === 'boss' ? 'PREMIUM BOSS' : 'MÓDULO REAL'}
                    </span>
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