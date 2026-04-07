"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, Search, MessageCircle, Phone, Mail, FileText, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Footer from '@/components/layout/Footer';

const CentralDeAjuda = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      q: "Como participar de um sorteio?",
      a: "1. Faz login na tua conta. 2. Seleciona o módulo desejado. 3. Escolha uma das 3 salas disponíveis. 4. Clica em 'SORTEAR' e confirma a tua entrada. 5. Aguarda o encerramento da sala para veres o resultado."
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
      a: "Cada sala permanece aberta por até 3 horas. Pode fechar antes se atingir o número máximo de participantes. Podes entrar até 10 minutos antes do encerramento."
    },
    {
      q: "Quando e onde vejo os resultados?",
      a: "Os resultados são divulgados em até 10 minutos após o encerramento da sala. Podes consultá-los em 'Minhas Mesas' ou em 'Consultar Bilhete' usando o código do teu bilhete."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const WHATSAPP_LINK = "https://wa.me/244939331003";

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Central de Ajuda</h1>
          <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">Suporte Técnico Especializado</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-16">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PESQUISAR DÚVIDAS..." 
            className="bg-white/5 border-white/10 h-16 pl-14 rounded-2xl font-black text-xs uppercase tracking-widest text-white focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2.5rem] p-4 border-white/5 shadow-2xl">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-none px-4">
                      <AccordionTrigger className="text-[11px] font-black uppercase tracking-widest hover:no-underline hover:text-blue-400 text-left py-7 text-white/80 transition-all">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/40 font-bold text-xs leading-relaxed pb-8 uppercase tracking-tight">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="p-12 text-center text-white/10 font-black uppercase tracking-widest text-xs">
                    Nenhum resultado encontrado.
                  </div>
                )}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="text-blue-400" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Suporte 24/7</h3>
              </div>
              <p className="text-[10px] text-white/40 font-black mb-8 uppercase tracking-widest leading-relaxed">
                Fala diretamente com a nossa equipa via WhatsApp para uma resposta imediata.
              </p>
              <Button 
                asChild
                className="w-full h-14 premium-gradient rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Phone size={16} className="mr-2" /> ABRIR CHAT
                </a>
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white/20 border border-white/10">
                <Mail size={32} />
              </div>
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-2">E-mail</h3>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1 tracking-widest">Contato Oficial</p>
                <p className="text-[11px] font-black text-blue-400 truncate">suporte@borasorteiar.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CentralDeAjuda;