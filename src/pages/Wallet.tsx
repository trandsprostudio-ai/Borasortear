"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, History, Plus, Loader2, Trophy, Activity, ArrowUpRight, CreditCard, ArrowDownLeft, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import TransactionModal from '@/components/wallet/TransactionModal';
import { toast } from 'sonner';

const Wallet = () => {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalConfig, setModalConfig] = useState<{ open: boolean, type: 'deposit' | 'withdrawal' }>({ open: false, type: 'deposit' });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData(session.user.id);
        setupRealtime(session.user.id);
      }
    };
    getSession();
  }, []);

  const setupRealtime = (userId: string) => {
    const channel = supabase.channel(`wallet-updates-${userId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${userId}` 
      }, (payload) => {
        setProfile(payload.new);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions', 
        filter: `user_id=eq.${userId}` 
      }, () => {
        fetchData(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchData = async (userId: string) => {
    const [profRes, transRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    if (profRes.data) setProfile(profRes.data);
    if (transRes.data) setTransactions(transRes.data);
    setLoading(false);
  };

  const handleAccelerate = async (txId: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ acceleration_requested: true })
      .eq('id', txId);

    if (!error) {
      toast.success("Pedido de urgência enviado ao suporte!");
      if (user) fetchData(user.id);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const currentBalance = Number(profile?.balance || 0);
  const pendingDepositAmount = transactions
    .filter(t => t.type === 'deposit' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalDisplayBalance = currentBalance + pendingDepositAmount;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0B12] via-transparent to-[#0A0B12]" />
      </div>

      <Navbar />
      
      <TransactionModal 
        isOpen={modalConfig.open} 
        onClose={() => {
          setModalConfig({ ...modalConfig, open: false });
          if (user) fetchData(user.id);
        }}
        type={modalConfig.type}
        user={user}
        currentBalance={currentBalance}
      />

      <main className="max-w-6xl mx-auto px-4 pt-24 md:pt-32 relative z-10">
        {profile?.is_banned && (
          <div className="mb-8 bg-red-500/20 border border-red-500/50 p-6 rounded-3xl flex items-center gap-4 text-red-400 backdrop-blur-xl">
            <ShieldAlert size={32} />
            <div>
              <h3 className="font-black uppercase tracking-widest">CONTA BANIDA</h3>
              <p className="text-xs font-bold">Sua conta foi suspensa por envio excessivo de comprovativos falsos.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#1A1D29]/40 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">Status da Conta</span>
                    <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12} /> Membro Premium
                    </span>
                  </div>
                </div>
                {pendingDepositAmount > 0 && (
                  <div className="bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20 flex items-center gap-2">
                    <Clock size={14} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Processando</span>
                  </div>
                )}
              </div>
              
              <div className="mb-12">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Saldo Total Acumulado</p>
                <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter flex items-baseline gap-3">
                  {totalDisplayBalance.toLocaleString()} 
                  <span className="text-2xl md:text-3xl opacity-30 not-italic font-bold">Kz</span>
                </h1>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">Disponível</span>
                  <span className="text-2xl font-black text-green-400 italic">{currentBalance.toLocaleString()} <span className="text-xs opacity-60">Kz</span></span>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">Pendente</span>
                  <span className="text-2xl font-black text-amber-400 italic">{pendingDepositAmount.toLocaleString()} <span className="text-xs opacity-60">Kz</span></span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setModalConfig({ open: true, type: 'deposit' })}
                  disabled={profile?.is_banned}
                  className="flex-1 h-16 rounded-2xl font-black text-lg premium-gradient shadow-2xl shadow-purple-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Plus size={24} className="mr-2" /> DEPOSITAR AGORA
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                  disabled={profile?.is_banned || currentBalance <= 0}
                  className="flex-1 h-16 rounded-2xl font-black text-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60"
                >
                  <ArrowUpRight size={24} className="mr-2" /> SOLICITAR SAQUE
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1A1D29]/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-amber-500" size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Ganhos Totais</h3>
              </div>
              <p className="text-3xl font-black italic tracking-tighter mb-2">0 <span className="text-sm opacity-40">Kz</span></p>
              <p className="text-[10px] font-bold text-white/20 uppercase">Você ainda não faturou prêmios.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1A1D29]/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-blue-400" size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Segurança</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-white/20">Alertas de Fraude</span>
                  <span className={`text-xl font-black ${profile?.false_proof_count > 0 ? 'text-red-500' : 'text-white/20'}`}>
                    {profile?.false_proof_count || 0}/3
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${profile?.false_proof_count > 1 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${((profile?.false_proof_count || 0) / 3) * 100}%` }} 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Tabs defaultValue="transactions" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 w-full md:w-auto">
            <TabsTrigger value="transactions" className="flex-1 md:flex-none rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <CreditCard size={14} className="mr-2" /> Histórico Financeiro
            </TabsTrigger>
            <TabsTrigger value="participations" className="flex-1 md:flex-none rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <History size={14} className="mr-2" /> Minhas Mesas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A1D29]/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/10">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                      <tr>
                        <th className="p-8">Data e Hora</th>
                        <th className="p-8">Operação / Valor</th>
                        <th className="p-8">Status Atual</th>
                        <th className="p-8 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold">
                      {transactions.map((tx) => {
                        const isOldEnough = (Date.now() - new Date(tx.created_at).getTime()) > 15 * 60 * 1000;
                        return (
                          <tr key={tx.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-8 text-white/40">{new Date(tx.created_at).toLocaleString()}</td>
                            <td className="p-8">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                  {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <span className="text-lg font-black italic">{tx.amount.toLocaleString()} <span className="text-[10px] opacity-40 not-italic">Kz</span></span>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center gap-2">
                                {tx.status === 'pending' ? <Clock size={14} className="text-amber-500" /> : 
                                 tx.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                                 <XCircle size={14} className="text-red-500" />}
                                <span className={`text-[10px] uppercase font-black tracking-widest ${
                                  tx.status === 'pending' ? 'text-amber-500' : 
                                  tx.status === 'completed' ? 'text-green-500' : 'text-red-500'
                                }`}>{tx.status}</span>
                              </div>
                            </td>
                            <td className="p-8 text-right">
                              {tx.status === 'pending' && isOldEnough && !tx.acceleration_requested && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAccelerate(tx.id)}
                                  className="h-10 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase px-4 rounded-xl hover:bg-purple-600 hover:text-white transition-all"
                                >
                                  Pedir Urgência
                                </Button>
                              )}
                              {tx.acceleration_requested && tx.status === 'pending' && (
                                <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-lg">Urgência Solicitada</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/10">
                    <CreditCard size={40} />
                  </div>
                  <p className="text-white/20 font-black text-xs uppercase tracking-[0.3em]">Nenhuma transação registrada.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participations" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1A1D29]/40 backdrop-blur-3xl rounded-[2.5rem] p-20 text-center border border-white/10">
              <History size={48} className="mx-auto mb-6 text-white/10" />
              <p className="text-white/20 font-black text-xs uppercase tracking-[0.3em]">Histórico de mesas disponível em "Minhas Mesas".</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Wallet;