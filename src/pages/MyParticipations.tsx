"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Activity, Users, Clock, Trophy, Ticket, Loader2, ChevronRight, Copy, Wallet, DollarSign, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DrawOverlay from '@/components/raffle/DrawOverlay';

const CountdownItem = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) return "SORTEANDO...";
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h}h ${m}m ${s}s`;
    };
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    setTimeLeft(calculate());
    return () => clearInterval(timer);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
};

const MyParticipations = () => {
  const [participations, setParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth?mode=login');
        return;
      }
      setUser(session.user);
      fetchParticipations(session.user.id);
    };
    getSession();

    const channel = supabase.channel('my-rooms-progress')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, 
      () => {
        if (user) fetchParticipations(user.id);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const fetchParticipations = async (userId: string) => {
    const { data, error } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setParticipations(data);
    }
    setLoading(false);
  };

  const handleShowResult = async (p: any) => {
    const { data: winners } = await supabase
      .from('winners')
      .select('*, profiles(first_name)')
      .eq('draw_id', p.rooms.id)
      .order('position', { ascending: true });

    if (winners) {
      setSelectedResult({
        isOpen: true,
        winners: winners.map(w => ({
          name: w.profiles?.first_name || 'Jogador',
          prize: w.prize_amount.toLocaleString() + ' Kz',
          position: w.position,
          userId: w.user_id,
          amount: w.prize_amount
        })),
        roomInfo: `MESA #${p.rooms.id.slice(0, 8)}`
      });
    }
  };

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeRooms = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  
  const finishedRooms = participations.filter(p => {
    if (p.rooms.status !== 'finished') return false;
    const completionDate = new Date(p.rooms.expires_at);
    const now = new Date();
    const hoursSinceFinished = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceFinished < 24;
  });

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      {selectedResult && (
        <DrawOverlay 
          isOpen={selectedResult.isOpen}
          onClose={() => setSelectedResult(null)}
          winners={selectedResult.winners}
          roomInfo={selectedResult.roomInfo}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 pt-28">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Minhas Mesas</h1>
            <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Acompanhe o progresso e veja seus resultados (últimas 24h)</p>
          </div>
          <Button 
            onClick={() => navigate('/consult-draw')}
            variant="outline"
            className="border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-600 hover:text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            <Search size={14} className="mr-2" /> CONSULTAR BILHETE ANTIGO
          </Button>
        </header>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Activity size={20} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Sorteios em Andamento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {activeRooms.length > 0 ? (
                activeRooms.map((p) => {
                  const progress = (p.rooms.current_participants / p.rooms.max_participants) * 100;
                  const valorTotalSorteio = p.rooms.modules.price * p.rooms.max_participants;
                  const isProcessing = p.rooms.status === 'processing';
                  
                  return (
                    <motion.div 
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group ${isProcessing ? 'border-purple-500/30' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Mesa #{p.rooms.id.slice(0,8)}</p>
                          <h3 className="text-2xl font-black italic tracking-tighter">{p.rooms.modules.price.toLocaleString()} Kz</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          isProcessing ? 'bg-blue-600/20 text-blue-400 border-blue-500/20' : 'bg-purple-600/20 text-purple-400 border-purple-500/20'
                        }`}>
                          {isProcessing ? 'SORTEANDO' : p.rooms.modules.name}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                            <DollarSign size={14} />
                            <span>VALOR DE SORTEIO: {valorTotalSorteio.toLocaleString()} Kz</span>
                          </div>
                          <span className="text-sm font-black text-purple-500">{Math.round(progress)}%</span>
                        </div>
                        
                        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] ${
                              isProcessing ? 'bg-gradient-to-r from-blue-600 to-purple-500 animate-pulse' : 'bg-gradient-to-r from-purple-600 to-blue-500'
                            }`}
                          />
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-white/5">
                          <div className="flex flex-col cursor-pointer group/code" onClick={(e) => copyCode(e, p.ticket_code)}>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
                              Seu Bilhete <Copy size={8} className="opacity-0 group-hover/code:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-sm font-black text-white tracking-widest">{p.ticket_code}</span>
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${isProcessing ? 'text-blue-400' : 'text-amber-500'}`}>
                            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                            <CountdownItem expiresAt={p.rooms.expires_at} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <Ticket size={40} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/20 font-black text-xs uppercase tracking-widest">Você não está em nenhuma mesa ativa no momento.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-purple-500 font-black text-[10px] uppercase tracking-widest hover:text-purple-400">Bora Jogar?</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 border border-white/10">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Resultados das últimas 24h</h2>
          </div>

          <div className="space-y-3">
            {finishedRooms.length > 0 ? (
              finishedRooms.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleShowResult(p)}
                  className="glass-card p-4 rounded-2xl border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-black text-xs">
                      {p.rooms.modules.name}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mesa #{p.rooms.id.slice(0,8)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white">{p.ticket_code}</p>
                        <button onClick={(e) => copyCode(e, p.ticket_code)} className="text-white/10 hover:text-purple-500 transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-black text-white/60">{p.rooms.modules.price.toLocaleString()} Kz</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase">Encerrado em {new Date(p.rooms.expires_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      Ver Resultado
                    </div>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-white/10 font-black text-[10px] uppercase tracking-widest">Nenhum resultado nas últimas 24 horas.</p>
                <p className="text-white/5 text-[8px] font-bold uppercase mt-2">Bilhetes antigos só podem ser vistos via consulta direta.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyParticipations;