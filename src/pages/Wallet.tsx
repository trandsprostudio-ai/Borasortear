"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, Loader2, Trophy, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ShieldAlert, RefreshCw, CreditCard, Info } from 'lucide-react';
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
  const bonusBalance = Number(profile?.bonus_balance || 0);
  const totalFunds = currentBalance + bonusBalance;

  const pendingDepositAmount = transactions
    .filter(t => t.type === 'deposit' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 block">Fundo de Jogo</span>
                  <span className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-widest">Ativo</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => user && fetchData(user.id, true)}>
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
            
            <div className="mb-10">
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter truncate">
                {totalFunds.toLocaleString()} <span className="text-xl md:text-3xl opacity-30 not-italic">Kz</span>
              </h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Saldo Sacável</span>
                <span className="text-2xl font-black text-green-400 italic">{currentBalance.toLocaleString()} Kz</span>
                <p className="text-[8px] text-white/10 uppercase mt-2 font-bold">Podes levantar este valor</p>
              </div>
              <div className="bg-purple-600/5 p-6 rounded-[2rem] border border-purple-500/10">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Bónus de Afiliado</span>
                <span className="text-2xl font-black text-white italic">{bonusBalance.toLocaleString()} Kz</span>
                <p className="text-[8px] text-purple-500/40 uppercase mt-2 font-bold">Apenas para sortear</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setModalConfig({ open: true, type: 'deposit' })} className="flex-1 h-16 rounded-2xl font-black text-lg premium-gradient">
                DEPOSITAR
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                disabled={currentBalance <= 0}
                className="flex-1 h-16 rounded-2xl font-black text-lg bg-white/5 border border-white/10"
              >
                SACAR SALDO REAL
              </Button>
            </div>
          </motion.div>

          <div className="space-y-6">
            <div className="bg-[#1A1D29]/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Info className="text-purple-500" size={18} />
                <h3 className="text-[10px] font-black uppercase text-white/40">Regras da Carteira</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">Saldos de bónus são gastos automaticamente primeiro ao entrar numa mesa.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                  <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">Apenas ganhos de sorteios e depósitos reais podem ser sacados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;