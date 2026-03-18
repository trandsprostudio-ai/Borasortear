"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = "933271690Ramos";
    const adminPass = "933271690Ramos";

    if (id === adminId && password === adminPass) {
      localStorage.setItem('admin_session', 'true');
      toast.success("Acesso administrativo concedido!");
      navigate('/admin-dashboard');
    } else {
      toast.error("Credenciais administrativas inválidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0B12]">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl border-purple-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter">PAINEL ADMIN</h1>
          <p className="text-muted-foreground text-sm">Acesso restrito a administradores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-id">ID Admin</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                id="admin-id" 
                value={id} 
                onChange={(e) => setId(e.target.value)}
                className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl" 
                placeholder="Digite seu ID"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                id="admin-pass" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl" 
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button type="submit" className="w-full premium-gradient h-12 rounded-xl font-black text-lg mt-4">
            ENTRAR NO PAINEL
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;