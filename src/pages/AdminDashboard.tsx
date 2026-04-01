"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Settings, LogOut, RefreshCw, 
  DollarSign, Wallet, ArrowDownLeft, ArrowUpRight,
  ShieldAlert, Activity, Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from '@/components/admin/AdminUsers';
import AdminSystem from '@/components/admin/AdminSystem';
import AdminFinance from '@/components/admin/AdminFinance';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/ui/SplashScreen';
import { toast } from 'sonner';
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    platformBalance: 0,
    pendingTxs: 0
  });

  // Estado para controle do modal Premium de confirmação
  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false, type: null });

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
      return;
    }
    
    const timer = setTimeout(() => {
      setShowInitialSplash(false);
    }, 2000);

    fetchGlobalStats();
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);

      const { data: txs } = await supabase.from('transactions').select('amount, type, status');
      const { data: platformEarnings } = await supabase
        .from('winners')
        .select('prize_amount')
        .is('user_id', null);

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

  const handleClearHistory = async () => {
    const { type } = confirmConfig;
    const label = type === 'deposit' ? 'DEPÓSITOS' : 'SAQUES';

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('type', type)
        .eq('status', 'completed');

      if (error) throw error;
      
      toast.success(`Histórico de ${label} limpo com sucesso!`);
      setConfirmConfig({ isOpen: false });
      fetchGlobalStats();
    } catch (err: any) {
      toast.error("Erro ao limpar dados da plataforma.");
    }
  };

  const handleGlobalRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchGlobalStats();
  };

  const handleLogout = () => {
    setShowExitSplash(true);
    setTimeout(() => {
      localStorage.removeItem('admin_session');
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans">
      <AnimatePresence>
        {showInitialSplash && <SplashScreen message="Carregando Painel..." />}
        {showExitSplash && <SplashScreen message="Saindo..." />}
      </AnimatePresence>

      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false })}
        onConfirm={handleClearHistory}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant="danger"
      />

      {!showInitialSplash && (
        <main className="max-w-[1600px] mx-auto p-4 md:p-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Painel Admin</h1>
                <p className="text-white/40 text-sm font-bold uppercase">Gestão da Plataforma</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={handleGlobalRefresh} className="flex-1 md:flex-none border-white/10 bg-white/5 h-12 rounded-xl font-black text-xs uppercase">
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="flex-1 md:flex-none h-12 rounded-xl bg-red-500/10 text-red-400 font-black text-xs uppercase border border-red-500/20">
                <LogOut size={16} className="mr-2" /> Sair
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Jogadores</p>
              <p className="text-4xl font-black italic tracking-tighter">{totalUsers}</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-green-500/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Depósitos</p>
                <button 
                  onClick={() => setConfirmConfig({
                    isOpen: true,
                    type: 'deposit',
                    title: 'LIMPAR DEPÓSITOS',
                    description: 'Tens a certeza que pretendes eliminar todo o histórico de depósitos concluídos? Esta ação é irreversível.'
                  })} 
                  className="text-white/10 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-3xl font-black italic tracking-tighter text-green-400">{stats.totalDeposits.toLocaleString()} Kz</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-amber-500/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Saques</p>
                <button 
                  onClick={() => setConfirmConfig({
                    isOpen: true,
                    type: 'withdrawal',
                    title: 'LIMPAR SAQUES',
                    description: 'Tens a certeza que pretendes eliminar todo o histórico de saques concluídos? Esta ação é irreversível.'
                  })} 
                  className="text-white/10 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-3xl font-black italic tracking-tighter text-amber-500">{stats.totalWithdrawals.toLocaleString()} Kz</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">LUCRO (TAXA 33.4%)</p>
              <p className="text-3xl font-black italic tracking-tighter text-blue-400">
                {stats.platformBalance.toLocaleString()} <span className="text-sm not-italic opacity-60">Kz</span>
              </p>
            </div>
          </div>

          <Tabs defaultValue="finance" className="space-y-8">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="finance" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">Financeiro</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">Jogadores</TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">Sistema</TabsTrigger>
            </TabsList>
            <TabsContent value="finance"><AdminFinance onUpdate={fetchGlobalStats} /></TabsContent>
            <TabsContent value="users"><AdminUsers /></TabsContent>
            <TabsContent value="system"><AdminSystem /></TabsContent>
          </Tabs>
        </main>
      )}
    </div>
  );
};

export default AdminDashboard;