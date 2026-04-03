"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, Lock, User, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/layout/Logo';
import SplashScreen from '@/components/ui/SplashScreen';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const refId = searchParams.get('ref'); 
  const roomId = searchParams.get('room');
  
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error("Número de telefone inválido.");
      return;
    }

    setLoading(true);
    const internalEmail = `${cleanPhone}@bora.com`;

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ 
          email: internalEmail, 
          password 
        });
        if (authError) throw authError;
      } else {
        if (!age || parseInt(age) < 18) throw new Error("Mínimo 18 anos.");
        if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
        if (!acceptTerms) throw new Error("Deves aceitar os termos.");

        // Registo com metadados de referência
        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: { 
              full_name: fullName,
              phone_number: cleanPhone,
              referred_by: refId // ID do padrinho
            }
          }
        });
        
        if (error) throw error;
        
        // Se o registo foi um sucesso, garantimos que o perfil existe
        if (data.user && refId) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: fullName.split(' ')[0],
            referred_by: refId,
            bank_info: bankInfo
          });
        }

        toast.success("Conta criada com sucesso!");
      }
      
      setShowSplash(true);
      setTimeout(() => navigate(roomId ? `/?room=${roomId}` : '/'), 2000);
      
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0B12] flex flex-col items-center justify-start overflow-y-auto pt-20 pb-10 px-4">
      <AnimatePresence>
        {showSplash && <SplashScreen message={isLogin ? "A entrar..." : "A criar conta..."} />}
      </AnimatePresence>

      <Link to="/" className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors z-50 font-bold text-xs uppercase tracking-widest bg-[#0A0B12]/80 backdrop-blur-md px-4 py-2 rounded-full">
        <ArrowLeft size={16} />
        <span>Início</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-lg p-6 md:p-10 rounded-[2.5rem] border-white/5"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          {refId && !isLogin && (
            <div className="mt-2 inline-flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              <ShieldCheck size={12} className="text-purple-400" />
              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Convite Detetado</span>
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Teu nome completo" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Idade</Label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18+" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Teu Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nº Multicaixa Express (Para Saques)</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="Número para receber prémios" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Confirmar Senha</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} className="border-white/20" />
                <label htmlFor="terms" className="text-[10px] font-bold text-white/40 cursor-pointer">Aceito os termos de uso do Bora Sortear</label>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Teu Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tua Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12" required />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full premium-gradient h-14 rounded-2xl font-black text-lg mt-4">
            {loading ? 'A PROCESSAR...' : isLogin ? 'ENTRAR AGORA' : 'FINALIZAR REGISTO'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-white/40 hover:text-purple-400 font-black uppercase tracking-widest">
            {isLogin ? 'Não tens conta? Criar agora' : 'Já tens conta? Entrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;