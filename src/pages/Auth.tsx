"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, ArrowLeft, Phone, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/layout/Logo';
import SplashScreen from '@/components/ui/SplashScreen';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 0 && !numbers.startsWith('244')) {
      return '+244' + numbers;
    }
    return numbers.startsWith('244') ? '+' + numbers : numbers;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formattedPhone = phone.startsWith('+') ? phone : formatPhone(phone);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          phone: formattedPhone, 
          password 
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      } else {
        const { error } = await supabase.auth.signUp({
          phone: formattedPhone,
          password,
          options: {
            data: { 
              first_name: name, 
              balance: 0 
            }
          }
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
      
      // Pequeno delay para o splash screen ser apreciado
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "Erro na autenticação");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0B12] relative overflow-hidden">
      <AnimatePresence>
        {loading && <SplashScreen message={isLogin ? "Acessando sua conta..." : "Criando seu perfil..."} />}
      </AnimatePresence>

      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors z-10 font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={16} />
        <span>Voltar ao Início</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 rounded-[2.5rem] relative z-10 border-white/5"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <Logo className="scale-125" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            {isLogin ? 'ENTRAR NA CONTA' : 'CRIAR NOVA CONTA'}
          </h1>
          <p className="text-white/40 mt-2 text-xs font-bold uppercase tracking-widest">
            {isLogin ? 'Acesse sua carteira e mesas' : 'Comece a ganhar prêmios hoje'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como quer ser chamado?" 
                  className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 focus:border-purple-500/50 transition-all" 
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Número de Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9XX XXX XXX" 
                className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 focus:border-purple-500/50 transition-all" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Senha de Acesso</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 focus:border-purple-500/50 transition-all" 
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full premium-gradient h-14 rounded-2xl font-black text-lg mt-6 shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isLogin ? 'ACESSAR DASHBOARD' : 'FINALIZAR CADASTRO'}
          </Button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-white/40 hover:text-purple-400 font-black uppercase tracking-widest transition-colors"
          >
            {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já possui uma conta? Faça Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;