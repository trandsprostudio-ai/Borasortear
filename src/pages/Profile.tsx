"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { User, Smartphone, ShieldCheck, Loader2, Trophy, Zap, Share2, Copy, Users, CheckCircle2, Star, Award, Medal, RefreshCw, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
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
      
      // 1. Eliminar o registo do perfil (os dados na public schema)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Sign Out
      await supabase.auth.signOut();
      
      toast.success("A tua conta e dados associados foram eliminados com sucesso.");
      navigate('/');
    } catch (err: any) {
      toast.error("Erro ao eliminar conta: " + err.message);
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, message: string) => {
    if (!text) {
      toast.error("Aguarde o carregamento do código...");
      return;
    }
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success(message);
        return;
      }
      
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) toast.success(message);
      else throw new Error("Cópia falhou");
      
    } catch (err) {
      toast.error("Erro ao copiar. Seleciona o código manualmente.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  const rank = referrals.length >= 10 ? { label: 'DIAMANTE', color: 'text-cyan-400', icon: Award } :
               referrals.length >= 5 ? { label: 'OURO', color: 'text-amber-500', icon: Trophy } :
               referrals.length >= 2 ? { label: 'PRATA', color: 'text-slate-300', icon: Medal } :
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
                  <DollarSign size={16} className="text-green-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Comissões</p>
                  <p className="font-black text-xs">{Number(profile?.total_earnings || 0).toLocaleString()} Kz</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Users size={16} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Indicados</p>
                  <p className="font-black">{profile?.referrals_count || 0}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => loadAllData(true)} 
                className="mt-6 w-full text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-white"
              >
                <RefreshCw size={12} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar Dados
              </Button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-purple-500/20 bg-purple-500/5 space-y-4">
              <div>
                <Label className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 block">Teu Código Único</Label>
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 group">
                  <span className="font-black tracking-[0.2em] text-white">
                    {profile?.referral_code || 'CARREGANDO...'}
                  </span>
                  <button 
                    onClick={copyOnlyCode} 
                    disabled={!profile?.referral_code}
                    className="text-white/20 hover:text-purple-400 transition-colors disabled:opacity-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <Button 
                onClick={copyInviteLink} 
                disabled={!profile?.referral_code}
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                <Share2 size={14} className="mr-2" /> COPIAR LINK COMPLETO
              </Button>
            </div>

            {/* Zona de Perigo */}
            <div className="glass-card p-6 rounded-[2rem] border-red-500/20 bg-red-500/5 space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={16} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Zona de Perigo</h3>
              </div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                Esta ação é irreversível. Todos os teus dados e saldo serão perdidos.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Trash2 size={14} className="mr-2" /> ELIMINAR CONTA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-white/10 rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black italic uppercase">Eliminar Conta?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-white/40 font-bold uppercase tracking-widest">
                      Tens a certeza absoluta? Todos os teus prémios, histórico e saldo atual serão permanentemente removidos do nosso sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="rounded-xl bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest"
                    >
                      CONFIRMAR ELIMINAÇÃO
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center justify-center min-h-[400px]">
              <MoneyPenguin />
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