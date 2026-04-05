"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, ExternalLink, Copy, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

interface AdminFinanceProps {
  onUpdate: () => void;
}

const AdminFinance = ({ onUpdate }: AdminFinanceProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false, tx: null, action: null });

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
    toast.success("IBAN copiado!");
  };

  const handleApprove = async () => {
    const { tx } = confirmConfig;
    if (!tx) return;

    try {
      const { error } = await supabase.rpc('approve_transaction_admin', {
        p_transaction_id: tx.id
      });

      if (error) throw error;

      toast.success("Operação aprovada com sucesso!");
      setConfirmConfig({ isOpen: false, tx: null });
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Falha ao processar aprovação.");
    }
  };

  const handleReject = async () => {
    const { tx, isFalse } = confirmConfig;
    if (!tx) return;

    try {
      const { error } = await supabase.rpc('reject_transaction_admin', {
        p_transaction_id: tx.id,
        p_is_false: isFalse || false
      });

      if (error) throw error;

      toast.error(isFalse ? "Jogador penalizado e transação rejeitada." : "Transação rejeitada.");
      setConfirmConfig({ isOpen: false, tx: null });
      fetchTransactions();
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao processar rejeição.");
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
        <div className="w-full overflow-x-auto no-scrollbar mb-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto flex w-max md:w-auto">
            <TabsTrigger value="deposits" className="rounded-lg px-4 md:px-6 py-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-green-600">
              Depósitos ({pendingDeposits.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="rounded-lg px-4 md:px-6 py-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-600">
              Saques ({pendingWithdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg px-4 md:px-6 py-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10">
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="deposits">
          <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px] md:min-w-[800px]">
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6">Jogador / Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6">Valor</TableHead>
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6">Comprovativo</TableHead>
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeposits.length > 0 ? pendingDeposits.map((tx) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="p-4 md:p-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-black uppercase text-xs truncate max-w-[150px]">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] text-white/20 uppercase font-black">{new Date(tx.created_at).toLocaleTimeString()}</span>
                            {tx.acceleration_requested && (
                              <span className="bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black animate-pulse flex items-center gap-1">
                                <Zap size={8} /> URGENTE
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 md:p-6 font-black text-green-400 text-base md:text-lg">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                      <TableCell className="p-4 md:p-6">
                        {tx.proof_url && (
                          <Button asChild variant="outline" size="sm" className="h-8 border-purple-500/30 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">
                            <a href={tx.proof_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="mr-1 md:mr-2" /> <span className="hidden md:inline">Ver Anexo</span></a>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="p-4 md:p-6 text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            tx, 
                            action: 'approve', 
                            title: 'APROVAR DEPÓSITO', 
                            description: `Deseja creditar ${Number(tx.amount).toLocaleString()} Kz para ${tx.profiles?.first_name}?`,
                            variant: 'success'
                          })} className="h-8 bg-green-600 hover:bg-green-700 text-white font-black text-[9px] uppercase px-2 md:px-3 rounded-lg">Aprovar</Button>
                          
                          <Button onClick={() => setConfirmConfig({ 
                            isOpen: true, 
                            tx, 
                            action: 'reject', 
                            isFalse: true,
                            title: 'MARCAR COMO FALSO', 
                            description: `O comprovativo de ${tx.profiles?.first_name} é falso? Isso penalizará o jogador.`,
                            variant: 'danger'
                          })} variant="ghost" className="h-8 text-red-500 border border-red-500/20 text-[9px] font-black uppercase px-2 md:px-3">Falso</Button>
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
          <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px] md:min-w-[800px]">
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6">Jogador / IBAN / Express</TableHead>
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6">Valor</TableHead>
                    <TableHead className="text-[10px] font-black uppercase p-4 md:p-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingWithdrawals.length > 0 ? pendingWithdrawals.map((tx) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="p-4 md:p-6">
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-xs">{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyIban(tx.profiles?.bank_info)}>
                            <span className="text-[10px] text-amber-500 font-bold tracking-wider">{tx.profiles?.bank_info || 'Sem IBAN'}</span>
                            <Copy size={10} className="text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 md:p-6 font-black text-amber-500 text-base md:text-lg">{Number(tx.amount).toLocaleString()} Kz</TableCell>
                      <TableCell className="p-4 md:p-6 text-right">
                        <Button onClick={() => setConfirmConfig({ 
                          isOpen: true, 
                          tx, 
                          action: 'approve', 
                          title: 'CONFIRMAR PAGAMENTO', 
                          description: `Você confirma que enviou ${Number(tx.amount).toLocaleString()} Kz para ${tx.profiles?.first_name}?`,
                          variant: 'warning'
                        })} className="h-9 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] md:text-[10px] uppercase px-4 md:px-6 rounded-xl">Validar Pagamento</Button>
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
          <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-white/5 opacity-80">
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