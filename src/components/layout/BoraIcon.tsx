"use client";

import React from 'react';

const BoraIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Círculo Amarelo Sólido */}
      <div className="absolute inset-0 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
      
      {/* Boneco Sentado (SVG) */}
      <svg 
        viewBox="0 0 24 24" 
        className="absolute w-[65%] h-[65%] text-[#0A0B12] drop-shadow-sm"
        fill="currentColor"
      >
        {/* Cabeça */}
        <circle cx="12" cy="6" r="3.5" />
        {/* Corpo e Pernas (Posição Sentada) */}
        <path d="M12 10c-2.5 0-4.5 1.5-4.5 4v2h9v-2c0-2.5-2-4-4.5-4z" />
        <path d="M7.5 16l-2.5 3.5h4l1-3.5M16.5 16l2.5 3.5h-4l-1-3.5" />
      </svg>
      
      {/* Saco de Dinheiro Flutuante */}
      <span className="absolute -top-[20%] -right-[20%] text-[50%] filter drop-shadow-md animate-bounce">
        💰
      </span>
    </div>
  );
};

export default BoraIcon;