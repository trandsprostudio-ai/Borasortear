"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageType = 'home' | 'raffle' | 'logout';

interface PenguinMascotProps {
  page: PageType;
  className?: string;
}

const PHRASES: Record<PageType, string[]> = {
  home: [
    "Bem-vindo à elite! Já viste as nossas novas mesas VIP hoje?",
    "Sinto um cheiro a prémio no ar... será que hoje é o teu grande dia?",
    "A tua próxima grande vitória pode estar a apenas um clique de distância!",
    "Não fiques de fora! Entra na mesa de 5 mil e triplica o teu saldo agora!",
    "Ganhe até 500.000 Kz em prémios reais. A sorte favorece os audazes!"
  ],
  raffle: [
    "Sinto que este bilhete tem algo muito especial... vamos com tudo!",
    "Quanto mais participares, mais chances tens de dominar o pódio, sabes né?",
    "Boa sorte, campeão! 🍀 Confirma os teus dados e vamos buscar esse prémio!",
    "A energia desta mesa está incrível! A tua vaga para a vitória está garantida!"
  ],
  logout: [
    "Foi um prazer ter-te connosco! A tua sorte fica guardada aqui.",
    "Já vou ter saudades das tuas jogadas... volta em breve para ganhar mais!",
    "Até breve, mestre dos sorteios! O pódio espera pelo teu regresso."
  ]
};

const PenguinMascot = ({ page, className = "" }: PenguinMascotProps) => {
  const [index, setIndex] = useState(0);
  const currentPhrases = PHRASES[page];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % currentPhrases.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [currentPhrases]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Balão de Fala mais amplo */}
      <div className="relative mb-2 w-full px-4 flex justify-center min-h-[75px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${page}-${index}`}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="bg-white text-[#0A0B12] px-5 py-3 rounded-[1.8rem] shadow-[0_15px_45px_rgba(0,0,0,0.6)] border-2 border-purple-500 relative max-w-[260px] md:max-w-[300px]"
          >
            <p className="text-[10px] md:text-[11px] font-black italic text-center uppercase tracking-tight leading-normal">
              {currentPhrases[index]}
            </p>
            {/* Seta do Balão */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mascote Pinguim com Barbatanas Realistas */}
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 blur-md rounded-full"
        />

        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 md:w-40 md:h-40 z-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Corpo (Preto e Branco) */}
            <path d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" fill="#0F111A" />
            
            {/* Barbatanas Realistas (Presas ao corpo) */}
            <motion.path 
              d="M26 45C22 45 18 55 20 70" stroke="#0F111A" strokeWidth="9" strokeLinecap="round"
              animate={{ rotate: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: '26px', originY: '45px' }}
            />
            <motion.path 
              d="M74 45C78 45 82 55 80 70" stroke="#0F111A" strokeWidth="9" strokeLinecap="round"
              animate={{ rotate: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{ originX: '74px', originY: '45px' }}
            />
            
            <path d="M50 25C40 25 32 35 32 50C32 70 38 85 50 85C62 85 68 70 68 50C68 35 60 25 50 25Z" fill="white" />
            <path d="M32 55C32 75 38 85 50 85C62 85 68 75 68 55C58 52 42 52 32 55Z" fill="#FACC15" />
            <text x="50" y="72" fontSize="7" fill="#0F111A" fontWeight="900" textAnchor="middle" style={{ fontStyle: 'italic', letterSpacing: '-0.02em' }}>BORA?</text>

            {/* Olhos com Piscar Rápido */}
            <circle cx="42" cy="35" r="4" fill="white" />
            <circle cx="58" cy="35" r="4" fill="white" />
            
            <motion.circle 
              cx="42.5" cy="35" r="2.2" fill="black" 
              animate={{ scaleY: [1, 1, 1, 0, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.9, 0.95, 1] }}
              style={{ originY: '35px' }}
            />
            <motion.circle 
              cx="57.5" cy="35" r="2.2" fill="black" 
              animate={{ scaleY: [1, 1, 1, 0, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.9, 0.95, 1] }}
              style={{ originY: '35px' }}
            />
            
            <circle cx="41.5" cy="33.5" r="0.8" fill="white" opacity="0.8" />
            <circle cx="56.5" cy="33.5" r="0.8" fill="white" opacity="0.8" />

            <path d="M50 38L45 44H55L50 38Z" fill="#F97316" />
            <circle cx="40" cy="89" r="3" fill="#F97316" />
            <circle cx="60" cy="89" r="3" fill="#F97316" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default PenguinMascot;