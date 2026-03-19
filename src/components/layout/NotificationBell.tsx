"use client";

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Info, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NotificationBell = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase.channel(`user-notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
      (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <button className="relative p-2 bg-[#1A1D29] rounded-xl border border-white/5 text-white/40 hover:text-white transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1D29] border-white/10 rounded-2xl p-0 overflow-hidden shadow-2xl" align="end">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Notificações</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setNotifications([])} className="h-6 text-[8px] font-black uppercase text-white/20 hover:text-red-400">Limpar</Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={cn("p-4 border-b border-white/5 flex gap-3 group relative", !n.read && "bg-purple-500/5")}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", 
                  n.type === 'success' ? 'bg-green-500/10 text-green-400' : 
                  n.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                )}>
                  {n.type === 'success' ? <CheckCircle2 size={14} /> : n.type === 'error' ? <XCircle size={14} /> : <Info size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-white mb-0.5">{n.title}</p>
                  <p className="text-[10px] font-bold text-white/40 leading-tight">{n.message}</p>
                  <p className="text-[8px] text-white/20 mt-2 font-black uppercase">{new Date(n.created_at).toLocaleTimeString()}</p>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-white/10 hover:text-red-400 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <Bell size={24} className="mx-auto mb-2 text-white/5" />
              <p className="text-[10px] font-black uppercase text-white/10">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;