"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { User, CreditCard, Phone, ShieldCheck, Save, Loader2, Trophy, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bank_info: profile.bank_info // Assumindo que adicionamos esta coluna no banco
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0B12]"><Loader2 className="animate-spin text-purple-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar user={user} />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Stats */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] text-center border-white/5">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/20">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.first_name || 'Jogador'}</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Membro desde {new Date(user?.created_at).getFullYear()}</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Trophy size={16} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Vitórias</p>
                  <p className="font-black">0</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <Zap size={16} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white/20 uppercase">Nível</p>
                  <p className="font-black">1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div className="flex-1">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                <ShieldCheck className="text-purple-500" /> Dados da Conta
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Primeiro Nome</Label>
                    <Input 
                      value={profile?.first_name || ''} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-2xl h-12" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sobrenome</Label>
                    <Input 
                      value={profile?.last_name || ''} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-2xl h-12" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Telefone (Não editável)</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                    <Input 
                      value={user?.email?.split('@')[0] || ''} 
                      disabled 
                      className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12 opacity-50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Dados para Saque (IBAN / Conta)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <Input 
                      value={profile?.bank_info || ''} 
                      onChange={(e) => setProfile({...profile, bank_info: e.target.value})}
                      placeholder="AO06..." 
                      className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" 
                    />
                  </div>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Certifique-se de que os dados estão corretos para evitar atrasos nos pagamentos.</p>
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

      <MobileNav />
      <Footer />
    </div>
  );
};

export default Profile;