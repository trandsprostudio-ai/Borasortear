"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lista de 50 Jogadores Fictícios com nomes típicos e criativos
const MOCK_PLAYERS = [
  "Ramos_King", "Ana_Luiza", "Kelson_24", "Marta_Vip", "Bravo_Uno", 
  "Sorte_Angola", "Milionario_AO", "Vencedor_99", "Elite_Player", "Diva_Sortuda",
  "Felix_Gamer", "Bruna_Millions", "Mauro_Boss", "Kianda_Sorte", "Nelo_Panda",
  "Afonso_10", "Zelia_Ganhadora", "Paulo_Vibe", "Sandra_Win", "Tiago_Top",
  "Mestre_Sorteio", "Rosa_Diamond", "Carlos_Flash", "Yola_Gold", "Gelson_M",
  "Isabel_Prestige", "Dario_Ango", "Silvia_Fama", "Vitor_Luck", "Teresa_Rich",
  "Jandira_Best", "Manico_2024", "Helder_Power", "Carla_Estrela", "Nelson_G",
  "Erica_Fiel", "Joaquim_Pro", "Madalena_V", "Inacio_Lucky", "Beatriz_M",
  "Cristiano_W", "Feliciano_88", "Gisela_Top", "Hamilton_Lux", "Igor_Play",
  "Janeth_Sortuda", "Kevin_Bora", "Lurdes_King", "Moises_Vencedor", "Nadia_AO"
];

const MODULES = ["M100", "M200", "M500", "M1000", "M2000", "M5000"];

const HallOfFame = () => {
  const [index, setIndex] = useState(0);
  const [displayWinners, setDisplayWinners] = useState<any[]>([]);

  // Gerador de Ganhos Aleatórios
  const generateRandomWinner = () => {
    const player = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    
    // Probabilidade de prémio absurdo (15% de chance)
    const isAbsurd = Math.random() < 0.15;
    let amount = 0;

    if (isAbsurd) {
      // Prémios Absurdos: entre 10.000 Kz e 50.000 Kz
      amount = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000;
    } else {
      // Prémios Comuns: entre 300 Kz e 5.000 Kz
      amount = Math.floor(Math.random() * (5000 - 300 + 1)) + 300;
    }

    return { id: player, amount, module };
  };

  useEffect(() => {
    // Inicializa com um vencedor
    setDisplayWinners([generateRandomWinner()]);

    const timer = setInterval(() => {
      const nextWinner = generateRandomWinner();
      setDisplayWinners(prev => {
        const newList = [nextWinner, ...prev];
        return newList.slice(0, 10); // Mantém apenas os últimos 10 gerados para economia de memória
      });
      setIndex(prev => prev + 1);
    }, 4500); // Troca a cada 4.5 segundos

    return () => clearInterval(timer);
  }, []);

  const currentWinner = displayWinners[0] || { id: "Bora Sortear", amount: 0, module: "Aguardando" };

  return (
    <div className="platinum-gradient rounded-[3rem] overflow-hidden h-[450px] flex flex-col relative border-2 border-[#E5E7EB] shadow-2xl">
      {/* Cabeçalho */}
      <div className="p-7 border-b border-[#D1D5DB] bg-white/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFA500]/10 rounded-xl flex items-center justify-center border border-[#FFA500]/20">
            <Trophy size={18} className="text-[#FFA500]" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0A0B12]">Ganhadores VIP</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full border border-blue-400">
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
           <span className="text-[8px] font-black text-white uppercase tracking-widest">AO VIVO</span>
        </div>
      </div>
      
      {/* Área do Vencedor */}
      <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#0066FF,_transparent)]" />
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            initial={{ y: 30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="p-10 text-center"
          >
            <div className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/30 border border-white/10 rotate-3">
              <Award size={40} className="text-white" />
            </div>
            
            <p className="text-[10px] font-black text-[#0066FF] uppercase tracking-[0.4em] mb-3 bg-blue-50 inline-block px-4 py-1 rounded-full border border-blue-100">
              {currentWinner.module}
            </p>
            
            <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-[#0A0B12]">
              @{currentWinner.id}
            </h4>
            
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-[1.5rem] border border-white/30 shadow-xl transition-all ${
              currentWinner.amount >= 10000 
              ? 'bg-[#FF4500] text-white shadow-[#FF4500]/20 scale-110' 
              : 'gold-gradient text-black shadow-yellow-500/20'
            }`}>
              <TrendingUp size={18} />
              <span className="text-2xl font-black italic tracking-tighter">
                +{currentWinner.amount.toLocaleString()} Kz
              </span>
            </div>

            {currentWinner.amount >= 10000 && (
              <p className="mt-4 text-[9px] font-black text-[#FF4500] uppercase animate-pulse">
                🏆 PRÉMIO ÉPICO DETECTADO!
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de Carregamento */}
      <div className="p-6 bg-white/40 backdrop-blur-sm border-t border-[#D1D5DB] flex gap-2 justify-center">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index % 5 === i ? 'w-8 bg-[#0066FF] shadow-[0_0_8px_#0066FF]' : 'w-2 bg-[#D1D5DB]'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default HallOfFame;