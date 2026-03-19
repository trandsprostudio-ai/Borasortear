"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import PrizeCarousel from '@/components/raffle/PrizeCarousel';
import WinnersCarousel from '@/components/raffle/WinnersCarousel';
import LiveActivity from '@/components/raffle/LiveActivity';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import Footer from '@/components/layout/Footer';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Zap, LayoutGrid, History, Trophy, Ticket, Share2, Copy, HelpCircle, Star, ChevronDown, Lock, Unlock } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
  
  const [drawResult, setDrawResult] = useState<{ isOpen: boolean, winners: any[], roomInfo: string }>({
    isOpen: false,
    winners: [],
    roomInfo: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (data) {
        // Garantir unicidade absoluta por preço para evitar duplicação visual
        const uniqueModules = Array.from(new Map(data.map(m => [m.price, m])).values());
        setModules(uniqueModules);
        if (uniqueModules.length > 0) setActiveModuleId(uniqueModules[0].id);
      }
    };

    const fetchTopWinners = async () => {
      const { data } = await supabase
        .from('winners')
        .select('*, profiles(first_name)')
        .order('prize_amount', { ascending: false })
        .limit(10);
      if (data) setTopWinners(data);
    };

    const fetchRecentWins = async () => {
      const { data } = await supabase
        .from('winners')
        .select('*, profiles(first_name)')
        .order('created_at', { ascending: false })
        .limit(15);
      if (data) setRecentWins(data);
    };

    fetchModules();
    fetchTopWinners();
    fetchRecentWins();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchMyParticipations(currentUser.id);
        listenToDraws(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const listenToDraws = (userId: string) => {
    const channel = supabase.channel(`user-draws-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'status=eq.finished' }, 
      async (payload) => {
        const { data: participation } = await supabase
          .from('participants')
          .select('id')
          .eq('room_id', payload.new.id)
          .eq('user_id', userId)
          .single();

        if (participation) {
          const { data: winners } = await supabase
            .from('winners')
            .select('*, profiles(first_name)')
            .eq('draw_id', payload.new.id)
            .order('position', { ascending: true });

          if (winners) {
            const formattedWinners = winners.map(w => ({
              name: w.profiles?.first_name || 'Jogador',
              prize: `${w.prize_amount.toLocaleString()} Kz`,
              position: w.position,
              userId: w.user_id,
              amount: w.prize_amount
            }));

            setDrawResult({
              isOpen: true,
              winners: formattedWinners,
              roomInfo: `MESA #${payload.new.id.slice(0,8)} FINALIZADA`
            });
            
            fetchMyParticipations(userId);
          }
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const fetchMyParticipations = async (userId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setMyParticipations(data);
  };

  const handleParticipateClick = (room: Room, module: Module) => {
    if (!user) { 
      navigate(`/auth?mode=login&room=${room.id}`); 
      return; 
    }
    setSelectedRoom({ room, module });
  };

  const activeModuleRooms = rooms
    .filter(r => r.module_id === activeModuleId && r.status === 'open')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 3);

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar />
      
      <DrawOverlay 
        isOpen={drawResult.isOpen} 
        onClose={() => setDrawResult(prev => ({ ...prev, isOpen: false }))}
        winners={drawResult.winners}
        roomInfo={drawResult.roomInfo}
      />

      {selectedRoom && user && profile && (
        <JoinRoomModal 
          isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)}
          room={selectedRoom.room} module={selectedRoom.module}
          userBalance={profile.balance} userId={user.id}
          onSuccess={() => {
            fetchMyParticipations(user.id);
          }}
        />
      )}

      {/* Ticker de Ganhadores Recentes */}
      <div className="pt-16 bg-purple-600/5 border-b border-white/5 overflow-hidden whitespace-nowrap py-2">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-12 items-center"
        >
          {recentWins.length > 0 ? [...recentWins, ...recentWins].map((win, i) => (
            <div key={i} className="flex items-center gap-2">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">@{win.profiles?.first_name || 'Jogador'}</span> faturou <span className="text-green-400">{win.prize_amount.toLocaleString()} Kz</span>
              </span>
            </div>
          )) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Aguardando novos ganhadores...</span>
          )}
        </motion.div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 pt-8 md:pt-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-[#151823]/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <PrizeCarousel />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {onlinePlayers.toLocaleString()} Jogadores Online
              </span>
            </div>
            
            <Button 
              onClick={() => navigate('/support')}
              variant="ghost"
              className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              <HelpCircle size={14} /> Como Funciona
            </Button>
          </div>
        </div>

        {/* Step 1: Module Selection */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 border border-purple-500/20">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">PASSO 1: ESCOLHA O MÓDULO</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Selecione o valor da entrada para liberar as mesas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modules.map((mod) => (
              <motion.button 
                key={mod.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModuleId(mod.id)}
                className={`relative flex flex-col items-center justify-center h-32 rounded-3xl font-black transition-all border-2 overflow-hidden ${
                  activeModuleId === mod.id 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-2xl shadow-purple-500/40' 
                    : 'bg-[#151823] border-white/5 text-white/30 hover:text-white hover:border-white/20'
                }`}
              >
                {activeModuleId === mod.id && (
                  <motion.div 
                    layoutId="active-glow"
                    className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"
                  />
                )}
                <span className="text-[9px] uppercase tracking-widest mb-2 opacity-60">{mod.name}</span>
                <span className="text-2xl italic tracking-tighter">{mod.price.toLocaleString()} Kz</span>
                <div className="mt-2">
                  {activeModuleId === mod.id ? <Unlock size={14} className="text-white" /> : <Lock size={14} className="opacity-20" />}
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Step 2: Room Release */}
        <AnimatePresence mode="wait">
          {activeModuleId ? (
            <motion.section 
              key={activeModuleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <Zap size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">PASSO 2: SALAS LIBERADAS ({activeModule?.name})</h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Escolha uma das 3 mesas disponíveis para entrar</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeModuleRooms.length > 0 ? (
                  activeModuleRooms.map((room, index) => (
                    <RoomCard 
                      key={room.id} 
                      roomNumber={index + 1}
                      room={{
                        id: room.id, moduleId: room.module_id, status: room.status,
                        currentParticipants: room.current_participants, maxParticipants: room.max_participants,
                        expiresAt: room.expires_at, createdAt: room.created_at
                      }} 
                      module={activeModule} 
                      onParticipate={handleParticipateClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-[#151823]/50 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Aguardando o sistema gerar novas mesas para este módulo...</p>
                  </div>
                )}
              </div>
            </motion.section>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/5 mb-16"
            >
              <LayoutGrid size={48} className="mx-auto mb-4 text-white/5" />
              <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Selecione um módulo acima para liberar as salas de sorteio</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Hall da Fama</h3>
                </div>
                <Button variant="ghost" onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest h-auto p-0">Ver Ranking Completo</Button>
              </div>
              <WinnersCarousel winners={topWinners} />
            </div>
          </div>

          <div className="space-y-8">
            <LiveActivity />
            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Share2 size={14} /> Programa de Afiliados
              </h4>
              <p className="text-[11px] font-bold text-white/40 mb-6 leading-relaxed">
                Convide amigos e fature <span className="text-green-400">5% de comissão</span> vitalícia sobre cada prêmio que eles ganharem!
              </p>
              <Button 
                onClick={() => navigate('/affiliates')}
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest"
              >
                SABER MAIS
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;