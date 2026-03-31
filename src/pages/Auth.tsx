"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, Lock, User, CreditCard, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
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
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: internalEmail, password });
        if (authError) throw authError;

        const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', authData.user.id).single();
        if (profile?.is_banned) {
          await supabase.auth.signOut();
          toast.error("Esta conta foi banida permanentemente.");
          setLoading(false);
          return;
        }
      } else {
        if (!age || parseInt(age) < 18) throw new Error("Mínimo 18 anos.");
        if (password !== confirmPassword) throw new Error("Senhas diferentes.");
        if (!acceptTerms) throw new Error("Aceite os termos.");

        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: { 
              full_name: fullName,
              phone_number: cleanPhone,
              express_number: bankInfo
            }
          }
        });
        
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({ 
            id: data.user.id,
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' '),
            balance: 0,
            referred_by: refId || null,
            express_number: bankInfo
          });
        }
      }
      
      setShowSplash(true);
      setTimeout(() => navigate(roomId ? `/?room=${roomId}` : '/'), 2000);
      
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0B12] relative overflow-hidden">
      <AnimatePresence>
        {showSplash && <SplashScreen message={isLogin ? "Entrando..." : "Criando Conta..."} />}
      </AnimatePresence>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors z-10 font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={16} />
        <span>Início</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-lg p-8 rounded-[2.5rem] relative z-10 border-white/5 my-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            {isLogin ? 'Acessar' : 'Cadastro'}
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Idade</Label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18+" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required min="18" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Número Multicaixa Express</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="Para receber prêmios" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Confirmar</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 rounded-2xl h-12 pl-12" required />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} className="border-white/20" />
                <label htmlFor="terms" className="text-[10px] font-bold text-white/40 cursor-pointer">Aceito os termos do BORA SORTEIAR</label>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12" required />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full premium-gradient h-14 rounded-2xl font-black text-lg mt-4">
            {loading ? 'CARREGANDO...' : isLogin ? 'ENTRAR' : 'CADASTRAR'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-white/40 hover:text-purple-400 font-black uppercase tracking-widest">
            {isLogin ? 'Criar conta' : 'Já tenho conta'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;