"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Star, Target, Crown, Gem } from 'lucide-react';

interface ModuleCardProps {
  module: any;
  isSelected: boolean;
  onSelect: () => void;
}

const getIcon = (name: string) => {
  if (name.includes('100')) return <Zap size={14} />;
  if (name.includes('200')) return <Target size={14} />;
  if (name.includes('500')) return <Star size={14} />;
  if (name.includes('1000')) return <Trophy size={14} />;
  if (name.includes('2000')) return <Crown size={14} />;
  return <Gem size={14} />;
};

const ModuleCard = ({ module, isSelected, onSelect }: ModuleCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 min-w-[110px] group",
        isSelected 
          ? "bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.2)]" 
          : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
        isSelected ? "bg-purple-600 text-white" : "bg-white/5 text-white/40"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[8px] font-black uppercase tracking-[0.2em] mb-1",
        isSelected ? "text-purple-400" : "text-white/20"
      )}>
        {module.name}
      </span>
      
      <span className="text-sm font-black italic tracking-tighter">
        {module.price.toLocaleString()} <span className="text-[8px] not-italic opacity-30 uppercase ml-0.5">Kz</span>
      </span>
    </button>
  );
};

export default ModuleCard;