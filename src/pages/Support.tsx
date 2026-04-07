"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const Support = () => {
  const faqs = [
    { q: "Como participar de um sorteio?", a: "Selecione o módulo, escolha a mesa e clique em entrar." },
    { q: "A plataforma participa?", a: "Não, apenas utilizadores reais participam." },
    { q: "O sorteio é justo?", a: "Sim, utilizamos algoritmos aleatórios verificáveis." },
    { q: "Tempo de duração?", a: "Cada sala dura até 3 horas ou até lotar." }
  ];

  const WHATSAPP_LINK = "https://wa.me/244939331003";

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFF] text-[#111111]">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-600/20 shadow-sm">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Suporte ao Jogador</h1>
          <p className="text-[#555555]/40 font-bold text-xs uppercase tracking-widest">Estamos aqui para ajudar 24/7</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2.5rem] p-4 border-white/5">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-none px-4">
                    <AccordionTrigger className="text-sm font-black uppercase text-left py-6 hover:no-underline hover:text-blue-500 text-white transition-colors">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 font-bold text-sm leading-relaxed pb-6 uppercase tracking-tight">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2 text-white">WhatsApp</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-6 tracking-widest">Atendimento Imediato</p>
              <Button asChild className="w-full h-14 rounded-xl gold-gradient text-black font-black text-xs uppercase shadow-xl shadow-yellow-500/20 hover:scale-[1.02] transition-all">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">FALAR AGORA</a>
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/20">
                <Mail size={32} />
              </div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2 text-white">E-mail</h3>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Contato Oficial</p>
                <p className="text-xs font-black text-blue-400">suporte@borasorteiar.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;