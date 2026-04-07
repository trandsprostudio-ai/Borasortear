"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  User, ShieldCheck, Loader2, Trophy, Zap, Share2, Copy, Users, 
  CheckCircle2, Award, Medal, RefreshCw, DollarSign, Trash2, 
  AlertTriangle, Star, Target, TrendingUp, Wallet
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloatingNav from '@/components/layout/FloatingNav';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import MoneyPenguin from '@/components/ui/MoneyPenguin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalPlayed: 0, wins: 0 });
  const navigate = useNavigate();

  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth?mode=login');
        return;
      }

      setUser(session.user);
      
      // Busca perfil e estatísticas básicas
      const [profRes, partRes, winRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        supabase.from('winners').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id)
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
      }
      
      setStats({
        totalPlayed: partRes.count || 0,
        wins: winRes.count || 0
      });

    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (profileError) throw profileError;
      await supabase.auth.signOut();
      toast.success("Conta eliminada com sucesso.");
      navigate('/');
    } catch (err: any) {
      toast.error("Erro ao eliminar conta.");
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      toast.error("Erro ao copiar.");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth?mode=signup&ref=${profile?.referral_code}`;
    copyToClipboard(link, "Link de convite copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" size={40} /></div>;

  const referralsCount = profile?.referrals_count || 0;
  const rankInfo = referralsCount >= 10 ? { label: 'DIAMANTE', color: 'text-cyan-600', icon: Award, next: 0, progress: 100 } :
                   referralsCount >= 5 ? { label: 'OURO', color: 'text-amber-600', icon: Trophy, next: 10, progress: (referralsCount / 10) * 100 } :
                   referralsCount >= 2 ? { label: 'PRATA', color: 'text-slate-500', icon: Medal, next: 5, progress: (referralsCount / 5) * 100 } :
                   { label: 'BRONZE', color: 'text-orange-700', icon: Star, next: 2, progress: (referralsCount / 2) * 100 };

  return (
    <div className="min-h-screen bg-[#F9FBFF] text-[#111111] pb-32">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-28">
        
        {/* Profile Header */}
        <div className="glass-card rounded-[3rem] p-8 md:p-12 border-[#D1D5DB] mb-10 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 hidden md:block">
            <Trophy size={180} className="text-[#111111]" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 premium-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <User size={64} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl border-2 border-[#D1D5DB] shadow-lg">
                <rankInfo.icon size={20} className={rankInfo.color} />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">{profile?.first_name || 'Jogador'}</h1>
                <div className={`px-4 py-1 rounded-full bg-white border-2 border-[#D1D5DB] flex items-center gap-2 ${rankInfo.color} shadow-sm`}>
                  <rankInfo.icon size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{rankInfo.label}</span>
                </div>
              </div>
              <p className="text-[11px] font-bold text-[#555555]/40 uppercase tracking-[0.2em] mb-6">Membro desde {new Date(profile?.updated_at).toLocaleDateString()}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button onClick={() => loadAllData(true)} variant="outline" className="h-10 rounded-xl border-[#D1D5DB] bg-white text-[10px] font-black uppercase tracking-widest hover:bg-[#F3F4F6]">
                  <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar Dados
                </Button>
                <Button asChild className="h-10 rounded-xl premium-gradient text-white text-[10px] font-black uppercase tracking-widest border-none">
                  <a href="/wallet">Ir para Carteira</a>
                </Button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-2 text-right">
              <span className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest">Próximo Nível: {rankInfo.next || '-'} Convites</span>
              <div className="w-48 h-3 bg-[#F3F4F6] rounded-full border border-[#D1D5DB] overflow-hidden p-0.5">
                <div className="h-full premium-gradient rounded-full" style={{ width: `${rankInfo.progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Dashboard Stats */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] bg-white text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100 text-green-600">
                  <DollarSign size={24} />
                </div>
                <p className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest mb-1">Ganhos Totais</p>
                <p className="text-2xl font-black italic text-[#111111]">{Number(profile?.total_earnings || 0).toLocaleString()} Kz</p>
              </div>

              <div className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] bg-white text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 text-blue-600">
                  <Target size={24} />
                </div>
                <p className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest mb-1">Participações</p>
                <p className="text-2xl font-black italic text-[#111111]">{stats.totalPlayed}</p>
              </div>

              <div className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] bg-white text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 text-amber-600">
                  <Trophy size={24} />
                </div>
                <p className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest mb-1">Vitórias</p>
                <p className="text-2xl font-black italic text-[#111111]">{stats.wins}</p>
              </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-10 border-[#D1D5DB] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                <TrendingUp size={100} />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 border border-purple-200">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-[#111111]">Centro de Afiliados</h3>
                  <p className="text-[10px] font-bold text-[#555555]/40 uppercase tracking-widest">Ganha 47% de comissão agora</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-black uppercase text-[#111111]/40 ml-1">Teu Código de Convite</Label>
                  <div className="flex items-center justify-between bg-[#F9FAFB] p-4 rounded-2xl border-2 border-dashed border-[#D1D5DB] group/code">
                    <span className="text-2xl font-black tracking-[0.3em] text-[#111111]">{profile?.referral_code || '---'}</span>
                    <button onClick={() => copyToClipboard(profile?.referral_code, "Código copiado!")} className="p-3 bg-white rounded-xl border border-[#D1D5DB] shadow-sm hover:text-blue-600 transition-colors">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={copyInviteLink} className="flex-1 h-14 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-xl border-none">
                    <Share2 size={16} className="mr-2" /> PARTILHAR LINK
                  </Button>
                  <div className="flex-1 bg-white p-4 rounded-2xl border-2 border-[#D1D5DB] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Users size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#555555]/60">Amigos Convidados</span>
                    </div>
                    <span className="text-lg font-black italic">{referralsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-[#D1D5DB] bg-white">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-amber-500" size={20} />
                <h3 className="text-lg font-black italic uppercase text-[#111111]">Saldos Atuais</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#D1D5DB]">
                  <p className="text-[9px] font-black text-[#555555]/40 uppercase mb-1">Saldo de Jogo</p>
                  <p className="text-2xl font-black italic text-[#111111]">{Number(profile?.balance || 0).toLocaleString()} Kz</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#D1D5DB]">
                  <p className="text-[9px] font-black text-[#555555]/40 uppercase mb-1">Saldo de Bónus</p>
                  <p className="text-2xl font-black italic text-purple-600">{Number(profile?.bonus_balance || 0).toLocaleString()} Kz</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-red-100 bg-red-50">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600" size={18} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600">Configurações Críticas</h3>
              </div>
              <p className="text-[9px] font-bold text-red-600/40 uppercase tracking-widest leading-relaxed mb-6">A eliminação da conta apaga todos os teus prémios acumulados permanentemente.</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full h-12 rounded-xl border border-red-200 text-red-600 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest">
                    <Trash2 size={14} className="mr-2" /> ELIMINAR CONTA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-[#D1D5DB] rounded-[2.5rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black italic uppercase text-[#111111]">Confirmar Eliminação?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-bold text-[#555555] uppercase tracking-widest">Esta ação é irreversível e perderás todo o teu saldo e histórico.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] border-[#D1D5DB]">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] text-white">CONFIRMAR</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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