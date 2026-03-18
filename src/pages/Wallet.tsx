"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, History, Plus, Loader2, Trophy, Zap, ArrowUpRight, CreditCard, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';
import TransactionModal from '@/components/wallet/TransactionModal';

const Wallet = () => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [modalConfig, setModalConfig] = useState<{ open: boolean, type: 'deposit' | 'withdrawal' }>({ open: false, type: 'deposit' });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchHistory(session.user.id);
      }
    };
    getSession();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from('participants')
      .select('*, rooms(*, modules(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar user={user} />
      
      <TransactionModal 
        isOpen={modalConfig.open} 
        onClose={() => setModalConfig({ ...modalConfig, open: false })}
        type={modalConfig.type}
        user={user}
        currentBalance={profile?.balance || 0}
      />

      <main className="max-w-6xl mx-auto px-4 pt-24 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Card de Saldo Principal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-blue-700 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-purple-500/20"
          >
            <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12 hidden md:block">
              <WalletIcon size={240} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Saldo Total Disponível</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8 md:mb-10 italic tracking-tighter">
                {profile?.balance?.toLocaleString() || '0'} <span className="text-xl md:text-2xl opacity-60 not-italic">Kz</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setModalConfig({ open: true, type: 'deposit' })}
                  className="bg-white text-purple-600 hover:bg-white/90 h-12 md:h-14 px-8 rounded-2xl font-black text-sm shadow-xl"
                >
                  <Plus size={20} className="mr-2" /> DEPOSITAR
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setModalConfig({ open: true, type: 'withdrawal' })}
                  className="bg-black/20 text-white hover:bg-black/30 h-12 md:h-14 px-8 rounded-2xl font-black text-sm border border-white/10"
                >
                  <ArrowDownLeft size={20} className="mr-2" /> SOLICITAR SAQUE
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Rápidas */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 rounded-3xl border-white/5"
            >
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Desempenho</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Trophy size={20} />
                    </div>
                    <span className="text-xs font-black uppercase text-white/60">Vitórias</span>
                  </div>
                  <span className="text-xl font-black">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                      <Zap size={20} />
                    </div>
                    <span className="text-xs font-black uppercase text-white/60">Participações</span>
                  </div>
                  <span className="text-xl font-black">{history.length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Histórico */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <History className="text-purple-500" /> Histórico de Atividade
            </h2>
          </div>
          
          <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-white/5">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                    <tr>
                      <th className="p-4 md:p-6">Data</th>
                      <th className="p-4 md:p-6">Mesa / Módulo</th>
                      <th className="p-4 md:p-6">Valor</th>
                      <th className="p-4 md:p-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold">
                    {history.map((item) => (
                      <tr key={item.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 md:p-6 text-white/40">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 md:p-6">
                          <div className="flex flex-col">
                            <span className="text-purple-400 font-black">#{item.rooms?.id.slice(0, 8)}</span>
                            <span className="text-[10px] text-white/20 uppercase">{item.rooms?.modules?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 md:p-6 font-black">{item.rooms?.modules?.price.toLocaleString()} Kz</td>
                        <td className="p-4 md:p-6">
                          <span className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] uppercase font-black ${
                            item.rooms?.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 
                            item.rooms?.status === 'finished' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'
                          }`}>
                            {item.rooms?.status === 'open' ? 'Em Aberto' : 'Finalizado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/10">
                  <History size={32} />
                </div>
                <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">Nenhuma atividade registrada ainda.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Wallet;