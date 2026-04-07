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
        "relative flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all duration-300 min-w-[140px] group active:scale-95",
        isSelected 
          ? "bg-white border-[#0066FF] shadow-[0_15px_40px_rgba(0,102,255,0.15)] scale-105 z-10" 
          : "bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#D1D5DB] shadow-sm"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm",
        isSelected ? "premium-gradient text-white" : "bg-white text-[#0A0B12]/40 border border-[#E5E7EB]"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] mb-1.5",
        isSelected ? "text-[#0066FF]" : "text-[#0A0B12]/40"
      )}>
        {displayName}
      </span>
      
      <span className="text-lg font-black italic tracking-tighter text-[#0A0B12]">
        {module.price.toLocaleString()} <span className="text-[9px] not-italic opacity-40 uppercase ml-0.5">Kz</span>
      </span>

      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 bg-[#FFA500] text-white p-1.5 rounded-full border-2 border-white shadow-md">
           <Star size={10} fill="white" />
        </div>
      )}
    </button>
  );
};

export default ModuleCard;