"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import DrawOverlay from '@/components/raffle/DrawOverlay';
import { MODULES, Room } from '@/types/raffle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, History, TrendingUp, Users, Wallet, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ROOMS: Room[] = [
  { id: '1', moduleId: 'm1', status: 'aberta', currentParticipants: 450, maxParticipants: 1000, expiresAt: '', createdAt: '' },
  { id: '2', moduleId: 'm1', status: 'aberta', currentParticipants: 920, maxParticipants: 1000, expiresAt: '', createdAt: '' },
  { id: '3', moduleId: 'm2', status: 'aberta', currentParticipants: 120, maxParticipants: 800, expiresAt: '', createdAt: '' },
  { id: '4', moduleId: 'm4', status: 'aberta', currentParticipants: 385, maxParticipants: 400, expiresAt: '', createdAt: '' },
];

const Index = () => {
  const [activeModule, setActiveModule] = useState('m1');
  const [showDraw, setShowDraw] = useState(false);

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      <DrawOverlay 
        isOpen={showDraw} 
        onClose={() => setShowDraw(false)} 
        winners={[
          { name: 'antonio_melo', prize: '33.000 Kz' },
          { name: 'carla_silva', prize: '33.000 Kz' }
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 pt-28">
        {/* Hero Section Premium */}
        <section className="mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden border-white/10"
          >
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full premium-gradient opacity-10 blur-[120px] -rotate-12" />
            
            <div className="relative z-10 max-w-3xl">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6"
              >
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black tracking-widest uppercase text-white/70">A PLATAFORMA Nº1 DE ANGOLA</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                TRANSFORME <br /> 
                <span className="text-gradient-purple">100 KZ</span> EM <br />
                <span className="text-gradient-cyan">MILHÕES.</span>
              </h1>
              
              <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                Sorteios automáticos a cada 10 minutos. 
                Segurança total, transparência absoluta e prêmios instantâneos.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowDraw(true)}
                  className="premium-gradient px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-purple-500/40 hover:scale-105 transition-all active:scale-95"
                >
                  COMEÇAR AGORA
                </button>
                <div className="flex -space-x-3 items-center ml-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      U{i}
                    </div>
                  ))}
                  <span className="ml-6 text-sm font-bold text-white/40">+12k ativos</span>
                </div>
              </div>
            </div>

            {/* Floating 3D-like Icon */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-20"
            >
              <Trophy size={320} className="text-white" />
            </motion.div>
          </motion.div>
        </section>

        {/* Modules Selection */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 premium-gradient rounded-full" />
              MÓDULOS ATIVOS
            </h2>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-xs font-black text-white/70 uppercase tracking-widest">LIVE</span>
            </div>
          </div>

          <Tabs defaultValue="m1" className="w-full" onValueChange={setActiveModule}>
            <TabsList className="bg-white/5 border border-white/10 p-1.5 h-auto flex flex-wrap justify-start gap-2 mb-10 rounded-2xl">
              {MODULES.map((mod) => (
                <TabsTrigger 
                  key={mod.id} 
                  value={mod.id}
                  className="rounded-xl px-8 py-4 data-[state=active]:premium-gradient data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">{mod.name}</span>
                    <span className="font-black text-lg">{mod.price} Kz</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {MODULES.map((mod) => (
              <TabsContent key={mod.id} value={mod.id} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_ROOMS.filter(r => r.moduleId === mod.id).length > 0 ? (
                    MOCK_ROOMS.filter(r => r.moduleId === mod.id).map((room) => (
                      <RoomCard key={room.id} room={room} module={mod} />
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center glass-card rounded-3xl border-dashed border-white/10">
                      <p className="text-white/40 font-black text-xl uppercase tracking-widest">Nenhuma sala ativa no momento.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Quick Stats / History Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-green-500"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 shadow-inner">
              <History size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Último Ganhador</p>
              <p className="font-black text-xl text-white">@joao_silva</p>
              <p className="text-sm font-bold text-green-400">+33.000 Kz</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-cyan-400"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Online Agora</p>
              <p className="font-black text-xl text-white">1,240</p>
              <p className="text-sm font-bold text-cyan-400">Participantes</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-3xl flex items-center gap-6 border-l-4 border-l-purple-500"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-inner">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Próximo Sorteio</p>
              <p className="font-black text-xl text-white">08:45 min</p>
              <p className="text-sm font-bold text-purple-400">Contagem Regressiva</p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Mobile Bottom Nav Premium */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 px-8 py-5 flex justify-between items-center">
        <button className="flex flex-col items-center gap-1.5 text-purple-500">
          <Zap size={24} fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-widest">Sorteios</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-white/40">
          <History size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Histórico</span>
        </button>
        <div className="relative -top-10">
          <button className="w-16 h-16 premium-gradient rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 border-4 border-[#0A0A0F] active:scale-90 transition-transform">
            <Wallet size={28} className="text-white" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1.5 text-white/40">
          <Trophy size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Ranking</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-white/40">
          <User size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Index;