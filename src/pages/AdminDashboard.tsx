"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Settings, LogOut, RefreshCw, 
  DollarSign, Wallet, ArrowDownLeft, ArrowUpRight,
  ShieldAlert, Activity
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    platformBalance: 0,
    pendingTxs: 0
  });

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
    fetchGlobalStats();

    const channel = supabase.channel('admin-stats-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchGlobalStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchGlobalStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [navigate]);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);

      const { data: txs } = await supabase.from('transactions').select('amount, type, status');
      const { data: platformEarnings } = await supabase.from('winners').select('prize_amount').eq('position', 3);

      if (txs) {
        const deposits = txs.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0);
        const withdrawals = txs.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0);
        const pending = txs.filter(t => t.status === 'pending').length;
        const totalPlatformProfit = platformEarnings?.reduce((acc, curr) => acc + Number(curr.prize_amount), 0) || 0;

        setStats({
          totalDeposits: deposits,
          totalWithdrawals: withdrawals,
          platformBalance: totalPlatformProfit,
          pendingTxs: pending
        });
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchGlobalStats();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans">
      <main className="max-w-[1600px] mx-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Painel Admin</h1>
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Controle Total da Plataforma</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {stats.pendingTxs > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-500 animate-pulse hidden sm:flex">
                <ShieldAlert size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{stats.pendingTxs} Pendentes</span>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={handleGlobalRefresh} 
              className="flex-1 md:flex-none border-white/10 bg-white/5 hover:bg-white/10 h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-black text-xs uppercase tracking-widest border border-red-500/20"
            >
              <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>
        </header>

        {/* Cards de Estatísticas com fontes responsivas para evitar cortes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-purple-500/20 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 text-purple-500/10 group-hover:scale-110 transition-transform">
              <Users size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Jogadores Cadastrados</p>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter break-all">{totalUsers}</p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-green-500/20 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 text-green-500/10 group-hover:scale-110 transition-transform">
              <ArrowDownLeft size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Depósitos</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-green-400 break-all">
              {stats.totalDeposits.toLocaleString()} <span className="text-xs sm:text-sm not-italic opacity-60">Kz</span>
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-amber-500/20 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform">
              <ArrowUpRight size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total Saques</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-amber-500 break-all">
              {stats.totalWithdrawals.toLocaleString()} <span className="text-xs sm:text-sm not-italic opacity-60">Kz</span>
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-blue-500/20 relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition-transform">
              <DollarSign size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Lucro Plataforma</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-blue-400 break-all">
              {stats.platformBalance.toLocaleString()} <span className="text-xs sm:text-sm not-italic opacity-60">Kz</span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="finance" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 w-full md:w-auto overflow-x-auto no-scrollbar">
            <TabsTrigger value="finance" className="flex-1 md:flex-none rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Wallet size={14} className="mr-2" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 md:flex-none rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Users size={14} className="mr-2" /> Jogadores
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-1 md:flex-none rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Settings size={14} className="mr-2" /> Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finance">
            <AdminFinance key={`finance-${refreshKey}`} onUpdate={fetchGlobalStats} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers key={`users-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="system">
            <AdminSystem key={`system-${refreshKey}`} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;