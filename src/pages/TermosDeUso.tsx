"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-500 border border-purple-500/20">
            <FileText size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Termos de Uso</h1>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">6. Distribuição de Prêmios</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Os prêmios são creditados automaticamente na conta dos vencedores. Em cada mesa, o sistema realiza a seleção de 3 vencedores entre os participantes reais que ocupam as vagas disponíveis. 
            </p>
            <p className="text-sm text-white/40 font-bold leading-relaxed mt-2">
              A plataforma retém uma taxa de intermediação utilizada para garantir a estabilidade do sistema, processamento de pagamentos, suporte 24/7 e financiamento do programa de bónus de afiliados.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosDeUso;