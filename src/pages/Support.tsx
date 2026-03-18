"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, ShieldCheck, Zap, ChevronRight, Phone, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';

const Support = () => {
  const faqs = [
    {
      q: "Como funcionam os sorteios?",
      a: "Os sorteios são realizados automaticamente assim que uma mesa atinge o número máximo de participantes. O sistema seleciona os vencedores de forma aleatória e transparente."
    },
    {
      q: "Como faço para depositar?",
      a: "Acesse sua carteira, clique em 'Depositar', escolha o valor e siga as instruções de transferência bancária. Após realizar o pagamento, nosso sistema processará seu saldo."
    },
    {
      q: "Quanto tempo leva para receber meu prêmio?",
      a: "Os prêmios são creditados instantaneamente no seu saldo da plataforma após o sorteio. Você pode solicitar o saque para sua conta bancária a qualquer momento, com processamento em até 24h."
    },
    {
      q: "É seguro jogar no BORA SORTEIAR?",
      a: "Sim! Utilizamos tecnologia de ponta para garantir a segurança dos seus dados e a imparcialidade de todos os sorteios. Somos uma plataforma premium focada na transparência."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-500 border border-purple-500/20">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Central de Ajuda</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Tudo o que você precisa saber para jogar e ganhar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 group hover:border-purple-500/30 transition-all">
            <MessageCircle className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Suporte via WhatsApp</h3>
            <p className="text-sm text-white/40 font-bold mb-6">Fale diretamente com nossa equipe de atendimento para resolver qualquer problema.</p>
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-black text-xs uppercase tracking-widest">
              <Phone size={16} className="mr-2" /> INICIAR CONVERSA
            </Button>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 group hover:border-blue-500/30 transition-all">
            <ShieldCheck className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Segurança & Termos</h3>
            <p className="text-sm text-white/40 font-bold mb-6">Leia nossas diretrizes de segurança e termos de uso da plataforma.</p>
            <Button variant="ghost" className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl font-black text-xs uppercase tracking-widest border border-white/5">
              VER DIRETRIZES <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        <section className="mb-20">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
            <Zap className="text-amber-500" /> Perguntas Frequentes
          </h2>
          
          <div className="glass-card rounded-[2rem] p-4 border-white/5">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-white/5 px-4">
                  <AccordionTrigger className="text-sm font-black uppercase tracking-widest hover:no-underline hover:text-purple-400 text-left py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/40 font-bold text-sm leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <div className="bg-gradient-to-br from-purple-900/20 to-transparent p-10 rounded-[3rem] border border-white/5 text-center">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Ainda tem dúvidas?</h3>
          <p className="text-white/40 font-bold mb-8">Nossa equipe está disponível 24/7 para garantir sua melhor experiência.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60">
              <Mail size={16} className="text-purple-500" /> suporte@borasorteiar.com
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;