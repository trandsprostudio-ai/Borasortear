"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, Loader2, Trophy, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ShieldAlert, RefreshCw, CreditCard } from 'lucide-react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [modalConfig, setModalConfig] = useState<{ open: boolean, type: 'deposit' | 'withdrawal' }>({ open: false, type: 'deposit' });

  const fetchData = useCallback(async (userId: string, isManual = false) => {
    if (isManual) setRefreshing(true);
    
    try {
      const [profRes, transRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (transRes.data) setTransactions(transRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchData(currentUser.id);
      }
    };

    getSession();
  }, [fetchData]);

  const handleAccelerate = async (txId: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ acceleration_requested: true })
      .eq('id', txId);

    if (!error) {
      toast.success("Pedido de urgência enviado!");
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
          <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-400">
            <ShieldAlert size={24} className="shrink-0" />
            <p className="text-[10px] font-black uppercase">Conta Suspensa para Operações Financeiras</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#1A1D29]/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <WalletIcon size={20} className="md:size-6" />
                </div>
                <div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 block">Balanço Geral</span>
                  <span className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-widest">Ativo</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => user && fetchData(user.id, true)}
                className="text-white/20 hover:text-white"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
            
            <div className="mb-10">
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter truncate">
                {totalDisplayBalance.toLocaleString()} <span className="text-xl md:text-3xl opacity-30 not-italic">Kz</span>
              </h1>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5">
                <span className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Disponível</span>
                <span className="text-xl md:text-2xl font-black text-green-400 italic truncate">{currentBalance.toLocaleString()} Kz</span>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5">
                <span className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Pendente</span>
                <span className="text-xl md:text-2xl font-black text-amber-400 italic truncate">{pendingDepositAmount.toLocaleString()} Kz</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setModalConfig({ open: true, type: 'deposit' })}
                disabled={profile?.is_banned}
                className="flex-1 h-14 md:h-16 rounded-xl md:rounded-2xl font-black text-base md:text-lg premium-gradient"
              >
                DEPOSITAR
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                disabled={profile?.is_banned || currentBalance <= 0}
                className="flex-1 h-14 md:h-16 rounded-xl md:rounded-2xl font-black text-base md:text-lg bg-white/5 border border-white/10"
              >
                SACAR
              </Button>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="bg-[#1A1D29]/40 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="text-amber-500" size={18} />
                <h3 className="text-[9px] font-black uppercase text-white/40">Ganhos Totais</h3>
              </div>
              <p className="text-3xl font-black italic tracking-tighter">0 Kz</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D29]/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest">Histórico Financeiro</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/30">
                <tr>
                  <th className="p-5">Data</th>
                  <th className="p-5">Tipo / Valor</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-white/5">
                    <td className="p-5 text-white/30">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="p-5">
                      <span className={tx.type === 'deposit' ? 'text-green-400' : 'text-amber-400'}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} Kz
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`text-[9px] uppercase font-black ${
                        tx.status === 'pending' ? 'text-amber-500' : 
                        tx.status === 'completed' ? 'text-green-500' : 'text-red-500'
                      }`}>{tx.status}</span>
                    </td>
                    <td className="p-5 text-right">
                      {tx.status === 'pending' && !tx.acceleration_requested && (
                        <button 
                          onClick={() => handleAccelerate(tx.id)}
                          className="text-[8px] font-black uppercase bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg"
                        >
                          Urgência
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Wallet;