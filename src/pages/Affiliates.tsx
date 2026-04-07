"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Users, Share2, Trophy, Zap, Gift, Megaphone, ArrowRight, Loader2, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
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
  const [refCount, setRefCount] = useState(0);
  const navigate = useNavigate();

  const fetchStats = useCallback(async (refCode: string) => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', refCode);

      setRefCount(count || 0);
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
            fetchStats(data.referral_code);
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
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-6 shadow-sm">
            <Gift size={14} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Afiliados VIP</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 leading-none text-[#111111]">
            Ganha com a <br /><span className="blue-gradient-text">Tua Rede</span>
          </h1>
          <p className="text-[#555555]/60 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
            Recebe 500 Kz de bónus por cada amigo e uma <span className="text-blue-600">comissão de 47%</span> no primeiro depósito deles.
          </p>
        </header>

        {user ? (
          <div className="space-y-8">
            <div className="glass-card p-10 md:p-14 rounded-[3rem] border-[#D1D5DB] bg-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                 <Users size={200} className="text-[#111111]" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Estado da Rede</h3>
                    <p className="text-[10px] font-bold text-[#555555]/40 uppercase tracking-widest">Acompanha o teu crescimento</p>
                  </div>
                  
                  <div className="bg-blue-600 px-10 py-6 rounded-[2rem] text-center shadow-xl shadow-blue-600/20 border border-blue-400/30">
                    <p className="text-[9px] font-black text-white/50 uppercase mb-1 tracking-widest">Amigos Convidados</p>
                    <p className="text-4xl font-black text-white italic tracking-tighter">{refCount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-[#555555]/60 ml-1 tracking-widest">Teu Link de Convite Único</Label>
                  <div className="relative group">
                    <Input 
                      readOnly 
                      value={`${window.location.origin}/auth?mode=signup&ref=${profile?.referral_code || ''}`} 
                      className="bg-[#F3F4F6] border-[#D1D5DB] h-16 pr-20 font-bold text-xs text-blue-600 rounded-2xl shadow-inner focus:ring-0"
                    />
                    <Button 
                      onClick={copyLink}
                      className="absolute right-2 top-2 bottom-2 premium-gradient text-white rounded-xl px-6 font-black text-[10px] uppercase shadow-lg hover:scale-[1.02] transition-all"
                    >
                      <Copy size={14} className="mr-2" /> COPIAR
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#F9FAFB] p-8 rounded-[2.5rem] border border-[#E5E7EB] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm border border-green-200">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Super Comissão</p>
                    <p className="text-sm font-black italic uppercase">47% no 1º Depósito</p>
                  </div>
               </div>
               <div className="bg-[#F9FAFB] p-8 rounded-[2.5rem] border border-[#E5E7EB] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Bónus Direto</p>
                    <p className="text-sm font-black italic uppercase">500 Kz por Registo</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center bg-[#F9FAFB] p-16 rounded-[4rem] border border-[#E5E7EB] shadow-inner">
             <Megaphone size={56} className="mx-auto mb-8 text-blue-600 opacity-20" />
             <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Faz parte do Elite</h3>
             <p className="text-[#555555]/60 font-bold text-xs mb-10 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
               Regista-te agora para obteres o teu link e começares a construir a tua rede.
             </p>
             <Button onClick={() => navigate('/auth?mode=signup')} className="h-16 px-12 rounded-2xl premium-gradient text-white font-black text-lg shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
               CRIAR CONTA AGORA <ArrowRight size={20} className="ml-2" />
             </Button>
          </div>
        )}
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Affiliates;