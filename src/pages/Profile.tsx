"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { User, CreditCard, Phone, ShieldCheck, Save, Loader2, Trophy, Zap, Trash2, AlertTriangle, Share2, Copy, Users, CheckCircle2, Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloatingNav from '@/components/layout/FloatingNav';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ count: 0, totalEarned: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
        fetchReferralData(session.user.id);
      } else {
        navigate('/auth?mode=login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const fetchReferralData = async (userId: string) => {
    const [refList, refEarnings] = await Promise.all([
      supabase.from('profiles').select('first_name, created_at').eq('referred_by', userId).order('created_at', { ascending: false }),
      supabase.from('transactions').select('amount').eq('user_id', userId).eq('payment_method', 'Bônus de Indicação').eq('status', 'completed')
    ]);

    if (refList.data) setReferrals(refList.data);
    setReferralStats({
      count: refList.data?.length || 0,
      totalEarned: refEarnings.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bank_info: profile.bank_info,
          express_number: profile.express_number // Novo campo
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth?mode=signup&ref=${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de convite copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] text-center border-white/5">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/20">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.first_name || 'Jogador'}</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">ID: {user?.id.slice(0,8)}</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Trophy size={16} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Vitórias</p>
                  <p className="font-black">0</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Users size={16} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Indicados</p>
                  <p className="font-black">{referralStats.count}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Share2 size={14} /> Link de Convite
              </h4>
              <p className="text-[11px] font-bold text-white/40 mb-4 leading-relaxed">
                Ganhe <span className="text-green-400">5% de bônus</span> sobre todos os prêmios que seus amigos ganharem!
              </p>
              <Button 
                onClick={copyInviteLink}
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest"
              >
                <Copy size={14} className="mr-2" /> COPIAR LINK
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                <ShieldCheck className="text-purple-500" /> Dados da Conta
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Primeiro Nome</Label>
                    <input 
                      value={profile?.first_name || ''} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-2xl h-12 px-4 w-full focus:outline-none focus:border-purple-500/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sobrenome</Label>
                    <input 
                      value={profile?.last_name || ''} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-2xl h-12 px-4 w-full focus:outline-none focus:border-purple-500/50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">IBAN para Saque</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        value={profile?.bank_info || ''} 
                        onChange={(e) => setProfile({...profile, bank_info: e.target.value})}
                        placeholder="AO06..." 
                        className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12 w-full focus:outline-none focus:border-purple-500/50" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Multicaixa Express</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        value={profile?.express_number || ''} 
                        onChange={(e) => setProfile({...profile, express_number: e.target.value})}
                        placeholder="9XXXXXXXX" 
                        className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12 w-full focus:outline-none focus:border-purple-500/50" 
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full premium-gradient h-14 rounded-2xl font-black text-lg"
                >
                  {saving ? <Loader2 className="animate-spin" /> : 'SALVAR ALTERAÇÕES'}
                </Button>
              </form>
            </div>

            {/* Referral List */}
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                  <Users className="text-purple-500" /> Amigos Indicados
                </h3>
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {referrals.length} Total
                </span>
              </div>

              <div className="space-y-3">
                {referrals.length > 0 ? (
                  referrals.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black">
                          {ref.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">@{ref.first_name}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase">Entrou em {new Date(ref.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <CheckCircle2 size={18} className="text-green-500/40" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Users size={32} className="mx-auto mb-4 text-white/5" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Você ainda não indicou ninguém.</p>
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