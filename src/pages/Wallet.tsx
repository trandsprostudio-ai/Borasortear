"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, History, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Wallet = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    };
    getSession();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Navbar user={user} />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-muted-foreground mb-1">Saldo Disponível</p>
              <h1 className="text-5xl font-black text-white">
                {profile?.balance?.toLocaleString() || '0'} <span className="text-2xl text-purple-400">Kz</span>
              </h1>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button className="flex-1 md:flex-none premium-gradient h-14 px-8 rounded-2xl font-bold">
                <Plus size={20} className="mr-2" /> Depositar
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none border-white/10 h-14 px-8 rounded-2xl font-bold hover:bg-white/5">
                Sacar
              </Button>
            </div>
          </div>
        </motion.div>

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History className="text-purple-500" />
            Histórico de Atividades
          </h2>
          
          <div className="py-20 text-center glass-card rounded-3xl border-dashed border-white/10">
            <p className="text-white/40 font-black text-sm uppercase tracking-widest">Nenhuma transação encontrada.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallet;