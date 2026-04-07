"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const Support = () => {
  const faqs = [
    {
      q: "Como participar de um sorteio?",
      a: "1. Faça login na sua conta. 2. Selecione o módulo desejado. 3. Escolha uma das 3 salas disponíveis. 4. Clique em 'ENTRAR NA MESA' e confirme sua entrada. 5. Aguarde o encerramento da sala para ver o resultado."
    },
    {
      q: "A plataforma participa dos sorteios?",
      a: "Absolutamente não. O Bora Sortear é uma plataforma de intermediação. Todas as vagas em cada mesa são preenchidas exclusivamente por utilizadores reais. A plataforma não possui contas de jogador e não concorre aos prémios."
    },
    {
      q: "O sorteio é justo?",
      a: "Sim. O sistema utiliza um algoritmo de seleção aleatória entre os IDs dos participantes reais da sala. Ninguém, incluindo a equipa técnica da plataforma, pode prever ou alterar o resultado de um sorteio."
    },
    {
      q: "Quanto tempo dura uma sala?",
      a: "Cada sala permanece aberta por até 3 horas. Pode fechar antes se atingir o número máximo de participantes. Você pode entrar até 10 minutos antes do encerramento."
    },
    {
      q: "Quando e onde vejo os resultados?",
      a: "Os resultados são divulgados em até 10 minutos após o encerramento da sala. Você pode consultá-los em 'Minhas Mesas' ou em 'Consultar Bilhete' usando o código do seu bilhete."
    }
  ];

  const WHATSAPP_LINK = "https://wa.me/244939331003";

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-sm">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Suporte ao Jogador</h1>
          <p className="text-[#555555]/40 font-bold text-xs uppercase tracking-widest">Respostas rápidas e atendimento direto</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-4 border-[#D1D5DB]">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-[#F3F4F6] px-4">
                    <AccordionTrigger className="text-sm font-black uppercase text-left py-6 hover:no-underline hover:text-blue-600 text-[#111111] tracking-widest">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#555555]/60 font-bold text-sm leading-relaxed pb-6 uppercase">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-green-100 bg-green-50 text-center">
              <MessageCircle className="mx-auto mb-4 text-green-600" size={32} />
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2 text-[#111111]">WhatsApp</h3>
              <p className="text-xs text-[#555555]/60 font-bold mb-6 uppercase tracking-tight">Atendimento 24/7 disponível</p>
              <Button asChild className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-green-600/20">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">FALAR AGORA</a>
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-blue-100 bg-blue-50 text-center">
              <Mail className="mx-auto mb-4 text-blue-600" size={32} />
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2 text-[#111111]">E-mail</h3>
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm mt-4">
                <p className="text-[9px] font-black text-[#555555]/40 uppercase tracking-widest mb-1">Contato Oficial</p>
                <p className="text-sm font-black text-blue-600 lowercase">suporte@borasorteiar.com</p>
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