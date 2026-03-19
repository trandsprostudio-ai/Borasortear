"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, Save, X, User, Loader2, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');

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

  const handleUpdateBalance = async (userId: string) => {
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (error) {
      toast.error("Erro ao atualizar saldo");
    } else {
      toast.success("Saldo atualizado com sucesso!");
      setEditingId(null);
      fetchUsers();
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "DESBANIR" : "BANIR";
    if (!confirm(`Deseja realmente ${action} este usuário?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);

    if (error) toast.error("Erro ao alterar status");
    else {
      toast.success(`Usuário ${currentStatus ? 'desbanido' : 'banido'}!`);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("⚠️ ATENÇÃO: Esta ação excluirá permanentemente a conta e todo o histórico do jogador. Continuar?")) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error("Erro ao excluir conta");
    } else {
      toast.success("Conta excluída com sucesso!");
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
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Jogador</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Saldo Atual</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Status / Segurança</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className={`border-white/5 hover:bg-white/5 transition-colors ${u.is_banned ? 'bg-red-500/5' : ''}`}>
                  <TableCell className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${u.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/10 text-purple-400'}`}>
                        {u.first_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${u.is_banned ? 'text-red-400' : ''}`}>{u.first_name} {u.last_name}</span>
                        <span className="text-[10px] text-white/20">ID: {u.id.slice(0,12)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          value={editBalance} 
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-32 h-9 bg-white/10 border-white/20"
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleUpdateBalance(u.id)} className="h-9 w-9 text-green-400">
                          <Save size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-9 w-9 text-red-400">
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-green-400 text-lg">{u.balance.toLocaleString()} Kz</span>
                        <button onClick={() => { setEditingId(u.id); setEditBalance(u.balance.toString()); }} className="text-white/20 hover:text-white">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.is_banned ? 'bg-red-500 text-white' : 'bg-green-500/20 text-green-400'}`}>
                          {u.is_banned ? 'Banido' : 'Ativo'}
                        </span>
                        {u.false_proof_count > 0 && (
                          <span className="text-[9px] font-black text-amber-500 uppercase">
                            {u.false_proof_count} Alertas
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-white/20 font-bold truncate max-w-[150px]">{u.bank_info || 'Sem IBAN'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleBan(u.id, u.is_banned)}
                        className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest ${u.is_banned ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}
                      >
                        {u.is_banned ? <ShieldCheck size={14} className="mr-2" /> : <ShieldAlert size={14} className="mr-2" />}
                        {u.is_banned ? 'Desbanir' : 'Banir'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteUser(u.id)}
                        className="h-9 w-9 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="p-20 text-center text-white/10 font-black uppercase tracking-widest text-xs">
                  Nenhum jogador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;