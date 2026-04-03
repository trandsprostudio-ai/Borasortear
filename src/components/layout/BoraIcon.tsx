"use client";

import React from 'react';

const BoraIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Corpo do Pinguim */}
        <path 
          d="M12 2C8.5 2 6 5 6 9C6 11 6.5 12.5 7.5 14C6.5 16 6 18 6 20C6 21 7 22 12 22C17 22 18 21 18 20C18 18 17.5 16 16.5 14C17.5 12.5 18 11 18 9C18 5 15.5 2 12 2Z" 
          fill="#0A0B12" 
        />
        {/* Barriga Branca */}
        <path 
          d="M12 11C9.5 11 8.5 13 8.5 16C8.5 19 9.5 21 12 21C14.5 21 15.5 19 15.5 16C15.5 13 14.5 11 12 11Z" 
          fill="white" 
        />
        {/* Olhos */}
        <circle cx="10" cy="7.5" r="1.2" fill="white" />
        <circle cx="14" cy="7.5" r="1.2" fill="white" />
        <circle cx="10" cy="7.5" r="0.5" fill="black" />
        <circle cx="14" cy="7.5" r="0.5" fill="black" />
        {/* Bico */}
        <path d="M12 8.5L11 10H13L12 8.5Z" fill="#F59E0B" />
        {/* Patas */}
        <path d="M9 21.5L8 22.5H10L9 21.5Z" fill="#F59E0B" />
        <path d="M15 21.5L14 22.5H16L15 21.5Z" fill="#F59E0B" />
      </svg>
      
      {/* Saco de Dinheiro Flutuante */}
      <span className="absolute -top-[15%] -right-[15%] text-[50%] filter drop-shadow-md animate-bounce">
        💰
      </span>
    </div>
  );
};

export default BoraIcon;