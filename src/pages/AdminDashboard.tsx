"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Settings, LogOut, Plus, Trash2, 
  RefreshCw, DollarSign, TrendingUp, CheckCircle2, XCircle, Clock, Wallet,
  ArrowDownLeft, ArrowUpRight, Search, Filter
} from 'lucide-react';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading } = useRooms();
  const [totalUsers, setTotalUsers] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    platformBalance: 0
  });

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoadingTx(true);
    try {
      // 1. Usuários
      const { data: users, count } = await supabase.from('profiles').select('*', { count: 'exact' });
      setTotalUsers(count || 0);
      setAllUsers(users || []);

      // 2. Transações com dados do perfil
      const { data: txs } = await supabase
        .from('transactions')
        .select('*, profiles(first_name, last_name, balance, bank_info)')
        .order('created_at', { ascending: false });
      
      setTransactions(txs || []);

      // 3. Calcular Estatísticas
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
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  const handleApproveTransaction = async (tx: any) => {
    const actionLabel = tx.type === 'deposit' ? 'Aprovar Depósito' : 'Aprovar Saque';
    if (!confirm(`${actionLabel} de ${tx.amount.toLocaleString()} Kz para ${tx.profiles?.first_name}?`)) return;

    try {
      // Se for depósito, aumenta o saldo do usuário
      if (tx.type === 'deposit') {
        const newBalance = (tx.profiles?.balance || 0) + Number(tx.amount);
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', tx.user_id);
        
        if (balanceError) throw balanceError;
      } 
      // Se for saque, o saldo já deve ter sido validado no pedido, 
      // mas aqui apenas confirmamos que o dinheiro foi enviado.
      // (Nota: Em um sistema real, o saldo seria deduzido no momento do pedido de saque)

      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', tx.id);

      if (txError) throw txError;

      toast.success("Transação processada com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao processar: " + error.message);
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    if (!confirm("Rejeitar esta transação?")) return;
    
    try {
      // Se for saque e estivermos rejeitando, deveríamos devolver o saldo ao usuário
      // (Assumindo que o saldo foi deduzido no pedido - lógica a ser refinada no modal)
      
      const { error } = await supabase.from('transactions').update({ status: 'rejected' }).eq('id', tx.id);
      if (error) throw error;
      
      toast.success("Transação rejeitada");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao rejeitar: " + error.message);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0A0B12] flex text-white font-sans">
      {/* Sidebar Premium */}
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
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
            <Users size={18} /> Usuários
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
            <Wallet size={18} /> Financeiro
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5">
            <Settings size={18} /> Sistema
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
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchData} 
              className="border-white/10 bg-white/5 hover:bg-white/10 h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest"
            >
              <RefreshCw size={16} className={`mr-2 ${loadingTx ? 'animate-spin' : ''}`} /> Atualizar Dados
            </Button>
          </div>
        </header>

        {/* Stats Grid Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-3xl border-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-purple-500/10 group-hover:scale-110 transition-transform">
              <Users size={100} />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Total de Jogadores</p>
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

        <Tabs defaultValue="transactions" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="transactions" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">TRANSAÇÕES</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">JOGADORES</TabsTrigger>
              <TabsTrigger value="rooms" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">MESAS</TabsTrigger>
            </TabsList>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <Input 
                placeholder="Buscar por nome ou ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:border-purple-500/50"
              />
            </div>
          </div>

          <TabsContent value="transactions">
            <div className="glass-card rounded-3xl overflow-hidden border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-6">Data / Hora</th>
                      <th className="p-6">Jogador</th>
                      <th className="p-6">Tipo</th>
                      <th className="p-6">Valor</th>
                      <th className="p-6">Dados Bancários</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] text-white/20">{new Date(tx.created_at).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-xs">
                              {tx.profiles?.first_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span>{tx.profiles?.first_name} {tx.profiles?.last_name}</span>
                              <span className="text-[10px] text-white/20">ID: {tx.user_id.slice(0,8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase ${
                            tx.type === 'deposit' ? 'text-green-400' : 'text-amber-400'
                          }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </span>
                        </td>
                        <td className="p-6 font-black text-lg">{tx.amount.toLocaleString()} Kz</td>
                        <td className="p-6">
                          <p className="text-[10px] text-white/40 max-w-[150px] truncate" title={tx.profiles?.bank_info || 'Não informado'}>
                            {tx.profiles?.bank_info || 'N/A'}
                          </p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            {tx.status === 'pending' ? <Clock size={14} className="text-amber-500" /> : 
                             tx.status === 'completed' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                             <XCircle size={14} className="text-red-500" />}
                            <span className={`text-[10px] uppercase font-black ${
                              tx.status === 'pending' ? 'text-amber-500' : 
                              tx.status === 'completed' ? 'text-green-500' : 'text-red-500'
                            }`}>{tx.status}</span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          {tx.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                onClick={() => handleApproveTransaction(tx)}
                                className="h-9 bg-green-600 hover:bg-green-700 text-[10px] font-black px-4 rounded-xl shadow-lg shadow-green-900/20"
                              >
                                APROVAR
                              </Button>
                              <Button 
                                onClick={() => handleRejectTransaction(tx)}
                                variant="ghost"
                                className="h-9 text-red-400 hover:bg-red-400/10 text-[10px] font-black px-4 rounded-xl"
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

          <TabsContent value="users">
            <div className="glass-card rounded-3xl overflow-hidden border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-6">Jogador</th>
                      <th className="p-6">Saldo Atual</th>
                      <th className="p-6">Dados Bancários</th>
                      <th className="p-6">Última Atividade</th>
                      <th className="p-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {allUsers.filter(u => u.first_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-black">
                              {u.first_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span>{u.first_name} {u.last_name}</span>
                              <span className="text-[10px] text-white/20">ID: {u.id.slice(0,12)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 font-black text-green-400 text-lg">{u.balance.toLocaleString()} Kz</td>
                        <td className="p-6 text-white/40 text-xs">{u.bank_info || 'Não cadastrado'}</td>
                        <td className="p-6 text-white/20 text-xs">{new Date(u.updated_at).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                            <Settings size={16} className="text-white/40" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="glass-card rounded-3xl overflow-hidden border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="p-6">ID Sala</th>
                      <th className="p-6">Participantes</th>
                      <th className="p-6">Progresso</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold">
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6 text-purple-400 font-black">#{room.id.slice(0, 8)}</td>
                        <td className="p-6">{room.current_participants}/{room.max_participants}</td>
                        <td className="p-6">
                          <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]" style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }} />
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-black ${
                            room.status === 'open' ? 'bg-green-500/10 text-green-400' : 
                            room.status === 'finished' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-red-400 hover:bg-red-400/10 rounded-xl">
                            <Trash2 size={16} />
                          </Button>
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