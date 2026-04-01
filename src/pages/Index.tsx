"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LayoutGrid, Loader2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import ModuleCard from '@/components/raffle/ModuleCard';
import RoomItem from '@/components/raffle/RoomItem';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';

const Index = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const roomsChannel = supabase.channel('lobby-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        if (selectedModule) fetchRooms(selectedModule.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(roomsChannel);
    };
  }, [selectedModule]);

  const fetchInitialData = async () => {
    const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
    if (modData && modData.length > 0) {
      setModules(modData);
      setSelectedModule(modData[0]);
      await fetchRooms(modData[0].id);
    }
    setLoading(false);
  };

  const fetchRooms = async (moduleId: string) => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('module_id', moduleId)
      .eq('status', 'open')
      .order('created_at', { ascending: true })
      .limit(3);
    if (data) setRooms(data);
  };

  const handleJoinRoom = async (room: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }

    setActionLoading(room.id);
    try {
      const { data, error } = await supabase.rpc('join_room_secure', {
        p_user_id: session.user.id,
        p_room_id: room.id,
        p_price: selectedModule.price
      });

      if (error) throw error;

      if (data === 'FULL') toast.error("Esta mesa acabou de lotar!");
      else if (data === 'NO_BALANCE') toast.error("Saldo insuficiente. Faça uma recarga!");
      else {
        toast.success(`Entrada confirmada! Bilhete: ${data}`, {
          description: "Acompanhe em 'Minhas Mesas'",
          duration: 5000
        });
      }
    } catch (err: any) {
      toast.error("Erro ao entrar na mesa.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B12] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <main className="max-w-[1600px] mx-auto px-4 pt-28 md:pt-36">
        <header className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Sorteios 100% Automáticos</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]"
          >
            A TUA SORTE <br /> <span className="text-purple-500">COMEÇA AQUI.</span>
          </motion.h1>
          
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest max-w-xl mx-auto">
            Escolha um módulo, entre numa mesa e ganhe até 3x o valor da entrada em minutos.
          </p>
        </header>

        <section className="mb-16">
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-6 px-2">
            {modules.map((mod) => (
              <ModuleCard 
                key={mod.id} 
                module={mod} 
                isSelected={selectedModule?.id === mod.id}
                onSelect={() => {
                  setSelectedModule(mod);
                  fetchRooms(mod.id);
                }}
              />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <LayoutGrid size={20} />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Mesas Disponíveis</h2>
            </div>
            <div className="hidden md:flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-green-500" />
                 <span className="text-[9px] font-black uppercase text-white/40">Seguro</span>
               </div>
               <div className="flex items-center gap-2">
                 <TrendingUp size={14} className="text-blue-500" />
                 <span className="text-[9px] font-black uppercase text-white/40">Rápido</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            <AnimatePresence mode="popLayout">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <RoomItem 
                    room={room} 
                    onJoin={() => handleJoinRoom(room)}
                    loading={actionLoading === room.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {rooms.length === 0 && (
              <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-dashed">
                <Loader2 className="animate-spin text-white/10 mx-auto mb-4" size={40} />
                <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Preparando novas mesas...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;