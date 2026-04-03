"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { User, Smartphone, ShieldCheck, Loader2, Trophy, Zap, Share2, Copy, Users, CheckCircle2, Star, Award, Medal, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloatingNav from '@/components/layout/FloatingNav';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ count: 0, totalEarned: 0 });
  const navigate = useNavigate();

  const fetchReferralData = useCallback(async (userId: string) => {
    try {
      // Busca direta na tabela profiles onde referred_by é o ID do usuário atual
      const { data: refList, error: refError } = await supabase
        .from('profiles')
        .select('id, first_name, created_at')
        .eq('referred_by', userId);

      if (refError) throw refError;

      // Busca bónus reais creditados
      const { data: refEarnings } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .ilike('payment_method', '%Indicação%');

      setReferrals(refList || []);
      setReferralStats({
        count: refList?.length || 0,
        totalEarned: refEarnings?.reduce((acc, curr) => acc + Number(acc), 0) || 0
      });
    } catch (err) {
      console.error("Erro ao carregar indicados:", err);
    }
  }, []);

  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      await fetchReferralData(session.user.id);
    } else {
      navigate('/auth?mode=login');
    }
    
    setLoading(false);
    setRefreshing(false);
  }, [navigate, fetchReferralData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth?mode=signup&ref=${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de convite copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const rank = referralStats.count >= 10 ? { label: 'DIAMANTE', color: 'text-cyan-400', icon: Award } :
               referralStats.count >= 5 ? { label: 'OURO', color: 'text-amber-500', icon: Trophy } :
               referralStats.count >= 2 ? { label: 'PRATA', color: 'text-slate-300', icon: Medal } :
               { label: 'BRONZE', color: 'text-orange-600', icon: Star };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] text-center border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <rank.icon size={80} />
              </div>
              
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.first_name || 'Jogador'}</h2>
              <div className={`flex items-center justify-center gap-1.5 mb-6 ${rank.color}`}>
                <rank.icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{rank.label}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Trophy size={16} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Bônus</p>
                  <p className="font-black text-xs">{referralStats.totalEarned.toLocaleString()} Kz</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Users size={16} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Amigos</p>
                  <p className="font-black">{referralStats.count}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => loadAllData(true)} 
                className="mt-6 w-full text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-white"
              >
                <RefreshCw size={12} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar Dados
              </Button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Share2 size={14} /> Link de Convite
              </h4>
              <Button onClick={copyInviteLink} className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest">
                <Copy size={14} className="mr-2" /> COPIAR MEU LINK
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                <Users className="text-purple-500" /> Lista de Convidados ({referrals.length})
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {referrals.length > 0 ? (
                  referrals.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black">
                          {ref.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">@{ref.first_name}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase">Cadastrado via link</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span className="text-[8px] font-black text-green-500 uppercase">Vínculo Ativo</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <Users size={32} className="mx-auto mb-4 text-white/5" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ainda não convidaste nenhum amigo.</p>
                  </div>
                )}
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

export default Profile;