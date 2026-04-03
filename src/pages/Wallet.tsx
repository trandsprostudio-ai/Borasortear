"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, Loader2, Trophy, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ShieldAlert, RefreshCw, CreditCard, Info, Zap } from 'lucide-react';
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

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const finishedTransactions = transactions.filter(t => t.status !== 'pending').slice(0, 5);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1D29]/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white">
                    <WalletIcon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block">Fundo de Jogo</span>
                    <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Ativo</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => user && fetchData(user.id, true)}>
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </Button>
              </div>
              
              <div className="mb-10">
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter truncate">
                  {totalFunds.toLocaleString()} <span className="text-xl md:text-3xl opacity-30 not-italic">Kz</span>
                </h1>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Saldo Sacável</span>
                  <span className="text-2xl font-black text-green-400 italic">{currentBalance.toLocaleString()} Kz</span>
                </div>
                <div className="bg-purple-600/5 p-6 rounded-[2rem] border border-purple-500/10">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Bónus Disponível</span>
                  <span className="text-2xl font-black text-white italic">{bonusBalance.toLocaleString()} Kz</span>
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
                  SACAR SALDO
                </Button>
              </div>
            </motion.div>

            {/* Container de Transações Pendentes */}
            {pendingTransactions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-4 flex items-center gap-2">
                  <Clock size={14} /> Operações em Validação
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {pendingTransactions.map((tx) => (
                    <div key={tx.id} className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                          {tx.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                            {tx.type === 'deposit' ? 'Aguardando Crédito' : 'Processando Pagamento'}
                          </p>
                          <p className="text-lg font-black italic">{Number(tx.amount).toLocaleString()} Kz</p>
                        </div>
                      </div>
                      {!tx.acceleration_requested ? (
                        <Button 
                          onClick={() => handleAccelerate(tx.id)}
                          className="h-9 px-4 rounded-xl bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest hover:bg-amber-400"
                        >
                          <Zap size={12} className="mr-2" /> Acelerar
                        </Button>
                      ) : (
                        <span className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest border border-amber-500/20 px-3 py-1.5 rounded-lg">Urgência Solicitada</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#1A1D29]/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10">
              <h3 className="text-[10px] font-black uppercase text-white/40 mb-6 flex items-center gap-2">
                <Clock size={16} /> Últimas Operações
              </h3>
              <div className="space-y-4">
                {finishedTransactions.length > 0 ? finishedTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.status === 'completed' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-white/60">{tx.type === 'deposit' ? 'Recarga' : 'Saque'}</p>
                        <p className="text-[8px] text-white/20 font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${tx.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.status === 'completed' ? '+' : '-'}{Number(tx.amount).toLocaleString()} Kz
                    </span>
                  </div>
                )) : (
                  <p className="text-[9px] font-black uppercase text-white/10 text-center py-4">Nenhum histórico</p>
                )}
              </div>
            </div>

            <div className="bg-purple-600/5 p-8 rounded-[2.5rem] border border-purple-500/10">
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <Info size={18} />
                <h4 className="text-[10px] font-black uppercase">Informações</h4>
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed">
                Os depósitos via Multicaixa Express são creditados em média em 15 minutos. Saques são processados em até 24h úteis.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;