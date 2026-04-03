"use client";

import React from 'react';

const BoraIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M50 10C35 10 25 25 25 45C25 70 30 90 50 90C70 90 75 70 75 45C75 25 65 10 50 10Z" 
          fill="#0A0B12" 
        />
        <path 
          d="M28 55C28 75 35 88 50 88C65 88 72 75 72 55C60 52 40 52 28 55Z" 
          fill="#FACC15" 
        />
        <circle cx="50" cy="73" r="10" fill="white" opacity="0.9" />
        <circle cx="42" cy="35" r="4" fill="white" />
        <circle cx="58" cy="35" r="4" fill="white" />
        <circle cx="42" cy="35" r="2" fill="black" />
        <circle cx="58" cy="35" r="2" fill="black" />
        <path d="M50 38L46 44H54L50 38Z" fill="#F97316" />
      </svg>
      <span className="absolute -top-[15%] -right-[15%] text-[50%] filter drop-shadow-md animate-bounce">
        💰
      </span>
    </div>
  );
};

export default BoraIcon;