"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  User, Loader2, Trophy, Zap, Share2, Copy, Users, 
  RefreshCw, DollarSign, AlertTriangle, TrendingUp, Wallet
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloatingNav from '@/components/layout/FloatingNav';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
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

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
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
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (data) setProfile(data);

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

  return (
    <div className="min-h-screen bg-[#F9FBFF] text-[#111111] pb-32 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-20 md:pt-28">
        
        {/* Profile Header */}
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 mb-8 md:mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block">
            <Trophy className="w-44 h-44" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 premium-gradient rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl shrink-0">
              <User className="text-white w-12 h-12 md:w-16 md:h-16" />
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-1">{profile?.first_name || 'Jogador'}</h1>
              <p className="text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Membro desde {new Date(profile?.updated_at).toLocaleDateString()}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button onClick={() => loadAllData(true)} variant="outline" className="h-9 md:h-10 rounded-xl border-white/10 bg-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">
                  <RefreshCw size={12} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar
                </Button>
                <Button onClick={() => navigate('/wallet')} className="h-9 md:h-10 rounded-xl premium-gradient text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none px-6">
                  Carteira
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="glass-card p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center relative overflow-hidden">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-green-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 border border-green-500/20 text-green-400">
                <DollarSign className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ganhos Totais Acumulados</p>
              <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                {Number(profile?.total_earnings || 0).toLocaleString()} <span className="text-lg md:text-xl not-italic opacity-40">Kz</span>
              </p>
            </div>

            <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase">Afiliados & Convites</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">Ganha 47% de comissão direta</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-[9px] md:text-[10px] font-black uppercase text-white/40 ml-1">Teu Código Exclusivo</Label>
                  <div className="flex items-center justify-between bg-white/5 p-4 md:p-5 rounded-2xl border-2 border-dashed border-white/10">
                    <span className="text-2xl md:text-3xl font-black tracking-[0.2em] md:tracking-[0.3em] text-white">{profile?.referral_code || '---'}</span>
                    <button onClick={() => copyToClipboard(profile?.referral_code, "Código copiado!")} className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <Copy size={18} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={copyInviteLink} className="flex-1 h-14 rounded-2xl premium-gradient text-white font-black text-[10px] md:text-xs uppercase tracking-widest border-none">
                    <Share2 size={16} className="mr-2" /> PARTILHAR LINK
                  </Button>
                  <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                        <Users size={16} />
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase text-white/40">Total Convidados</span>
                    </div>
                    <span className="text-lg md:text-xl font-black italic">{referralsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
                <h3 className="text-lg font-black italic uppercase">Balanço</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase mb-1">Saldo Real</p>
                  <p className="text-xl md:text-2xl font-black italic text-white">{Number(profile?.balance || 0).toLocaleString()} Kz</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase mb-1">Saldo Bónus</p>
                  <p className="text-xl md:text-2xl font-black italic text-purple-400">{Number(profile?.bonus_balance || 0).toLocaleString()} Kz</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-red-500/5 border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={18} />
                <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500">Zona de Risco</h3>
              </div>
              <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-widest mb-6 leading-relaxed">A eliminação da conta é irreversível e resultará na perda de todos os saldos.</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full h-11 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                    ELIMINAR CONTA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#111827] border-white/10 rounded-[2rem] text-white max-w-[90vw] md:max-w-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg md:text-xl font-black italic uppercase">Eliminar Permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Todos os teus dados e saldos serão removidos.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 flex-row justify-end mt-4">
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-[9px] border-white/10 bg-transparent text-white h-10 md:h-12 px-4">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-red-600 font-black uppercase text-[9px] text-white h-10 md:h-12 px-4">CONFIRMAR</AlertDialogAction>
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