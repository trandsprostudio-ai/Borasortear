"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Users, DollarSign, Share2, Copy, Trophy, Star, ArrowUpRight, ShieldCheck, Zap, Gift, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Footer from '@/components/layout/Footer';
import FloatingNav from '@/components/layout/FloatingNav';

const Affiliates = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ count: 0, totalEarned: 0 });
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchData(session.user.id);
      }
    };
    checkAuth();
  }, []);

  const fetchData = async (userId: string) => {
    const [refList, refEarnings] = await Promise.all([
      supabase.from('profiles').select('first_name, created_at').eq('referred_by', userId).order('created_at', { ascending: false }),
      supabase.from('transactions').select('amount').eq('user_id', userId).eq('payment_method', 'Bônus de Indicação').eq('status', 'completed')
    ]);

    if (refList.data) setReferrals(refList.data);
    setStats({
      count: refList.data?.length || 0,
      totalEarned: refEarnings.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    });
    setLoading(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/auth?mode=signup&ref=${user?.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de afiliado copiado!");
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
            <Gift size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Programa de Afiliados Elite</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">Ganhe com a Sorte dos Outros</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest max-w-2xl mx-auto">
            Convide seus amigos para o BORA SORTEIAR e receba <span className="text-green-400">5% de comissão vitalícia</span> sobre cada prêmio que eles ganharem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Megaphone size={120} />
              </div>
              
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-8">Seu Link de Divulgação</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl h-16 flex items-center px-6 font-bold text-white/40 overflow-hidden">
                  <span className="truncate">{window.location.origin}/auth?ref={user?.id?.slice(0,8)}...</span>
                </div>
                <Button onClick={copyLink} className="h-16 px-10 rounded-2xl premium-gradient font-black text-lg shadow-2xl shadow-purple-500/20">
                  <Copy size={20} className="mr-2" /> COPIAR LINK
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Indicados</p>
                  <p className="text-3xl font-black italic">{stats.count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Comissões Recebidas</p>
                  <p className="text-3xl font-black italic text-green-400">{stats.totalEarned.toLocaleString()} <span className="text-xs opacity-60">Kz</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nível de Parceiro</p>
                  <p className="text-3xl font-black italic text-purple-400">BRONZE</p>
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                <Users className="text-purple-500" /> Seus Indicados Recentes
              </h3>
              <div className="space-y-3">
                {referrals.length > 0 ? referrals.map((ref, i) => (
                  <div key={i} className="glass-card p-5 rounded-2xl border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 font-black">
                        {ref.first_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase">@{ref.first_name}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase">Cadastrado em {new Date(ref.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase">Ativo</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Nenhum indicado ainda. Comece a partilhar!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-6">Como Funciona?</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 font-black text-xs">1</div>
                  <p className="text-xs font-bold text-white/40 leading-relaxed">Partilhe seu link exclusivo com amigos, grupos de WhatsApp ou redes sociais.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 font-black text-xs">2</div>
                  <p className="text-xs font-bold text-white/40 leading-relaxed">Quando eles ganharem qualquer prêmio em qualquer mesa, você recebe 5% do valor na hora.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 font-black text-xs">3</div>
                  <p className="text-xs font-bold text-white/40 leading-relaxed">O bônus cai direto no seu saldo disponível para jogar ou sacar.</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5">
              <Star className="text-amber-500 mb-4" size={32} />
              <h4 className="text-lg font-black italic tracking-tighter uppercase mb-2">Meta de Parceiro</h4>
              <p className="text-xs font-bold text-white/40 mb-6">Indique 50 amigos ativos para subir para o nível <span className="text-amber-500">PRATA</span> e ganhar bônus extras semanais.</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Progresso</span>
                  <span>{stats.count}/50</span>
                </div>
                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(stats.count / 50) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Affiliates;