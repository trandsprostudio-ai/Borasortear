"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, LayoutGrid, Clock, Zap, Ghost, Loader2, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [injectingId, setInjectingId] = useState<string | null>(null);
  const [isGlobalInjecting, setIsGlobalInjecting] = useState(false);

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
        toast.error("Esta sala já possui fantasmas injetados.");
      } else if (data === 'SEM_ESPACO') {
        toast.error("A sala já está quase lotada, não há espaço para injeção.");
      } else if (data === 'STATUS_INVALIDO') {
        toast.error("Apenas salas 'Abertas' podem receber injeção.");
      } else {
        toast.error(`Falha: ${data}`);
      }
    } catch (err: any) {
      toast.error("Erro técnico na operação de injeção.");
    } finally {
      setInjectingId(null);
    }
  };

  const handleGlobalInjection = async () => {
    setIsGlobalInjecting(true);
    try {
      // Nota: inject_ghosts_globally retorna uma tabela/array
      const { data, error } = await supabase.rpc('inject_ghosts_globally');

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        const roomsAffected = result.rooms_affected || 0;
        const totalGhosts = result.total_ghosts || 0;

        if (roomsAffected > 0) {
          toast.success(`Sucesso! ${totalGhosts} fantasmas injetados em ${roomsAffected} salas.`);
        } else {
          toast.info("Nenhuma sala disponível para injeção no momento.");
        }
        fetchSystemData();
      }
    } catch (err: any) {
      toast.error("Erro ao processar injeção global.");
    } finally {
      setIsGlobalInjecting(false);
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

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Visão por Módulo
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGlobalInjection} 
              disabled={isGlobalInjecting}
              className="bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
            >
              {isGlobalInjecting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Globe size={14} className="mr-2" />}
              Injeção Global
            </Button>
            <Button onClick={handleCleanExpired} variant="outline" className="border-purple-500/20 bg-purple-500/5 h-10 rounded-xl font-black text-[10px] uppercase">
              <Clock size={14} className="mr-2 text-purple-400" /> Varredura de Tempo
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((mod) => {
            const activeRooms = rooms.filter(r => r.module_id === mod.id && (r.status === 'open' || r.status === 'processing'));
            return (
              <div key={mod.id} className="glass-card p-5 rounded-[2rem] border-white/5 text-center relative group overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-5">
                   <LayoutGrid size={40} />
                </div>
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">{mod.name}</p>
                <p className="text-xl font-black italic mb-2">{mod.price.toLocaleString()} Kz</p>
                <div className="flex flex-col gap-2">
                  {activeRooms.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                      <span className="text-[8px] font-black text-white/40">{r.current_participants}/{r.max_participants}</span>
                      {r.status === 'open' && (
                        <button 
                          onClick={() => handleInjectGhosts(r.id)}
                          disabled={injectingId === r.id}
                          className="text-purple-400 hover:text-white transition-colors"
                          title="Injetar Fantasmas"
                        >
                          {injectingId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Ghost size={10} />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Monitoramento de Mesas</h3>
              <p className="text-[10px] font-black text-white/20 uppercase">Ações rápidas para salas abertas</p>
            </div>
          </div>
          <Button variant="ghost" onClick={fetchSystemData} className="text-white/20 hover:text-white">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase p-6">ID da Mesa</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Módulo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Participantes</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6 text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.filter(r => r.status !== 'finished').map((room) => (
                  <TableRow key={room.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="p-6 font-black text-purple-400">
                      <span className="bg-purple-500/10 px-2 py-1 rounded">#{room.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell className="p-6 font-bold">{room.modules?.name}</TableCell>
                    <TableCell className="p-6">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-white/20" />
                        <span className="font-black text-lg">{room.current_participants}</span>
                        <span className="text-[10px] text-white/20">/ {room.max_participants}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-6">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                        room.status === 'processing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {room.status === 'open' ? 'Aguardando' : 'Sorteando'}
                      </span>
                    </TableCell>
                    <TableCell className="p-6 text-right">
                      {room.status === 'open' ? (
                        <Button 
                          onClick={() => handleInjectGhosts(room.id)}
                          disabled={injectingId === room.id}
                          className="h-10 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-600/20"
                        >
                          {injectingId === room.id ? (
                            <Loader2 size={14} className="animate-spin mr-2" />
                          ) : (
                            <Ghost size={14} className="mr-2" />
                          )}
                          Injetar
                        </Button>
                      ) : (
                        <span className="text-[8px] font-black text-white/10 uppercase italic">Bloqueado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSystem;