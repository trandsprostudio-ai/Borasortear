"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { LayoutGrid, Users, Clock, Trophy, Ticket, Loader2, History, Search, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PenguinMascot from '@/components/ui/PenguinMascot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTimeRemaining, isWithinHours } from '@/utils/date-utils';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" size={40} /></div>;

  const activeParticipations = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  const historyParticipations = participations.filter(p => p.rooms.status === 'finished' && isWithinHours(p.rooms.created_at, 48));

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-28 pb-20">
        <header className="mb-12 flex items-end justify-between">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Minhas Mesas</h1>
          <PenguinMascot page="raffle" state={activeParticipations.length > 0 ? "waiting" : "idle"} className="scale-50 origin-bottom" />
        </header>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-[#F3F4F6] border border-[#D1D5DB] p-1 rounded-2xl h-14 mb-10">
            <TabsTrigger value="active" className="rounded-xl px-8 font-black text-[10px] uppercase data-[state=active]:bg-white data-[state=active]:text-blue-600 h-full shadow-sm">Ativas</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 font-black text-[10px] uppercase data-[state=active]:bg-white data-[state=active]:text-blue-600 h-full shadow-sm">Histórico (48h)</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeParticipations.length > 0 ? activeParticipations.map((p) => (
                <div key={p.id} className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {p.source === 'bonus' ? (
                          <span className="bg-purple-100 text-purple-600 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-purple-200">Simulado</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-green-200">Real</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black italic uppercase text-[#111111]">{p.rooms.modules.name}</h3>
                      <p className="text-[10px] text-[#555555]/40 font-bold uppercase">ID: #{p.rooms.id.slice(0,8)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl text-center border border-[#D1D5DB] shadow-sm">
                      <Ticket size={16} className="text-blue-600 mx-auto mb-1" />
                      <span className="text-[10px] font-black tracking-widest text-[#111111]">{p.ticket_code}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex items-center justify-between border-t border-[#D1D5DB]">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[#111111]/40" />
                      <span className="text-[10px] font-bold text-[#555555]/60">{p.rooms.current_participants}/{p.rooms.max_participants} Jogadores</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-black"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 py-20 text-center glass-card rounded-[2rem]">
                  <Search size={40} className="mx-auto mb-4 text-[#111111]/10" />
                  <p className="text-[10px] font-black uppercase text-[#555555]/40 tracking-widest">Nenhuma participação ativa encontrada.</p>
                  <Button asChild variant="link" className="text-blue-600 font-black text-xs uppercase mt-4">
                    <Link to="/">Participar de uma Mesa</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {historyParticipations.length > 0 ? historyParticipations.map((p) => {
                const roomWinners = winnersList[p.rooms.id] || [];
                const iWon = roomWinners.some((w: any) => w.user_id === user?.id);
                return (
                  <div key={p.id} className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iWon ? 'bg-green-100 text-green-600' : 'bg-white text-[#111111]/20 border border-[#D1D5DB]'}`}>
                        {iWon ? <Trophy size={24} /> : <History size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black italic uppercase text-[#111111]">{p.rooms.modules.name}</h4>
                        <div className="flex gap-2 items-center">
                           <span className="text-[10px] font-black text-[#555555]/60">{p.ticket_code}</span>
                           <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${p.source === 'bonus' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                             {p.source}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-6 py-2 rounded-xl border ${iWon ? 'bg-green-100 border-green-200 text-green-600' : 'bg-white border-[#D1D5DB] text-[#555555]/40'} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                      {iWon ? 'Premiado' : 'Não Premiado'}
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center glass-card rounded-[2rem]">
                  <History size={40} className="mx-auto mb-4 text-[#111111]/10" />
                  <p className="text-[10px] font-black uppercase text-[#555555]/40 tracking-widest">O teu histórico de 48h está vazio.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyParticipations;