"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, Clock, Trophy, Ticket, Loader2, History, CheckCircle2, XCircle, Search, Hash, Info } from 'lucide-react';
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
    const { data: winners } = await supabase.from('winners').select('*, profiles(first_name)').in('draw_id', roomIds).order('position', { ascending: true });
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
    const { data, error } = await supabase.from('participants').select('*, rooms(*, modules(*))').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { toast.error("Erro ao carregar"); return; }
    if (data) {
      setParticipations(data);
      const finishedRoomIds = data.filter(p => p.rooms.status === 'finished').map(p => p.rooms.id);
      await fetchWinnersForRooms(finishedRoomIds);
    }
    setLoading(false);
  }, [fetchWinnersForRooms]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth?mode=login'); return; }
      setUser(session.user);
      fetchParticipations(session.user.id);
    };
    getSession();
  }, [navigate, fetchParticipations]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeParticipations = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  const historyParticipations = participations.filter(p => p.rooms.status === 'finished' && isWithinHours(p.rooms.created_at, 48));

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <header className="mb-12 flex items-end justify-between">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Minhas Mesas</h1>
          <PenguinMascot page="raffle" className="scale-50 origin-bottom" />
        </header>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 mb-10">
            <TabsTrigger value="active" className="rounded-xl px-8 font-black text-[10px] uppercase data-[state=active]:bg-purple-600 h-full">Ativas</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 font-black text-[10px] uppercase data-[state=active]:bg-purple-600 h-full">Histórico (48h)</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeParticipations.map((p) => (
                <div key={p.id} className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {p.source === 'bonus' ? (
                          <span className="bg-purple-500/20 text-purple-400 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-purple-500/20">Simulado</span>
                        ) : (
                          <span className="bg-green-500/20 text-green-400 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-green-500/20">Real</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black italic uppercase">{p.rooms.modules.name}</h3>
                      <p className="text-[10px] text-white/20">ID: #{p.rooms.id.slice(0,8)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                      <Ticket size={16} className="text-purple-500 mx-auto mb-1" />
                      <span className="text-[10px] font-black tracking-widest">{p.ticket_code}</span>
                    </div>
                  </div>
                  
                  {p.source === 'bonus' && (
                     <div className="mb-4 flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase bg-white/5 p-2 rounded-lg border border-white/5">
                        <Info size={10} />
                        Este bilhete não é elegível para prémios reais.
                     </div>
                  )}

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-white/20" />
                      <span className="text-[10px] font-bold text-white/40">{p.rooms.current_participants}/{p.rooms.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-black"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {historyParticipations.map((p) => {
                const roomWinners = winnersList[p.rooms.id] || [];
                const iWon = roomWinners.some((w: any) => w.user_id === user?.id);
                return (
                  <div key={p.id} className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iWon ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/20'}`}>
                        {iWon ? <Trophy size={24} /> : <History size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black italic uppercase">{p.rooms.modules.name}</h4>
                        <div className="flex gap-2 items-center">
                           <span className="text-[8px] font-black text-white/20">{p.ticket_code}</span>
                           <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${p.source === 'bonus' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                             {p.source}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-6 py-2 rounded-xl border ${iWon ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/5 text-white/20'} text-[10px] font-black uppercase tracking-widest`}>
                      {iWon ? 'Premiado' : 'Não Premiado'}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyParticipations;