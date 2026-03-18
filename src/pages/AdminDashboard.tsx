"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Settings, LogOut, Plus, Trash2, 
  RefreshCw, DollarSign, TrendingUp, CheckCircle2, XCircle, Clock, Wallet
} from 'lucide-react';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading } = useRooms();
  const [totalUsers, setTotalUsers] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
    fetchStats();
    fetchTransactions();
  }, [navigate]);

  const fetchStats = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setTotalUsers(count || 0);
  };

  const fetchTransactions = async () => {
    setLoadingTx(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(first_name, last_name, balance)')
      .order('created_at', { ascending: false });
    
    if (!error && data) setTransactions(data);
    setLoadingTx(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  const handleApproveTransaction = async (tx: any) => {
    if (!confirm(`Aprovar ${tx.type} de ${tx.amount} Kz para ${tx.profiles?.first_name}?`)) return;

    try {
      // 1. Se for depósito, adicionar saldo ao usuário
      if (tx.type === 'deposit') {
        const newBalance = (tx.profiles?.balance || 0) + tx.amount;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', tx.user_id);
        
        if (balanceError) throw balanceError;
      }

      // 2. Marcar transação como completada
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', tx.id);

      if (txError) throw txError;

      toast.success("Transação aprovada com sucesso!");
      fetchTransactions();
    } catch (error: any) {
      toast.error("Erro ao processar: " + error.message);
    }
  };

  const handleRejectTransaction = async (id: string) => {
    if (!confirm("Rejeitar esta transação?")) return;
    const { error } = await supabase.from('transactions').update({ status: 'rejected' }).eq('id', id);
    if (error) toast.error("Erro ao rejeitar");
    else {
      toast.success("Transação rejeitada");
      fetchTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] flex text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0F111A] p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-black">A</div>
          <span className="font-black italic tracking-tighter">ADMIN BORA</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-white/5 text-white">
            <LayoutDashboard size={18} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/40 hover:text-white">
            <Users size={18} /> Usuários
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/40 hover:text-white">
            <Settings size={18} /> Configurações
          </Button>
        </nav>

        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10">
          <LogOut size={18} /> Sair
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">CENTRO DE COMANDO</h1>
            <p className="text-white/40 text-sm">Gerencie mesas, usuários e transações financeiras.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={() => { fetchStats(); fetchTransactions(); }} className="border-white/10">
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border-purple-500/20">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Salas Ativas</p>
            <p className="text-3xl font-black">{rooms.filter(r => r.status === 'open').length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-blue-500/20">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Usuários</p>
            <p className="text-3xl font-black">{totalUsers}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-green-500/20">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Depósitos Pendentes</p>
            <p className="text-3xl font-black text-green-400">{transactions.filter(t => t.status === 'pending' && t.type === 'deposit').length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-amber-500/20">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Saques Pendentes</p>
            <p className="text-3xl font-black text-amber-500">{transactions.filter(t => t.status === 'pending' && t.type === 'withdrawal').length}</p>
          </div>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="rooms" className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600">MESAS ATIVAS</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600">TRANSAÇÕES</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <div className="glass-card rounded-2xl overflow-hidden border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-4">ID Sala</th>
                      <th className="p-4">Participantes</th>
                      <th className="p-4">Progresso</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-purple-400">#{room.id.slice(0, 8)}</td>
                        <td className="p-4">{room.current_participants}/{room.max_participants}</td>
                        <td className="p-4">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }} />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black ${
                            room.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-400/10">
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="glass-card rounded-2xl overflow-hidden border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-4">Data</th>
                      <th className="p-4">Usuário</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white/40">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span>{tx.profiles?.first_name}</span>
                            <span className="text-[10px] text-white/20">ID: {tx.user_id.slice(0,8)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${
                            tx.type === 'deposit' ? 'text-green-400' : 'text-purple-400'
                          }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                            {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </span>
                        </td>
                        <td className="p-4 font-black">{tx.amount.toLocaleString()} Kz</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {tx.status === 'pending' ? <Clock size={14} className="text-amber-500" /> : 
                             tx.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                             <XCircle size={14} className="text-red-500" />}
                            <span className="text-[10px] uppercase font-black">{tx.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {tx.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleApproveTransaction(tx)}
                                className="h-8 bg-green-600 hover:bg-green-700 text-[10px] font-black px-3 rounded-lg"
                              >
                                APROVAR
                              </Button>
                              <Button 
                                onClick={() => handleRejectTransaction(tx.id)}
                                variant="ghost"
                                className="h-8 text-red-400 hover:bg-red-400/10 text-[10px] font-black px-3 rounded-lg"
                              >
                                REJEITAR
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;