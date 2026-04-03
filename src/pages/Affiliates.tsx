"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Users, DollarSign, Share2, Trophy, Zap, ShieldCheck, Gift, Megaphone, ArrowRight, Loader2, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import FloatingNav from '@/components/layout/FloatingNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Affiliates = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, totalEarned: 0 });
  const navigate = useNavigate();

  const fetchStats = useCallback(async (userId: string, refCode: string) => {
    try {
      // 1. Contar indicados
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', refCode);

      // 2. Somar ganhos de comissão
      const { data: commissions } = await supabase
        .from('referral_earnings')
        .select('amount')
        .eq('referrer_id', userId);

      setStats({
        count: count || 0,
        totalEarned: commissions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
      });
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
        if (data?.referral_code) {
          fetchStats(session.user.id, data.referral_code);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [fetchStats]);

  const copyLink = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/auth?mode=signup&ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de convite copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
            <Gift size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Programa de Afiliados Elite</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">Ganhe com a Sorte <br /><span className="text-purple-500">dos Teus Amigos</span></h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            Recebe <span className="text-green-400">1.000 Kz de bónus imediato</span> por cada registo e <span className="text-green-400">5% de comissão vitalícia</span> sobre todos os prémios ganhos por eles.
          </p>
        </header>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Teu Dashboard</h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Estatísticas em tempo real</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase mb-1">Total Ganhos</p>
                      <p className="text-2xl font-black text-green-400 italic">{stats.totalEarned.toLocaleString()} Kz</p>
                    </div>
                    <div className="w-px h-10 bg-white/5 mx-2" />
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase mb-1">Rede Ativa</p>
                      <p className="text-2xl font-black text-purple-400 italic">{stats.count} Amigos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0B12]/60 p-6 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                      <Label className="text-[10px] font-black uppercase text-white/40 mb-2 block ml-1">Teu Link de Convite Único</Label>
                      <div className="relative">
                        <Input 
                          readOnly 
                          value={`${window.location.origin}/?ref=${profile?.referral_code}`} 
                          className="bg-white/5 border-white/10 h-14 pr-16 font-bold text-xs text-purple-400 rounded-2xl"
                        />
                        <Button 
                          onClick={copyLink}
                          className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-700 rounded-xl px-4 font-black text-[10px] uppercase"
                        >
                          <Copy size={14} className="mr-2" /> COPIAR
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                    <Zap size={16} />
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">Dica: Partilha no WhatsApp para resultados 3x mais rápidos!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2">
                  <Trophy size={14} /> Ganhos Recentes
                </h4>
                <div className="space-y-4">
                  {stats.totalEarned > 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                        <TrendingUp size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase">Comissão Recebida</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase">Prémio do Afiliado</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[9px] font-black text-white/10 uppercase italic">Aguardando primeiras vitórias...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mb-20">
             <div className="glass-card p-12 rounded-[3rem] border-purple-500/20 text-center">
                <Megaphone size={48} className="mx-auto mb-6 text-purple-500" />
                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Cria a tua rede hoje</h3>
                <p className="text-white/40 font-bold text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                  Faz o login para acederes ao teu link exclusivo e começares a acumular ganhos passivos com a sorte dos teus amigos.
                </p>
                <Button onClick={() => navigate('/auth?mode=signup')} className="h-16 px-10 rounded-2xl premium-gradient font-black text-lg shadow-2xl shadow-purple-500/20">
                  CRIAR CONTA AGORA <ArrowRight size={20} className="ml-2" />
                </Button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
              <Smartphone size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Partilha o Link</h4>
            <p className="text-[10px] font-bold text-white/30 uppercase leading-relaxed">Envia o teu link exclusivo para amigos, grupos de WhatsApp e redes sociais.</p>
          </div>
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Vínculo Automático</h4>
            <p className="text-[10px] font-bold text-white/30 uppercase leading-relaxed">Quando eles se registam, ficam vinculados à tua conta para sempre. Recebes 1.000 Kz na hora!</p>
          </div>
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <DollarSign size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2">Ganhos Vitalícios</h4>
            <p className="text-[10px] font-bold text-white/30 uppercase leading-relaxed">Cada vez que eles ganham um sorteio, recebes 5% do valor total do prémio deles.</p>
          </div>
        </div>
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Affiliates;