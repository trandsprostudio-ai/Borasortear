"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Award, Target, Crown, Gem, Star } from 'lucide-react';

interface ModuleCardProps {
  module: any;
  isSelected: boolean;
  onSelect: () => void;
}

const getIcon = (name: string) => {
  if (name.includes('100')) return <Zap size={16} />;
  if (name.includes('200')) return <Target size={16} />;
  if (name.includes('500')) return <Award size={16} />;
  if (name.includes('1000')) return <Trophy size={16} />;
  if (name.includes('2000')) return <Crown size={16} />;
  return <Gem size={16} />;
};

const ModuleCard = ({ module, isSelected, onSelect }: ModuleCardProps) => {
  const displayName = module.name.replace('M', 'Mód. ');

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center p-5 rounded-[2.5rem] border-2 transition-all duration-500 min-w-[150px] group active:scale-95 shadow-lg",
        isSelected 
          ? "bg-white border-[#0066FF] shadow-[0_20px_50px_rgba(0,102,255,0.2)] scale-105 z-10" 
          : "platinum-gradient border-[#9CA3AF] hover:border-[#0066FF] shadow-black/5"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all shadow-md border",
        isSelected 
          ? "premium-gradient text-white border-transparent" 
          : "bg-white text-[#0A0B12]/40 border-[#D1D5DB] group-hover:border-[#0066FF]/20"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 transition-colors",
        isSelected ? "text-[#0066FF]" : "text-[#0A0B12]/40"
      )}>
        {displayName}
      </span>
      
      <span className="text-xl font-black italic tracking-tighter text-[#0A0B12]">
        {module.price.toLocaleString()} <span className="text-[10px] not-italic opacity-40 uppercase ml-0.5">Kz</span>
      </span>

      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-[#FFA500] text-white p-2 rounded-full border-2 border-white shadow-xl animate-bounce">
           <Star size={12} fill="white" />
        </div>
      )}
    </button>
  );
};

export default ModuleCard;