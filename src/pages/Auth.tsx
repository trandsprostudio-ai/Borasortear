"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, Lock, User, ShieldCheck, UserCheck, Smartphone, Gift, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/layout/Logo';
import SplashScreen from '@/components/ui/SplashScreen';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const roomId = searchParams.get('room');
  const urlRef = searchParams.get('ref');
  
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [manualRefCode, setManualRefCode] = useState(urlRef || localStorage.getItem('referral_code') || '');
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

        const finalRefCode = manualRefCode.trim().toUpperCase();

        if (finalRefCode) {
          const { data: refOwner, error: refError } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', finalRefCode)
            .maybeSingle();
          
          if (refError) throw refError;
          if (!refOwner) {
            setLoading(false);
            toast.error("Código de convite inválido ou inexistente!");
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: { 
              full_name: fullName,
              phone_number: cleanPhone,
              referred_by: finalRefCode || null
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          localStorage.removeItem('referral_code');
          await supabase.from('profiles').update({
            bank_info: bankInfo
          }).eq('id', data.user.id);
        }

        toast.success("Conta criada com sucesso!");
      }
      
      setShowSplash(true);
      setTimeout(() => navigate(roomId ? `/?room=${roomId}` : '/'), 2000);
      
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Erro ao processar pedido.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fbff] flex flex-col items-center justify-start overflow-y-auto pt-20 pb-10 px-4">
      <AnimatePresence>
        {showSplash && <SplashScreen message={isLogin ? "A entrar..." : "A criar conta..."} />}
      </AnimatePresence>

      <Link to="/" className="fixed top-8 left-8 flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors z-50 font-bold text-xs uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#e0e0e0] shadow-sm">
        <ArrowLeft size={16} />
        <span>Início</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-lg p-6 md:p-10 rounded-[2.5rem]"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-[#111111] uppercase">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Teu nome completo" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Idade</Label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18+" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Teu Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Nº Multicaixa Express (Para Saques)</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="Número para receber prémios" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40">Código de Convite (Opcional)</Label>
                  <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Bónus de 200 Kz</span>
                </div>
                <div className="relative">
                  <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input 
                    value={manualRefCode} 
                    onChange={(e) => setManualRefCode(e.target.value.toUpperCase())} 
                    placeholder="EX: ABC123D" 
                    className="bg-[#f5f5f5] border-[#e0e0e0] h-12 pl-12 uppercase font-black text-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Confirmar Senha</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-12 pl-12 text-[#111111]" required />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} className="border-[#e0e0e0]" />
                <label htmlFor="terms" className="text-[10px] font-bold text-[#555555] cursor-pointer">Aceito os termos de uso do Bora Sortear</label>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Teu Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XXXXXXXX" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-14 pl-12 text-[#111111]" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#555555]/40 ml-1">Tua Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#f5f5f5] border-[#e0e0e0] rounded-2xl h-14 pl-12 text-[#111111]" required />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full premium-gradient h-14 rounded-2xl font-black text-lg mt-4 text-white border-none shadow-lg">
            {loading ? <Loader2 className="animate-spin" /> : isLogin ? 'ENTRAR AGORA' : 'FINALIZAR REGISTO'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-[#555555] hover:text-blue-600 font-black uppercase tracking-widest">
            {isLogin ? 'Não tens conta? Criar agora' : 'Já tens conta? Entrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;