"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, Loader2, ShieldAlert, RefreshCw, CreditCard, History, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminFinanceProps {
  onUpdate: () => void;
}

const AdminFinance = ({ onUpdate }: AdminFinanceProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    
    // Canal de tempo real para atualizações instantâneas
    const channel = supabase.channel('admin-finance-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        console.log("Nova transação detectada, atualizando...");
        fetchTransactions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // 1. Buscar todas as transações pendentes e recentes
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (txError) throw txError;

      if (txData && txData.length > 0) {
        // 2. Buscar perfis para associar nomes e IBANs
        const userIds = [...new Set(txData.map(t => t.user_id))];
        const { data: profileData, error: profError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, bank_info, false_proof_count')
          .in('id', userIds);

        if (profError) throw profError;

        const mergedData = txData.map(tx => ({
          ...tx,
          profiles: profileData?.find(p => p.id === tx.user_id) || null
        }));

        setTransactions(mergedData);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      console.error("Erro AdminFinance:", err);
      toast.error("Erro ao carregar transações.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx: any) => {
    if (!confirm(`CONFIRMAR OPERAÇÃO DE ${Number(tx.amount).toLocaleString()} Kz?`)) return;

    try {
      // Se for depósito, adiciona saldo. Se for saque, o saldo já foi deduzido no pedido.
      if (tx.type === 'deposit') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        await supabase.from('profiles').update({ balance: Number(profile?.balance || 0) + Number(tx.amount) }).eq('id', tx.user_id);
        
        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Depósito Confirmado! ✅',
          message: `Sua recarga de ${Number(tx.amount).toLocaleString()} Kz foi validada.`,
          type: 'success'
        });
      } else {
        // Notificação de saque concluído
        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Saque Concluído! 💸',
          message: `Seu saque de ${Number(tx.amount).toLocaleString()} Kz foi processado com sucesso.`,
          type: 'success'
        });
      }

      await supabase.from('transactions').update({ status: 'completed' }).eq('id', tx.id);
      toast.success("Operação finalizada!");
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const handleRejectDeposit = async (tx: any, isFalse: boolean = false) => {
    if (!confirm("Deseja rejeitar este depósito?")) return;

    try {
      if (isFalse) {
        const currentCount = tx.profiles?.false_proof_count || 0;
        await supabase.from('profiles').update({ 
          false_proof_count: currentCount + 1,
          is_banned: (currentCount + 1) >= 3
        }).eq('id', tx.user_id);
      }

      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      
      await supabase.from('notifications').insert({
        user_id: tx.user_id,
        title: 'Depósito Rejeitado ❌',
        message: isFalse ? 'Seu comprovativo foi identificado como falso.' : 'Seu depósito não pôde ser validado.',
        type: 'error'
      });

      toast.error("Depósito rejeitado.");
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao rejeitar.");
    }
  };

  // Filtros rigorosos para as abas
  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const history = transactions.filter(t => t.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          onClick={fetchTransactions} 
          className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sincronizar Dados
        </Button>
      </div>

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="deposits" className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-green-600">
            Depósitos ({pendingDeposits.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-600">
            Saques ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase p-6">Jogador</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Valor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Comprovativo</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDeposits.length > 0 ? pendingDeposits.map((tx) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="p-6">
                      <div className="flex flex-col">
                        <span className="font-black uppercase">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                        <span className="text-[9px] text-white/20">{new Date(tx.created_at).toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-6 font-black text-green-400">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                    <TableCell className="p-6">
                      {tx.proof_url && (
                        <Button asChild variant="outline" size="sm" className="h-8 border-purple-500/30 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">
                          <a href={tx.proof_url} target="_blank" rel="noopener noreferrer">Ver Anexo</a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleApprove(tx)} className="h-8 bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase px-3 rounded-lg">Aprovar</Button>
                        <Button onClick={() => handleRejectDeposit(tx, false)} variant="ghost" className="h-8 text-white/40 text-[9px] font-black uppercase px-3">Rejeitar</Button>
                        <Button onClick={() => handleRejectDeposit(tx, true)} variant="ghost" className="h-8 text-red-500 border border-red-500/20 text-[9px] font-black uppercase px-3">Falso</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="p-10 text-center text-white/10 font-black uppercase text-[10px]">Nenhum depósito pendente</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="text-[10px] font-black uppercase p-6">Jogador / IBAN</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6">Valor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase p-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.length > 0 ? pendingWithdrawals.map((tx) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="p-6">
                      <div className="flex flex-col">
                        <span className="font-black uppercase">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                        <span className="text-[10px] text-amber-500 font-bold">{tx.profiles?.bank_info || 'Sem IBAN'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-6 font-black text-amber-500">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                    <TableCell className="p-6 text-right">
                      <Button onClick={() => handleApprove(tx)} className="h-9 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase px-6 rounded-xl">Validar Pagamento</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="p-10 text-center text-white/10 font-black uppercase text-[10px]">Nenhum saque pendente</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5 opacity-60">
            <Table>
              <TableBody>
                {history.map((tx) => (
                  <TableRow key={tx.id} className="border-white/5">
                    <TableCell className="p-4 text-[10px] font-bold text-white/40">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="p-4 font-black uppercase text-xs">{tx.profiles?.first_name}</TableCell>
                    <TableCell className="p-4 font-black text-xs">{tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString()} Kz</TableCell>
                    <TableCell className="p-4 text-right">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinance;