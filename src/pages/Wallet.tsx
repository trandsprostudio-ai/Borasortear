"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, History, Plus, Loader2, Trophy, Zap, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/layout/Footer';

const Wallet = () => {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    <div className="min-h-screen bg-[#0A0B12] text-white">
      <Navbar user={user} />
      
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card de Saldo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card p-8 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <WalletIcon size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Saldo Disponível</p>
              <h1 className="text-5xl font-black text-white mb-8">
                {profile?.balance?.toLocaleString() || '0'} <span className="text-2xl text-purple-400">Kz</span>
              </h1>
              <div className="flex gap-3">
                <Button className="premium-gradient h-12 px-8 rounded-xl font-bold shadow-lg shadow-purple-500/20">
                  <Plus size={20} className="mr-2" /> DEPOSITAR
                </Button>
                <Button variant="outline" className="border-white/10 h-12 px-8 rounded-xl font-bold hover:bg-white/5">
                  SACAR
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card de Stats Rápidas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-3xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                    <Trophy size={20} />
                  </div>
                  <span className="text-sm font-bold">Vitórias</span>
                </div>
                <span className="text-xl font-black">0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                    <Zap size={20} />
                  </div>
                  <span className="text-sm font-bold">Participações</span>
                </div>
                <span className="text-xl font-black">{history.length}</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-white/40 hover:text-white">
              VER RANKING GLOBAL <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </motion.div>
        </div>

        {/* Histórico de Participação */}
        <section>
          <h2 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-2">
            <History className="text-purple-500" />
            HISTÓRICO DE SORTEIOS
          </h2>
          
          <div className="glass-card rounded-3xl overflow-hidden border-white/5">
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-4">Data</th>
                      <th className="p-4">Mesa</th>
                      <th className="p-4">Módulo</th>
                      <th className="p-4">Custo</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {history.map((item) => (
                      <tr key={item.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white/60">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-purple-400">#{item.rooms?.id.slice(0, 8)}</td>
                        <td className="p-4">{item.rooms?.modules?.name}</td>
                        <td className="p-4">{item.rooms?.modules?.price.toLocaleString()} Kz</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black ${
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
                <p className="text-white/20 font-black text-sm uppercase tracking-widest">Nenhuma participação encontrada.</p>
                <Button asChild variant="link" className="text-purple-500 mt-2">
                  <a href="/">Começar a jogar agora</a>
                </Button>
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