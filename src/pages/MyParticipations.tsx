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
import PenguinMascot from '@/components/ui/PenguinMascot';

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
  }, [user?.id, navigate]);

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
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Minhas Mesas</h1>
              <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Acompanhe seus bilhetes ativos e resultados</p>
            </div>
            {/* Mascote integrada aqui */}
            <div className="hidden md:block">
              <PenguinMascot page="raffle" className="scale-75 origin-bottom" />
            </div>
          </div>
        </header>

        {/* Mascote para Mobile */}
        <div className="md:hidden flex justify-center mb-8">
           <PenguinMascot page="raffle" className="scale-90" />
        </div>

        {/* ... resto do conteúdo ... */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRooms.map((p) => (
              <motion.div key={p.id} className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden">
                {/* Detalhes da mesa */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase mb-1">Mesa #{p.rooms.id.slice(0,8)}</p>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white">{p.rooms.modules.price.toLocaleString()} Kz</h3>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <span className="text-sm font-black text-purple-400 tracking-widest">{p.ticket_code}</span>
                  <span className="text-[11px] font-black text-amber-500"><CountdownItem expiresAt={p.rooms.expires_at} /></span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyParticipations;