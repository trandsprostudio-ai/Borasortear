"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Loader2, Star, HelpCircle } from 'lucide-react';
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
      <div className="hidden sm:block">
        <NewsTicker />
      </div>
      
      <main className="max-w-[1400px] w-full mx-auto px-4 md:px-6 pt-10 md:pt-16 flex-1 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16">
          
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <header className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#F2F2F2] border border-[#D1D5DB] px-4 py-2 rounded-full shadow-sm">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">O TEU PRÓXIMO NÍVEL DE SORTE</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] text-[#111111]">
                A TUA SORTE <br /> <span className="blue-gradient-text">EM MILHÕES</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center md:items-center gap-6 pt-2">
                <p className="text-[#555555] font-bold text-[10px] md:text-[11px] uppercase tracking-widest max-w-xs leading-relaxed text-center md:text-left">
                  Participa nas mesas exclusivas e garante o teu lugar no topo dos vencedores.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={() => navigate('/wallet')} 
                    className="premium-gradient h-14 sm:h-12 px-8 rounded-xl font-black text-[10px] uppercase text-white shadow-lg border-none"
                  >
                    COMEÇAR AGORA
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/central-de-ajuda')} 
                    className="h-14 sm:h-12 px-8 rounded-xl font-black text-[10px] uppercase text-[#111111] border-[#D1D5DB] hover:bg-[#F3F4F6]"
                  >
                    <HelpCircle size={14} className="mr-2" /> COMO FUNCIONA
                  </Button>
                </div>
              </div>
            </header>

            <section className="bg-[#F9FAFB] p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border-2 border-[#E5E7EB] shadow-xl overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-4 py-2">
                {modules.map((mod) => (
                  <ModuleCard key={mod.id} module={mod} isSelected={selectedModule?.id === mod.id} onSelect={() => setSelectedModule(mod)} />
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Mesas em Aberto</h2>
                <div className="h-px flex-1 bg-[#E5E7EB] mx-8 hidden lg:block" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

          <aside className="lg:col-span-4 space-y-8">
            <div className="hidden lg:block">
              <HallOfFame />
            </div>

            <div className="platinum-gradient p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-[#D1D5DB] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                <LayoutGrid size={80} />
              </div>
              <h4 className="text-[10px] md:text-[11px] font-black uppercase text-[#111111] tracking-widest mb-4">Rede de Afiliados</h4>
              <p className="text-[10px] md:text-[11px] font-bold text-[#555555] uppercase leading-relaxed mb-6">Convida a tua rede e fatura uma super comissão de 47% no primeiro depósito de cada amigo.</p>
              <Button onClick={() => navigate('/affiliates')} className="w-full h-12 md:h-14 bg-[#0A0B12] hover:bg-blue-600 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase text-white shadow-xl border-none transition-all">GERAR MEU LINK</Button>
            </div>
          </aside>
        </div>
      </main>

      {/* O BORA AGORA É UM ASSISTENTE FLUTUANTE GLOBAL */}
      <PenguinMascot page="home" />

      <Footer />
    </div>
  );
};

export default Index;