"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/raffle';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, module_id, status, current_participants, max_participants, expires_at, created_at')
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

    fetchRooms();

    const channel = supabase
      .channel('rooms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRoom: Room = {
              id: payload.new.id,
              moduleId: payload.new.module_id,
              status: payload.new.status,
              currentParticipants: payload.new.current_participants,
              maxParticipants: payload.new.max_participants,
              expiresAt: payload.new.expires_at,
              createdAt: payload.new.created_at,
            };
            
            setRooms((prev) => {
              const index = prev.findIndex(r => r.id === newRoom.id);
              if (index !== -1) {
                const updated = [...prev];
                updated[index] = newRoom;
                return updated;
              }
              return [newRoom, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setRooms((prev) => prev.filter((room) => room.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { rooms, loading };
}