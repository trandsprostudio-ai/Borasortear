"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import ModulesRoomsTable from '@/components/admin/ModulesRoomsTable';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LayoutGrid } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const AdminRoomsStatus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-28">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">Status das Salas</h1>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Monitoramento em tempo real de módulos e mesas
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/admin-dashboard')}
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            <Shield size={14} className="mr-2" /> VOLTAR AO PAINEL
          </Button>
        </div>

        <ModulesRoomsTable />
      </main>

      <Footer />
    </div>
  );
};

export default AdminRoomsStatus;