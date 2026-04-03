"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, Save, X, User, Loader2, ShieldAlert, ShieldCheck, Trash2, Wallet, Gift } from 'lucide-react';
import { toast } from 'sonner';
import ActionConfirmModal from '@/components/ui/ActionConfirmModal';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  const [editBonusBalance, setEditBonusBalance] = useState<string>('');
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
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalances = async (userId: string) => {
    const newBalance = parseFloat(editBalance);
    const newBonusBalance = parseFloat(editBonusBalance);
    
    if (isNaN(newBalance) || isNaN(newBonusBalance)) {
      toast.error("Insira valores numéricos válidos.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        balance: newBalance,
        bonus_balance: newBonusBalance
      })
      .eq('id', userId);

    if (error) {
      toast.error("Erro ao atualizar saldos");
    } else {
      toast.success("Saldos atualizados com sucesso!");
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
      toast.success(`Usuário ${currentStatus ? 'desbanido' : 'banido'}!`);
      setConfirmConfig({ isOpen: false });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-white/20">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">Carregando jogadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.action === 'ban' ? toggleBan : () => {}}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <Input 
          placeholder="Buscar por nome ou ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl"
        />
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Jogador</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Saldos (Real / Bónus)</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Segurança</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
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
                        <div className="flex items-center gap-2">
                          <Wallet size={12} className="text-green-500" />
                          <Input 
                            type="number" 
                            value={editBalance} 
                            onChange={(e) => setEditBalance(e.target.value)}
                            className="w-24 h-8 bg-white/10 border-white/20 text-xs"
                            placeholder="Real"
                          />
                          <span className="text-[10px] text-white/20">Real</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift size={12} className="text-purple-500" />
                          <Input 
                            type="number" 
                            value={editBonusBalance} 
                            onChange={(e) => setEditBonusBalance(e.target.value)}
                            className="w-24 h-8 bg-white/10 border-white/20 text-xs"
                            placeholder="Bónus"
                          />
                          <span className="text-[10px] text-white/20">Bónus</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => handleUpdateBalances(u.id)} className="h-7 px-3 bg-green-600 text-[9px] font-black uppercase">Gravar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 px-3 text-red-400 text-[9px] font-black uppercase">Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-green-400">{Number(u.balance).toLocaleString()} Kz</span>
                          <span className="text-[8px] font-black text-white/20 uppercase">Real</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-purple-400">{Number(u.bonus_balance || 0).toLocaleString()} Kz</span>
                          <span className="text-[8px] font-black text-white/20 uppercase">Bónus</span>
                        </div>
                        <button onClick={() => { 
                          setEditingId(u.id); 
                          setEditBalance(u.balance.toString());
                          setEditBonusBalance((u.bonus_balance || 0).toString());
                        }} className="text-[9px] font-black text-white/20 hover:text-white uppercase mt-1 flex items-center gap-1">
                          <Edit2 size={10} /> Editar Saldos
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit ${u.is_banned ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                        {u.is_banned ? 'Banido' : 'Ativo'}
                      </span>
                      <span className="text-[10px] font-bold text-white/40">{u.bank_info || 'Sem Express'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setConfirmConfig({
                        isOpen: true,
                        userId: u.id,
                        currentStatus: u.is_banned,
                        action: 'ban',
                        title: u.is_banned ? 'DESBANIR JOGADOR' : 'BANIR JOGADOR',
                        description: `Deseja realmente ${u.is_banned ? 'desbanir' : 'banir'} @${u.first_name}?`,
                        variant: u.is_banned ? 'success' : 'danger'
                      })}
                      className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${u.is_banned ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}
                    >
                      {u.is_banned ? <ShieldCheck size={14} className="mr-2" /> : <ShieldAlert size={14} className="mr-2" />}
                      {u.is_banned ? 'Desbanir' : 'Banir'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;