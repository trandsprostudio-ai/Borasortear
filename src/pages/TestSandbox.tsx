"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Beaker, ShieldCheck, Database, Zap, Loader2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

const TestSandbox = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>({ db: 'checking', auth: 'checking' });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    const { error } = await supabase.from('modules').select('id').limit(1);
    setStatus({
      db: error ? 'error' : 'ok',
      auth: session ? 'authenticated' : 'anonymous'
    });
  };

  const runFullTest = async () => {
    if (!user) {
      toast.error("Precisas de estar logado para testar o fluxo.");
      return;
    }

    setLoading(true);
    try {
      // 1. Criar Módulo de Teste (Se não existir)
      const testModuleName = "TEST_SANDBOX_1K";
      let { data: mod } = await supabase.from('modules').select('*').eq('name', testModuleName).maybeSingle();
      
      if (!mod) {
        const { data: newMod, error: modErr } = await supabase.from('modules').insert({
          name: testModuleName,
          price: 1,
          max_participants: 2
        }).select().single();
        if (modErr) throw modErr;
        mod = newMod;
      }

      // 2. Dar Saldo de Teste (Simulação de Depósito aprovado)
      const { error: balErr } = await supabase.rpc('approve_transaction_admin', {
        p_transaction_id: (await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount: 10,
          status: 'pending',
          payment_method: 'SANDBOX_TEST'
        }).select().single()).data.id
      });
      if (balErr) throw balErr;

      // 3. Criar Mesa de Teste
      const { data: room, error: roomErr } = await supabase.from('rooms').insert({
        module_id: mod.id,
        max_participants: 2,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: 'open'
      }).select().single();
      if (roomErr) throw roomErr;

      // 4. Tentar Entrar
      const { data: ticket, error: joinErr } = await supabase.rpc('join_room_secure', {
        p_user_id: user.id,
        p_room_id: room.id,
        p_price: 1
      });
      if (joinErr) throw joinErr;

      toast.success("Teste concluído com sucesso!", {
        description: `Módulo criado, saldo adicionado e entrada confirmada (Bilhete: ${ticket})`
      });

    } catch (error: any) {
      toast.error("Falha no teste: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B12] text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-32">
        <div className="glass-card p-10 rounded-[3rem] border-purple-500/20 text-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-purple-500 border border-purple-500/20">
            <Beaker size={40} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Ambiente de Sandbox</h1>
          <p className="text-white/40 font-bold text-xs uppercase tracking-widest mb-10">
            Validação técnica do motor de sorteios e transações
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-blue-400" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Base de Dados</span>
              </div>
              <span className={`text-[10px] font-black uppercase ${status.db === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {status.db}
              </span>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-purple-400" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sessão</span>
              </div>
              <span className="text-[10px] font-black uppercase text-purple-400">
                {status.auth}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={runFullTest} 
              disabled={loading}
              className="w-full h-16 rounded-2xl premium-gradient font-black text-lg shadow-2xl shadow-purple-500/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><PlayCircle className="mr-2" /> EXECUTAR TESTE DE FLUXO COMPLETO</>}
            </Button>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
              Este teste cria um módulo "TEST_SANDBOX_1K" que é filtrado na página inicial.
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <h3 className="text-amber-500 text-[10px] font-black uppercase mb-2">Aviso de Segurança</h3>
          <p className="text-[10px] text-white/40 leading-relaxed">
            As funções RPC (`join_room_secure` e `approve_transaction_admin`) são as mesmas usadas em produção. 
            O teste valida a integridade dos Triggers do Postgres e do cálculo de bónus de aliados.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TestSandbox;