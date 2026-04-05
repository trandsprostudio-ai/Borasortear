"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, User, Loader2, ShieldAlert, ShieldCheck, Trash2, Wallet, Gift, Zap, Sparkles, RefreshCw, Dice5 } from 'lucide-react';
import { toast } from 'sonner';
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  const [editBonusBalance, setEditBonusBalance] = useState<string>('');
  
  // Estados para Injeção Automática (Lucky Drop)
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [userCount, setUserCount] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<any>({ isOpen: false, userId: null, action: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      setUsers(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar jogadores. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  };

  const handleLuckyDrop = async () => {
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);
    const count = parseInt(userCount);

    if (isNaN(min) || isNaN(max) || min <= 0 || max < min || isNaN(count) || count <= 0) {
      toast.error("Configure o intervalo e o número de jogadores corretamente.");
      return;
    }

    setIsDistributing(true);
    try {
      const { error } = await supabase.rpc('distribute_random_bonus', {
        p_min_amount: min,
        p_max_amount: max,
        p_user_count: count
      });

      if (error) throw error;

      toast.success(`Lucky Drop realizado! ${count} jogadores premiados.`);
      setMinAmount('');
      setMaxAmount('');
      setUserCount('');
      fetchUsers();
    } catch (error: any) {
      toast.error("Erro no sorteio surpresa.");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleUpdateBalances = async (userId: string) => {
    const newBalance = parseFloat(editBalance);
    const newBonusBalance = parseFloat(editBonusBalance);
    
    if (isNaN(newBalance) || isNaN(newBonusBalance)) {
      toast.error("Valores inválidos.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        balance: newBalance, 
        bonus_balance: newBonusBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) toast.error("Erro ao atualizar saldos");
    else {
      toast.success("Saldos atualizados!");
      setEditingId(null);
      fetchUsers();
    }
  };

  const toggleBan = async () => {
    const { userId, currentStatus } = confirmConfig;
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);

    if (error) toast.error("Erro ao alterar status");
    else {
      toast.success(`Jogador ${currentStatus ? 'desbanido' : 'banido'}!`);
      setConfirmConfig({ isOpen: false });
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    const { userId } = confirmConfig;
    setActionLoading(true);
    
    try {
      const response = await fetch(`https://ifdskxgsijmpqayufxgg.supabase.co/functions/v1/admin-delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error("Falha na exclusão remota");

      toast.success("Utilizador removido!");
      setConfirmConfig({ isOpen: false });
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao eliminar utilizador.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => !actionLoading && setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.action === 'ban' ? toggleBan : handleDeleteUser}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        loading={actionLoading}
      />

      <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Dice5 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Lucky Drop</h3>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Distribuição Totalmente Aleatória</p>
            </div>
          </div>
          <Sparkles className="text-purple-500/40 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">Mínimo (Kz)</label>
            <Input type="number" placeholder="Ex: 100" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl font-black" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">Máximo (Kz)</label>
            <Input type="number" placeholder="Ex: 1000" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl font-black" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">Nº Jogadores</label>
            <Input type="number" placeholder="Ex: 5" value={userCount} onChange={(e) => setUserCount(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl font-black" />
          </div>
          <Button onClick={handleLuckyDrop} disabled={isDistributing} className="h-12 premium-gradient rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-600/20">
            {isDistributing ? <Loader2 className="animate-spin" /> : <><Zap size={14} className="mr-2" /> DISPARAR SORTE</>}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input placeholder="Buscar por nome ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl" />
        </div>
        <Button variant="ghost" onClick={fetchUsers} className="text-white/20 hover:text-white">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Jogador</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Saldos</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                <TableRow key={u.id} className={`border-white/5 hover:bg-white/5 transition-colors ${u.is_banned ? 'bg-red-500/5' : ''}`}>
                  <TableCell className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${u.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/10 text-purple-400'}`}>
                        {u.first_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${u.is_banned ? 'text-red-400' : ''}`}>{u.first_name}</span>
                        <span className="text-[10px] text-white/20">ID: {u.id.slice(0,8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    {editingId === u.id ? (
                      <div className="space-y-2">
                        <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-24 h-8 text-xs bg-white/10" />
                        <Input type="number" value={editBonusBalance} onChange={(e) => setEditBonusBalance(e.target.value)} className="w-24 h-8 text-xs bg-white/10" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateBalances(u.id)} className="h-7 bg-green-600 text-[9px] font-black uppercase">OK</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-red-400 text-[9px] font-black uppercase">X</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Wallet size={12} className="text-green-500/40" />
                          <span className="font-black text-green-400">{Number(u.balance).toLocaleString()} Kz</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift size={12} className="text-purple-500/40" />
                          <span className="font-black text-purple-400">{Number(u.bonus_balance || 0).toLocaleString()} Kz</span>
                        </div>
                        <button onClick={() => { setEditingId(u.id); setEditBalance(u.balance.toString()); setEditBonusBalance((u.bonus_balance || 0).toString()); }} className="text-[9px] font-black text-white/20 hover:text-white uppercase mt-1 text-left underline decoration-dotted">Editar</button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setConfirmConfig({ isOpen: true, userId: u.id, currentStatus: u.is_banned, action: 'ban', title: u.is_banned ? 'DESBANIR' : 'BANIR', variant: u.is_banned ? 'success' : 'danger' })} className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase ${u.is_banned ? 'text-green-400' : 'text-red-400'}`}>
                        {u.is_banned ? <ShieldCheck size={14} className="mr-2" /> : <ShieldAlert size={14} className="mr-2" />}
                        {u.is_banned ? 'Ativar' : 'Banir'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmConfig({ isOpen: true, userId: u.id, action: 'delete', title: 'ELIMINAR', variant: 'danger' })} className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500"><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="p-20 text-center text-white/10 font-black uppercase text-[10px]">
                    {loading ? "A carregar dados..." : "Nenhum jogador encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;