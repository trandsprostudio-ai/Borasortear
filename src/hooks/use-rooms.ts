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
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRooms(data as Room[]);
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
          if (payload.eventType === 'INSERT') {
            setRooms((prev) => {
              if (prev.some(r => r.id === payload.new.id)) return prev;
              return [payload.new as Room, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setRooms((prev) =>
              prev.map((room) =>
                room.id === payload.new.id ? (payload.new as Room) : room
              )
            );
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