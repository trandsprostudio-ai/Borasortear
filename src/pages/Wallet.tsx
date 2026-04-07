"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, Loader2, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      if (currentUser) fetchData(currentUser.id);
    };
    getSession();
  }, [fetchData]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" size={40} /></div>;

  const currentBalance = Number(profile?.balance || 0);
  const bonusBalance = Number(profile?.bonus_balance || 0);
  
  const pendingBalance = transactions
    .filter(tx => tx.type === 'deposit' && tx.status === 'pending')
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const totalFunds = currentBalance + bonusBalance;

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-32">
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

      <main className="max-w-6xl mx-auto px-4 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-gradient p-8 md:p-12 rounded-[3rem] shadow-2xl text-white relative overflow-hidden border-2 border-[#111111]"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <WalletIcon size={120} />
              </div>

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <WalletIcon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block">Saldo Disponível</span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Conta Verificada</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => user && fetchData(user.id, true)} className="text-white/40 hover:text-white">
                  <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                </Button>
              </div>
              
              <div className="mb-8 relative z-10">
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
                  {totalFunds.toLocaleString()} <span className="text-2xl md:text-3xl opacity-30 not-italic ml-2">Kz</span>
                </h1>
              </div>

              {/* Saldo Pendente em Destaque */}
              {pendingBalance > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10 mb-10 bg-amber-500/10 border border-amber-500/30 p-4 md:p-6 rounded-[2rem] flex items-center justify-between backdrop-blur-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/20 animate-pulse">
                      <Clock size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/60">Recarga em Processamento</p>
                      <p className="text-xl md:text-2xl font-black text-amber-400 italic">+{pendingBalance.toLocaleString()} Kz</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Tempo Estimado</span>
                    <p className="text-[10px] font-black uppercase">~ 15 Minutos</p>
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative z-10">
                <div className="bg-white/5 p-6 rounded-[2rem] border-2 border-white/10">
                  <span className="text-[9px] font-black opacity-40 uppercase tracking-widest block mb-2">Fundos Reais</span>
                  <span className="text-2xl font-black text-amber-400 italic">{currentBalance.toLocaleString()} Kz</span>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border-2 border-white/10">
                  <span className="text-[9px] font-black opacity-40 uppercase tracking-widest block mb-2">Créditos de Bónus</span>
                  <span className="text-2xl font-black italic">{bonusBalance.toLocaleString()} Kz</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <Button 
                   onClick={() => setModalConfig({ open: true, type: 'deposit' })} 
                   className="flex-1 h-16 rounded-2xl font-black text-lg gold-gradient text-black border-none shadow-xl shadow-amber-500/20"
                >
                  <Plus size={20} className="mr-2" /> RECARREGAR
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                  disabled={currentBalance <= 0}
                  className="flex-1 h-16 rounded-2xl font-black text-lg bg-white/10 border-2 border-white/10 text-white hover:bg-white/20"
                >
                  <ArrowUpRight size={20} className="mr-2" /> LEVANTAR
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black uppercase text-[#111111]/40 mb-8 flex items-center gap-2">
                <Clock size={16} /> Fluxo de Caixa
              </h3>
              <div className="space-y-6">
                {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${
                        tx.status === 'completed' ? 'bg-[#f0f9f1] border-green-200 text-green-600' : 
                        tx.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                        'bg-[#fff5f5] border-red-100 text-red-500'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-black uppercase text-[#111111]">{tx.type === 'deposit' ? 'Depósito' : 'Saque'}</p>
                          {tx.status === 'pending' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                        </div>
                        <p className="text-[9px] text-[#555555]/40 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black italic ${tx.status === 'completed' ? 'text-[#111111]' : 'text-[#111111]/30'}`}>
                        {Number(tx.amount).toLocaleString()} <span className="text-[9px] not-italic">Kz</span>
                      </p>
                      <p className={`text-[7px] font-black uppercase tracking-widest ${
                        tx.status === 'completed' ? 'text-green-600' : 
                        tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {tx.status === 'completed' ? 'Validado' : tx.status === 'pending' ? 'Em Análise' : 'Recusado'}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-20">
                    <p className="text-[9px] font-black uppercase tracking-widest">Sem movimentações</p>
                  </div>
                )}
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