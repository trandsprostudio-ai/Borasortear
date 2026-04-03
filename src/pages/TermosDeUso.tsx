"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Shield, AlertTriangle, Scale, CreditCard, UserCheck } from 'lucide-react';
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
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Atualizado em: Outubro de 2024</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="text-purple-500" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">1. Aceitação dos Termos</h2>
            </div>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Ao aceder e utilizar a plataforma BORA SORTEIAR, o utilizador concorda em cumprir e estar vinculado a estes Termos de Uso. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="text-purple-500" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">2. Elegibilidade</h2>
            </div>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              O uso da plataforma é EXCLUSIVAMENTE restrito a indivíduos com idade igual ou superior a 18 anos. É terminantemente proibida a utilização do serviço por menores de idade, mesmo que assistidos. Ao registar-se, o utilizador declara possuir capacidade legal para assumir responsabilidades financeiras. A plataforma reserva-se o direito de banir permanentemente qualquer conta sob suspeita de idade insuficiente.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-purple-500" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">3. Contas de Utilizador</h2>
            </div>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Cada utilizador é responsável por manter a confidencialidade das suas credenciais de acesso. Atividades suspeitas ou uso não autorizado da conta devem ser comunicados imediatamente ao suporte. É proibida a criação de múltiplas contas pelo mesmo utilizador para manipulação do sistema.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-purple-500" size={24} />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">4. Depósitos e Levantamentos</h2>
            </div>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Os depósitos são realizados via Multicaixa Express ou Unitel Money e requerem a submissão de um comprovativo válido. O saldo é creditado após validação manual (até 15 minutos). Os levantamentos são processados para o número Express associado ao perfil num prazo de até 24 horas úteis.
            </p>
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-1 shrink-0" size={18} />
              <p className="text-[11px] text-amber-500/80 font-bold uppercase leading-tight">
                Tentativas de fraude, como a submissão de comprovativos falsos, resultarão no banimento imediato da conta e perda total de saldos acumulados.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">5. Regras dos Sorteios</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Cada mesa possui um custo de entrada e um número fixo de participantes. O sorteio ocorre automaticamente quando a mesa atinge a lotação máxima ou quando o tempo de 3 horas expira. A plataforma seleciona aleatoriamente 2 bilhetes vencedores entre os participantes reais presentes na mesa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">6. Distribuição de Prêmios</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Os prêmios são creditados automaticamente na carteira dos vencedores. A plataforma retém uma taxa de intermediação (33.4%) destinada à manutenção do sistema, suporte e financiamento do programa de afiliados. A BORA SORTEIAR não participa nem concorre em qualquer sorteio realizado na plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">7. Programa de Afiliados</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              O bónus de convite (1.000 Kz) é creditado após o registo bem-sucedido de um novo utilizador através do link de afiliado. A comissão de 5% sobre ganhos é vitalícia e aplicada apenas sobre os prémios ganhos pelos indicados diretos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-purple-500">8. Modificações do Serviço</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do serviço a qualquer momento. Estes termos podem ser atualizados periodicamente, sendo a utilização continuada da plataforma considerada como aceitação das novas condições.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );