"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, FileText, Zap, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AdminFinanceProps {
  onUpdate: () => void;
}

const AdminFinance = ({ onUpdate }: AdminFinanceProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase.channel('admin-finance-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchTransactions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            balance,
            bank_info,
            false_proof_count,
            is_banned
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar transações:", err.message);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx: any) => {
    if (!confirm(`APROVAR ${tx.type === 'deposit' ? 'DEPÓSITO' : 'SAQUE'} DE ${tx.amount.toLocaleString()} Kz?`)) return;

    try {
      if (tx.type === 'deposit') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        const currentBalance = profile?.balance || 0;
        
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: currentBalance + Number(tx.amount) })
          .eq('id', tx.user_id);
        
        if (balanceError) throw balanceError;

        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Recarga Confirmada! 💰',
          message: `Seu depósito de ${tx.amount.toLocaleString()} Kz foi validado. Boa sorte nas mesas!`,
          type: 'success'
        });
      }

      await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);
      toast.success("Transação aprovada!");
      fetchTransactions();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao processar aprovação");
    }
  };

  const handleReject = async (tx: any, isFalse: boolean = false) => {
    const reason = isFalse ? "COMPROVATIVO FALSO DETECTADO" : prompt("Motivo da rejeição:", "Comprovativo inválido.");
    if (reason === null) return;

    try {
      if (isFalse) {
        const currentCount = tx.profiles?.false_proof_count || 0;
        const newCount = currentCount + 1;
        const shouldBan = newCount >= 3;

        await supabase.from('profiles').update({ 
          false_proof_count: newCount,
          is_banned: shouldBan
        }).eq('id', tx.user_id);

        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'ALERTA DE SEGURANÇA ⚠️',
          message: shouldBan 
            ? 'Sua conta foi banida permanentemente por envio de comprovativos falsos.' 
            : `Detectamos um comprovativo falso. Você tem ${newCount}/3 alertas. No 3º sua conta será banida.`,
          type: 'error'
        });
      }

      if (tx.type === 'withdrawal') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        const currentBalance = profile?.balance || 0;
        await supabase.from('profiles').update({ balance: currentBalance + Number(tx.amount) }).eq('id', tx.user_id);
      }

      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      toast.success(isFalse ? "Fraude registrada!" : "Transação rejeitada.");
      fetchTransactions();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao processar");
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white/20">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden border-white/5">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Jogador</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Tipo / Valor</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Comprovativo</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow key={tx.id} className={`border-white/5 hover:bg-white/5 transition-colors ${tx.acceleration_requested && tx.status === 'pending' ? 'bg-purple-500/5' : ''}`}>
                <TableCell className="p-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{tx.profiles?.first_name || 'Usuário'}</span>
                      {tx.profiles?.is_banned && <ShieldAlert size={12} className="text-red-500" />}
                    </div>
                    <span className="text-[10px] text-white/20">{new Date(tx.created_at).toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell className="p-6">
                  <div className="flex items-center gap-2">
                    {tx.type === 'deposit' ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-amber-400" />}
                    <span className="font-black text-lg">{tx.amount.toLocaleString()} Kz</span>
                  </div>
                </TableCell>
                <TableCell className="p-6">
                  {tx.proof_url ? (
                    <a href={tx.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-black text-purple-400 uppercase hover:underline">
                      <FileText size={12} /> Ver Arquivo
                    </a>
                  ) : (
                    <span className="text-[10px] text-white/10 uppercase font-black">Sem anexo</span>
                  )}
                </TableCell>
                <TableCell className="p-6">
                  <div className="flex items-center gap-2">
                    {tx.status === 'pending' ? <Clock size={14} className="text-amber-500" /> : 
                     tx.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                     <XCircle size={14} className="text-red-500" />}
                    <span className={`text-[10px] uppercase font-black ${
                      tx.status === 'pending' ? 'text-amber-500' : 
                      tx.status === 'completed' ? 'text-green-500' : 'text-red-500'
                    }`}>{tx.status}</span>
                  </div>
                </TableCell>
                <TableCell className="p-6 text-right">
                  {tx.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleApprove(tx)} className="h-8 bg-green-600 hover:bg-green-700 text-[10px] font-black px-3 rounded-lg">APROVAR</Button>
                      <Button onClick={() => handleReject(tx, false)} variant="ghost" className="h-8 text-white/40 hover:bg-white/5 text-[10px] font-black px-3 rounded-lg">REJEITAR</Button>
                      <Button onClick={() => handleReject(tx, true)} variant="ghost" className="h-8 text-red-500 hover:bg-red-500/10 text-[10px] font-black px-3 rounded-lg">FALSO</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="p-20 text-center text-white/10 font-black uppercase tracking-widest text-xs">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminFinance;