"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, FileText, Loader2, ShieldAlert, ExternalLink, CreditCard, Phone } from 'lucide-react';
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
      // Passo 1: Buscar as transações
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (txError) throw txError;

      if (txData && txData.length > 0) {
        // Passo 2: Buscar os perfis dos usuários dessas transações
        const userIds = [...new Set(txData.map(t => t.user_id))];
        const { data: profileData, error: profError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, bank_info, false_proof_count, is_banned')
          .in('id', userIds);

        if (profError) throw profError;

        // Passo 3: Mesclar os dados manualmente para evitar erro de join do Supabase
        const mergedData = txData.map(tx => ({
          ...tx,
          profiles: profileData?.find(p => p.id === tx.user_id) || null
        }));

        setTransactions(mergedData);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados financeiros:", err);
      toast.error("Erro ao sincronizar dados. Tente atualizar a página.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx: any) => {
    if (!confirm(`CONFIRMAR RECEBIMENTO DE ${tx.amount.toLocaleString()} Kz?`)) return;

    try {
      if (tx.type === 'deposit') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        const currentBalance = Number(profile?.balance || 0);
        
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: currentBalance + Number(tx.amount) })
          .eq('id', tx.user_id);
        
        if (balanceError) throw balanceError;

        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Depósito Confirmado! ✅',
          message: `Sua recarga de ${tx.amount.toLocaleString()} Kz foi validada manualmente pelo admin.`,
          type: 'success'
        });
      }

      const { error: txError } = await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);
      if (txError) throw txError;

      toast.success("Transação validada!");
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao processar: " + error.message);
    }
  };

  const handleReject = async (tx: any, isFalse: boolean = false) => {
    const reason = isFalse ? "COMPROVATIVO FALSO" : prompt("Motivo da rejeição:");
    if (reason === null) return;

    try {
      if (isFalse) {
        const currentCount = tx.profiles?.false_proof_count || 0;
        await supabase.from('profiles').update({ 
          false_proof_count: currentCount + 1,
          is_banned: (currentCount + 1) >= 3
        }).eq('id', tx.user_id);
      }

      if (tx.type === 'withdrawal') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        const currentBalance = Number(profile?.balance || 0);
        await supabase.from('profiles').update({ balance: currentBalance + Number(tx.amount) }).eq('id', tx.user_id);
      }

      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      toast.error("Transação rejeitada.");
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao rejeitar: " + error.message);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white/20">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">Carregando Centro Financeiro...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 mb-4">
        <ShieldAlert className="text-amber-500" size={20} />
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
          Validação Manual: Compare o comprovativo com o seu extrato bancário antes de aprovar.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-white/5">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Jogador / Dados</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Valor / Método</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Comprovativo</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id} className={`border-white/5 hover:bg-white/5 transition-colors ${tx.status === 'pending' ? 'bg-purple-500/5' : ''}`}>
                  <TableCell className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-white uppercase">
                        {tx.profiles?.first_name} {tx.profiles?.last_name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold">
                        <CreditCard size={12} />
                        <span>IBAN: {tx.profiles?.bank_info || 'Não informado'}</span>
                      </div>
                      <span className="text-[9px] text-white/20 uppercase">{new Date(tx.created_at).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    <div className="flex items-center gap-2">
                      {tx.type === 'deposit' ? <ArrowDownLeft size={14} className="text-green-400" /> : <ArrowUpRight size={14} className="text-amber-400" />}
                      <span className="font-black text-xl">{Number(tx.amount).toLocaleString()} Kz</span>
                    </div>
                    <span className="text-[9px] font-black text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded w-fit">
                      {tx.payment_method}
                    </span>
                  </TableCell>
                  <TableCell className="p-6">
                    {tx.proof_url ? (
                      <Button asChild variant="outline" size="sm" className="h-9 border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white font-black text-[10px] uppercase rounded-xl">
                        <a href={tx.proof_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} className="mr-2" /> ABRIR
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[9px] font-black text-white/10 uppercase">Sem anexo</span>
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
                      }`}>{tx.status === 'pending' ? 'Pendente' : tx.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleApprove(tx)} className="h-9 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase px-4 rounded-xl">APROVAR</Button>
                        <Button onClick={() => handleReject(tx, false)} variant="ghost" className="h-9 text-white/40 hover:bg-white/5 font-black text-[10px] uppercase px-4 rounded-xl">REJEITAR</Button>
                        <Button onClick={() => handleReject(tx, true)} variant="ghost" className="h-9 text-red-500 hover:bg-red-500/10 font-black text-[10px] uppercase px-4 rounded-xl border border-red-500/20">FALSO</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="p-20 text-center text-white/10 font-black uppercase tracking-widest text-xs">
                  Nenhuma transação registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminFinance;