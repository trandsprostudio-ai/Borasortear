"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, LogOut, Plus, Trash2, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { useRooms } from '@/hooks/use-rooms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { rooms, loading } = useRooms();
  const [totalUsers, setTotalUsers] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setTotalUsers(count || 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sala?")) return;
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir sala");
    else toast.success("Sala excluída com sucesso");
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
            <h1 className="text-3xl font-black italic tracking-tighter">VISÃO GERAL</h1>
            <p className="text-white/40 text-sm">Bem-vindo ao centro de comando administrativo.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="border-white/10">
              <RefreshCw size={18} />
            </Button>
            <Button className="premium-gradient rounded-xl font-bold">
              <Plus size={18} className="mr-2" /> Nova Sala
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border-purple-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><LayoutDashboard size={20} /></div>
              <span className="text-[10px] font-black text-green-400">+5%</span>
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Salas Ativas</p>
            <p className="text-3xl font-black">{rooms.filter(r => r.status === 'open').length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-blue-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Users size={20} /></div>
              <span className="text-[10px] font-black text-blue-400">Total</span>
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Usuários</p>
            <p className="text-3xl font-black">{totalUsers}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-green-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><DollarSign size={20} /></div>
              <span className="text-[10px] font-black text-green-400">Hoje</span>
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Receita Bruta</p>
            <p className="text-3xl font-black">850.000 <span className="text-sm">Kz</span></p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-amber-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><TrendingUp size={20} /></div>
              <span className="text-[10px] font-black text-amber-400">Total</span>
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Prêmios Pagos</p>
            <p className="text-3xl font-black">12.4M <span className="text-sm">Kz</span></p>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="glass-card rounded-2xl overflow-hidden border-white/5">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-black italic tracking-tighter">GERENCIAR MESAS ATIVAS</h2>
            <div className="flex gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-white/40">Monitoramento em Tempo Real</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                <tr>
                  <th className="p-4">ID Sala</th>
                  <th className="p-4">Módulo</th>
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
                    <td className="p-4">Módulo {room.module_id.slice(0, 4)}</td>
                    <td className="p-4">{room.current_participants}/{room.max_participants}</td>
                    <td className="p-4">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${(room.current_participants / room.max_participants) * 100}%` }} 
                        />
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
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                          <RefreshCw size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;