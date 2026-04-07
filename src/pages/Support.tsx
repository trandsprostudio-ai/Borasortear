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
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-28 pb-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-sm">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Suporte ao Jogador</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-4 border-[#D1D5DB]">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-[#F3F4F6] px-4">
                    <AccordionTrigger className="text-sm font-black uppercase text-left py-6 hover:no-underline hover:text-blue-600 text-[#111111]">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-[#555555]/60 font-bold text-sm leading-relaxed pb-6 uppercase">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-green-100 bg-green-50 text-center">
              <MessageCircle className="mx-auto mb-4 text-green-600" size={32} />
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2">WhatsApp</h3>
              <Button asChild className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase shadow-md shadow-green-600/20">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">FALAR AGORA</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;