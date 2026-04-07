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
  if (name.includes('100')) return <Zap size={14} />;
  if (name.includes('200')) return <Target size={14} />;
  if (name.includes('500')) return <Award size={14} />;
  if (name.includes('1000')) return <Trophy size={14} />;
  if (name.includes('2000')) return <Crown size={14} />;
  return <Gem size={14} />;
};

const ModuleCard = ({ module, isSelected, onSelect }: ModuleCardProps) => {
  const displayName = module.name.replace('M', 'Módulo ');

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 min-w-[130px] group",
        isSelected 
          ? "bg-[#E3F2FD] border-blue-500 shadow-lg" 
          : "bg-[#f5f5f5] border-[#e0e0e0] hover:bg-[#ebebeb]"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
        isSelected ? "premium-gradient text-white" : "bg-[#e0e0e0] text-[#555555]/40"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[8px] font-black uppercase tracking-[0.2em] mb-1",
        isSelected ? "text-blue-600" : "text-[#555555]/40"
      )}>
        {displayName}
      </span>
      
      <span className="text-sm font-black italic tracking-tighter text-[#111111]">
        {module.price.toLocaleString()} <span className="text-[8px] not-italic opacity-30 uppercase ml-0.5">Kz</span>
      </span>
    </button>
  );
};

export default ModuleCard;