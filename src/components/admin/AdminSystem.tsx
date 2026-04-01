"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Activity, Trash2, RefreshCw, LayoutGrid, Trophy, Loader2, CheckCircle2, Clock, Layers, Zap, RotateCcw, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false });

  useEffect(() => {
    fetchSystemData();
    
    const channel = supabase.channel('admin-system-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchSystemData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
    const { data: roomData } = await supabase.from('rooms').select('*, modules(*)').order('created_at', { ascending: false });
    
    if (modData) setModules(modData);
    if (roomData) setRooms(roomData);
    setLoading(false);
  };

  const handleTestReset = async () => {
    setLoading(true);
    try {
      // Deletar tudo para o teste
      await supabase.from('winners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Recriar 1 mesa de cada módulo com 30s
      for (const mod of modules) {
        await supabase.from('rooms').insert({
          module_id: mod.id,
          max_participants: mod.max_participants,
          status: 'open',
          expires_at: new Date(Date.now() + 30 * 1000).toISOString()
        });
      }
      
      toast.success("Sistema reiniciado para Teste de 30s!");
      fetchSystemData();
    } catch (err) {
      toast.error("Erro ao resetar para teste");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanExpired = async () => {
    const { error } = await supabase.rpc('check_and_draw_expired_rooms');
    if (error) toast.error("Erro ao processar expirações");
    else {
      toast.success("Mesas expiradas processadas!");
      fetchSystemData();
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Módulos de Jogo
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTestReset} className="bg-amber-600 hover:bg-amber-700 h-10 rounded-xl font-black text-[10px] uppercase">
              <Beaker size={14} className="mr-2" /> RESET TESTE (30S)
            </Button>
            <Button onClick={handleCleanExpired} variant="outline" className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 h-10 rounded-xl font-black text-[10px] uppercase">
              Processar Expiradas
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => {
            const activeCount = rooms.filter(r => r.module_id === mod.id && (r.status === 'open' || r.status === 'processing')).length;
            return (
              <div key={mod.id} className="glass-card p-4 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase mb-1">{mod.name}</p>
                <p className="text-lg font-black italic mb-1">{mod.price.toLocaleString()} Kz</p>
                <p className={`text-[9px] font-bold mb-3 ${activeCount > 0 ? 'text-green-400' : 'text-amber-500'}`}>
                  {activeCount} Mesas Ativas
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <Activity className="text-amber-500" /> Monitoramento de Mesas
          </h3>
          <Button variant="ghost" onClick={fetchSystemData} className="text-white/20 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">ID Mesa</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Módulo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Participantes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Expira em</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <tbody className="divide-y divide-white/5">
                {rooms.filter(r => r.status !== 'finished').map((room) => {
                  const isExpired = new Date(room.expires_at) <= new Date();
                  return (
                    <TableRow key={room.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="p-6 font-black text-purple-400">#{room.id.slice(0, 8)}</TableCell>
                      <TableCell className="p-6 font-bold">{room.modules?.name}</TableCell>
                      <TableCell className="p-6">
                        <span className="font-bold">{room.current_participants}/{room.max_participants}</span>
                      </TableCell>
                      <TableCell className="p-6">
                        <span className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-500' : 'text-white/40'}`}>
                          {isExpired ? 'Expirada' : new Date(room.expires_at).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell className="p-6">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          room.status === 'processing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {room.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSystem;