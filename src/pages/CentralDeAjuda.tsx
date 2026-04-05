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
    },
    {
      q: "Como faço recarga de créditos?",
      a: "Acesse 'Carteira' e clique em 'DEPOSITAR AGORA'. Escolha o método de pagamento (Multicaixa Express ou Unitel Money), informe o valor e anexe o comprovativo. O crédito é liberado após validação (até 15 minutos)."
    },
    {
      q: "Como solicito um saque?",
      a: "Acesse 'Carteira' > 'SOLICITAR SAQUE'. Escolha Multicaixa Express (o número deve estar cadastrado no perfil). O saque é processado em até 24 horas úteis após aprovação."
    },
    {
      q: "Como funciona o sistema de afiliados?",
      a: "Cada usuário tem um link de indicação exclusivo. Quando alguém se cadastra usando seu link, você recebe 1.000 Kz de bónus inicial e 5% de comissão sobre todos os prêmios que essa pessoa ganhar, para sempre."
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
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-500/20">
            <HelpCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Central de Ajuda</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Encontre respostas para suas dúvidas</p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar dúvidas..." 
            className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl font-black text-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-4 border-white/5">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-white/5 px-4">
                      <AccordionTrigger className="text-sm font-black uppercase tracking-widest hover:no-underline hover:text-purple-400 text-left py-6">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/40 font-bold text-sm leading-relaxed pb-6">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 font-black uppercase tracking-widest">
                    Nenhum resultado encontrado para "{searchTerm}"
                  </div>
                )}
              </Accordion>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="text-green-500" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Fale Conosco</h3>
              </div>
              <p className="text-sm text-white/40 font-bold mb-6">
                Não encontrou o que procurava? Nossa equipe está disponível 24/7 para ajudar.
              </p>
              <Button 
                asChild
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Phone size={16} className="mr-2" /> WHATSAPP
                </a>
              </Button>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-blue-500" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase">E-mail</h3>
              </div>
              <p className="text-sm text-white/40 font-bold mb-4">
                Para questões técnicas ou envio de comprovativos:
              </p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Suporte Técnico</p>
                <p className="text-sm font-black text-blue-400">suporte@borasorteiar.com</p>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-purple-500" size={24} />
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Documentos</h3>
              </div>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  asChild
                  className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 rounded-lg h-10 text-xs font-black uppercase tracking-widest"
                >
                  <a href="/termos-de-uso">
                    <FileText size={14} className="mr-3" /> Termos de Uso
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  asChild
                  className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 rounded-lg h-10 text-xs font-black uppercase tracking-widest"
                >
                  <a href="/privacidade">
                    <Shield size={14} className="mr-3" /> Política de Privacidade
                  </a>
                </Button>
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