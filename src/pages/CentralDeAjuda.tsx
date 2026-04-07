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
      a: "1. Faça login na sua conta. 2. Selecione o módulo desejado. 3. Escolha uma das 3 salas disponíveis. 4. Clique em 'SORTEAR' e confirme sua entrada. 5. Aguarde o encerramento da sala para ver o resultado."
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

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const WHATSAPP_LINK = "https://wa.me/244939331003";

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-24">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 border border-blue-100 shadow-sm">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-[#111111]">Central de Ajuda</h1>
          <p className="text-[#555555]/40 font-bold text-xs uppercase tracking-widest">Encontre respostas rápidas</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/20" size={20} />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar dúvidas..." 
            className="bg-[#F3F4F6] border-[#D1D5DB] h-14 pl-12 rounded-2xl font-black text-lg text-[#111111]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-4 border-[#D1D5DB]">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-[#F3F4F6] px-4">
                      <AccordionTrigger className="text-sm font-black uppercase tracking-widest hover:no-underline hover:text-blue-600 text-left py-6 text-[#111111]">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#555555]/60 font-bold text-sm leading-relaxed pb-6 uppercase">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#555555]/20 font-black uppercase tracking-widest">
                    Nenhum resultado encontrado.
                  </div>
                )}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-green-100 bg-green-50">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="text-green-600" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase text-[#111111]">Suporte 24/7</h3>
              </div>
              <p className="text-sm text-[#555555]/60 font-bold mb-6 uppercase tracking-tight">
                Fala diretamente com a nossa equipa via WhatsApp.
              </p>
              <Button 
                asChild
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Phone size={16} className="mr-2" /> ABRIR CHAT
                </a>
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-blue-100 bg-blue-50">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-blue-600" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase text-[#111111]">E-mail</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-100 text-center shadow-sm">
                <p className="text-[10px] font-black text-[#555555]/40 uppercase tracking-widest mb-1">Contato Oficial</p>
                <p className="text-sm font-black text-blue-600">suporte@borasorteiar.com</p>
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