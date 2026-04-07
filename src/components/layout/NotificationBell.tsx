"use client";

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Info, Trash2, Gift, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NotificationBell = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase.channel(`user-notifications-${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);

          if (newNotif.type === 'success') {
            toast.success(newNotif.title, {
              description: newNotif.message,
              icon: <Gift className="text-green-500" size={18} />,
              duration: 5000
            });
          } else {
            toast(newNotif.title, {
              description: newNotif.message,
              icon: <Info className="text-blue-500" size={18} />
            });
          }
        }
      )
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

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', userId);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <Popover onOpenChange={(open) => open && markAsRead()}>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-[#111111]/40 hover:text-blue-600 transition-colors group shadow-sm">
          <Bell size={16} className="group-hover:animate-ring" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-[7px] font-black text-white rounded-full flex items-center justify-center animate-bounce border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border-[#E5E7EB] rounded-2xl p-0 overflow-hidden shadow-2xl z-[100]" align="end">
        <div className="p-4 border-b border-[#F3F4F6] flex justify-between items-center bg-[#F9FAFB]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111111]/40">Notificações</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-[8px] font-black uppercase text-[#111111]/20 hover:text-red-500">Limpar Tudo</Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className={cn("p-4 border-b border-[#F3F4F6] flex gap-3 group relative transition-colors", !n.read && "bg-blue-50/30")}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", 
                  n.type === 'success' ? 'bg-green-50 text-green-600' : 
                  n.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                )}>
                  {n.type === 'success' ? <Gift size={14} /> : n.type === 'error' ? <XCircle size={14} /> : <Info size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-[#111111] mb-0.5 truncate">{n.title}</p>
                  <p className="text-[10px] font-bold text-[#555555]/60 leading-tight line-clamp-2 uppercase">{n.message}</p>
                  <p className="text-[8px] text-[#555555]/20 mt-2 font-black uppercase">{new Date(n.created_at).toLocaleTimeString()}</p>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-[#111111]/10 hover:text-red-500 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <Bell size={24} className="mx-auto mb-2 text-[#111111]/5" />
              <p className="text-[10px] font-black uppercase text-[#111111]/10">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;