"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, Clock, Trophy, Ticket, Loader2, History, CheckCircle2, XCircle, Search, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PenguinMascot from '@/components/ui/PenguinMascot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, getTimeRemaining, isWithinHours } from '@/utils/date-utils';

const CountdownItem = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(expiresAt)), 1000);
    setTimeLeft(getTimeRemaining(expiresAt));
    return () => clearInterval(timer);
  }, [expiresAt]);

  return <span>{timeLeft}</span>;
};

const MyParticipations = () => {
  const [participations, setParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [winnersList, setWinnersList] = useState<Record<string, any[]>>({});
  const navigate = useNavigate();

  const fetchWinnersForRooms = useCallback(async (roomIds: string[]) => {
    if (roomIds.length === 0) return;
    
    const { data: winners } = await supabase
      .from('winners')
      .select('*, profiles(first_name)')
      .in('draw_id', roomIds)
      .order('position', { ascending: true });
    
    if (winners) {
      const winnersMap: Record<string, any[]> = {};
      winners.forEach(w => {
        if (!winnersMap[w.draw_id]) winnersMap[w.draw_id] = [];
        winnersMap[w.draw_id].push(w);
      });
      setWinnersList(prev => ({ ...prev, ...winnersMap }));
    }
  }, []);

  const fetchParticipations = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar participações");
      return;
    }

    if (data) {
      setParticipations(data);
      const finishedRoomIds = data
        .filter(p => p.rooms.status === 'finished')
        .map(p => p.rooms.id);
      
      await fetchWinnersForRooms(finishedRoomIds);
    }
    setLoading(false);
  }, [fetchWinnersForRooms]);

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

    const channel = supabase.channel('my-rooms-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        if (user) fetchParticipations(user.id);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, navigate, fetchParticipations]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeParticipations = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  
  // Filtro de 48 horas usando o utilitário profissional
  const historyParticipations = participations.filter(p => {
    if (p.rooms.status !== 'finished') return false;
    return isWithinHours(p.rooms.created_at, 48);
  });

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Minhas Mesas</h1>
              <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Acompanhe seus bilhetes ativos e resultados</p>
            </div>
            <div className="hidden md:block">
              <PenguinMascot page="raffle" className="scale-75 origin-bottom" />
            </div>
          </div>
        </header>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 mb-10">
            <TabsTrigger value="active" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              Ativas ({activeParticipations.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              Histórico (48h)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeParticipations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeParticipations.map((p) => (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Sorteio em Curso</span>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{p.rooms.modules.name} - {p.rooms.modules.price.toLocaleString()} Kz</h3>
                        <p className="text-[10px] font-bold text-white/20 mt-1">ID MESA: #{p.rooms.id.slice(0,8)}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                        <Ticket size={18} className="text-purple-500 mx-auto mb-1" />
                        <span className="text-[10px] font-black text-white tracking-widest">{p.ticket_code}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-white/20" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.rooms.current_participants}/{p.rooms.max_participants} JOGADORES</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <LayoutGrid size={40} className="mx-auto mb-4 text-white/10" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Nenhuma mesa ativa no momento</p>
                <Button onClick={() => navigate('/')} className="mt-6 premium-gradient h-12 px-8 rounded-xl font-black text-[10px] uppercase">Explorar Mesas</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyParticipations.length > 0 ? (
              <div className="space-y-6">
                {historyParticipations.map((p) => {
                  const roomWinners = winnersList[p.rooms.id] || [];
                  const myWinData = roomWinners.find((w: any) => w.user_id === user?.id);
                  const iWon = !!myWinData;
                  
                  return (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              iWon ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/20'
                            }`}>
                              {iWon ? <Trophy size={24} /> : <History size={24} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Sorteio Finalizado</span>
                                <span className="text-[8px] font-black text-white/10">•</span>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{formatDateTime(p.rooms.created_at)}</span>
                              </div>
                              <h4 className="text-lg font-black uppercase italic tracking-tighter">{p.rooms.modules.name} <span className="text-[10px] not-italic text-white/20 ml-2">#{p.rooms.id.slice(0, 8)}</span></h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Bilhete</p>
                                <div className="flex items-center gap-2">
                                  <Ticket size={12} className="text-purple-400" />
                                  <span className="text-[10px] font-black text-purple-400 tracking-widest">{p.ticket_code}</span>
                                </div>
                             </div>
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Entrada</p>
                                <span className="text-[10px] font-black">{p.rooms.modules.price.toLocaleString()} Kz</span>
                             </div>
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Mesa</p>
                                <div className="flex items-center gap-2">
                                  <Hash size={12} className="text-white/20" />
                                  <span className="text-[10px] font-black uppercase">{p.rooms.id.slice(0, 8)}</span>
                                </div>
                             </div>
                             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Participantes</p>
                                <span className="text-[10px] font-black">{p.rooms.max_participants}</span>
                             </div>
                          </div>
                        </div>

                        <div className={`min-w-[180px] rounded-3xl p-6 flex flex-col items-center justify-center text-center border ${
                          iWon ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5'
                        }`}>
                          <div className="mb-2">
                            {iWon ? <CheckCircle2 size={32} className="text-green-500" /> : <XCircle size={32} className="text-white/20" />}
                          </div>
                          <h5 className={`text-sm font-black uppercase tracking-widest mb-1 ${iWon ? 'text-green-400' : 'text-white/30'}`}>
                            {iWon ? 'PREMIADO!' : 'NÃO PREMIADO'}
                          </h5>
                          {iWon && (
                            <div className="mt-2">
                              <p className="text-[8px] font-black text-green-500/40 uppercase mb-0.5">{myWinData.position}º Lugar</p>
                              <p className="text-xl font-black text-green-400 italic">+{Number(myWinData.prize_amount).toLocaleString()} Kz</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="bg-white/5 border border-dashed border-white/10 p-8 rounded-[2.5rem] text-center">
                  <Search size={24} className="mx-auto mb-4 text-white/20" />
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                    Sorteios com mais de 48 horas não aparecem aqui.<br />
                    Para ver resultados antigos, utilize o nosso <Link to="/consult-draw" className="text-purple-400 hover:underline">Consultor de Bilhetes</Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <History size={40} className="mx-auto mb-4 text-white/10" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Nenhum histórico nas últimas 48 horas</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyParticipations;