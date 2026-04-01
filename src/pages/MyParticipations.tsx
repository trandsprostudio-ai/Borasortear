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
import { Button } from '@/components/ui/button';

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

    const channel = supabase.channel('my-rooms-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        if (user) fetchParticipations(user.id);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const fetchParticipations = async (userId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setParticipations(data);
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

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const activeRooms = participations.filter(p => p.rooms.status === 'open' || p.rooms.status === 'processing');
  const finishedRooms = participations.filter(p => p.rooms.status === 'finished');

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
            <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Acompanhe seus bilhetes ativos e resultados</p>
          </div>
          <Button 
            onClick={() => navigate('/consult-draw')}
            variant="outline"
            className="border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-600 hover:text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            <Search size={14} className="mr-2" /> BUSCAR POR CÓDIGO
          </Button>
        </header>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Activity size={20} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Em Sorteio</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRooms.length > 0 ? (
              activeRooms.map((p) => (
                <motion.div 
                  key={p.id}
                  layout
                  className={`glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden ${p.rooms.status === 'processing' ? 'border-purple-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase mb-1">Mesa #{p.rooms.id.slice(0,8)}</p>
                      <h3 className="text-2xl font-black italic tracking-tighter text-white">{p.rooms.modules.price.toLocaleString()} Kz</h3>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-purple-600/20 text-purple-400 text-[10px] font-black uppercase">
                      {p.rooms.status === 'processing' ? 'SORTEANDO' : p.rooms.modules.name}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col cursor-pointer" onClick={(e) => copyCode(e, p.ticket_code)}>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Seu Bilhete</span>
                      <span className="text-sm font-black text-purple-400 tracking-widest">{p.ticket_code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Expira em</span>
                      <span className="text-[11px] font-black text-amber-500"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/20 font-black text-[10px] uppercase">Nenhuma mesa ativa no momento.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Resultados Recentes</h2>
          </div>

          <div className="space-y-3">
            {finishedRooms.map((p) => (
              <div 
                key={p.id}
                onClick={() => handleShowResult(p)}
                className="glass-card p-4 rounded-2xl border-white/5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black text-xs">
                    {p.rooms.modules.name}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase">Mesa #{p.rooms.id.slice(0,8)}</p>
                    <p className="text-sm font-black text-white tracking-widest">{p.ticket_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Ver Resultado</span>
                  <ChevronRight size={16} className="text-white/10 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyParticipations;