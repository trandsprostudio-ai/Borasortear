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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const currentBalance = Number(profile?.balance || 0);
  const bonusBalance = Number(profile?.bonus_balance || 0);
  const totalFunds = currentBalance + bonusBalance;

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const finishedTransactions = transactions.filter(t => t.status !== 'pending').slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-24 relative overflow-hidden">
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
              className="bg-[#f8f9fa] p-6 md:p-10 rounded-[2.5rem] border border-[#e0e0e0] shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center text-white">
                    <WalletIcon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 block">Fundo de Jogo</span>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Ativo</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => user && fetchData(user.id, true)} className="text-[#555555]">
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </Button>
              </div>
              
              <div className="mb-10">
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter truncate text-[#111111]">
                  {totalFunds.toLocaleString()} <span className="text-xl md:text-3xl opacity-30 not-italic">Kz</span>
                </h1>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-[#e0e0e0]">
                  <span className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest block mb-1">Saldo Sacável</span>
                  <span className="text-2xl font-black text-green-600 italic">{currentBalance.toLocaleString()} Kz</span>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Bónus Disponível</span>
                  <span className="text-2xl font-black text-[#111111] italic">{bonusBalance.toLocaleString()} Kz</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setModalConfig({ open: true, type: 'deposit' })} className="flex-1 h-16 rounded-2xl font-black text-lg premium-gradient text-white border-none shadow-lg">
                  DEPOSITAR
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                  disabled={currentBalance <= 0}
                  className="flex-1 h-16 rounded-2xl font-black text-lg bg-white border border-[#e0e0e0] text-[#111111] hover:bg-[#f5f5f5]"
                >
                  SACAR SALDO
                </Button>
              </div>
            </motion.div>

            {pendingTransactions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4 flex items-center gap-2">
                  <Clock size={14} /> Operações em Validação
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {pendingTransactions.map((tx) => (
                    <div key={tx.id} className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                          {tx.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 mb-1">
                            {tx.type === 'deposit' ? 'Aguardando Crédito' : 'Processando Pagamento'}
                          </p>
                          <p className="text-lg font-black italic text-[#111111]">{Number(tx.amount).toLocaleString()} Kz</p>
                        </div>
                      </div>
                      {!tx.acceleration_requested ? (
                        <Button 
                          onClick={() => handleAccelerate(tx.id)}
                          className="h-9 px-4 rounded-xl gold-gradient text-black font-black text-[9px] uppercase tracking-widest hover:opacity-90 border-none"
                        >
                          <Zap size={12} className="mr-2" /> Acelerar
                        </Button>
                      ) : (
                        <span className="text-[8px] font-black text-amber-600/40 uppercase tracking-widest border border-amber-200 px-3 py-1.5 rounded-lg">Urgência Solicitada</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#f8f9fa] p-8 rounded-[2.5rem] border border-[#e0e0e0]">
              <h3 className="text-[10px] font-black uppercase text-[#555555]/40 mb-6 flex items-center gap-2">
                <Clock size={16} /> Últimas Operações
              </h3>
              <div className="space-y-4">
                {finishedTransactions.length > 0 ? finishedTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center py-2 border-b border-[#e0e0e0] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#555555]">{tx.type === 'deposit' ? 'Recarga' : 'Saque'}</p>
                        <p className="text-[8px] text-[#555555]/40 font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${tx.status === 'completed' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.status === 'completed' ? '+' : '-'}{Number(tx.amount).toLocaleString()} Kz
                    </span>
                  </div>
                )) : (
                  <p className="text-[9px] font-black uppercase text-[#555555]/20 text-center py-4">Nenhum histórico</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <Info size={18} />
                <h4 className="text-[10px] font-black uppercase">Informações</h4>
              </div>
              <p className="text-[9px] font-bold text-[#555555]/60 uppercase leading-relaxed">
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