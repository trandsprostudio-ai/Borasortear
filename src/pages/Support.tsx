"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { HelpCircle, MessageCircle, ShieldCheck, Zap, ChevronRight, Phone, Mail, FileText, Info, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from '@/components/layout/Footer';

const Support = () => {
  const WHATSAPP_LINK = "https://wa.me/244933271690"; // Usando o número base do admin

  const faqs = [
    {
      q: "O que é o BORA SORTEIAR?",
      a: "O BORA SORTEIAR é uma plataforma digital de sorteios, organizada por módulos e salas, que permite aos utilizadores participarem em sorteios mediante a aquisição de entradas digitais, de acordo com as regras aqui estabelecidas."
    },
    {
      q: "Como participar?",
      a: "1. Crie sua conta na plataforma. 2. Faça uma recarga de sua conta. 3. Escolha o módulo desejado. 4. Entre em uma das salas disponíveis. 5. Aguarde o encerramento e o resultado."
    },
    {
      q: "Quanto tempo dura uma sala?",
      a: "Cada sala fica aberta por até 5 horas. Pode fechar antes se atingir o número máximo de participantes."
    },
    {
      q: "Quando sai o resultado?",
      a: "O resultado é divulgado até 10 minutos após o encerramento da sala."
    },
    {
      q: "Onde vejo os resultados?",
      a: "Nas abas Registos, minhas bolsas e consultar bilhete, onde ficam armazenados todos os resultados das salas encerradas (No perfil do usúario)."
    },
    {
      q: "Posso participar em várias salas?",
      a: "Sim. O utilizador pode participar em múltiplas salas, desde que tenha créditos suficientes."
    },
    {
      q: "Como faço recarga?",
      a: "A plataforma disponibiliza métodos de pagamento digitais. Basta escolher o método, seguir as instruções e aguardar a atualização do crédito."
    },
    {
      q: "Meu crédito não entrou, o que fazer?",
      a: "Entre em contacto com o suporte pelo canal indicado no app e informe: Valor, Método de pagamento e Data."
    },
    {
      q: "Os créditos podem ser devolvidos?",
      a: "Não. Após a confirmação da participação em uma sala, os créditos não são reembolsáveis."
    },
    {
      q: "Como recebo meu prémio?",
      a: "Os prémios são creditados automaticamente na conta do utilizador vencedor após solicitar o saque."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 rounded-[2.5rem] border-white/5 group hover:border-purple-500/30 transition-all">
                <MessageCircle className="text-purple-500 mb-4" size={32} />
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Suporte via WhatsApp</h3>
                <p className="text-sm text-white/40 font-bold mb-6">Fale diretamente com nossa equipe de atendimento para resolver qualquer problema.</p>
                <Button 
                  asChild
                  className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    <Phone size={16} className="mr-2" /> INICIAR CONVERSA
                  </a>
                </Button>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] border-white/5 group hover:border-blue-500/30 transition-all">
                <Mail className="text-blue-500 mb-4" size={32} />
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">E-mail Oficial</h3>
                <p className="text-sm text-white/40 font-bold mb-6">Envie comprovantes ou dúvidas técnicas para nossa equipe de análise.</p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-white/60">
                  suporte@borasorteiar.com
                </div>
              </div>
            </div>

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
                  O BORA SORTEIAR é uma plataforma digital de sorteios, organizada por módulos e salas, que permite aos utilizadores participarem em sorteios mediante a aquisição de entradas digitais, de acordo com as regras aqui estabelecidas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">1</div>
                    Definições Gerais
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    Ao utilizar a plataforma, o utilizador declara que leu, compreendeu e concorda integralmente com estes Termos e Condições.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">2</div>
                    Elegibilidade
                  </h3>
                  <ul className="text-sm text-white/40 font-bold leading-relaxed pl-8 space-y-2">
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-purple-500 mt-1 shrink-0" /> Pessoas maiores de idade;</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-purple-500 mt-1 shrink-0" /> Com capacidade legal para realizar transações digitais;</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-purple-500 mt-1 shrink-0" /> Que forneçam informações verdadeiras e atualizadas no cadastro.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">3</div>
                    Estrutura dos Sorteios
                  </h3>
                  <div className="pl-8 space-y-4">
                    <div>
                      <h4 className="text-white font-black text-xs uppercase mb-2">3.1 Módulos</h4>
                      <p className="text-sm text-white/40 font-bold">A plataforma opera com os módulos: 100 Kz, 200 Kz, 500 Kz, 1.000 Kz, 2.000 Kz e 5.000 Kz. Cada módulo possui regras idênticas, variando apenas o valor.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-xs uppercase mb-2">3.2 Salas de Sorteio</h4>
                      <p className="text-sm text-white/40 font-bold">Cada módulo contém 5 salas ativas. Cada sala permanece aberta por até 5 horas. Usuários podem acessar até faltar 10 minutos para o encerramento.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-xs uppercase mb-2">3.3 Encerramento e Resultados</h4>
                      <p className="text-sm text-white/40 font-bold">O resultado é apurado em até 10 minutos após o encerramento. Resultados disponíveis em Ranking, Minhas Mesas e Consultar Bilhetes.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">4</div>
                    Participação e Créditos
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    A participação ocorre através de créditos digitais. Os créditos não são reembolsáveis após a confirmação da participação em uma sala.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">5</div>
                    Pagamentos e Recargas
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    O crédito é atualizado após a confirmação do pagamento. A plataforma não se responsabiliza por erros causados por pagamentos realizados fora das instruções fornecidas.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">6</div>
                    Prémios
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    Os prémios são atribuídos exclusivamente aos vencedores apurados pelo sistema e creditados diretamente na conta do utilizador vencedor.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-500 text-xs">7</div>
                    Responsabilidades do Utilizador
                  </h3>
                  <p className="text-sm text-white/40 font-bold leading-relaxed pl-8">
                    O utilizador compromete-se a não utilizar a plataforma para fins ilícitos ou manipular resultados. Qualquer tentativa de fraude resultará no bloqueio imediato.
                  </p>
                </section>
              </div>

              <div className="pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Última atualização: Outubro 2024</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-20 bg-gradient-to-br from-purple-900/20 to-transparent p-10 rounded-[3rem] border border-white/5 text-center">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Ainda tem dúvidas?</h3>
          <p className="text-white/40 font-bold mb-8">Nossa equipe está disponível 24/7 para garantir sua melhor experiência.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-gray-200 font-black px-8 rounded-xl h-12">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                FALAR COM SUPORTE
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;