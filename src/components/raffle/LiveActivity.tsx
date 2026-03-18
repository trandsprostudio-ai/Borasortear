"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  user_name: string;
  room_id: string;
  module_name: string;
  created_at: string;
}

const LiveActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Buscar atividades iniciais
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('participants')
        .select('id, created_at, profiles(first_name), rooms(id, modules(name))')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const formatted = data.map((p: any) => ({
          id: p.id,
          user_name: p.profiles?.first_name || 'Jogador',
          room_id: p.rooms?.id.slice(0, 4),
          module_name: p.rooms?.modules?.name || '',
          created_at: p.created_at
        }));
        setActivities(formatted);
      }
    };

    fetchInitial();

    // Ouvir novas participações
    const channel = supabase.channel('live-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants' }, 
      async (payload) => {
        const { data } = await supabase
          .from('participants')
          .select('id, created_at, profiles(first_name), rooms(id, modules(name))')
          .eq('id', payload.new.id)
          .single();

        if (data) {
          const newAct = {
            id: data.id,
            user_name: (data as any).profiles?.first_name || 'Jogador',
            room_id: (data as any).rooms?.id.slice(0, 4),
            module_name: (data as any).rooms?.modules?.name || '',
            created_at: data.created_at
          };
          setActivities(prev => [newAct, ...prev.slice(0, 4)]);
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Atividade em Tempo Real</h3>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((act) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <User size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white">@{act.user_name}</span>
                  <span className="text-[9px] text-white/20 font-bold uppercase">Entrou na Mesa #{act.room_id}</span>
                </div>
              </div>
              <div className="bg-purple-600/20 px-2 py-1 rounded-md border border-purple-500/20">
                <span className="text-[9px] font-black text-purple-400 uppercase">{act.module_name}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivity;