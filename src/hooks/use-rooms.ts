"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/raffle';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .neq('status', 'finished')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
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
    } catch (err) {
      console.error("Erro ao sincronizar salas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel('rooms-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .subscribe();

    // Polling acelerado para 1s
    const interval = setInterval(fetchRooms, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchRooms]);

  return { rooms, loading, refresh: fetchRooms };
}