"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/raffle';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, module_id, status, current_participants, max_participants, expires_at, created_at')
      .neq('status', 'finished') // Apenas salas que interessam ao jogador
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedRooms: Room[] = data.map(r => ({
        id: r.id,
        moduleId: r.module_id,
        status: r.status as any,
        currentParticipants: r.current_participants,
        maxParticipants: r.max_participants,
        expiresAt: r.expires_at,
        createdAt: r.created_at
      }));
      setRooms(mappedRooms);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();

    // Ouvinte em tempo real para mudanças globais
    const channel = supabase
      .channel('rooms-active-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .subscribe();

    // Verificação de segurança AGRESSIVA (2 SEGUNDOS) durante o teste
    const interval = setInterval(fetchRooms, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { rooms, loading, refresh: fetchRooms };
}