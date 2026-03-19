"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Zap, LayoutGrid, History, Trophy, Ticket, Share2, Copy, HelpCircle } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState(Math.floor(Math.random() * 1500) + 2000);
  
  // Estado para o Overlay de Sorteio
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
        setModules(data);
        if (data.length > 0) setActiveModuleId(data[0].id);
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

    fetchModules();
    fetchTopWinners();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchMyParticipations(session.user.id);
        listenToDraws(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const listenToDraws = (userId: string) => {
    const channel = supabase.channel(`user-draws-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: 'status=eq.finished' }, 
      async (payload) => {
        // Verificar se o usuário participou desta mesa
        const { data: participation } = await supabase
          .from('participants')
          .select('id')
          .eq('room_id', payload.new.id)
          .eq('user_id', userId)
          .single();

        if (participation) {
          // Buscar vencedores da mesa
          const { data: winners } = await supabase
            .from('winners')
            .select('*, profiles(first_name)')
            .eq('draw_id', payload.new.id)
            .order('position', { ascending: true });

          if (winners) {
            const formattedWinners = winners.map(w => ({
              name: w.profiles?.first_name || 'Jogador',
              prize: `${w.prize_amount.toLocaleString()} Kz`,
              position: w.position
            }));

            setDrawResult({
              isOpen: true,
              winners: formattedWinners,
              roomInfo: `MESA #${payload.new.id.slice(0,8)} FINALIZADA`
            });
            
            // Atualizar dados do usuário
            fetchProfile(userId);
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

  const copyInviteLink = () => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    const link = `${window.location.origin}/auth?mode=signup&ref=${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de convite copiado!");
  };

  const activeModuleRooms = rooms
    .filter(r => r.module_id === activeModuleId && r.status === 'open')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar user={user} />
      
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
            fetchProfile(user.id);
            fetchMyParticipations(user.id);
          }}
        />
      )}

      <main className="max-w-[1600px] mx-auto px-4 pt-20 md:pt-24 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#151823]/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl">
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

        <div className="mb-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase">Convite Geral (5% Bônus)</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Ganhe 5% sobre todos os prêmios de quem aderir à plataforma pelo seu link.</p>
            </div>
          </div>
          <Button 
            onClick={copyInviteLink}
            className="bg-white text-black hover:bg-gray-200 font-black px-6 rounded-xl h-12 flex items-center gap-2"
          >
            <Copy size={16} /> COPIAR LINK GERAL
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-3 space-y-12">
            {user && myParticipations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Ticket size={18} className="text-purple-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Minhas Participações Recentes</h2>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/my-participations')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest h-auto p-0">Ver Todas</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myParticipations.map((p) => (
                    <div key={p.id} className="glass-card p-4 rounded-2xl border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xs">
                          {p.rooms?.modules?.name}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mesa #{p.rooms?.id.slice(0,4)}</p>
                          <p className="text-sm font-black text-white">{p.ticket_code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                          p.rooms?.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {p.rooms?.status === 'open' ? 'Em Aberto' : 'Finalizado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
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

            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">
                    Mesas {activeModule?.name} <span className="text-purple-500">—</span> {activeModule?.price.toLocaleString()} Kz
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
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
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <LiveActivity />
              <div className="glass-card p-6 rounded-3xl border-white/5 bg-gradient-to-br from-purple-600/10 to-transparent">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Dica Premium</h4>
                <p className="text-[11px] font-bold text-white/40 leading-relaxed">
                  Consulte seus bilhetes na aba "Consultar" para ver se você foi um dos vencedores da última mesa!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History size={18} className="text-purple-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Maiores Ganhadores
                </h3>
              </div>
              <Button variant="ghost" onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest h-auto p-0">Ver Ranking</Button>
            </div>
            <WinnersCarousel winners={topWinners} />
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 via-[#151823] to-black border border-purple-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-6 text-amber-500 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
              <Trophy size={40} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-3 uppercase">Sua Sorte Começa Aqui</h3>
            <Button 
              onClick={() => navigate(user ? '/wallet' : '/auth?mode=signup')}
              className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-lg shadow-2xl shadow-white/10 transition-transform active:scale-95"
            >
              {user ? 'DEPOSITAR AGORA' : 'CRIAR CONTA GRÁTIS'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;