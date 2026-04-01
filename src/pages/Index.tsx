import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Loader2, Construction } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0A0B12] text-white font-sans pb-24">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 text-purple-500 border border-purple-500/20">
          <Construction size={40} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">REESTRUTURANDO O SISTEMA</h1>
        <p className="text-white/40 font-bold text-xs uppercase tracking-widest text-center max-w-md">
          A Etapa 1 foi concluída. O banco de dados e o frontend foram limpos. Aguardando comando para a Etapa 2.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Index;