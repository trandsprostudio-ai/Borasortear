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
        {/* Camisa Amarela */}
        <path 
          d="M7.5 14C6.5 16 6 18 6 20C6 20.5 6.5 21 8 21H16C17.5 21 18 20.5 18 20C18 18 17.5 16 16.5 14C15.5 13 14.5 12.5 12 12.5C9.5 12.5 8.5 13 7.5 14Z" 
          fill="#FACC15" 
        />
        {/* Barriga Branca */}
        <path 
          d="M12 15C10.5 15 9.5 16.5 9.5 18.5C9.5 20 10.5 21 12 21C13.5 21 14.5 20 14.5 18.5C14.5 16.5 13.5 15 12 15Z" 
          fill="white" 
        />
        {/* Olhos */}
        <circle cx="10" cy="7.5" r="1.2" fill="white" />
        <circle cx="14" cy="7.5" r="1.2" fill="white" />
        <circle cx="10" cy="7.5" r="0.5" fill="black" />
        <circle cx="14" cy="7.5" r="0.5" fill="black" />
        {/* Bico */}
        <path d="M12 8.5L11 10H13L12 8.5Z" fill="#F97316" />
        {/* Patas */}
        <path d="M9 21.5L8 22.5H10L9 21.5Z" fill="#F97316" />
        <path d="M15 21.5L14 22.5H16L15 21.5Z" fill="#F97316" />
      </svg>
      
      {/* Saco de Dinheiro Flutuante */}
      <span className="absolute -top-[15%] -right-[15%] text-[50%] filter drop-shadow-md animate-bounce">
        💰
      </span>
    </div>
  );
};

export default BoraIcon;