"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Loader2, Sparkles, HelpCircle, Gift, ArrowRight, ShieldCheck } from 'lucide-react';
import ModuleCard from '@/components/raffle/ModuleCard';
import RoomItem from '@/components/raffle/RoomItem';
import NewsTicker from '@/components/layout/NewsTicker';
import HallOfFame from '@/components/raffle/HallOfFame';
import TicketConfirmationModal from '@/components/raffle/TicketConfirmationModal';
import RoomJoinConfirmation from '@/components/raffle/RoomJoinConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [ticketModal, setTicketModal] = useState<{ open: boolean; code: string } | null>(null);
  const [confirmingRoom, setConfirmingRoom] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .order('price', { ascending: true });
      
      if (modData && modData.length > 0) {
        setModules(modData);
        setSelectedModule(modData[0]);
      }
      setLoading(false);
    };
    fetchModules();
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    const fetchRooms = async (moduleId: string) => {
      const { data } = await supabase
        .from('rooms')
        .select('*, modules(*)')
        .eq('module_id', moduleId)
        .eq('status', 'open')
        .order('created_at', { ascending: true })
        .limit(3);
      if (data) setRooms(data);
    };
    fetchRooms(selectedModule.id);
    const roomsChannel = supabase.channel(`lobby-rooms-${selectedModule.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `module_id=eq.${selectedModule.id}` }, () => {
        fetchRooms(selectedModule.id);
      }).subscribe();
    return () => { supabase.removeChannel(roomsChannel); };
  }, [selectedModule]);

  const handleOpenConfirm = async (room: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      setIsAuthModalOpen(true); 
      return; 
    }
    setConfirmingRoom(room);
  };

  const handleJoinRoom = async () => {
    if (!confirmingRoom) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setActionLoading(confirmingRoom.id);
    try {
      const { data, error } = await supabase.rpc('join_room_secure', {
        p_user_id: session.user.id,
        p_room_id: confirmingRoom.id,
        p_price: selectedModule.price
      });

      if (error) {
        if (error.message.includes('participants_user_id_room_id_key')) {
          toast.error("Já estás nesta mesa! Por favor, escolhe outra sala para participar novamente.");
        } else {
          toast.error(`Erro: ${error.message}`);
        }
        return;
      }

      if (data === 'FULL') {
        toast.error("Esta mesa já está lotada!");
      } else if (data === 'NO_BALANCE') {
        toast.error("Saldo insuficiente para entrar nesta mesa.");
      } else if (data === 'BANNED') {
        toast.error("Esta conta está suspensa.");
      } else if (data) {
        setTicketModal({ open: true, code: data });
        setConfirmingRoom(null);
      } else {
        toast.error("Ocorreu um erro inesperado ao processar sua entrada.");
      }
    } catch (err: any) {
      toast.error(`Erro ao entrar: ${err.message || "Tente novamente mais tarde."}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0B12] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32 selection:bg-purple-500/30">
      <Navbar />
      <NewsTicker />
      
      <main className="max-w-[1600px] mx-auto px-4 pt-12 md:pt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-12">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Elite Gaming</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-400">ATIVO AGORA</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                  <ShieldCheck size={12} className="text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">SISTEMA SEGURO</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">
                A TUA SORTE <br /> <span className="text-purple-500">NAS TUAS MÃOS.</span>
              </h1>
              
              <div className="flex items-center gap-6">
                <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest max-w-xs leading-relaxed">
                  Entra numa mesa, aguarda o sorteio e triplica o teu saldo em segundos.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/central-de-ajuda')}
                  className="h-10 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-black text-[9px] uppercase tracking-widest px-4"
                >
                  <HelpCircle size={14} className="mr-2" /> COMO FUNCIONA
                </Button>
              </div>
            </header>

            <section>
              <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
                {modules.map((mod) => (
                  <ModuleCard 
                    key={mod.id} 
                    module={mod} 
                    isSelected={selectedModule?.id === mod.id}
                    onSelect={() => setSelectedModule(mod)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                    <LayoutGrid size={16} />
                  </div>
                  <h2 className="text-lg font-black italic tracking-tighter uppercase">Mesas Ativas ({selectedModule?.name.replace('M', 'Módulo ')})</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <RoomItem 
                        room={room} 
                        onJoin={() => handleOpenConfirm(room)}
                        loading={actionLoading === room.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {rooms.length === 0 && !loading && (
                  <div className="col-span-full py-16 text-center glass-card rounded-[2rem] border-dashed border-white/10">
                    <Loader2 className="animate-spin text-white/10 mx-auto mb-3" size={32} />
                    <p className="text-white/20 font-black uppercase text-[9px] tracking-widest">Preparando novas salas para ti...</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-[320px] shrink-0">
            <HallOfFame />
          </aside>
        </div>

        <section className="mt-24 pt-16 border-t border-white/5">
          <div className="glass-card p-10 rounded-[3rem] border-purple-500/10 bg-gradient-to-br from-purple-600/5 to-transparent relative overflow-hidden">
            <div className="max-w-3xl relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                <Gift size={12} className="text-purple-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">PROGRAMA DE AFILIADOS</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">Ganhe com <span className="text-green-400">cada vitória</span> dos seus amigos</h2>
              <p className="text-white/30 font-bold text-[10px] uppercase tracking-widest mb-10 leading-relaxed max-w-xl">
                Sempre que um indicado seu ganhar um prémio, você recebe automaticamente 5% do valor na sua carteira. Sem limites, sem taxas.
              </p>
              
              <Button onClick={() => navigate('/affiliates')} className="h-14 px-8 rounded-2xl premium-gradient font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20">
                SABER MAIS <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {ticketModal && (
        <TicketConfirmationModal 
          isOpen={ticketModal.open}
          onClose={() => setTicketModal(null)}
          ticketCode={ticketModal.code}
          moduleName={selectedModule?.name.replace('M', 'Módulo ')}
          price={selectedModule?.price}
        />
      )}
      <RoomJoinConfirmation 
        isOpen={!!confirmingRoom}
        onClose={() => setConfirmingRoom(null)}
        onConfirm={handleJoinRoom}
        room={confirmingRoom}
        loading={!!actionLoading}
      />
      <Footer />
    </div>
  );
};

export default Index;