"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Users, DollarSign, Share2, Trophy, Star, ShieldCheck, Gift, Megaphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import FloatingNav from '@/components/layout/FloatingNav';

const Affiliates = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-32">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-28">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-6">
            <Gift size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Programa de Afiliados Elite</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">Ganhe com a Sorte dos Outros</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest max-w-2xl mx-auto">
            Convide seus amigos para o BORA SORTEIAR e receba <span className="text-green-400">5% de comissão vitalícia</span> sobre cada prêmio que eles ganharem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 rounded-[3rem] border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Megaphone size={120} />
              </div>
              
              <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Como Funciona?</h3>
              <div className="space-y-8 relative z-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-purple-500/20">1</div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-1">Partilhe seu Link</h4>
                    <p className="text-sm text-white/40 font-bold leading-relaxed">Aceda ao seu perfil para copiar o seu link exclusivo e partilhe com amigos ou nas redes sociais.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-purple-500/20">2</div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-1">Amigos se Cadastram</h4>
                    <p className="text-sm text-white/40 font-bold leading-relaxed">Quando os seus amigos criarem conta através do seu link, eles ficam vinculados a si para sempre.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-purple-500/20">3</div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-1">Receba Comissões</h4>
                    <p className="text-sm text-white/40 font-bold leading-relaxed">Sempre que um indicado ganhar qualquer prêmio, 5% do valor é creditado instantaneamente no seu saldo.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <Button onClick={() => navigate('/profile')} className="h-16 px-10 rounded-2xl premium-gradient font-black text-lg shadow-2xl shadow-purple-500/20">
                  ACEDER AO MEU LINK <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 mb-6">Vantagens Elite</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                    <DollarSign size={20} />
                  </div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Ganhos Ilimitados</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Comissão Vitalícia</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Trophy size={20} />
                  </div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Bônus de Rede</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5">
              <Star className="text-amber-500 mb-4" size={32} />
              <h4 className="text-lg font-black italic tracking-tighter uppercase mb-2">Seja um Parceiro</h4>
              <p className="text-xs font-bold text-white/40 mb-6 leading-relaxed">
                O nosso programa de afiliados é a forma mais rápida de construir uma renda passiva enquanto os seus amigos se divertem.
              </p>
              <Button onClick={() => navigate('/auth?mode=signup')} variant="outline" className="w-full h-12 rounded-xl border-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                CRIAR CONTA AGORA
              </Button>
            </div>
          </div>
        </div>
      </main>

      <FloatingNav />
      <Footer />
    </div>
  );
};

export default Affiliates;