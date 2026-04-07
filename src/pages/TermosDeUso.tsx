"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Shield, AlertTriangle, Scale, CreditCard, UserCheck } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-white text-[#111111] pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-sm">
            <FileText size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Termos de Uso</h1>
          <p className="text-[#555555]/40 font-bold text-xs uppercase tracking-widest">Atualizado em: Janeiro de 2025</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-[#D1D5DB] space-y-12 bg-[#F9FAFB]">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="text-blue-600" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#111111]">1. Aceitação dos Termos</h2>
            </div>
            <p className="text-sm text-[#555555]/80 font-bold leading-relaxed uppercase tracking-tight">
              Ao aceder e utilizar a plataforma BORA SORTEIAR, o utilizador concorda em cumprir e estar vinculado a estes Termos de Uso. O uso contínuo implica aceitação plena das regras aqui descritas.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="text-blue-600" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#111111]">2. Elegibilidade</h2>
            </div>
            <p className="text-sm text-[#555555]/80 font-bold leading-relaxed uppercase tracking-tight">
              O serviço é exclusivo para maiores de 18 anos. A plataforma reserva-se o direito de banir contas de menores sem aviso prévio. O utilizador deve garantir a veracidade dos seus dados de identificação.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-blue-600" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-[#111111]">3. Depósitos e Saques</h2>
            </div>
            <p className="text-sm text-[#555555]/80 font-bold leading-relaxed uppercase tracking-tight">
              Depósitos via Multicaixa Express requerem comprovativo. Saques são processados em até 24 horas úteis. Fraudes em comprovativos resultam em banimento imediato e perda de saldos acumulados.
            </p>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertTriangle className="text-amber-600 mt-1 shrink-0" size={18} />
              <p className="text-[11px] text-amber-700 font-black uppercase leading-tight">
                SEGURANÇA: Todas as transações são auditadas para prevenir lavagem de dinheiro e fraude digital.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-600">4. Regras dos Sorteios</h2>
            <p className="text-sm text-[#555555]/80 font-bold leading-relaxed uppercase tracking-tight">
              O sorteio é 100% aleatório e automático assim que a mesa lota ou o tempo expira. O resultado é definitivo e inalterável após o processamento pelo sistema.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosDeUso;