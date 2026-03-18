"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Wallet = () => {
  const transactions = [
    { id: 1, type: 'deposit', amount: 5000, date: '2024-03-20 14:30', status: 'completed' },
    { id: 2, type: 'participation', amount: -100, date: '2024-03-20 15:00', room: 'M1 #4521' },
    { id: 3, type: 'win', amount: 33000, date: '2024-03-19 22:15', room: 'M3 #8829' },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl mb-8 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-muted-foreground mb-1">Saldo Disponível</p>
              <h1 className="text-5xl font-black text-white">12.500 <span className="text-2xl text-purple-400">Kz</span></h1>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button className="flex-1 md:flex-none premium-gradient h-14 px-8 rounded-2xl font-bold">
                <Plus size={20} className="mr-2" /> Depositar
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none border-white/10 h-14 px-8 rounded-2xl font-bold hover:bg-white/5">
                Sacar
              </Button>
            </div>
          </div>
        </motion.div>

        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History className="text-purple-500" />
            Histórico de Atividades
          </h2>
          
          <div className="space-y-3">
            {transactions.map((tx) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tx.type === 'win' ? 'bg-green-500/20 text-green-400' : 
                    tx.type === 'deposit' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-muted-foreground'
                  }`}>
                    {tx.type === 'win' ? <ArrowUpCircle size={24} /> : 
                     tx.type === 'deposit' ? <Plus size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div>
                    <p className="font-bold">
                      {tx.type === 'win' ? 'Prêmio Recebido' : 
                       tx.type === 'deposit' ? 'Depósito Realizado' : `Participação ${tx.room}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${
                  tx.amount > 0 ? 'text-green-400' : 'text-white'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} Kz
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallet;