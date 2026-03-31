"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, Loader2, ShieldAlert, RefreshCw, CreditCard, History, Phone, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

interface AdminFinanceProps {
  onUpdate: () => void;
}

const AdminFinance = ({ onUpdate }: AdminFinanceProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false, tx: null, isFalse: false });

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
      const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (txData && txData.length > 0) {
        const userIds = [...new Set(txData.map(t => t.user_id))];
        const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name, bank_info, false_proof_count, balance').in('id', userIds);
        const mergedData = txData.map(tx => ({
          ...tx,
          profiles: profileData?.find(p => p.id === tx.user_id) || null
        }));
        setTransactions(mergedData);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      toast.error("Erro ao carregar transações.");
    } finally {
      setLoading(false);
    }
  };

  const copyIban = (iban: string) => {
    if (!iban) return;
    navigator.clipboard.writeText(iban);
    toast.success("IBAN copiado para transferência!");
  };

  const handleApprove = async () => {
    const { tx } = confirmConfig;
    if (!tx || !tx.user_id) {
      toast.error("Dados da transação incompletos.");
      return;
    }

    try {
      if (tx.type === 'deposit') {
        // 1. Buscar saldo atualizado (Garantir que pegamos o mais recente)
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', tx.user_id)
          .maybeSingle();

        if (fetchError) {
          console.error("Erro Supabase Profile:", fetchError);
          throw new Error(`Erro ao acessar perfil: ${fetchError.message}`);
        }

        if (!profile) throw new Error("Perfil do jogador não encontrado no sistema.");

        const currentBalance = Number(profile.balance || 0);
        const depositAmount = Number(tx.amount);
        const newBalance = currentBalance + depositAmount;

        // 2. Atualizar o saldo
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', tx.user_id);

        if (balanceError) throw new Error("Falha ao creditar saldo na conta do jogador.");

        // 3. Notificar o jogador
        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Depósito Confirmado! ✅',
          message: `Sua recarga de ${depositAmount.toLocaleString()} Kz foi validada.`,
          type: 'success'
        });
      } else {
        // No Saque, o saldo já foi deduzido no pedido. Apenas notificamos.
        await supabase.from('notifications').insert({
          user_id: tx.user_id,
          title: 'Saque Concluído! 💸',
          message: `Seu saque de ${Number(tx.amount).toLocaleString()} Kz foi processado.`,
          type: 'success'
        });
      }

      // 4. Finalizar transação
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', tx.id);

      if (txError) throw new Error("Saldo atualizado, mas erro ao registrar conclusão da transação.");

      toast.success("Operação concluída com sucesso!");
      setConfirmConfig({ isOpen: false, tx: null });
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      console.error("Erro Crítico na Aprovação:", error);
      toast.error(error.message || "Erro desconhecido ao processar.");
    }
  };

  const handleReject = async () => {
    const { tx, isFalse } = confirmConfig;
    if (!tx) return;

    try {
      if (isFalse) {
        const currentCount = tx.profiles?.false_proof_count || 0;
        await supabase.from('profiles').update({ 
          false_proof_count: currentCount + 1,
          is_banned: (currentCount + 1) >= 3
        }).eq('id', tx.user_id);
      }

      // Se for saque rejeitado, devolvemos o dinheiro
      if (tx.type === 'withdrawal') {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.user_id).single();
        await supabase.from('profiles').update({ balance: Number(profile?.balance || 0) + Number(tx.amount) }).eq('id', tx.user_id);
      }

      await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      
      await supabase.from('notifications').insert({
        user_id: tx.user_id,
        title: tx.type === 'deposit' ? 'Depósito Rejeitado ❌' : 'Saque Rejeitado ❌',
        message: isFalse ? 'Seu comprovativo foi identificado como falso.' : 'Sua operação não pôde ser validada.',
        type: 'error'
      });

      toast.error("Operação rejeitada.");
      setConfirmConfig({ isOpen: false, tx: null });
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao rejeitar.");
    }
  };

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const history = transactions.filter(t => t.status !== 'pending');

  return (
    <div className="space-y-6">
      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, tx: null })}
        onConfirm={confirmConfig.action === 'approve' ? handleApprove : handleReject}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
      />

      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-12 mb-6 w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger value="deposits" className="flex-1 md:flex-none rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-green-600">
            Depósitos ({pendingDeposits.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex-1 md:flex-none rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-600">
            Saques ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 md:flex-none rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
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
                          <span className="font-black uppercase text-xs">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                          <span className="text-[9px] text-white/20">{new Date(tx.created_at).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-6 font-black text-green-400 text-lg">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                      <TableCell className="p-6">
                        {tx.proof_url && (
                          <Button asChild variant="outline" size="sm" className="h-8 border-purple-500/30 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">
                            <a href={tx.proof_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="mr-2" /> Ver Anexo</a>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            tx, 
                            action: 'approve', 
                            title: 'APROVAR DEPÓSITO', 
                            description: `Deseja creditar ${Number(tx.amount).toLocaleString()} Kz para ${tx.profiles?.first_name}?`,
                            variant: 'success'
                          })} className="h-8 bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase px-3 rounded-lg">Aprovar</Button>
                          
                          <Button onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            tx, 
                            action: 'reject', 
                            isFalse: false,
                            title: 'REJEITAR DEPÓSITO', 
                            description: `Deseja recusar o depósito de ${Number(tx.amount).toLocaleString()} Kz?`,
                            variant: 'info'
                          })} variant="ghost" className="h-8 text-white/40 text-[9px] font-black uppercase px-3">Rejeitar</Button>
                          
                          <Button onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            tx, 
                            action: 'reject', 
                            isFalse: true,
                            title: 'MARCAR COMO FALSO', 
                            description: `O comprovativo de ${tx.profiles?.first_name} é falso? Isso penalizará o jogador.`,
                            variant: 'danger'
                          })} variant="ghost" className="h-8 text-red-500 border border-red-500/20 text-[9px] font-black uppercase px-3">Falso</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="p-20 text-center text-white/10 font-black uppercase text-[10px]">Nenhum depósito pendente</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
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
                          <span className="font-black uppercase text-xs">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyIban(tx.profiles?.bank_info)}>
                            <span className="text-[10px] text-amber-500 font-bold tracking-wider">{tx.profiles?.bank_info || 'Sem IBAN'}</span>
                            <Copy size={10} className="text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-6 font-black text-amber-500 text-lg">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                      <TableCell className="p-6 text-right">
                        <Button onClick={() => setConfirmConfig({ 
                          isOpen: true, 
                          tx, 
                          action: 'approve', 
                          title: 'CONFIRMAR PAGAMENTO', 
                          description: `Você confirma que enviou ${Number(tx.amount).toLocaleString()} Kz para ${tx.profiles?.first_name}?`,
                          variant: 'warning'
                        })} className="h-9 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase px-6 rounded-xl">Validar Pagamento</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} className="p-20 text-center text-white/10 font-black uppercase text-[10px]">Nenhum saque pendente</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="glass-card rounded-3xl overflow-hidden border-white/5 opacity-60">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableBody>
                  {history.map((tx) => (
                    <TableRow key={tx.id} className="border-white/5">
                      <TableCell className="p-4 text-[10px] font-bold text-white/40">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="p-4 font-black uppercase text-xs">{tx.profiles?.first_name} {tx.profiles?.last_name}</TableCell>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinance;