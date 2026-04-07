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
        "relative flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all duration-500 min-w-[140px] group",
        isSelected 
          ? "bg-white border-blue-600 shadow-2xl shadow-blue-600/10 scale-105 z-10" 
          : "bg-[#f8f9fa] border-[#e5e7eb] hover:bg-white hover:border-[#d1d5db]"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-500",
        isSelected ? "blue-gradient text-white shadow-lg shadow-blue-500/20" : "bg-white text-[#111111]/20 border border-[#e5e7eb]"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[9px] font-black uppercase tracking-[0.2em] mb-1.5",
        isSelected ? "text-blue-600" : "text-[#111111]/40"
      )}>
        {displayName}
      </span>
      
      <span className="text-base font-black italic tracking-tighter text-[#111111]">
        {module.price.toLocaleString()} <span className="text-[9px] not-italic opacity-30 uppercase ml-1">Kz</span>
      </span>

      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
      )}
    </button>
  );
};

export default ModuleCard;