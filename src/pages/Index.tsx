"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Loader2, Star } from 'lucide-react';
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
import PenguinMascot from '@/components/ui/PenguinMascot';

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
      const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
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
      const { data } = await supabase.from('rooms').select('*, modules(*)').eq('module_id', moduleId).eq('status', 'open').order('created_at', { ascending: true }).limit(3);
      if (data) setRooms(data);
    };
    fetchRooms(selectedModule.id);
  }, [selectedModule]);

  const handleOpenConfirm = (room: any) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setIsAuthModalOpen(true); return; }
      setConfirmingRoom(room);
    });
  };

  const handleJoinRoom = async () => {
    if (!confirmingRoom) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setActionLoading(confirmingRoom.id);
    try {
      const { data, error } = await supabase.rpc('join_room_secure', { p_user_id: session.user.id, p_room_id: confirmingRoom.id, p_price: selectedModule.price });
      if (error) { toast.error(`Erro: ${error.message}`); return; }
      if (data === 'FULL') toast.error("Mesa lotada!");
      else if (data === 'NO_BALANCE') toast.error("Saldo insuficiente!");
      else if (data) {
        setTicketModal({ open: true, code: data });
        setConfirmingRoom(null);
      }
    } catch (err: any) {
      toast.error("Erro ao entrar.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-black" size={40} /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />
      <NewsTicker />
      
      <main className="max-w-[1600px] w-full mx-auto px-4 pt-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          
          <div className="flex-1 space-y-12">
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F2F2F2] border border-[#D1D5DB] px-4 py-2 rounded-full shadow-sm">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">O TEU PRÓXIMO NÍVEL DE SORTE</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-[#111111]">
                A TUA SORTE <br /> <span className="blue-gradient-text">EM MILHÕES</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
                <p className="text-[#555555] font-bold text-[11px] uppercase tracking-widest max-w-xs leading-relaxed">
                  Participa nas mesas exclusivas e garante o teu lugar no topo dos vencedores.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate('/wallet')} className="premium-gradient h-12 px-8 rounded-xl font-black text-[10px] uppercase text-white shadow-lg">COMEÇAR AGORA</Button>
                </div>
              </div>
            </header>

            <section className="bg-[#F9FAFB] p-6 rounded-[2.5rem] border border-[#E5E7EB]">
              <div className="flex overflow-x-auto no-scrollbar gap-4 py-2">
                {modules.map((mod) => (
                  <ModuleCard key={mod.id} module={mod} isSelected={selectedModule?.id === mod.id} onSelect={() => setSelectedModule(mod)} />
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mesas em Aberto</h2>
                <div className="h-px flex-1 bg-[#E5E7EB] mx-8 hidden md:block" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {rooms.map((room) => (
                    <motion.div key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
                      <RoomItem room={room} onJoin={() => handleOpenConfirm(room)} loading={actionLoading === room.id} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-[380px] shrink-0 space-y-8">
            <HallOfFame />
            <div className="glass-card p-8 rounded-[2.5rem] border-[#D1D5DB]">
              <h4 className="text-[10px] font-black uppercase text-[#111111] mb-4">Rede de Afiliados</h4>
              <p className="text-[11px] font-bold text-[#555555] uppercase leading-relaxed mb-6">Convida a tua rede e fatura 5% de comissão vitalícia em cada prémio ganho.</p>
              <Button onClick={() => navigate('/affiliates')} className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-[10px] uppercase text-white shadow-md">GERAR MEU LINK</Button>
            </div>
          </aside>
        </div>
      </main>

      <PenguinMascot page="home" />
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
      <RoomJoinConfirmation isOpen={!!confirmingRoom} onClose={() => setConfirmingRoom(null)} onConfirm={handleJoinRoom} room={confirmingRoom} loading={!!actionLoading} />
      <Footer />
    </div>
  );
};

export default Index;