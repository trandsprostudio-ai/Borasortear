"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import RoomCard from '@/components/raffle/RoomCard';
import AuthModal from '@/components/auth/AuthModal';
import JoinRoomModal from '@/components/raffle/JoinRoomModal';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Zap, Flame, Star, LayoutGrid, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Room, Module } from '@/types/raffle';

const Index = () => {
  const { rooms, loading } = useRooms();
  const [modules, setModules] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ room: Room, module: Module } | null>(null);

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
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleParticipateClick = (room: Room, module: Module) => {
    if (!user) { setShowAuth(true); return; }
    setSelectedRoom({ room, module });
  };

  const openRooms = rooms.filter(r => r.status === 'open');

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white">
      <Navbar onAuthClick={() => setShowAuth(true)} user={user} />
      
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      {selectedRoom && user && profile && (
        <JoinRoomModal 
          isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)}
          room={selectedRoom.room} module={selectedRoom.module}
          userBalance={profile.balance} userId={user.id}
          onSuccess={() => fetchProfile(user.id)}
        />
      )}

      <main className="max-w-[1600px] mx-auto px-4 pt-20 pb-20">
        {/* Banner de Destaque Compacto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          <div className="lg:col-span-8 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/5 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px]" />
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">SORTEIOS AO VIVO</h1>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Participe agora e multiplique seu capital em segundos</p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                <Zap size={16} className="text-amber-500" />
                <span className="text-sm font-black">1.240 ATIVOS</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                <Trophy size={16} className="text-green-400" />
                <span className="text-sm font-black">450k KZ PAGOS HOJE</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-[#151823] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-white/40 uppercase tracking-widest">Último Resultado</span>
              <History size={14} className="text-white/20" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-sm font-black">@antonio_melo</p>
                <p className="text-xl font-black text-green-400">150.000 Kz</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
              Ver Histórico Completo
            </button>
          </div>
        </div>

        {/* Categorias / Módulos */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveModule(null)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap border ${
              activeModule === null ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#151823] border-white/5 text-white/40 hover:text-white'
            }`}
          >
            <LayoutGrid size={16} /> TODOS
          </button>
          {modules.map((mod) => (
            <button 
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap border ${
                activeModule === mod.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#151823] border-white/5 text-white/40 hover:text-white'
              }`}
            >
              <Zap size={16} className={activeModule === mod.id ? 'text-white' : 'text-amber-500'} />
              {mod.name} - {mod.price} Kz
            </button>
          ))}
        </div>

        {/* Grid de Salas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-[#151823] animate-pulse rounded-2xl border border-white/5" />
            ))
          ) : (
            (activeModule ? openRooms.filter(r => r.module_id === activeModule) : openRooms).map((room) => {
              const mod = modules.find(m => m.id === room.module_id);
              if (!mod) return null;
              return (
                <RoomCard 
                  key={room.id} 
                  room={{
                    id: room.id, moduleId: room.module_id, status: room.status,
                    currentParticipants: room.current_participants, maxParticipants: room.max_participants,
                    expiresAt: room.expires_at, createdAt: room.created_at
                  }} 
                  module={{
                    id: mod.id, name: mod.name, price: mod.price, maxParticipants: mod.max_participants
                  }} 
                  onParticipate={handleParticipateClick}
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;