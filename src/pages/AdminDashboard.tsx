"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Settings, LogOut, Plus, Trash2 } from 'lucide-react';
import { useRooms } from '@/hooks/use-rooms';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { rooms, loading } = useRooms();

  useEffect(() => {
    if (localStorage.getItem('admin_session') !== 'true') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0F111A] p-6 flex flex-col">
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
          <h1 className="text-3xl font-black italic tracking-tighter">GERENCIAR SALAS</h1>
          <Button className="premium-gradient rounded-xl font-bold">
            <Plus size={18} className="mr-2" /> Nova Sala Manual
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border-purple-500/20">
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Salas Ativas</p>
            <p className="text-3xl font-black">{rooms.filter(r => r.status === 'open').length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-green-500/20">
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Sorteios Hoje</p>
            <p className="text-3xl font-black">12</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border-amber-500/20">
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Total em Prêmios</p>
            <p className="text-3xl font-black">1.450.000 Kz</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border-white/5">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
              <tr>
                <th className="p-4">ID Sala</th>
                <th className="p-4">Módulo</th>
                <th className="p-4">Participantes</th>
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
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black ${
                      room.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;