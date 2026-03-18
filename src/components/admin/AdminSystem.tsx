"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Zap, Trash2, RefreshCw, LayoutGrid, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
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

    if (error) {
      toast.error("Erro ao criar mesa manual");
    } else {
      toast.success("Mesa manual criada com sucesso!");
      fetchSystemData();
    }
  };

  return (
    <div className="space-y-10">
      {/* Status do Motor Automático */}
      <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cpu className="text-white animate-pulse" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Motor de Sorteio Ativo</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">As mesas são geradas e finalizadas automaticamente pelo sistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Sincronizado com Supabase</span>
        </div>
      </div>

      {/* Módulos */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Configuração de Módulos
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => (
            <div key={mod.id} className="glass-card p-6 rounded-2xl border-white/5 text-center group hover:border-purple-500/30 transition-all">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">{mod.name}</p>
              <p className="text-xl font-black italic mb-4">{mod.price.toLocaleString()} Kz</p>
              <Button 
                onClick={() => handleCreateRoom(mod.id, mod.max_participants)}
                className="w-full h-10 bg-white/5 hover:bg-purple-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all"
              >
                Forçar Mesa
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Mesas Ativas */}
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
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Participantes</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="p-6 font-black text-purple-400">#{room.id.slice(0, 8)}</TableCell>
                  <TableCell className="p-6 font-bold">{room.modules?.name} ({room.modules?.price.toLocaleString()} Kz)</TableCell>
                  <TableCell className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{room.current_participants}/{room.max_participants}</span>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]" 
                          style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black ${
                      room.status === 'open' ? 'bg-green-500/10 text-green-400' : 
                      room.status === 'finished' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {room.status}
                    </span>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-400/10 rounded-xl">
                      <Trash2 size={16} />
                    </Button>
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