"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutGrid, Clock, Users, CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  price: number;
  max_participants: number;
  created_at: string;
  _count?: {
    rooms: number;
  };
}

interface Room {
  id: string;
  module_id: string;
  status: 'open' | 'closed' | 'processing' | 'finished';
  current_participants: number;
  max_participants: number;
  expires_at: string;
  created_at: string;
  modules?: {
    name: string;
    price: number;
  };
}

const ModulesRoomsTable = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          rooms!inner(count)
        `)
        .order('price', { ascending: true });

      if (modulesError) throw modulesError;

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          modules (name, price)
        `)
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
  };

  const handleForceDraw = async (roomId: string) => {
    if (!confirm("⚠️ ATENÇÃO: Deseja forçar o sorteio desta mesa agora? Isso encerrará a participação e escolherá os vencedores entre os jogadores atuais.")) return;
    
    setRefreshing(true);
    try {
      const { error } = await supabase.rpc('perform_automatic_draw', { p_room_id: roomId });
      if (error) throw error;
      toast.success("Sorteio forçado com sucesso!");
      await fetchData();
    } catch (err: any) {
      toast.error("Erro ao forçar sorteio: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ABERTA</Badge>;
      case 'closed':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">ENCERRADA</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">SORTEANDO</Badge>;
      case 'finished':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">FINALIZADA</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expirado";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMins}m`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={40} />
        <span className="ml-3 font-black text-white/40 uppercase tracking-widest">Carregando estrutura...</span>
      </div>
    );
  }

  const roomsByModule = rooms.reduce((acc, room) => {
    if (!acc[room.module_id]) {
      acc[room.module_id] = [];
    }
    acc[room.module_id].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Estrutura de Módulos e Salas</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Visão geral completa do sistema
            </p>
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
        {modules.map((module) => {
          const moduleRooms = roomsByModule[module.id] || [];
          const totalParticipants = moduleRooms.reduce((sum, r) => sum + r.current_participants, 0);
          
          return (
            <div 
              key={module.id} 
              className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <LayoutGrid size={60} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 font-black">
                      {module.name}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest">{module.name}</p>
                      <p className="text-[10px] text-white/20">{module.price.toLocaleString()} Kz</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {moduleRooms.length}/3 Salas
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Participantes</span>
                    <span className="text-lg font-black text-green-400">{totalParticipants} / {module.max_participants * 3}</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-1000"
                      style={{ width: `${(totalParticipants / (module.max_participants * 3)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {moduleRooms.map((room, idx) => (
                    <div 
                      key={room.id} 
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          room.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          room.status === 'closed' ? 'bg-amber-500/20 text-amber-400' :
                          room.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white/60">
                            Mesa {idx + 1}
                          </span>
                          <span className="text-[9px] text-white/20">
                            {room.current_participants}/{room.max_participants} jogadores
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(room.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-lg font-black italic tracking-tighter uppercase">Lista Completa de Salas</h3>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
            Todas as salas ativas e seu status atual
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Módulo</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">ID da Sala</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Participantes</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Progresso</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4">Expira em</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xs">
                        {room.modules?.name || 'N/A'}
                      </div>
                      <span className="font-bold text-sm">{room.modules?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <code className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                      {room.id.slice(0, 8)}
                    </code>
                  </TableCell>
                  <TableCell className="p-4">
                    {getStatusBadge(room.status)}
                  </TableCell>
                  <TableCell className="p-4">
                    <span className="font-black text-lg">{room.current_participants}</span>
                    <span className="text-[10px] text-white/20 ml-1">/ {room.max_participants}</span>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            room.status === 'open' ? 'bg-green-500' :
                            room.status === 'closed' ? 'bg-amber-500' :
                            room.status === 'processing' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${getProgressPercentage(room.current_participants, room.max_participants)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/40">
                        {getProgressPercentage(room.current_participants, room.max_participants)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <span className={`text-[10px] font-black uppercase ${
                      new Date(room.expires_at) <= new Date() ? 'text-red-500' : 'text-white/40'
                    }`}>
                      {formatTimeRemaining(room.expires_at)}
                    </span>
                  </TableCell>
                  <TableCell className="p-4 text-right">
                    {room.status === 'open' && (
                      <Button 
                        size="sm"
                        onClick={() => handleForceDraw(room.id)}
                        className="h-8 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[9px] font-black uppercase px-3 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <Zap size={12} className="mr-1" /> Forçar Sorteio
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ModulesRoomsTable;