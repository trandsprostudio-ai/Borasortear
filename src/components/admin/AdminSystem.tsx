"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Activity, Trash2, RefreshCw, LayoutGrid, Trophy, Loader2, CheckCircle2, Clock, Layers } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleCleanExpired = async () => {
    const { error } = await supabase.rpc('check_and_draw_expired_rooms');
    if (error) toast.error("Erro ao processar expirações");
    else {
      toast.success("Mesas expiradas processadas!");
      fetchSystemData();
    }
  };

  const handleCreateRoom = async (moduleId: string, maxParticipants: number) => {
    const { error } = await supabase.from('rooms').insert({
      module_id: moduleId,
      max_participants: maxParticipants,
      status: 'open',
      expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 horas
    });

    if (error) toast.error("Erro ao criar mesa");
    else {
      toast.success("Mesa criada com sucesso!");
      fetchSystemData();
    }
  };

  const handleAutoFillRooms = async () => {
    if (!confirm("Isso criará salas até que cada módulo tenha 3 salas ativas. Continuar?")) return;
    
    setLoading(true);
    try {
      for (const mod of modules) {
        const activeRoomsCount = rooms.filter(r => r.module_id === mod.id && r.status === 'open').length;
        const needed = 3 - activeRoomsCount;
        
        if (needed > 0) {
          const newRooms = Array(needed).fill({
            module_id: mod.id,
            max_participants: mod.max_participants,
            status: 'open',
            expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 horas
          });
          await supabase.from('rooms').insert(newRooms);
        }
      }
      toast.success("Salas geradas com sucesso!");
      fetchSystemData();
    } catch (err) {
      toast.error("Erro ao gerar salas automáticas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Módulos de Jogo
          </h3>
          <div className="flex gap-2">
            <Button onClick={handleAutoFillRooms} variant="outline" className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10 h-10 rounded-xl font-black text-[10px] uppercase">
              <Layers size={14} className="mr-2" /> Gerar 3 Salas/Módulo
            </Button>
            <Button onClick={handleCleanExpired} variant="outline" className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-10 rounded-xl font-black text-[10px] uppercase">
              Processar Expiradas
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => {
            const activeCount = rooms.filter(r => r.module_id === mod.id && r.status === 'open').length;
            return (
              <div key={mod.id} className="glass-card p-4 rounded-2xl border-white/5 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase mb-1">{mod.name}</p>
                <p className="text-lg font-black italic mb-1">{mod.price.toLocaleString()} Kz</p>
                <p className={`text-[9px] font-bold mb-3 ${activeCount >= 3 ? 'text-green-400' : 'text-amber-500'}`}>
                  {activeCount}/3 Salas Ativas
                </p>
                <Button 
                  size="sm"
                  disabled={activeCount >= 3}
                  onClick={() => handleCreateRoom(mod.id, mod.max_participants)}
                  className="w-full h-8 bg-white/5 hover:bg-purple-600 text-[9px] font-black uppercase rounded-lg"
                >
                  {activeCount >= 3 ? 'Limite Atingido' : 'Nova Mesa'}
                </Button>
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
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Progresso</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Expira em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.filter(r => r.status !== 'finished').map((room) => {
                  const isExpired = new Date(room.expires_at) <= new Date();
                  return (
                    <TableRow key={room.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="p-6 font-black text-purple-400">#{room.id.slice(0, 8)}</TableCell>
                      <TableCell className="p-6 font-bold">{room.modules?.name} ({room.modules?.price.toLocaleString()} Kz)</TableCell>
                      <TableCell className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{room.current_participants}/{room.max_participants}</span>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500" 
                              style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-6">
                        <span className={`text-[10px] font-black uppercase ${isExpired ? 'text-red-500' : 'text-white/40'}`}>
                          {isExpired ? 'Expirada' : new Date(room.expires_at).toLocaleTimeString()}
                        </span>
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