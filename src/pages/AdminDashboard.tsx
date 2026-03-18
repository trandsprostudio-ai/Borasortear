"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Settings, LogOut, RefreshCw, 
  DollarSign, TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from '@/components/admin/AdminUsers';
import AdminSystem from '@/components/admin/AdminSystem';
import AdminFinance from '@/components/admin/AdminFinance';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    platformBalance: 0
  });

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
    fetchGlobalStats();
  }, [navigate]);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);

      const { data: txs } = await supabase.from('transactions').select('amount, type, status');
      if (txs) {
        const deposits = txs.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0);
        const withdrawals = txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0);
        setStats({
          totalDeposits: deposits,
          totalWithdrawals: withdrawals,
          platformBalance: deposits - withdrawals
        });
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0F111A] p-8 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-black italic tracking-tighter leading-none">ADMIN</h2>
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Bora Sorteiar</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Menu Principal</p>
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl bg-white/5 text-white border border-white/5">
            <LayoutDashboard size={18} className="text-purple-500" /> Dashboard
          </Button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full justify-start gap-4 h-12 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <LogOut size={18} /> Terminar Sessão
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Centro de Comando</h1>
            <p className="text-white/40 text-sm font-bold">Gestão em tempo real de ativos e jogadores.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchGlobalStats} 
            className="border-white/10 bg-white/5 hover:bg-white/10 h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-3xl border-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-purple-500/10 group-hover:scale-110 transition-transform">
              <Users size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Jogadores</p>
            <p className="text-4xl font-black italic">{totalUsers}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-400">
              <TrendingUp size={12} /> +12% este mês
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border-green-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-green-500/10 group-hover:scale-110 transition-transform">
              <ArrowDownLeft size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Depósitos</p>
            <p className="text-4xl font-black italic text-green-400">{stats.totalDeposits.toLocaleString()} <span className="text-xs not-italic opacity-60">Kz</span></p>
          </div>

          <div className="glass-card p-6 rounded-3xl border-amber-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform">
              <ArrowUpRight size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Saques</p>
            <p className="text-4xl font-black italic text-amber-500">{stats.totalWithdrawals.toLocaleString()} <span className="text-xs not-italic opacity-60">Kz</span></p>
          </div>

          <div className="glass-card p-6 rounded-3xl border-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition-transform">
              <DollarSign size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Balanço Plataforma</p>
            <p className="text-4xl font-black italic text-blue-400">{stats.platformBalance.toLocaleString()} <span className="text-xs not-italic opacity-60">Kz</span></p>
          </div>
        </div>

        <Tabs defaultValue="finance" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14">
            <TabsTrigger value="finance" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Wallet size={14} className="mr-2" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Users size={14} className="mr-2" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Settings size={14} className="mr-2" /> Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <AdminFinance onUpdate={fetchGlobalStats} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="system">
            <AdminSystem />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;