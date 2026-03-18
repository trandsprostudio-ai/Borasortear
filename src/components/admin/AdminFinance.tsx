"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

interface AdminFinanceProps {
  onUpdate: () => void;
}

const AdminFinance = ({ onUpdate }: AdminFinanceProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(first_name, last_name, balance, bank_info)')
      .order('created_at', { ascending: false });
    
    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  const handleApprove = async (tx: any) => {
    if (!confirm(`Aprovar ${tx.type === 'deposit' ? 'depósito' : 'saque'} de ${tx.amount.toLocaleString()} Kz?`)) return;

    try {
      if (tx.type === 'deposit') {
        const newBalance = (tx.profiles?.balance || 0) + Number(tx.amount);
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', tx.user_id);
      }
      // Para saque, o saldo já foi deduzido no pedido (escrow)

      await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);
      toast.success("Transação aprovada!");
      fetchTransactions();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao processar transação");
    }
  };

  const handleReject = async (tx: any) => {
    if (!confirm("Rejeitar esta transação?")) return;

    try {
      if (tx.type === 'withdrawal') {
        const newBalance = (tx.profiles?.balance || 0) + Number(tx.amount);
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', tx.user_id);
      }

      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      toast.success("Transação rejeitada");
      fetchTransactions();
      onUpdate();
    } catch (error) {
      toast.error("Erro ao rejeitar transação");
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border-white/5">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Data / Jogador</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Tipo / Valor</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Dados Bancários</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
              <TableCell className="p-6">
                <div className="flex flex-col">
                  <span className="font-bold">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                  <span className="text-[10px] text-white/20">{new Date(tx.created_at).toLocaleString()}</span>
                </div>
              </TableCell>
              <TableCell className="p-6">
                <div className="flex items-center gap-2">
                  {tx.type === 'deposit' ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-amber-400" />}
                  <span className="font-black text-lg">{tx.amount.toLocaleString()} Kz</span>
                </div>
              </TableCell>
              <TableCell className="p-6 text-white/40 text-xs max-w-[150px] truncate">
                {tx.profiles?.bank_info || 'N/A'}
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
                    <Button onClick={() => handleReject(tx)} variant="ghost" className="h-8 text-red-400 hover:bg-red-400/10 text-[10px] font-black px-3 rounded-lg">REJEITAR</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminFinance;