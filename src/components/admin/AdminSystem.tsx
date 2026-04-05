"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, LayoutGrid, Clock, Zap, Ghost, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [injectingId, setInjectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
    const channel = supabase.channel('admin-system-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchSystemData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
      const { data: roomData } = await supabase.from('rooms').select('*, modules(*)').order('created_at', { ascending: false });
      
      if (modData) setModules(modData);
      if (roomData) setRooms(roomData);
    } catch (error) {
      toast.error("Erro ao sincronizar dados do sistema.");
    } finally {
      setLoading(false);
    }
  };

  const handleInjectGhosts = async (roomId: string) => {
    setInjectingId(roomId);
    try {
      const { data, error } = await supabase.rpc('inject_ghosts_secure', {
        p_room_id: roomId
      });

      if (error) throw error;

      if (data.startsWith('SUCESSO')) {
        const count = data.split(':')[1];
        toast.success(`${count} usuários fantasmas injetados!`);
        fetchSystemData();
      } else if (data === 'JA_INJECTADO') {
        toast.error("Esta sala já possui fantasmas.");
      } else {
        toast.error(`Erro: ${data}`);
      }
    } catch (err: any) {
      toast.error("Falha na operação de injeção.");
    } finally {
      setInjectingId(null);
    }
  };

  const handleCleanExpired = async () => {
    const { error } = await supabase.rpc('check_and_draw_expired_rooms');
    if (error) toast.error("Erro ao processar expirações");
    else {
      toast.success("Mesas expiradas processadas com sucesso!");
      fetchSystemData();
    }
  };

  const handleResetStuck = async () => {
    const { error } = await supabase.rpc('reset_stuck_rooms');
    if (error) toast.error("Erro ao resetar mesas");
    else {
      toast.success("Mesas 'travadas' foram reiniciadas.");
      fetchSystemData();
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Gestão de Módulos
          </h3>
          <div className="flex gap-2">
            <Button onClick={handleResetStuck} variant="outline" className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-10 rounded-xl font-black text-[10px] uppercase">
              <Zap size={14} className="mr-2" /> Resetar Travadas
            </Button>
            <Button onClick={handleCleanExpired} className="bg-purple-600 hover:bg-purple-700 h-10 rounded-xl font-black text-[10px] uppercase">
              <Clock size={14} className="mr-2" /> Forçar Varredura (3h)
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => {
            const activeCount = rooms.filter(r => r.module_id === mod.id && (r.status === 'open' || r.status === 'processing')).length;
            return (
              <div key={mod.id} className="glass-card p-4 rounded-2xl border-white/5 text-center group hover:border-purple-500/30 transition-all">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">{mod.name}</p>
                <p className="text-lg font-black italic mb-1">{mod.price.toLocaleString()} Kz</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                  <p className="text-[8px] font-black uppercase text-white/40">{activeCount} Mesas</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <Activity className="text-amber-500" /> Monitoramento em Tempo Real
          </h3>
          <Button variant="ghost" onClick={fetchSystemData} className="text-white/20 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase p-6">Mesa</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Módulo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Ocupação</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.filter(r => r.status !== 'finished').map((room) => {
                  const isExpired = new Date(room.expires_at) <= new Date();
                  return (
                    <TableRow key={room.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="p-6 font-black text-purple-400">#{room.id.slice(0, 8)}</TableCell>
                      <TableCell className="p-6 font-bold">{room.modules?.name}</TableCell>
                      <TableCell className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg">{room.current_participants}</span>
                          <span className="text-[10px] text-white/20">/ {room.max_participants}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-6">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          room.status === 'processing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {room.status}
                        </span>
                      </TableCell>
                      <TableCell className="p-6 text-right">
                        {room.status === 'open' && (
                          <Button 
                            onClick={() => handleInjectGhosts(room.id)}
                            disabled={injectingId === room.id}
                            className="h-9 px-4 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            {injectingId === room.id ? (
                              <Loader2 size={14} className="animate-spin mr-2" />
                            ) : (
                              <Ghost size={14} className="mr-2" />
                            )}
                            Injetar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSystem;