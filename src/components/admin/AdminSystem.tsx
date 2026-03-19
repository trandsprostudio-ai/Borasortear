"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Zap, Trash2, RefreshCw, LayoutGrid, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystem = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawingId, setDrawingId] = useState<string | null>(null);

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

    if (error) toast.error("Erro ao criar mesa");
    else {
      toast.success("Mesa criada com sucesso!");
      fetchSystemData();
    }
  };

  const handlePerformDraw = async (room: any) => {
    if (room.current_participants < 1) {
      toast.error("Não há participantes nesta mesa.");
      return;
    }

    if (!confirm(`Deseja realizar o sorteio da Mesa #${room.id.slice(0,8)}?`)) return;

    setDrawingId(room.id);
    try {
      // 1. Buscar participantes
      const { data: participants } = await supabase
        .from('participants')
        .select('*, profiles(id, balance, referred_by)')
        .eq('room_id', room.id);

      if (!participants || participants.length === 0) throw new Error("Sem participantes");

      // 2. Embaralhar e escolher vencedor (Lógica simples: 1 vencedor leva 90% do pool)
      const winner = participants[Math.floor(Math.random() * participants.length)];
      const totalPool = room.modules.price * room.current_participants;
      const prizeAmount = totalPool * 0.9;

      // 3. Registrar Vencedor
      await supabase.from('winners').insert({
        draw_id: room.id,
        user_id: winner.user_id,
        prize_amount: prizeAmount,
        position: 1
      });

      // 4. Pagar Vencedor
      const newWinnerBalance = (winner.profiles.balance || 0) + prizeAmount;
      await supabase.from('profiles').update({ balance: newWinnerBalance }).eq('id', winner.user_id);

      // 5. Lógica de Bônus de Indicação
      // Bônus de 15% (Indicação específica da sala)
      if (winner.referred_by) {
        const bonus15 = prizeAmount * 0.15;
        const { data: refProfile } = await supabase.from('profiles').select('balance').eq('id', winner.referred_by).single();
        if (refProfile) {
          await supabase.from('profiles').update({ balance: refProfile.balance + bonus15 }).eq('id', winner.referred_by);
          await supabase.from('transactions').insert({
            user_id: winner.referred_by,
            type: 'deposit',
            amount: bonus15,
            status: 'completed',
            payment_method: 'Bônus de Indicação (15%)'
          });
        }
      } 
      // Bônus de 5% (Indicação geral da plataforma - se não houver a de 15%)
      else if (winner.profiles.referred_by) {
        const bonus5 = prizeAmount * 0.05;
        const { data: refProfile } = await supabase.from('profiles').select('balance').eq('id', winner.profiles.referred_by).single();
        if (refProfile) {
          await supabase.from('profiles').update({ balance: refProfile.balance + bonus5 }).eq('id', winner.profiles.referred_by);
          await supabase.from('transactions').insert({
            user_id: winner.profiles.referred_by,
            type: 'deposit',
            amount: bonus5,
            status: 'completed',
            payment_method: 'Bônus de Indicação (5%)'
          });
        }
      }

      // 6. Finalizar Mesa
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', room.id);

      toast.success(`Sorteio realizado! Vencedor: ${winner.profiles.first_name}`);
      fetchSystemData();
    } catch (error: any) {
      toast.error("Erro no sorteio: " + error.message);
    } finally {
      setDrawingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <LayoutGrid className="text-purple-500" /> Módulos
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
            <Zap className="text-amber-500" /> Mesas Ativas
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
                    <span className="px-3 py-1 rounded-lg text-[10px] uppercase font-black bg-green-500/10 text-green-400">
                      {room.status}
                    </span>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <Button 
                      onClick={() => handlePerformDraw(room)}
                      disabled={drawingId === room.id}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase px-4 h-9 rounded-xl"
                    >
                      {drawingId === room.id ? <Loader2 className="animate-spin" /> : <><Trophy size={14} className="mr-2" /> SORTEAR</>}
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