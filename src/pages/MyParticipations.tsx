"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Activity, Users, Clock, Trophy, Ticket, Loader2, ChevronRight, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeRooms = participations.filter(p => p.rooms.status === 'open');
  const finishedRooms = participations.filter(p => p.rooms.status === 'finished');

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Minhas Mesas</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Acompanhe o progresso dos seus sorteios em tempo real</p>
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
                  return (
                    <motion.div 
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Mesa #{p.rooms.id.slice(0,8)}</p>
                          <h3 className="text-2xl font-black italic tracking-tighter">{p.rooms.modules.price.toLocaleString()} Kz</h3>
                        </div>
                        <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                          {p.rooms.modules.name}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                            <Users size={14} />
                            <span>{p.rooms.current_participants} / {p.rooms.max_participants} Jogadores</span>
                          </div>
                          <span className="text-sm font-black text-purple-500">{Math.round(progress)}%</span>
                        </div>
                        
                        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                          />
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-white/5">
                          <div className="flex flex-col cursor-pointer group/code" onClick={(e) => copyCode(e, p.ticket_code)}>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
                              Seu Bilhete <Copy size={8} className="opacity-0 group-hover/code:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-sm font-black text-white tracking-widest">{p.ticket_code}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                            <Clock size={12} />
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
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Histórico Recente</h2>
          </div>

          <div className="space-y-3">
            {finishedRooms.length > 0 ? (
              finishedRooms.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/consult-draw?code=${p.ticket_code}`)}
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
                      <p className="text-[9px] font-bold text-white/20 uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      Finalizado
                    </div>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-white/10 font-black text-xs uppercase tracking-widest">Nenhum sorteio finalizado ainda.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyParticipations;