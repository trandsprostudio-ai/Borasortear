"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ghost, Clock, Hash, Activity, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/utils/date-utils';
import { Button } from '@/components/ui/button';

const AdminLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_logs')
      .select('*, rooms(id, modules(name))')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Activity className="text-purple-500" size={20} />
          <h3 className="text-xl font-black italic tracking-tighter uppercase">Histórico de Atividade</h3>
        </div>
        <Button variant="ghost" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-white/5">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-black uppercase p-6">Data/Hora</TableHead>
              <TableHead className="text-[10px] font-black uppercase p-6">Mesa</TableHead>
              <TableHead className="text-[10px] font-black uppercase p-6">Ação</TableHead>
              <TableHead className="text-[10px] font-black uppercase p-6 text-right">Impacto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? logs.map((log) => (
              <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="p-6">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">{formatDateTime(log.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell className="p-6">
                  <div className="flex flex-col">
                    <span className="font-black text-xs uppercase">{log.rooms?.modules?.name || 'Mesa'}</span>
                    <span className="text-[8px] text-purple-400 font-black">#{log.room_id?.slice(0,8)}</span>
                  </div>
                </TableCell>
                <TableCell className="p-6">
                  <div className="flex items-center gap-2">
                    <Ghost size={14} className="text-purple-500/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Injeção Proporcional</span>
                  </div>
                </TableCell>
                <TableCell className="p-6 text-right">
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-black">
                    +{log.quantity} Fantasmas
                  </span>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="p-20 text-center text-white/10 font-black uppercase text-[10px]">
                  Nenhuma atividade registada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLogs;