"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, FileText, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from '@/components/layout/Footer';

const Support = () => {
  const faqs = [
    {
      q: "Como funciona a premiação?",
      a: "Em cada sala ganham 2 participantes reais: o 1º leva 33.3% e o 2º leva 33.3%. O restante do valor (33.4%) é retido pela plataforma como taxa de serviço para cobrir custos operacionais e bônus de afiliados."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-28">
        <Tabs defaultValue="help" className="space-y-10">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 w-full max-w-md mx-auto flex">
            <TabsTrigger value="help" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">Ajuda</TabsTrigger>
            <TabsTrigger value="terms" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-purple-600 h-full">Termos</TabsTrigger>
          </TabsList>
          <TabsContent value="help" className="space-y-12">
            <Accordion type="single" collapsible className="glass-card rounded-[2rem] p-4 border-white/5">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-white/5 px-4">
                  <AccordionTrigger className="text-sm font-black uppercase text-left py-6">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-white/40 font-bold text-sm leading-relaxed pb-6">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Support;