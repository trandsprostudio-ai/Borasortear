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
import { Activity, Trophy, HelpCircle, Loader2, Zap } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { rooms, loading: roomsLoading } = useRooms();
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [onlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
  const [drawResult, setDrawResult] = useState<{ isOpen: boolean; winners: any[]; roomInfo: string }>({ isOpen: false, winners: [], roomInfo: "" });
  const [shownDrawRooms, setShownDrawRooms] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }

      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .order('price', { ascending: true });
      
      if (modData && modData.length > 0) {
        const mappedModules: Module[] = modData.map(m => ({
          id: m.id,
          name: m.name,
          price: Number(m.price),
          maxParticipants: m.max_participants
        }));
        setModules(mappedModules);
        setActiveModuleId(mappedModules[0].id);
      }
      
      fetchTopWinners();
      fetchRecentWins();
      
      // Manutenção automática silenciosa
      supabase.rpc('ensure_active_rooms');
      supabase.rpc('check_and_draw_expired_rooms');
    };
    initializeData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitorar salas finalizadas para exibir o overlay de sorteio apenas se for recente
  useEffect(() => {
    const finishedRooms = rooms.filter(r => r.status === 'finished');
    const newFinished = finishedRooms.filter(r => !shownDrawRooms.has(r.id));
    
    if (newFinished.length > 0) {
      const roomToShow = newFinished.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const isFresh = (Date.now() - new Date(roomToShow.createdAt).getTime()) < 60000;
      
      if (isFresh) fetchWinnersForRoom(roomToShow);
      else setShownDrawRooms(prev => new Set(prev).add(roomToShow.id));
    }
  }, [rooms, shownDrawRooms]);

  const fetchWinnersForRoom = async (room: Room) => {
    const { data: winners } = await supabase.from('winners').select('*, profiles(first_name)').eq('draw_id', room.id).order('position', { ascending: true });
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

  // Filtramos apenas as salas abertas para a visualização principal
  const activeModuleRooms = rooms
    .filter(r => r.moduleId === activeModuleId && (r.status === 'open' || r.status === 'processing'))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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

      {selectedRoom && user && (
        <JoinRoomModal 
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          room={selectedRoom.room}
          module={selectedRoom.module}
          userBalance={profile?.balance || 0}
          userId={user.id}
          onSuccess={() => fetchProfile(user.id)}
        />
      )}

      <div className="pt-16 bg-purple-600/5 border-b border-white/5 overflow-hidden whitespace-nowrap py-2">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-12 items-center"
        >
          {recentWins.map((win, i) => (
            <div key={i} className="flex items-center gap-2">
              <Trophy size={10} className="text-amber-500" />
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
              <HelpCircle size={14} className="mr-2" /> COMO FUNCIONA
            </Button>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">MÓDULOS AO VIVO</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Sorteios Automáticos • Novas salas instantâneas</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
            {modules.map((mod) => (
              <Button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                variant={activeModuleId === mod.id ? 'default' : 'outline'}
                className={`h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shrink-0 ${
                  activeModuleId === mod.id ? 'premium-gradient border-none shadow-lg shadow-purple-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {mod.name} ({mod.price.toLocaleString()} Kz)
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeModuleId && (
              <motion.div
                key={activeModuleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {roomsLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="glass-card h-64 rounded-[2.5rem] border-white/5 animate-pulse" />
                  ))
                ) : activeModuleRooms.length > 0 ? (
                  activeModuleRooms.map((room, index) => (
                    <RoomCard 
                      key={room.id} 
                      roomNumber={index + 1}
                      room={room}
                      module={activeModule!}
                      onParticipate={handleParticipateClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Salas Live...</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" /> Hall da Fama
                </h3>
                <Button variant="ghost" onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-purple-400 uppercase">
                  Ver Ranking
                </Button>
              </div>
              <WinnersCarousel winners={topWinners} />
            </div>
          </div>
          
          <div className="space-y-6">
            <LiveActivity />
            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Afiliados</h4>
              <p className="text-[11px] font-bold text-white/40 mb-6">Convide amigos e ganhe 5% sobre cada prêmio que eles ganharem!</p>
              <Button onClick={() => navigate('/affiliates')} className="w-full h-12 rounded-xl bg-purple-600 font-black text-[10px] uppercase">
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