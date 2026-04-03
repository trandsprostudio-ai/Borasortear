"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, User, Loader2, ShieldAlert, ShieldCheck, Trash2, Wallet, Gift } from 'lucide-react';
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
      toast.error("Erro ao carregar jogadores");
    } finally {
      setLoading(false);
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
      .update({ balance: newBalance, bonus_balance: newBonusBalance })
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession() ? (await supabase.auth.getSession()).data.session?.access_token : ''}`
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Falha na exclusão");

      toast.success("Utilizador e conta removidos permanentemente!");
      setConfirmConfig({ isOpen: false });
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <ActionConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => !actionLoading && setConfirmConfig({ isOpen: false })}
        onConfirm={confirmConfig.action === 'ban' ? toggleBan : handleDeleteUser}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        loading={actionLoading}
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <Input 
          placeholder="Buscar jogador..." 
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
                <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Saldos</TableHead>
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
                        <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-24 h-8 text-xs bg-white/10" placeholder="Real" />
                        <Input type="number" value={editBonusBalance} onChange={(e) => setEditBonusBalance(e.target.value)} className="w-24 h-8 text-xs bg-white/10" placeholder="Bónus" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateBalances(u.id)} className="h-7 bg-green-600 text-[9px] font-black uppercase">OK</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-red-400 text-[9px] font-black uppercase">X</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2"><span className="font-black text-green-400">{Number(u.balance).toLocaleString()} Kz</span></div>
                        <div className="flex items-center gap-2"><span className="font-black text-purple-400">{Number(u.bonus_balance || 0).toLocaleString()} Kz</span></div>
                        <button onClick={() => { setEditingId(u.id); setEditBalance(u.balance.toString()); setEditBonusBalance((u.bonus_balance || 0).toString()); }} className="text-[9px] font-black text-white/20 hover:text-white uppercase mt-1">Editar</button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-6">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.is_banned ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                      {u.is_banned ? 'Banido' : 'Ativo'}
                    </span>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setConfirmConfig({ 
                          isOpen: true, 
                          userId: u.id, 
                          currentStatus: u.is_banned, 
                          action: 'ban', 
                          title: u.is_banned ? 'DESBANIR JOGADOR' : 'BANIR JOGADOR', 
                          description: u.is_banned ? `Deseja reativar a conta de @${u.first_name}?` : `Deseja suspender a conta de @${u.first_name}?`, 
                          variant: u.is_banned ? 'success' : 'danger' 
                        })} 
                        className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${u.is_banned ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {u.is_banned ? <ShieldCheck size={14} className="mr-2" /> : <ShieldAlert size={14} className="mr-2" />}
                        {u.is_banned ? 'Ativar' : 'Banir'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmConfig({ isOpen: true, userId: u.id, action: 'delete', title: 'EXCLUIR JOGADOR', description: `REMOVER PERMANENTEMENTE @${u.first_name}? Esta ação apaga a conta e o perfil.`, variant: 'danger' })} className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500"><Trash2 size={16} /></Button>
                    </div>
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