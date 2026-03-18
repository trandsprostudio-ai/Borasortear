"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { User, CreditCard, Phone, ShieldCheck, Save, Loader2, Trophy, Zap, Trash2, AlertTriangle, Share2, Copy } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      } else {
        navigate('/auth?mode=login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bank_info: profile.bank_info
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
    toast.success("Link de convite copiado! Ganhe 5% de bônus.");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (profileError) throw profileError;
      await supabase.auth.signOut();
      toast.success("Conta excluída permanentemente.");
      navigate('/');
    } catch (error: any) {
      toast.error("Erro ao excluir conta: " + error.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar user={user} />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] text-center border-white/5">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/20">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.first_name || 'Jogador'}</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Membro desde {new Date(user?.created_at).getFullYear()}</p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Trophy size={16} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Vitórias</p>
                  <p className="font-black">0</p>
                </div>
              </div>
            </div>

            {/* Referral Card */}
            <div className="glass-card p-6 rounded-[2rem] border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Share2 size={14} /> Programa de Bônus
              </h4>
              <p className="text-[11px] font-bold text-white/40 mb-4 leading-relaxed">
                Convide amigos e ganhe <span className="text-green-400">5% de bônus</span> sobre todos os prêmios que eles ganharem!
              </p>
              <Button 
                onClick={copyInviteLink}
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 font-black text-[10px] uppercase tracking-widest"
              >
                <Copy size={14} className="mr-2" /> COPIAR MEU LINK
              </Button>
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-red-500/10 bg-red-500/5">
              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Zona de Perigo
              </h4>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-widest">
                    <Trash2 size={16} className="mr-2" /> APAGAR MINHA CONTA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-white/10 rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black italic tracking-tighter text-red-500">EXCLUIR TUDO DEFINITIVAMENTE?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/40 font-bold">
                      Esta ação é irreversível. Seu saldo e histórico serão apagados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-white/10 bg-transparent font-bold">CANCELAR</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="rounded-xl bg-red-500 font-black">SIM, APAGAR</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex-1">
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

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Telefone (Não editável)</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                    <input 
                      value={user?.email?.split('@')[0] || ''} 
                      disabled 
                      className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12 w-full opacity-50 cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Dados para Saque (IBAN / Conta)</Label>
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

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full premium-gradient h-14 rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> SALVAR ALTERAÇÕES</>}
                </Button>
              </form>
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