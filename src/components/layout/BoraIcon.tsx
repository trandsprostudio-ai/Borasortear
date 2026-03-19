"use client";

import React from 'react';

const BoraIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* O círculo da letra O */}
      <div className="absolute inset-0 border-[3.5px] border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
      
      {/* O Boneco sentado */}
      <svg 
        viewBox="0 0 24 24" 
        className="absolute -top-[15%] w-[70%] h-[70%] text-white drop-shadow-md"
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
      <span className="absolute -top-[25%] -right-[25%] text-[40%] animate-bounce">💰</span>
    </div>
  );
};

export default BoraIcon;