"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import PrizeCarousel from '@/components/raffle/PrizeCarousel';
import WinnersCarousel from '@/components/raffle/WinnersCarousel';
import LiveActivity from '@/components/raffle/LiveActivity';
import Footer from '@/components/layout/Footer';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Zap, LayoutGrid, History, Trophy, Ticket, ArrowRight, Share2, Copy, CheckCircle2, Wallet, PlayCircle } from 'lucide-react';
import { Room, Module } from '@/types/raffle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);
  const [finishedDraw, setFinishedDraw] = useState<{ winners: any[], info: string } | null>(null);
  const [topWinners, setTopWinners] = useState<any[]>([]);
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
      } else {
        setProfile(null);
        setMyParticipations([]);
      }
    });

    // Real-time para resultados de sorteio
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
          fetchTopWinners();
          if (user) fetchMyParticipations(user.id);
        }
      }).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
      navigate('/auth?mode=login'); 
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
    toast.success("Link de convite copiado! Ganhe 5% de bônus.");
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
          onSuccess={() => {
            fetchProfile(user.id);
            fetchMyParticipations(user.id);
          }}
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

        {/* Hero Section / How it Works */}
        <section className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-600/20 to-transparent border border-white/5 p-8 md:p-12 rounded-[3rem] relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                A Maior Arena de <br /> <span className="text-purple-500">Sorteios de Angola</span>
              </h1>
              <p className="text-white/40 font-bold text-sm md:text-lg max-w-xl mb-10 leading-relaxed">
                Entre em mesas exclusivas, garanta seu bilhete e concorra a prêmios em Kwanzas instantaneamente. Transparência total e pagamentos rápidos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate(user ? '/wallet' : '/auth?mode=signup')} className="h-14 px-8 rounded-2xl premium-gradient font-black text-lg shadow-2xl shadow-purple-500/20">
                  COMEÇAR AGORA
                </Button>
                <Button variant="ghost" onClick={() => navigate('/support')} className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 font-black text-sm uppercase tracking-widest">
                  SAIBA MAIS
                </Button>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12 hidden lg:block">
              <Trophy size={400} />
            </div>
          </div>

          <div className="glass-card p-8 rounded-[3rem] border-white/5 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8">Como Funciona</h3>
            <div className="space-y-8">
              {[
                { icon: Wallet, title: "Recarregue", desc: "Adicione saldo via IBAN ou Express" },
                { icon: PlayCircle, title: "Escolha a Mesa", desc: "Selecione o valor e entre na sala" },
                { icon: CheckCircle2, title: "Ganhe", desc: "Aguarde o sorteio e receba o prêmio" }
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <step.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tighter">{step.title}</h4>
                    <p className="text-[11px] font-bold text-white/30 uppercase">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Referral Banner */}
        <div className="mb-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase">Ganhe 5% de Bônus Vitalício</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Convide amigos e ganhe sobre cada prêmio que eles faturarem.</p>
            </div>
          </div>
          <Button 
            onClick={copyInviteLink}
            className="bg-white text-black hover:bg-gray-200 font-black px-6 rounded-xl h-12 flex items-center gap-2"
          >
            <Copy size={16} /> COPIAR MEU LINK
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {/* My Active Participations */}
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

            {/* Module Selector */}
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

            {/* Rooms Section */}
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

          {/* Sidebar Activity */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <LiveActivity />
              
              <div className="glass-card p-6 rounded-3xl border-white/5 bg-gradient-to-br from-purple-600/10 to-transparent">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Dica Premium</h4>
                <p className="text-[11px] font-bold text-white/40 leading-relaxed">
                  Quanto maior o valor da mesa, maior o prêmio acumulado. Mesas de 5.000 Kz podem render prêmios gigantescos!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Winners Section & CTA */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#151823]/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <History size={18} className="text-purple-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Maiores Ganhadores da Plataforma
                </h3>
              </div>
              <Button variant="ghost" onClick={() => navigate('/leaderboard')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest h-auto p-0">Ver Ranking</Button>
            </div>
            
            <WinnersCarousel winners={topWinners} />
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
      <Footer />
    </div>
  );
};

export default Index;