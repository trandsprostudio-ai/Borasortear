"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import AuthModal from '@/components/auth/AuthModal';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, History, Users, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showDraw, setShowDraw] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchModules = async () => {
      const { data } = await supabase.from('modules').select('*').order('price', { ascending: true });
      if (data) {
        setModules(data);
        if (data.length > 0) setActiveModule(data[0].id);
      }
    };

    fetchModules();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openRooms = rooms.filter(r => r.status === 'open');

  return (
    <div className="min-h-screen pb-24">
      <Navbar onAuthClick={() => setShowAuth(true)} user={user} />
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <DrawOverlay 
        isOpen={showDraw} 
        onClose={() => setShowDraw(false)} 
        winners={[]} 
      />

      <main className="max-w-7xl mx-auto px-4 pt-28">
        <section className="mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden border-white/10"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full premium-gradient opacity-10 blur-[120px] -rotate-12" />
            
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black tracking-widest uppercase text-white/70">A PLATAFORMA Nº1 DE ANGOLA</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                TRANSFORME <br /> 
                <span className="text-gradient-purple">100 KZ</span> EM <br />
                <span className="text-gradient-cyan">MILHÕES.</span>
              </h1>
              
              <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                Sorteios automáticos e transparentes. 
                Participe agora e mude sua vida com apenas um clique.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => !user ? setShowAuth(true) : null}
                  className="premium-gradient px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/40 hover:scale-105 transition-all active:scale-95"
                >
                  {user ? 'VER SALAS' : 'COMEÇAR AGORA'}
                </button>
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-20"
            >
              <Trophy size={320} className="text-white" />
            </motion.div>
          </motion.div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 premium-gradient rounded-full" />
              🔴 AO VIVO AGORA
            </h2>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-xs font-black text-white/70 uppercase tracking-widest">LIVE</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          ) : modules.length > 0 ? (
            <Tabs value={activeModule || undefined} onValueChange={setActiveModule} className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1.5 h-auto flex flex-wrap justify-start gap-2 mb-10 rounded-2xl">
                {modules.map((mod) => (
                  <TabsTrigger 
                    key={mod.id} 
                    value={mod.id}
                    className="rounded-xl px-8 py-4 data-[state=active]:premium-gradient data-[state=active]:text-white transition-all"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">{mod.name}</span>
                      <span className="font-black text-lg">{mod.price} Kz</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {modules.map((mod) => (
                <TabsContent key={mod.id} value={mod.id} className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {openRooms.filter(r => r.module_id === mod.id).length > 0 ? (
                      openRooms.filter(r => r.module_id === mod.id).map((room) => (
                        <RoomCard 
                          key={room.id} 
                          room={room} 
                          module={mod} 
                          user={user}
                          onAuthRequired={() => setShowAuth(true)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center glass-card rounded-3xl border-dashed border-white/10">
                        <p className="text-white/40 font-black text-xl uppercase tracking-widest">Nenhuma sala ativa para este módulo.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="py-20 text-center glass-card rounded-3xl border-dashed border-white/10">
              <p className="text-white/40 font-black text-xl uppercase tracking-widest">Aguardando inicialização do sistema...</p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-green-500">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
              <History size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Último Ganhador</p>
              <p className="font-black text-xl text-white">---</p>
              <p className="text-sm font-bold text-green-400">Aguardando sorteio</p>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-cyan-400">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Online Agora</p>
              <p className="font-black text-xl text-white">---</p>
              <p className="text-sm font-bold text-cyan-400">Participantes</p>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-purple-500">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Próximo Sorteio</p>
              <p className="font-black text-xl text-white">--:--</p>
              <p className="text-sm font-bold text-purple-400">Contagem Regressiva</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;