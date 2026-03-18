"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import PrizeCarousel from '@/components/raffle/PrizeCarousel';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Zap, LayoutGrid, History, Trophy } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [finishedDraw, setFinishedDraw] = useState<{ winners: any[], info: string } | null>(null);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (data) {
        setModules(data);
        if (data.length > 0) setActiveModuleId(data[0].id);
      }
    };

    const fetchRecentWinners = async () => {
      const { data } = await supabase
        .from('winners')
        .select('*, profiles(first_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setRecentWinners(data);
    };

    fetchModules();
    fetchRecentWinners();

    const onlineInterval = setInterval(() => {
      setOnlinePlayers(prev => {
        const change = Math.floor(Math.random() * 300) - 150;
        const next = prev + change;
        return next < 1000 ? 1000 + Math.floor(Math.random() * 200) : next;
      });
    }, 180000);

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
          fetchRecentWinners();
        }
      }).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      clearInterval(onlineInterval);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleParticipateClick = (room: Room, module: Module) => {
    if (!user) { 
      navigate('/auth?mode=login'); 
      return; 
    }
    setSelectedRoom({ room, module });
  };

  const activeModuleRooms = rooms
    .filter(r => r.module_id === activeModuleId && r.status === 'open')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar user={user} />
      
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

      <main className="max-w-[1600px] mx-auto px-4 pt-20 md:pt-24 pb-20">
        {/* Top Bar Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#151823]/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <PrizeCarousel />
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5 w-full md:w-auto justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
              {onlinePlayers.toLocaleString()} Jogadores Online
            </span>
          </div>
        </div>

        {/* Module Selector */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <LayoutGrid size={18} className="text-purple-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Selecione o Valor da Mesa</h2>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {modules.map((mod) => (
              <button 
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={`flex flex-col items-center justify-center min-w-[120px] md:min-w-[140px] h-20 md:h-24 rounded-2xl font-black transition-all border-2 ${
                  activeModuleId === mod.id 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-2xl shadow-purple-500/40 scale-105' 
                    : 'bg-[#151823] border-white/5 text-white/30 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="text-[8px] md:text-[9px] uppercase tracking-widest mb-1 opacity-60">{mod.name}</span>
                <span className="text-lg md:text-xl italic tracking-tighter">{mod.price.toLocaleString()} Kz</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Section */}
        <div className="space-y-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">
                Mesas {activeModule?.name} <span className="text-purple-500">—</span> {activeModule?.price.toLocaleString()} Kz
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">
              <Trophy size={12} className="text-amber-500" />
              Sorteio Automático
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-56 bg-[#151823] animate-pulse rounded-2xl border border-white/5" />
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
              <div className="col-span-full py-20 text-center bg-[#151823]/50 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-xs">Nenhuma mesa aberta neste módulo no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Winners & CTA Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white/40">
                <History size={18} className="text-purple-500" /> Histórico de Ganhadores
              </h3>
              <button onClick={() => navigate('/ranking')} className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors">Ver Ranking Completo</button>
            </div>
            <div className="space-y-4">
              {recentWinners.length > 0 ? (
                recentWinners.map((winner) => (
                  <div key={winner.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 font-black text-sm border border-white/5">
                        {winner.profiles?.first_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-black text-sm text-white">@{winner.profiles?.first_name || 'Usuário'}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Posição: {winner.position}º Lugar</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-base md:text-lg text-green-400">+{winner.prize_amount.toLocaleString()} Kz</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase">Sorteio Finalizado</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-white/10 font-black text-xs uppercase tracking-widest">Aguardando os próximos resultados...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 via-[#151823] to-black border border-purple-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all" />
            
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 text-amber-500 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
              <Trophy size={40} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-3 uppercase">Sua Sorte Começa Aqui</h3>
            <p className="text-sm text-white/40 font-bold mb-8 leading-relaxed">
              Milhares de kwanzas são distribuídos diariamente. Não fique de fora da próxima mesa!
            </p>
            <Button 
              onClick={() => navigate(user ? '/wallet' : '/auth?mode=signup')}
              className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-lg shadow-2xl shadow-white/10 transition-transform active:scale-95"
            >
              {user ? 'DEPOSITAR AGORA' : 'CRIAR CONTA GRÁTIS'}
            </Button>
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
};

export default Index;