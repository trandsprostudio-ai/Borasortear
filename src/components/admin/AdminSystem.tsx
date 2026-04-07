"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, LayoutGrid, Clock, Zap, Ghost, Loader2, Users, Globe, Shield, Ban, History } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bossRooms, setBossRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [injectingId, setInjectingId] = useState<string | null>(null);
  const [isGlobalInjecting, setIsGlobalInjecting] = useState(false);
  const [isCheckingExpiration, setIsCheckingExpiration] = useState(false);
  const [processingBossId, setProcessingBossId] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemData();
    const channel = supabase.channel('admin-system-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchSystemData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boss_rooms' }, () => fetchSystemData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const { data: modData } = await supabase.from('modules').select('*').order('price', { ascending: true });
      const { data: roomData } = await supabase.from('rooms').select('*, modules(*)').order('created_at', { ascending: false });
      const { data: bossData } = await supabase.from('boss_rooms').select('*').order('created_at', { ascending: false });
      
      if (modData) setModules(modData);
      if (roomData) setRooms(roomData);
      if (bossData) setBossRooms(bossData);
    } catch (error) {
      toast.error("Erro ao sincronizar dados do sistema.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckExpirations = async () => {
    setIsCheckingExpiration(true);
    try {
      const { error } = await supabase.rpc('check_and_draw_expired_rooms');
      if (error) throw error;
      
      toast.success("Verificação de expiração concluída. Salas obsoletas foram encerradas.");
      fetchSystemData();
    } catch (err: any) {
      toast.error("Erro ao verificar expirações.");
    } finally {
      setIsCheckingExpiration(false);
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
      } else {
        toast.error(`Falha na injeção: ${data}`);
      }
    } catch (err: any) {
      toast.error(`Erro técnico: ${err.message}`);
    } finally {
      setInjectingId(null);
    }
  };

  const handleFinalizeBoss = async (roomId: string) => {
    setProcessingBossId(roomId);
    try {
      const { error } = await supabase.rpc('perform_boss_draw', { 
        p_room_id: roomId 
      });

      if (error) throw error;

      toast.success("Mesa BOSS finalizada com sucesso. Lucro revertido.");
      fetchSystemData();
    } catch (err: any) {
      toast.error("Erro ao finalizar mesa BOSS.");
    } finally {
      setProcessingBossId(null);
    }
  };

  const handleGlobalInjection = async () => {
    setIsGlobalInjecting(true);
    try {
      const { data, error } = await supabase.rpc('inject_ghosts_globally');
      if (error) throw error;
      fetchSystemData();
      toast.success("Injeção global concluída.");
    } catch (err: any) {
      toast.error("Erro na injeção global.");
    } finally {
      setIsGlobalInjecting(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="bg-amber-500/5 border border-amber-500/10 p-6 md:p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Mesas Premium BOSS</h3>
              <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Controle de Retenção Garantida</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bossRooms.filter(r => r.status === 'ativo').map((room) => (
            <div key={room.id} className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{room.name}</p>
                  <p className="text-xl font-black italic">#{room.id.slice(0, 8)}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleFinalizeBoss(room.id)}
                disabled={processingBossId === room.id}
                className="h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-600/20"
              >
                {processingBossId === room.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} className="mr-2" />}
                ENCERRAR (RETENÇÃO)
              </Button>
            </div>
          ))}
          {bossRooms.filter(r => r.status === 'ativo').length === 0 && (
            <div className="col-span-full py-10 text-center text-white/10 font-black uppercase text-[10px] tracking-widest">
              Nenhuma mesa BOSS ativa no momento.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Mesas em Aberto
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleCheckExpirations} 
              disabled={isCheckingExpiration}
              variant="outline"
              className="border-amber-500/20 bg-amber-500/5 text-amber-500 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/10"
            >
              {isCheckingExpiration ? <Loader2 size={14} className="animate-spin mr-2" /> : <Clock size={14} className="mr-2" />} 
              Verificar Expirações
            </Button>
            <Button onClick={handleGlobalInjection} disabled={isGlobalInjecting} className="bg-blue-600 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">
              {isGlobalInjecting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Globe size={14} className="mr-2" />} Injeção Global
            </Button>
            <Button variant="ghost" onClick={fetchSystemData} className="text-white/20"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] font-black uppercase p-6">ID da Mesa</TableHead>
                <TableHead className="text-[10px] font-black uppercase p-6">Módulo</TableHead>
                <TableHead className="text-[10px] font-black uppercase p-6">Jogadores</TableHead>
                <TableHead className="text-[10px] font-black uppercase p-6 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.filter(r => r.status === 'open').map((room) => (
                <TableRow key={room.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="p-6 font-black text-purple-400">#{room.id.slice(0, 8)}</TableCell>
                  <TableCell className="p-6 font-bold">{room.modules?.name}</TableCell>
                  <TableCell className="p-6 font-black">{room.current_participants}/{room.max_participants}</TableCell>
                  <TableCell className="p-6 text-right">
                    <Button onClick={() => handleInjectGhosts(room.id)} disabled={injectingId === room.id} className="h-10 px-6 rounded-xl bg-purple-600 font-black text-[10px] uppercase tracking-widest">
                      {injectingId === room.id ? <Loader2 size={14} className="animate-spin" /> : <Ghost size={14} className="mr-2" />} Injetar
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