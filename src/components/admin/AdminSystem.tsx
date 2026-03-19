"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Zap, Trash2, RefreshCw, LayoutGrid, Trophy, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
    
    // Real-time para atualizar a lista de mesas quando o sorteio automático acontecer
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

  const handleCreateRoom = async (moduleId: string, maxParticipants: number) => {
    const { error } = await supabase.from('rooms').insert({
      module_id: moduleId,
      max_participants: maxParticipants,
      status: 'open',
      expires_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
    });

    if (error) toast.error("Erro ao criar mesa");
    else {
      toast.success("Mesa criada com sucesso!");
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
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => (
            <div key={mod.id} className="glass-card p-4 rounded-2xl border-white/5 text-center">
              <p className="text-[10px] font-black text-white/20 uppercase mb-1">{mod.name}</p>
              <p className="text-lg font-black italic mb-3">{mod.price.toLocaleString()} Kz</p>
              <Button 
                size="sm"
                onClick={() => handleCreateRoom(mod.id, mod.max_participants)}
                className="w-full h-8 bg-white/5 hover:bg-purple-600 text-[9px] font-black uppercase rounded-lg"
              >
                Nova Mesa
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <Zap className="text-amber-500" /> Monitoramento de Mesas
          </h3>
          <Button variant="ghost" onClick={fetchSystemData} className="text-white/20 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">ID Mesa</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Módulo</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Progresso</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.filter(r => r.status !== 'finished').map((room) => (
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
                    <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black ${
                      room.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {room.status === 'open' ? 'Em Aberto' : 'Sorteando...'}
                    </span>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-white/20 uppercase">
                      <Clock size={12} /> Automático
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default AdminSystem;