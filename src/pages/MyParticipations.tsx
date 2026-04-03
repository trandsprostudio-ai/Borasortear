"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Activity, Users, Clock, Trophy, Ticket, Loader2, ChevronRight, Copy, Wallet, DollarSign, Search, CheckCircle2, XCircle, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import { Button } from '@/components/ui/button';
import PenguinMascot from '@/components/ui/PenguinMascot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [winnersList, setWinnersList] = useState<Record<string, any>>({});
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

    const channel = supabase.channel('my-rooms-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        if (user) fetchParticipations(user.id);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, navigate]);

  const fetchParticipations = async (userId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setParticipations(data);
      // Buscar vencedores para as salas finalizadas
      const finishedRoomIds = data
        .filter(p => p.rooms.status === 'finished')
        .map(p => p.rooms.id);
      
      if (finishedRoomIds.length > 0) {
        const { data: winners } = await supabase
          .from('winners')
          .select('*')
          .in('draw_id', finishedRoomIds);
        
        if (winners) {
          const winnersMap: Record<string, any> = {};
          winners.forEach(w => {
            if (!winnersMap[w.draw_id]) winnersMap[w.draw_id] = [];
            winnersMap[w.draw_id].push(w);
          });
          setWinnersList(winnersMap);
        }
      }
    }
    setLoading(false);
  };

  const handleShowResult = async (p: any) => {
    const { data: winners } = await supabase
      .from('winners')
      .select('*, profiles(first_name)')
      .eq('draw_id', p.rooms.id)
      .order('position', { ascending: true });

    if (winners && winners.length > 0) {
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
    } else {
      toast.error("O resultado ainda está sendo processado.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeParticipations = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  const historyParticipations = participations.filter(p => p.rooms.status === 'finished');

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
              Histórico (72h)
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
                        <span className="text-[10px] font-black uppercase"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
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
              <div className="space-y-4">
                {historyParticipations.map((p) => {
                  const myWinners = winnersList[p.rooms.id] || [];
                  const iWon = myWinners.some((w: any) => w.user_id === user?.id);
                  const myPosition = myWinners.find((w: any) => w.user_id === user?.id)?.position;
                  
                  return (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleShowResult(p)}
                      className="glass-card p-5 rounded-3xl border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          iWon ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/20'
                        }`}>
                          {iWon ? <Trophy size={28} /> : <History size={28} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Finalizado</span>
                            <span className="text-[9px] font-black text-white/10">•</span>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{new Date(p.rooms.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-tighter">{p.rooms.modules.name} - {p.rooms.modules.price.toLocaleString()} Kz</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Bilhete:</span>
                            <span className="text-[10px] font-black text-purple-400 tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">{p.ticket_code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-white/20 uppercase mb-1">Resultado</p>
                          <div className="flex items-center gap-2">
                            {iWon ? (
                              <>
                                <span className="text-xs font-black text-green-400 uppercase tracking-widest">{myPosition}º LUGAR</span>
                                <CheckCircle2 size={14} className="text-green-500" />
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest">NÃO PREMIADO</span>
                                <XCircle size={14} className="text-white/20" />
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-white/10 group-hover:text-purple-500 transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <History size={40} className="mx-auto mb-4 text-white/10" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Nenhum histórico nas últimas 72 horas</p>
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