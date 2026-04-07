"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Users, DollarSign, Share2, Trophy, Zap, ShieldCheck, Gift, Megaphone, ArrowRight, Loader2, Copy, CheckCircle2, TrendingUp, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import FloatingNav from '@/components/layout/FloatingNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Affiliates = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, totalEarned: 0 });
  const navigate = useNavigate();

  const fetchStats = useCallback(async (userId: string, refCode: string) => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', refCode);

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
        if (data) {
          setProfile(data);
          if (data.referral_code) {
            fetchStats(session.user.id, data.referral_code);
          }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" size={40} /></div>;

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-32">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-6 shadow-sm">
            <Gift size={14} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Programa de Afiliados VIP</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none text-[#111111]">Ganha com a <br /><span className="text-blue-600">Tua Rede</span></h1>
          <p className="text-[#555555]/60 font-bold text-[10px] uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            Recebe <span className="text-green-600">500 Kz de bónus</span> por cada amigo e uma <span className="text-green-600">super comissão de 47%</span> no primeiro depósito.
          </p>
        </header>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border-[#D1D5DB] bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Users size={120} className="text-[#111111]" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-[#111111]">Teus Rendimentos</h3>
                    <p className="text-[10px] font-bold text-[#555555]/40 uppercase tracking-widest">Atualizado em tempo real</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-[#555555]/40 uppercase mb-1">Total Ganho</p>
                      <p className="text-2xl font-black text-green-600 italic">{stats.totalEarned.toLocaleString()} Kz</p>
                    </div>
                    <div className="w-px h-10 bg-[#D1D5DB] mx-2" />
                    <div className="text-right">
                      <p className="text-[8px] font-black text-[#555555]/40 uppercase mb-1">Referenciados</p>
                      <p className="text-2xl font-black text-blue-600 italic">{stats.count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F3F4F6] p-6 rounded-3xl border border-[#D1D5DB] space-y-6 relative z-10">
                  <div className="flex flex-col items-start gap-4">
                    <Label className="text-[10px] font-black uppercase text-[#555555]/60 mb-1 ml-1">Teu Link de Convite</Label>
                    <div className="relative w-full">
                      <Input 
                        readOnly 
                        value={`${window.location.origin}/auth?mode=signup&ref=${profile?.referral_code || ''}`} 
                        className="bg-white border-[#D1D5DB] h-14 pr-16 font-bold text-xs text-blue-600 rounded-2xl shadow-sm"
                      />
                      <Button 
                        onClick={copyLink}
                        className="absolute right-2 top-2 bottom-2 premium-gradient text-white rounded-xl px-4 font-black text-[10px] uppercase shadow-md"
                      >
                        <Copy size={14} className="mr-2" /> COPIAR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-8 rounded-[2.5rem] border-[#D1D5DB]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
                  <Trophy size={14} /> Benefícios VIP
                </h4>
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <Zap size={12} />
                      </div>
                      <p className="text-[10px] font-bold text-[#555555]/80 uppercase leading-tight">Comissão de 47% no 1º depósito</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Gift size={12} />
                      </div>
                      <p className="text-[10px] font-bold text-[#555555]/80 uppercase leading-tight">500 Kz de bónus instantâneo</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mb-20">
             <div className="glass-card p-12 rounded-[3rem] border-[#D1D5DB] text-center bg-white shadow-2xl">
                <Megaphone size={48} className="mx-auto mb-6 text-blue-600" />
                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Torna-te um Parceiro</h3>
                <p className="text-[#555555]/60 font-bold text-sm mb-8 max-w-lg mx-auto leading-relaxed uppercase">
                  Regista-te para obteres o teu link e começares a faturar comissões reais hoje mesmo.
                </p>
                <Button onClick={() => navigate('/auth?mode=signup')} className="h-16 px-10 rounded-2xl premium-gradient text-white font-black text-lg shadow-2xl shadow-blue-600/20">
                  CRIAR CONTA DE AFILIADO <ArrowRight size={20} className="ml-2" />
                </Button>
             </div>
          </div>
        )}
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Affiliates;