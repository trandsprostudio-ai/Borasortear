"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import AuthModal from '@/components/auth/AuthModal';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import PrizeCarousel from '@/components/raffle/PrizeCarousel';
import Footer from '@/components/layout/Footer';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Zap, LayoutGrid, History, Trophy } from 'lucide-react';
import { Room, Module } from '@/types/raffle';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [finishedDraw, setFinishedDraw] = useState<{ winners: any[], info: string } | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (data) {
        setModules(data);
        if (data.length > 0) setActiveModuleId(data[0].id);
      }
    };
    fetchModules();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const channel = supabase.channel('draw-results')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'status=eq.finished' }, 
      async (payload) => {
        const { data: winners } = await supabase
          .from('winners')
          .select('*, profiles(first_name)')
          .eq('draw_id', payload.new.id);
        
        if (winners) {
          setFinishedDraw({
            winners: winners.map(w => ({ 
              name: w.profiles?.first_name || 'Usuário', 
              prize: `${w.prize_amount.toLocaleString()} Kz`,
              position: w.position 
            })),
            info: `MESA #${payload.new.id.slice(0,4)} FINALIZADA`
          });
        }
      }).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleParticipateClick = (room: Room, module: Module) => {
    if (!user) { setShowAuth(true); return; }
    setSelectedRoom({ room, module });
  };

  const activeModuleRooms = rooms
    .filter(r => r.module_id === activeModuleId && r.status === 'open')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans">
      <Navbar onAuthClick={() => setShowAuth(true)} user={user} />
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      {selectedRoom && user && profile && (
        <JoinRoomModal 
          isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)}
          room={selectedRoom.room} module={selectedRoom.module}
          userBalance={profile.balance} userId={user.id}
          onSuccess={() => fetchProfile(user.id)}
        />
      )}

      <DrawOverlay 
        isOpen={!!finishedDraw} 
        onClose={() => setFinishedDraw(null)} 
        winners={finishedDraw?.winners || []}
        roomInfo={finishedDraw?.info}
      />

      <main className="max-w-[1600px] mx-auto px-4 pt-20 pb-20">
        {/* Header de Status com Carrossel */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#151823] border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-6">
            <PrizeCarousel />
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sorteios Realizados</span>
              <span className="text-xl font-black text-purple-500">842</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest">2.140 Jogadores Online</span>
          </div>
        </div>

        {/* Seleção de Módulos */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={18} className="text-purple-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Escolha o Valor do Sorteio</h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {modules.map((mod) => (
              <button 
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={`flex flex-col items-center justify-center min-w-[120px] h-20 rounded-xl font-black transition-all border ${
                  activeModuleId === mod.id 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-[#151823] border-white/5 text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="text-[10px] uppercase tracking-tighter mb-1">{mod.name}</span>
                <span className="text-lg">{mod.price} Kz</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              <h2 className="text-xl font-black italic tracking-tighter">
                MESAS DISPONÍVEIS - {activeModule?.name} ({activeModule?.price} Kz)
              </h2>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sorteio em até 5h ou ao lotar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-44 bg-[#151823] animate-pulse rounded-xl border border-white/5" />
              ))
            ) : activeModuleRooms.length > 0 ? (
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
              <div className="col-span-full py-12 text-center bg-[#151823] rounded-xl border border-dashed border-white/10">
                <p className="text-white/20 font-black uppercase tracking-widest text-sm">Nenhuma mesa aberta neste módulo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#151823] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History size={16} className="text-purple-500" /> Últimos Ganhadores
              </h3>
              <button className="text-[10px] font-black text-purple-400 hover:underline uppercase">Ver Tudo</button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">U{i}</div>
                    <span className="font-bold text-sm">usuário_sortudo_{i}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-white/20">MÓDULO M{i}</span>
                    <span className="font-black text-green-400">+{i * 1000} Kz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <Trophy size={48} className="text-amber-500 mb-4" />
            <h3 className="text-xl font-black italic mb-2">SEJA O PRÓXIMO!</h3>
            <p className="text-xs text-white/60 font-bold mb-6">Milhares de kwanzas são pagos todos os dias aos nossos jogadores.</p>
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-black text-sm transition-all">
              DEPOSITAR AGORA
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;