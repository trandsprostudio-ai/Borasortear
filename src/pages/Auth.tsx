"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Lock, User, ShieldCheck, UserCheck, Smartphone, Gift, Loader2, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/layout/Logo';
import SplashScreen from '@/components/ui/SplashScreen';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ul/dropdown-menu";

const COUNTRIES = [
  { code: '244', name: 'Angola', flag: '🇦🇴', length: 9, placeholder: '9XXXXXXXX' },
  { code: '55', name: 'Brasil', flag: '🇧🇷', length: 11, placeholder: '119XXXXXXXX' },
  { code: '351', name: 'Portugal', flag: '🇵🇹', length: 9, placeholder: '9XXXXXXXX' },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const roomId = searchParams.get('room');
  const urlRef = searchParams.get('ref');
  
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const saved = localStorage.getItem('last_country_code');
    return COUNTRIES.find(c => c.code === saved) || COUNTRIES[0];
  });

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

  const handleCountryChange = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    localStorage.setItem('last_country_code', country.code);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    
    if (cleanPhone.length !== selectedCountry.length) {
      toast.error(`O número deve ter ${selectedCountry.length} dígitos.`);
      return;
    }

    setLoading(true);
    const internalEmail = `${selectedCountry.code}${cleanPhone}@bora.com`;

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
          const { data: refOwner } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', finalRefCode)
            .maybeSingle();
          
          if (!refOwner) {
            setLoading(false);
            toast.error("Código de convite inválido!");
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: { 
              full_name: fullName,
              phone_number: `${selectedCountry.code}${cleanPhone}`,
              country_code: selectedCountry.code,
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

  const inputClasses = "bg-[#1E293B] border-white/10 rounded-2xl text-white font-bold placeholder:text-white/20 autofill:shadow-[0_0_0px_1000px_#1E293B_inset] autofill:text-fill-white transition-all focus:bg-[#2D3748] focus:border-blue-500/50";

  return (
    <div className="min-h-screen w-full bg-[#f8fbff] flex flex-col items-center justify-start overflow-y-auto pt-12 md:pt-20 pb-10 px-4">
      <AnimatePresence>
        {showSplash && <SplashScreen message={isLogin ? "A entrar..." : "A criar conta..."} />}
      </AnimatePresence>

      <Link to="/" className="fixed top-6 left-6 flex items-center gap-2 text-[#111111] hover:text-[#0066FF] transition-colors z-50 font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2.5 rounded-xl border border-[#e0e0e0] shadow-sm">
        <ArrowLeft size={16} />
        <span>Início</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-lg p-6 md:p-10 rounded-[2.5rem] mt-12 md:mt-0"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <Logo className="scale-125" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            {isLogin ? 'Entrar na Conta' : 'Criar Conta Grátis'}
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">
            {isLogin ? 'Bem-vindo de volta, jogador!' : 'Junta-te a milhares de vencedores'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleAuth}>
          {!isLogin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Teu nome completo" className={`${inputClasses} h-14 pl-12`} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Idade</Label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="18+" className={`${inputClasses} h-14 pl-12`} required />
                </div>
              </div>

              {/* Telefone com Seletor Integrado (Cadastro) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Teu Telefone</Label>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="bg-[#1E293B] border border-white/10 rounded-2xl h-14 px-3 flex items-center gap-1 text-white hover:bg-[#2D3748] transition-colors">
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <ChevronDown size={14} className="text-white/40" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#111827] border-white/10 rounded-xl p-1 z-[100]">
                      {COUNTRIES.map(c => (
                        <DropdownMenuItem 
                          key={c.code} 
                          onClick={() => handleCountryChange(c)}
                          className="flex items-center gap-3 p-3 font-black text-[10px] uppercase text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          <span>{c.flag}</span> {c.name} (+{c.code})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder={selectedCountry.placeholder} 
                    className={`${inputClasses} h-14 flex-1`} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Dados Bancários / Express</Label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} placeholder="Número para recebimento de prémios" className={`${inputClasses} h-14 pl-12`} required />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Código de Convite (Opcional)</Label>
                <div className="relative">
                  <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input 
                    value={manualRefCode} 
                    onChange={(e) => setManualRefCode(e.target.value.toUpperCase())} 
                    placeholder="EX: ABC123D" 
                    className={`${inputClasses} h-14 pl-12 uppercase font-black`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClasses} h-14 pl-12`} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Confirmar</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={`${inputClasses} h-14 pl-12`} required />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(c) => setAcceptTerms(c as boolean)} className="border-white/20 data-[state=checked]:bg-[#0066FF]" />
                <label htmlFor="terms" className="text-[10px] font-bold text-white/60 cursor-pointer uppercase tracking-tight">Aceito os termos de uso do Bora Sortear</label>
              </div>
            </div>
          ) : (
            <>
              {/* Telefone com Seletor Integrado (Login) */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Teu Telefone</Label>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="bg-[#1E293B] border border-white/10 rounded-2xl h-16 px-4 flex items-center gap-2 text-white hover:bg-[#2D3748] transition-colors shadow-lg">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-xs font-black text-white/40">+{selectedCountry.code}</span>
                        <ChevronDown size={14} className="text-white/40" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#111827] border-white/10 rounded-xl p-1 z-[100] shadow-2xl">
                      {COUNTRIES.map(c => (
                        <DropdownMenuItem 
                          key={c.code} 
                          onClick={() => handleCountryChange(c)}
                          className="flex items-center gap-3 p-3 font-black text-[10px] uppercase text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                        >
                          <span className="text-lg">{c.flag}</span> {c.name} (+{c.code})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder={selectedCountry.placeholder} 
                    className={`${inputClasses} h-16 flex-1 text-lg pl-6`} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Tua Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClasses} h-16 pl-12 text-lg`} required />
                </div>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full premium-gradient h-16 rounded-2xl font-black text-lg mt-6 text-white border-none shadow-xl shadow-[#0066FF]/20 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : isLogin ? 'ENTRAR AGORA' : 'FINALIZAR REGISTO'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-white/40 hover:text-white font-black uppercase tracking-widest transition-colors">
            {isLogin ? 'Ainda não tens conta? Criar agora' : 'Já tens uma conta? Entrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;