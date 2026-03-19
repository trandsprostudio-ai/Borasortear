"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-500 border border-purple-500/20">
            <FileText size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Termos de Uso</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Última atualização: Outubro 2024</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">1. Aceitação dos Termos</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Ao acessar e utilizar a plataforma BORA SORTEIAR, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">2. Elegibilidade</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Você deve ter pelo menos 18 anos de idade para utilizar nossa plataforma. Ao se cadastrar, você declara que possui capacidade legal para celebrar este contrato e que todas as informações fornecidas são verdadeiras e precisas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">3. Descrição do Serviço</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              O BORA SORTEIAR é uma plataforma digital de sorteios organizados por módulos e salas. Os usuários podem adquirir entradas digitais para participar de sorteios, onde os prêmios são distribuídos conforme as regras estabelecidas nestes termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">4. Regras de Participação</h2>
            <ul className="text-sm text-white/40 font-bold leading-relaxed space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-purple-500 mt-0.5 shrink-0" />
                <span>Cada sala permanece aberta por até 3 horas ou até atingir o número máximo de participantes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-purple-500 mt-0.5 shrink-0" />
                <span>Os resultados são divulgados em até 10 minutos após o encerramento da sala</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-purple-500 mt-0.5 shrink-0" />
                <span>A participação requer créditos disponíveis na conta do usuário</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-purple-500 mt-0.5 shrink-0" />
                <span>Os créditos utilizados não são reembolsáveis após a confirmação da participação</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">5. Pagamentos e Recargas</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              A plataforma oferece múltiplos métodos de pagamento para recarga de créditos. Os valores são creditados após confirmação do pagamento. Não nos responsabilizamos por erros causados por pagamentos realizados incorretamente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">6. Prêmios</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Os prêmios são creditados automaticamente na conta do vencedor. A distribuição segue a seguinte divisão: 33.3% para o 1º lugar, 33.3% para o 2º lugar, e 33.3% como taxa de manutenção da plataforma. Usuários indicados por afiliados recebem bônus adicionais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">7. Responsabilidades do Usuário</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              O usuário se compromete a não utilizar a plataforma para fins ilícitos, a não tentar manipular resultados e a manter a confidencialidade de suas credenciais. Qualquer violação resultará em suspensão imediata da conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">8. Modificações</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação. O uso continuado da plataforma após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">9. Contato</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Para questões sobre estes termos, entre em contato através do e-mail: suporte@borasorteiar.com
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosDeUso;