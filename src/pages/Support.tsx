"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, MessageCircle, ShieldCheck, Zap, ChevronRight, Phone, Mail, FileText, Info, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from '@/components/layout/Footer';

const Support = () => {
  const WHATSAPP_LINK = "https://wa.me/244933271690";

  const faqs = [
    {
      q: "O que é o BORA SORTEIAR?",
      a: "O BORA SORTEIAR é uma plataforma digital de sorteios, organizada por módulos e salas, que permite aos utilizadores participarem em sorteios mediante a aquisição de entradas digitais."
    },
    {
      q: "Como participar?",
      a: "1. Crie sua conta. 2. Faça uma recarga. 3. Escolha o módulo. 4. Entre em uma das 4 salas disponíveis. 5. Aguarde o encerramento e o resultado instantâneo."
    },
    {
      q: "Quanto tempo dura uma sala?",
      a: "Cada sala fica aberta por até 3 horas. Ela fecha automaticamente se atingir o número máximo de participantes ou ao término do tempo."
    },
    {
      q: "Quando sai o resultado?",
      a: "O resultado é apurado instantaneamente após o encerramento da sala, estilo bet."
    },
    {
      q: "Como funciona a premiação?",
      a: "Em cada sala ganham 3 participantes: o 1º leva 33%, o 2º leva 33% e a plataforma (3º participante) leva 34% do valor total arrecadado."
    },
    {
      q: "Onde vejo os resultados?",
      a: "Nas abas 'Minhas Mesas' e 'Consultar Bilhete', onde ficam armazenados todos os resultados."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-500 border border-purple-500/20">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Suporte & Termos</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Tudo o que você precisa saber para jogar com segurança</p>
        </div>

        <Tabs defaultValue="help" className="space-y-10">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 w-full max-w-md mx-auto flex">
            <TabsTrigger value="help" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <Info size={14} className="mr-2" /> Ajuda
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">
              <FileText size={14} className="mr-2" /> Termos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="help" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
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
          </TabsContent>

          <TabsContent value="terms" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-purple-500">Termos e Condições</h2>
                <p className="text-sm text-white/40 font-bold leading-relaxed">
                  O BORA SORTEIAR opera com módulos de 100 Kz a 5.000 Kz, cada um com 4 salas ativas simultaneamente.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">1</div>
                    Estrutura dos Sorteios
                  </h3>
                  <div className="pl-8 space-y-4">
                    <p className="text-sm text-white/40 font-bold">Salas fecham com o número máximo de participantes ou após 3 horas. O sorteio é instantâneo e uma nova sala é aberta imediatamente após o encerramento.</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">2</div>
                    Divisão de Prêmios
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    O valor total arrecadado é dividido em 3 partes: 33% para o 1º vencedor, 33% para o 2º vencedor e 34% para a plataforma (3º participante).
                  </p>
                </section>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Support;