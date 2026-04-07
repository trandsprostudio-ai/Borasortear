"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { User, ShieldCheck, Loader2, Trophy, Zap, Share2, Copy, Users, CheckCircle2, Award, Medal, RefreshCw, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
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

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchReferralData = useCallback(async (myCode: string) => {
    try {
      const { data: refList, error: refError } = await supabase
        .from('profiles')
        .select('id, first_name, created_at')
        .eq('referred_by', myCode);

      if (refError) throw refError;
      setReferrals(refList || []);
    } catch (err) {
      console.error("Erro ao carregar indicados:", err);
    }
  }, []);

  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth?mode=login');
        return;
      }

      setUser(session.user);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        if (data.referral_code) {
          await fetchReferralData(data.referral_code);
        }
      } else {
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: createdProfile } = await supabase.from('profiles').upsert({
          id: session.user.id,
          first_name: session.user.user_metadata?.full_name?.split(' ')[0] || 'Jogador',
          referral_code: newCode,
          balance: 0
        }).select().single();
        
        if (createdProfile) setProfile(createdProfile);
      }
    } catch (err) {
      console.error("Erro fatal ao carregar perfil:", err);
      toast.error("Erro ao carregar teus dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, fetchReferralData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;
      await supabase.auth.signOut();
      toast.success("Conta eliminada com sucesso.");
      navigate('/');
    } catch (err: any) {
      toast.error("Erro ao eliminar conta: " + err.message);
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, message: string) => {
    if (!text) {
      toast.error("Aguarde o carregamento...");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      toast.error("Erro ao copiar.");
    }
  };

  const copyInviteLink = () => {
    const code = profile?.referral_code;
    if (!code) return;
    const link = `${window.location.origin}/auth?mode=signup&ref=${code}`;
    copyToClipboard(link, "Link de convite copiado!");
  };

  const copyOnlyCode = () => {
    const code = profile?.referral_code;
    if (!code) return;
    copyToClipboard(code, "Código de afiliado copiado!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black" size={40} /></div>;

  const rank = referrals.length >= 10 ? { label: 'DIAMANTE', color: 'text-cyan-600', icon: Award } :
               referrals.length >= 5 ? { label: 'OURO', color: 'text-amber-600', icon: Trophy } :
               referrals.length >= 2 ? { label: 'PRATA', color: 'text-slate-500', icon: Medal } :
               { label: 'BRONZE', color: 'text-orange-700', icon: Award };

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-32">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] text-center border-[#D1D5DB] relative overflow-hidden bg-[#F9FAFB]">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <rank.icon size={80} className="text-[#111111]" />
              </div>
              
              <div className="w-24 h-24 premium-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <User size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#111111]">{profile?.first_name || 'Jogador'}</h2>
              <div className={`flex items-center justify-center gap-1.5 mb-6 ${rank.color}`}>
                <rank.icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{rank.label}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-2xl border border-[#D1D5DB] shadow-sm">
                  <DollarSign size={16} className="text-green-600 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-[#555555]/40 uppercase tracking-widest">Ganhos</p>
                  <p className="font-black text-xs text-[#111111]">{Number(profile?.total_earnings || 0).toLocaleString()} Kz</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#D1D5DB] shadow-sm">
                  <Users size={16} className="text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-[#555555]/40 uppercase tracking-widest">Amigos</p>
                  <p className="font-black text-[#111111]">{profile?.referrals_count || 0}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => loadAllData(true)} 
                className="mt-6 w-full text-[9px] font-black uppercase tracking-widest text-[#555555]/40 hover:text-blue-600"
              >
                <RefreshCw size={12} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar
              </Button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-[#D1D5DB] space-y-4">
              <div>
                <Label className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 block ml-1">Código de Afiliado</Label>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#D1D5DB] group">
                  <span className="font-black tracking-[0.2em] text-[#111111]">
                    {profile?.referral_code || 'CARREGANDO...'}
                  </span>
                  <button 
                    onClick={copyOnlyCode} 
                    className="text-[#111111]/20 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <Button 
                onClick={copyInviteLink} 
                className="w-full h-12 rounded-xl premium-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                <Share2 size={14} className="mr-2" /> LINK DE CONVITE
              </Button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-red-100 bg-red-50 space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Zona de Perigo</h3>
              </div>
              <p className="text-[9px] font-bold text-red-600/60 uppercase tracking-widest leading-relaxed">
                Esta ação é irreversível. Perderás todos os teus dados e saldos.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl border border-red-200 text-red-600 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Trash2 size={14} className="mr-2" /> ELIMINAR MINHA CONTA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-[#D1D5DB] rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black italic uppercase text-[#111111]">Tens a certeza?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-bold text-[#555555] uppercase tracking-widest">
                      Esta ação não pode ser desfeita. Todos os teus prémios e histórico serão permanentemente removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] border-[#D1D5DB]">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="rounded-xl bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] text-white"
                    >
                      CONFIRMAR ELIMINAÇÃO
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-[#D1D5DB] flex flex-col items-center justify-center min-h-[400px]">
              <MoneyPenguin />
              <div className="mt-8 text-center max-w-sm">
                <h3 className="text-xl font-black italic uppercase text-[#111111]">Gestão Premium</h3>
                <p className="text-[10px] font-bold text-[#555555]/60 uppercase tracking-[0.2em] mt-2">
                  A tua conta Bora Sortear é protegida por criptografia de ponta a ponta.
                </p>
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