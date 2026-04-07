"use client";

import React from 'react';
import BoraIcon from './BoraIcon';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-0.5 font-black italic tracking-tighter select-none ${className}`}>
      <span className="text-[#111111] text-xl md:text-2xl">B</span>
      
      <BoraIcon className="w-6 h-6 md:w-7 md:h-7" />

      <span className="text-[#111111] text-xl md:text-2xl -ml-0.5">RA</span>
      <span className="text-blue-600 text-xl md:text-2xl ml-1 tracking-tight">SORTEAR</span>
    </div>
  );
};

export default Logo;