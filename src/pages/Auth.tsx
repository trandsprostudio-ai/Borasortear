"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, ArrowLeft, Loader2, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/layout/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Adiciona o código de Angola se não tiver
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
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0B12]">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 premium-gradient" />
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isLogin ? 'Acesse sua carteira com seu número' : 'Cadastre seu número para começar'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome" 
                className="bg-white/5 border-white/10 rounded-xl h-12" 
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9XX XXX XXX" 
                className="bg-white/5 border-white/10 rounded-xl h-12 pl-10" 
                required
              />
            </div>
            <p className="text-[10px] text-white/40">Ex: 923 000 000 (Angola +244)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="bg-white/5 border-white/10 rounded-xl h-12" 
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full premium-gradient h-12 rounded-xl font-bold text-lg mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              isLogin ? (
                <><LogIn size={20} className="mr-2" /> Entrar</>
              ) : (
                <><UserPlus size={20} className="mr-2" /> Cadastrar</>
              )
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;