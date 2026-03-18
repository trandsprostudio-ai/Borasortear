"use client";

import React from 'react';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-1 font-black italic tracking-tighter select-none ${className}`}>
      <span className="text-white text-2xl">B</span>
      
      {/* A letra O com o boneco sentado */}
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* O círculo da letra O */}
        <div className="absolute inset-0 border-[3.5px] border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
        
        {/* O Boneco sentado */}
        <svg 
          viewBox="0 0 24 24" 
          className="absolute -top-1 w-5 h-5 text-white drop-shadow-md"
          fill="currentColor"
        >
          {/* Cabeça */}
          <circle cx="12" cy="6" r="3" />
          {/* Corpo sentado */}
          <path d="M12 9c-2 0-4 1-4 3v2h8v-2c0-2-2-3-4-3z" />
          {/* Pernas dobradas (sentado) */}
          <path d="M8 14l-2 3h3l1-3M16 14l2 3h-3l-1-3" />
        </svg>
        
        {/* Dinheiro/Saco de dinheiro ao lado */}
        <span className="absolute -top-2 -right-2 text-[10px] animate-bounce">💰</span>
      </div>

      <span className="text-white text-2xl">RA</span>
      <span className="text-purple-500 text-2xl ml-0.5">SORTEIAR</span>
    </div>
  );
};

export default Logo;