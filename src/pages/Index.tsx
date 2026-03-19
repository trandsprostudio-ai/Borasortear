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
import { Zap, LayoutGrid, Trophy, Star, Lock, Unlock, Share2, Copy, HelpCircle, Loader2 } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { rooms, loading: roomsLoading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
  const [drawResult, setDrawResult] = useState<{ isOpen: boolean, winners: any[], roomInfo: string }>({ isOpen: false, winners: [], roomInfo: "" });
  const [shownDrawRooms, setShownDrawRooms] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (modData) {
        const uniqueModules = Array.from(new Map(modData.map(m => [m.price, m])).values());
        setModules(uniqueModules);
        if (uniqueModules.length > 0) setActiveModuleId(uniqueModules[0].id);
      }
      fetchTopWinners();
      fetchRecentWins();
    };
    initializeData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const finishedRooms = rooms.filter(r => r.status === 'finished');
    const newFinished = finishedRooms.filter(r => !shownDrawRooms.has(r.id));
    if (newFinished.length > 0) {
      const roomToShow = newFinished.sort((a, b) => 
        new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      )[0];
      fetchWinnersForRoom(roomToShow);
    }
  }, [rooms, shownDrawRooms]);

  const fetchWinnersForRoom = async (room: Room) => {
    const { data: winners } = await supabase
      .from('winners')
      .select('*, profiles(first_name)')
      .eq('draw_id', room.id)
      .order('position', { ascending: true });
    if (winners && winners.length > 0) {
      setDrawResult({
        isOpen: true,
        winners: winners.map(w => ({
          name: w.profiles?.first_name || 'Jogador',
          prize: w.prize_amount.toLocaleString() + ' Kz',
          position: w.position,
          userId: w.user_id,
          amount: w.prize_amount
        })),
        roomInfo: `MESA ${room.id.slice(0, 8)}`
      });
      setShownDrawRooms(prev => new Set(prev).add(room.id));
    }
  };

  const handleDrawClose = () => {
    setDrawResult(prev => ({ ...prev, isOpen: false }));
    const remainingFinished = rooms.filter(r => r.status === 'finished' && !shownDrawRooms.has(r.id));
    if (remainingFinished.length > 0) {
      fetchWinnersForRoom(remainingFinished[0]);
    }
  };

  const fetchTopWinners = async () => {
    const { data } = await supabase.from('winners').select('*, profiles(first_name)').order('prize_amount', { ascending: false }).limit(10);
    if (data) setTopWinners(data);
  };

  const fetchRecentWins = async () => {
    const { data } = await supabase.from('winners').select('*, profiles(first_name)').order('created_at', { ascending: false }).limit(15);
    if (data) setRecentWins(data);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleParticipateClick = (room: Room, module: Module) => {
    if (!user) {
      navigate(`/auth?mode=login&room=${room.id}`);
      return;
    }
    setSelectedRoom({ room, module });
  };

  const activeModuleRooms = rooms    .filter(r => r.module_id === activeModuleId && r.status === 'open')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 3);

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar />
            <DrawOverlay 
        isOpen={drawResult.isOpen} 
        onClose={handleDrawClose}
        winners={drawResult.winners}
        roomInfo={drawResult.roomInfo}
      />

      {selectedRoom && user && profile && (
        <JoinRoomModal 
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          room={selectedRoom.room}
          module={selectedRoom.module}
          userBalance={profile.balance}
          userId={user.id}
          onSuccess={() => {}}
        />
      )}

      <div className="pt-16 bg-purple-600/5 border-b border-white/5 overflow-hidden whitespace-nowrap py-2">
        <motion.div           animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-12 items-center"
        >
          {recentWins.map((win, i) => (
            <div key={i} className="flex items-center gap-2">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">@{win.profiles?.first_name || 'Jogador'}</span> faturou <span className="text-green-400">{win.prize_amount.toLocaleString()} Kz</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 pt-8 md:pt-12 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-[#151823]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <PrizeCarousel />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
            <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                {onlinePlayers.toLocaleString()} ONLINE
              </span>
            </div>
            <Button onClick={() => navigate('/central-de-ajuda')} variant="ghost" className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest">
              <HelpCircle size={14} className="mr-2" /> AJUDA
            </Button>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">Módulos</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Escolha o valor da sua mesa</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {modules.map((mod) => (
              <motion.button 
                key={mod.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModuleId(mod.id)}
                className={`relative flex flex-col items-center justify-center h-36 rounded-[2rem] font-black transition-all border-2 overflow-hidden ${
                  activeModuleId === mod.id 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_rgba(124,58,237,0.4)]' 
                    : 'bg-[#151823] border-white/5 text-white/30 hover:border-white/20'
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] mb-2 opacity-60">{mod.name}</span>
                <span className="text-3xl italic tracking-tighter">{mod.price.toLocaleString()} Kz</span>
                <div className="mt-3">
                  {activeModuleId === mod.id ? <Unlock size={18} className="text-white animate-pulse" /> : <Lock size={18} className="opacity-10" />}
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeModuleId && (
            <motion.section 
              key={activeModuleId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                  <Zap size={24} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase">MESAS</h2>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Entre em uma mesa para começar a faturar</p>
                </div>
              </div>

              {roomsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 animate-pulse">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-6 bg-white/5 rounded w-1/3 mb-2"></div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        <div className="h-4 bg-white/5 rounded w-3/4"></div>
                        <div className="h-12 bg-white/5 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeModuleRooms.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-white/20 font-black uppercase tracking-widest">Nenhuma mesa disponível no momento.</p>
                  <p className="text-white/10 text-sm mt-2">Tente outro módulo ou volte mais tarde.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeModuleRooms.map((room, index) => (
                    <RoomCard                       key={room.id} 
                      roomNumber={index + 1}
                      room={{
                        id: room.id,
                        moduleId: room.module_id,
                        status: room.status,
                        currentParticipants: room.current_participants,
                        maxParticipants: room.max_participants,
                        expiresAt: room.expires_at,
                        createdAt: room.created_at
                      }}
                      module={activeModule}
                      onParticipate={handleParticipateClick}
                    />
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" /> Hall da Fama
                </h3>
                <Button variant="ghost" onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-purple-400 uppercase">Ver Ranking</Button>
              </div>
              <WinnersCarousel winners={topWinners} />
            </div>
          </div>
          
          <div className="space-y-6">
            <LiveActivity />
            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Afiliados</h4>
              <p className="text-[11px] font-bold text-white/40 mb-6">Convide amigos e ganhe 5% sobre cada prêmio que eles ganharem!</p>
              <Button onClick={() => navigate('/affiliates')} className="w-full h-12 rounded-xl bg-purple-600 font-black text-[10px] uppercase">SABER MAIS</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;