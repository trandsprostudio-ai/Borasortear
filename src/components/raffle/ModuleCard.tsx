"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Award, Target, Crown, Gem } from 'lucide-react';

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
        "relative flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all duration-300 min-w-[140px] group active:scale-95",
        isSelected 
          ? "bg-white border-blue-600 shadow-[0_8px_30px_rgb(0,123,255,0.2)] scale-105 z-10" 
          : "bg-white border-[#D1D5DB] hover:border-[#9CA3AF] shadow-sm"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-all",
        isSelected ? "premium-gradient text-white shadow-lg" : "bg-[#F3F4F6] text-[#111111]/40 border border-[#D1D5DB]"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] mb-1.5",
        isSelected ? "text-blue-600" : "text-[#111111]/40"
      )}>
        {displayName}
      </span>
      
      <span className="text-lg font-black italic tracking-tighter text-[#111111]">
        {module.price.toLocaleString()} <span className="text-[9px] not-italic opacity-40 uppercase ml-0.5">Kz</span>
      </span>

      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
           <Star size={10} fill="white" />
        </div>
      )}
    </button>
  );
};

export default ModuleCard;