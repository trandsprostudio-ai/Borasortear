import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import PrizeCarousel from '@/components/raffle/PrizeCarousel';
import WinnersCarousel from '@/components/raffle/WinnersCarousel';
import LiveActivity from '@/components/raffle/LiveActivity';
import Footer from '@/components/layout/Footer';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Trophy, HelpCircle, Loader2, Zap } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { rooms, loading: roomsLoading, refresh: refreshRooms } = useRooms();
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [onlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
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
      
      // Check inicial para garantir mesas e processar expiradas
      await supabase.rpc('check_and_draw_expired_rooms');
      fetchTopWinners();
    };
    
    initializeData();

    // Monitor de Saúde do Sistema (Roda a cada 5 segundos)
    const monitorInterval = setInterval(() => {
      supabase.rpc('check_and_draw_expired_rooms');
    }, 5000);

    return () => clearInterval(monitorInterval);
  }, []);

  const fetchTopWinners = async () => {
    const { data } = await supabase.from('winners').select('*, profiles(first_name)').order('prize_amount', { ascending: false }).limit(10);
    if (data) setTopWinners(data);
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

  // FILTRO CRÍTICO: Só mostra mesas OPEN que pertencem ao módulo ativo
  const activeModuleRooms = rooms
    .filter(r => r.moduleId === activeModuleId && r.status === 'open')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 3); // Sempre mostra as 3 mais recentes/vivas

  const activeModule = modules.find(m => m.id === activeModuleId);

  const tickerItems = useMemo(() => {
    const prizes = [16500, 33000, 82500, 66000, 13200, 41250];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 30 }, () => ({
      code: Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(''),
      amount: prizes[Math.floor(Math.random() * prizes.length)]
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar />
      
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
          animate={{ x: [0, -2000] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="inline-flex gap-12 items-center"
        >
          {tickerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Trophy size={10} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">#{item.code}</span> faturou <span className="text-green-400">{item.amount.toLocaleString()} Kz</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 pt-4 md:pt-12 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12 bg-[#151823]/80 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-[2rem]">
          <PrizeCarousel />
          
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center">
            <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 flex-1 md:flex-none text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                {onlinePlayers.toLocaleString()} ONLINE
              </span>
            </div>
            <Button onClick={() => navigate('/central-de-ajuda')} variant="ghost" className="text-white/40 font-black text-[10px] uppercase flex-1 md:flex-none">
              AJUDA
            </Button>
          </div>
        </div>

        <section className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0">
              <Activity size={20} className="md:size-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">SALAS AO VIVO</h2>
              <p className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Sorteios Automáticos 24/7</p>
            </div>
          </div>

          <div className="flex gap-2 mb-8 md:mb-10 overflow-x-auto no-scrollbar pb-2 px-1">
            {modules.map((mod) => (
              <Button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                variant={activeModuleId === mod.id ? 'default' : 'outline'}
                className={`h-11 px-5 md:h-12 md:px-6 rounded-2xl font-black text-[9px] md:text-xs uppercase shrink-0 ${
                  activeModuleId === mod.id ? 'premium-gradient border-none' : 'border-white/10 bg-white/5'
                }`}
              >
                {mod.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomsLoading ? (
              <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-purple-500" size={32} /></div>
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
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                 <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={32} />
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Iniciando Mesas do Módulo...</p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#151823]/50 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase text-white/40 mb-6 flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" /> HALL DA FAMA (ÚLTIMAS VITÓRIAS)
              </h3>
              <WinnersCarousel winners={topWinners} />
            </div>
          </div>
          
          <div className="space-y-6">
            <LiveActivity />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;