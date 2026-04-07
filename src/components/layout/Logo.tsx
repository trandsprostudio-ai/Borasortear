"use client";

import React from 'react';
import BoraIcon from './BoraIcon';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo = ({ className = "", variant = 'dark' }: LogoProps) => {
  // Se for variant 'light', o texto deve ser branco. Se for 'dark', o texto deve ser escuro (#111111).
  const textColor = variant === 'light' ? 'text-white' : 'text-[#111111]';

  return (
    <div className={`flex items-center gap-0.5 font-black italic tracking-tighter select-none ${className}`}>
      <span className={`${textColor} text-xl md:text-2xl`}>B</span>
      
      <BoraIcon className="w-6 h-6 md:w-7 md:h-7" />

      <span className={`${textColor} text-xl md:text-2xl -ml-0.5`}>RA</span>
      <span className="text-blue-600 text-xl md:text-2xl ml-1 tracking-tight">SORTEAR</span>
    </div>
  );
};

export default Logo;