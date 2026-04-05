"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutGrid, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ModuleSummaryCard from './ModuleSummaryCard';
import RoomRow from './RoomRow';

const ModulesRoomsTable = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [injectingId, setInjectingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*, rooms!inner(count)')
        .order('price', { ascending: true });

      if (modulesError) throw modulesError;

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*, modules (name, price)')
        .order('created_at', { ascending: false });

      if (roomsError) throw roomsError;

      setModules(modulesData || []);
      setRooms(roomsData || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleInjectGhosts = async (roomId: string) => {
    setInjectingId(roomId);
    try {
      const { data, error } = await supabase.rpc('inject_ghosts_secure', {
        p_room_id: roomId
      });

      if (error) throw error;

      if (data.startsWith('SUCESSO')) {
        const count = data.split(':')[1];
        toast.success(`${count} usuários fantasmas injectados com sucesso!`);
        fetchData();
      } else if (data === 'JA_INJECTADO') {
        toast.error("Esta sala já recebeu uma injeção de fantasmas.");
      } else {
        toast.error("Não foi possível injectar fantasmas: " + data);
      }
    } catch (err: any) {
      toast.error("Erro na operação: " + err.message);
    } finally {
      setInjectingId(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={40} />
        <span className="ml-3 font-black text-white/40 uppercase tracking-widest">Carregando estrutura...</span>
      </div>
    );
  }

  const roomsByModule = rooms.reduce((acc, room) => {
    if (!acc[room.module_id]) acc[room.module_id] = [];
    acc[room.module_id].push(room);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Estrutura de Módulos e Salas</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Visão geral completa do sistema</p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="border-white/10 bg-white/5 hover:bg-white/10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest"
        >
          <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          ATUALIZAR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleSummaryCard 
            key={module.id} 
            module={module} 
            rooms={roomsByModule[module.id] || []} 
            injectingId={injectingId}
            onInject={handleInjectGhosts}
          />
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-black italic tracking-tighter uppercase">Lista Completa de Salas</h3>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Módulo</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">ID da Sala</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Participantes</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Progresso</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <RoomRow 
                  key={room.id} 
                  room={room} 
                  injectingId={injectingId} 
                  onInject={handleInjectGhosts} 
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ModulesRoomsTable;