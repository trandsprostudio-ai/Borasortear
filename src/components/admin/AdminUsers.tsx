"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, Save, X, User, Loader2 } from 'lucide-react';
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
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6">Dados Bancários</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-white/40 p-6 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black">
                        {u.first_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{u.first_name} {u.last_name}</span>
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
                  <TableCell className="p-6 text-white/40 text-xs max-w-[200px] truncate">
                    {u.bank_info || 'Não cadastrado'}
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">
                      Ver Detalhes
                    </Button>
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