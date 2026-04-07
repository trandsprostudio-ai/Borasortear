"use client";

import React from 'react';
import BoraIcon from './BoraIcon';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-1 font-black italic tracking-tighter select-none ${className}`}>
      <span className="text-[#111111] text-2xl">B</span>
      
      <BoraIcon className="w-7 h-7" />

      <span className="text-[#111111] text-2xl">RA</span>
      <span className="text-blue-600 text-2xl ml-0.5">SORTEAR</span>
    </div>
  );
};

export default Logo;