"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import { MODULES, Room } from '@/types/raffle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, History, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock de salas ativas
const MOCK_ROOMS: Room[] = [
  { id: '1', moduleId: 'm1', status: 'aberta', currentParticipants: 450, maxParticipants: 1000, expiresAt: '', createdAt: '' },
  { id: '2', moduleId: 'm1', status: 'aberta', currentParticipants: 890, maxParticipants: 1000, expiresAt: '', createdAt: '' },
  { id: '3', moduleId: 'm2', status: 'aberta', currentParticipants: 120, maxParticipants: 800, expiresAt: '', createdAt: '' },
  { id: '4', moduleId: 'm4', status: 'aberta', currentParticipants: 380, maxParticipants: 400, expiresAt: '', createdAt: '' },
];

const Index = () => {
  const [activeModule, setActiveModule] = useState('m1');

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-28">
        {/* Hero Section */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl premium-gradient relative overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Sua sorte começa <br /> com apenas <span className="underline decoration-blue-400">100 Kz</span>
              </h1>
              <p className="text-white/80 text-lg mb-6">
                Participe de sorteios rápidos, transparentes e automáticos. 
                Milhares de angolanos já estão ganhando!
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={20} />
                  <span className="text-white font-bold">1.2M Kz Distribuídos</span>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Zap className="text-blue-300" size={20} />
                  <span className="text-white font-bold">Sorteios a cada 10min</span>
                </div>
              </div>
            </div>
            <div className="absolute right-[-50px] bottom-[-50px] opacity-20 rotate-12 hidden lg:block">
              <Trophy size={400} className="text-white" />
            </div>
          </motion.div>
        </section>

        {/* Modules Selection */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="text-purple-500" />
              Módulos Ativos
            </h2>
            <span className="text-sm text-muted-foreground">4 salas por módulo</span>
          </div>

          <Tabs defaultValue="m1" className="w-full" onValueChange={setActiveModule}>
            <TabsList className="bg-white/5 border border-white/10 p-1 h-auto flex flex-wrap justify-start gap-2 mb-8">
              {MODULES.map((mod) => (
                <TabsTrigger 
                  key={mod.id} 
                  value={mod.id}
                  className="rounded-xl px-6 py-3 data-[state=active]:premium-gradient data-[state=active]:text-white transition-all"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-70">{mod.name}</span>
                    <span className="font-bold">{mod.price} Kz</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {MODULES.map((mod) => (
              <TabsContent key={mod.id} value={mod.id} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MOCK_ROOMS.filter(r => r.moduleId === mod.id).length > 0 ? (
                    MOCK_ROOMS.filter(r => r.moduleId === mod.id).map((room) => (
                      <RoomCard key={room.id} room={room} module={mod} />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center glass-card rounded-2xl">
                      <p className="text-muted-foreground">Nenhuma sala ativa para este módulo no momento.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Quick Stats / History Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <History size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último Ganhador</p>
              <p className="font-bold">@joao_silva - 33.000 Kz</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online Agora</p>
              <p className="font-bold">1,240 Participantes</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo Sorteio</p>
              <p className="font-bold">Em 08:45 min</p>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-white/10 px-6 py-4 flex justify-between items-center">
        <button className="flex flex-col items-center gap-1 text-purple-500">
          <Zap size={24} />
          <span className="text-[10px] font-bold">Sorteios</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <History size={24} />
          <span className="text-[10px] font-bold">Histórico</span>
        </button>
        <div className="relative -top-8">
          <button className="w-14 h-14 premium-gradient rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-4 border-background">
            <Wallet size={24} className="text-white" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <Trophy size={24} />
          <span className="text-[10px] font-bold">Ranking</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <User size={24} />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Index;