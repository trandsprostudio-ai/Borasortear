"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Loader2, Star, HelpCircle, Shield } from 'lucide-react';
import ModuleCard from '@/components/raffle/ModuleCard';
import RoomItem from '@/components/raffle/RoomItem';
import BossRoomItem from '@/components/raffle/BossRoomItem';
import NewsTicker from '@/components/layout/NewsTicker';
import HallOfFame from '@/components/raffle/HallOfFame';
import TicketConfirmationModal from '@/components/raffle/TicketConfirmationModal';
import RoomJoinConfirmation from '@/components/raffle/RoomJoinConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PenguinMascot from '@/components/ui/PenguinMascot';

const Index = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bossRooms, setBossRooms] = useState<any[]>([]);
  const [bossCounts, setBossCounts] = useState<Record<string, number>>({});
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [ticketModal, setTicketModal] = useState<{ open: boolean; code: string } | null>(null);
  const [confirmingRoom, setConfirmingRoom] = useState<any>(null);

  const navigate = useNavigate();

  const fetchRooms = useCallback(async (moduleId: string) => {
    if (moduleId === 'BOSS') {
      try {
        const { data, error } = await supabase.from('boss_rooms').select('*').eq('status', 'ativo');
        if (error) throw error;
        setBossRooms(data || []);
        
        const { data: counts } = await supabase.from('boss_participants').select('room_id');
        if (counts) {
          const countsMap = counts.reduce((acc: any, curr: any) => {
            acc[curr.room_id] = (acc[curr.room_id] || 0) + 1;
            return acc;
          }, {});
          setBossCounts(countsMap);
        }
      } catch (err) {
        console.error("Erro ao carregar mesas BOSS:", err);
      }
      return;
    }

    const { data } = await supabase
      .from('rooms')
      .select('*, modules(*)')
      .eq('module_id', moduleId)
      .eq('status', 'open')
      .order('created_at', { ascending: true })
      .limit(3);
    if (data) setRooms(data);
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (modData) {
        const allModules = [...modData, { id: 'BOSS', name: 'BOSS', price: 0, is_boss: true }];
        setModules(allModules);
        setSelectedModule(allModules[0]);
      }
      setLoading(false);
    };
    fetchModules();
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    fetchRooms(selectedModule.id);
  }, [selectedModule, fetchRooms]);

  const handleOpenConfirm = (room: any) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { 
        setIsAuthModalOpen(true); 
        return; 
      }
      setConfirmingRoom(room);
    });
  };

  const handleJoinRoom = async () => {
    if (!confirmingRoom) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setActionLoading(confirmingRoom.id);
    try {
      if (selectedModule.id === 'BOSS') {
        const { data, error } = await supabase.rpc('join_boss_room', { 
          p_user_id: session.user.id, 
          p_room_id: confirmingRoom.id, 
          p_fee: confirmingRoom.entry_fee 
        });

        if (error) throw error;
        if (data === 'NO_REAL_BALANCE') {
          toast.error("Saldo real insuficiente! Bónus não permitido no BOSS.");
          return;
        }

        setTicketModal({ open: true, code: data });
        setConfirmingRoom(null);
        fetchRooms('BOSS');
        return;
      }

      const { data, error } = await supabase.rpc('join_room_secure', { 
        p_user_id: session.user.id, 
        p_room_id: confirmingRoom.id, 
        p_price: selectedModule.price 
      });
      
      if (error) throw error;
      
      if (data === 'FULL') toast.error("Mesa lotada!");
      else if (data === 'NO_BALANCE' || data === 'NO_BALANCE_REAL_REQUIRED') toast.error("Saldo insuficiente!");
      else if (data) {
        setTicketModal({ open: true, code: data });
        setConfirmingRoom(null);
        fetchRooms(selectedModule.id);
      }
    } catch (err: any) {
      toast.error("Erro ao entrar: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-black" size={40} /></div>;

  const isBossMode = selectedModule?.id === 'BOSS';

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />
      <div className="hidden sm:block">
        <NewsTicker />
      </div>
      
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-6 pt-10 md:pt-16 flex-1 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16">
          
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <header className="space-y-6 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 ${isBossMode ? 'bg-blue-50 border-blue-100' : 'bg-[#F2F2F2] border-[#D1D5DB]'} px-4 py-2 rounded-full shadow-sm`}>
                <Star size={12} className={isBossMode ? 'text-blue-500 fill-blue-500' : 'text-amber-500 fill-amber-500'} />
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ${isBossMode ? 'text-blue-600' : ''}`}>
                  {isBossMode ? 'MÓDULO DE ELITE BOSS' : 'O TEU PRÓXIMO NÍVEL DE SORTE'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] text-[#111111]">
                {isBossMode ? (
                  <>MÓDULO <br /><span className="text-[#0066FF]">BOSS</span></>
                ) : (
                  <>A TUA SORTE <br /> <span className="blue-gradient-text">EM MILHÕES</span></>
                )}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center md:items-center gap-6 pt-2">
                <p className="text-[#555555] font-bold text-[10px] md:text-[11px] uppercase tracking-widest max-w-xs leading-relaxed text-center md:text-left">
                  {isBossMode 
                    ? 'As maiores mesas de Angola. Resultados em 72h. Apenas os melhores entram aqui.' 
                    : 'Participa nas mesas exclusivas e garante o teu lugar no topo dos vencedores.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => navigate('/wallet')} 
                    className={`${isBossMode ? 'bg-[#0066FF] hover:bg-blue-700' : 'premium-gradient'} h-14 sm:h-12 px-8 rounded-xl font-black text-[10px] uppercase text-white shadow-lg border-none`}
                  >
                    RECARREGAR SALDO
                  </Button>
                </div>
              </div>
            </header>

            <section className={`p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border-2 shadow-xl overflow-hidden ${isBossMode ? 'bg-[#EBF5FF] border-blue-200' : 'bg-[#D1D5DB] border-[#9CA3AF]'}`}>
              <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-4 py-2">
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

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
                  {isBossMode ? 'Mesas BOSS Disponíveis' : 'Mesas em Aberto'}
                </h2>
                <div className={`h-px flex-1 mx-8 hidden lg:block ${isBossMode ? 'bg-blue-200' : 'bg-[#E5E7EB]'}`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {isBossMode ? (
                    bossRooms.length > 0 ? (
                      bossRooms.map((room) => (
                        <motion.div key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                          <BossRoomItem 
                            room={room} 
                            participantCount={bossCounts[room.id] || 0}
                            onJoin={() => handleOpenConfirm(room)} 
                            loading={actionLoading === room.id} 
                          />
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center text-[#111111]/20 font-black uppercase text-[10px] tracking-widest">
                        A carregar mesas premium...
                      </div>
                    )
                  ) : (
                    rooms.map((room) => (
                      <motion.div key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <RoomItem room={room} onJoin={() => handleOpenConfirm(room)} loading={actionLoading === room.id} />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <HallOfFame />
            <div className={`${isBossMode ? 'bg-[#EBF5FF] text-[#111111]' : 'platinum-gradient'} p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-[#D1D5DB] shadow-2xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                <Shield size={80} />
              </div>
              <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-4">REGRAS DA PLATAFORMA</h4>
              <ul className="text-[9px] font-bold uppercase leading-relaxed mb-6 space-y-2 opacity-80">
                <li>• DEPÓSITOS VIA MULTICAIXA EXPRESS</li>
                <li>• SORTEIOS 100% AUTOMÁTICOS E JUSTOS</li>
                <li>• SAQUES RÁPIDOS EM ATÉ 24 HORAS</li>
                <li>• GANHA 47% DE COMISSÃO POR AMIGO</li>
                <li>• SUPORTE ESPECIALIZADO 24/7 WHATSAPP</li>
              </ul>
              <Button onClick={() => navigate('/affiliates')} className={`w-full h-12 md:h-14 ${isBossMode ? 'bg-[#0066FF] text-white' : 'bg-[#0A0B12] text-white'} rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase shadow-xl border-none transition-all`}>
                GANHAR BÓNUS DE CONVITE
              </Button>
            </div>
          </aside>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <RoomJoinConfirmation 
          isOpen={!!confirmingRoom} 
          onClose={() => setConfirmingRoom(null)} 
          onConfirm={handleJoinRoom} 
          room={confirmingRoom} 
          loading={!!actionLoading} 
        />
        {ticketModal && (
          <TicketConfirmationModal 
            isOpen={ticketModal.open} 
            onClose={() => setTicketModal(null)} 
            ticketCode={ticketModal.code} 
            moduleName={selectedModule?.name || ''} 
            price={selectedModule?.price || 0} 
          />
        )}
      </main>
      <PenguinMascot page="home" />
      <Footer />
    </div>
  );
};

export default Index;