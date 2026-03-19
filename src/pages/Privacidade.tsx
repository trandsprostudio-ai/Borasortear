"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const Privacidade = () => {
  return (
    <div className="min-h-screen bg-[#0A0B12] text-white pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/20">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Política de Privacidade</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest">Última atualização: Outubro 2024</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-white/5 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">1. Coleta de Dados</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Coletamos informações que você fornece diretamente, como nome, número de telefone, dados bancários e informações de perfil. Também coletamos dados de uso automaticamente, incluindo interações com a plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">2. Uso das Informações</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Utilizamos suas informações para: fornecer e melhorar nossos serviços, processar transações, verificar identidade, prevenir fraudes, comunicar atualizações e cumprir obrigações legais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">3. Compartilhamento de Dados</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Não vendemos seus dados pessoais. Podemos compartilhar informações com prestadores de serviços de pagamento, autoridades competentes quando exigido por lei, e com parceiros de negócios para operação da plataforma, sempre com garantias de segurança.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">4. Segurança</h2>
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Lock className="text-blue-500 mt-1" size={24} />
              <div>
                <h3 className="font-black uppercase text-sm mb-2">Medidas de Proteção</h3>
                <p className="text-sm text-white/40 font-bold leading-relaxed">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia, acesso restrito e monitoramento contínuo. No entanto, nenhum sistema é 100% seguro.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">5. Seus Direitos</h2>
            <ul className="text-sm text-white/40 font-bold leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <Eye size={16} className="text-blue-500 mt-1 shrink-0" />
                <span>Acessar, corrigir ou excluir seus dados pessoais</span>
              </li>
              <li className="flex items-start gap-2">
                <Database size={16} className="text-blue-500 mt-1 shrink-0" />
                <span>Portabilidade de dados para outro serviço</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield size={16} className="text-blue-500 mt-1 shrink-0" />
                <span>Retirar consentimentos previamente concedidos</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">6. Retenção de Dados</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Mantemos seus dados pelo tempo necessário para cumprir os propósitos descritos nesta política, exceto quando exigido por lei. Dados de transações financeiras são retidos por pelo menos 5 anos conforme exigido pela legislação angolana.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">7. Cookies e Rastreamento</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar tendências e personalizar conteúdo. Você pode configurar seu navegador para recusar cookies, mas algumas funcionalidades podem ser limitadas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">8. Alterações na Política</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Podemos atualizar esta política periodicamente. A data da última atualização será sempre indicada no topo da página. O uso continuado após alterações constitui aceitação da nova política.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-blue-500">9. Contato</h2>
            <p className="text-sm text-white/40 font-bold leading-relaxed">
              Para questões sobre privacidade ou proteção de dados, entre em contato com nosso Encarregado de Proteção de Dados através de: dpo@borasorteiar.com
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacidade;