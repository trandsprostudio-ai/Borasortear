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
  if (name.includes('100')) return <Zap size={18} />;
  if (name.includes('200')) return <Target size={18} />;
  if (name.includes('500')) return <Star size={18} />;
  if (name.includes('1000')) return <Trophy size={18} />;
  if (name.includes('2000')) return <Crown size={18} />;
  return <Gem size={18} />;
};

const ModuleCard = ({ module, isSelected, onSelect }: ModuleCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 min-w-[140px] group overflow-hidden",
        isSelected 
          ? "bg-purple-600/20 border-purple-500 shadow-[0_0_30px_rgba(124,58,237,0.3)]" 
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
      )}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500 rounded-bl-2xl flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
      )}

      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
        isSelected ? "bg-purple-600 text-white" : "bg-white/5 text-white/40"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-xs font-black uppercase tracking-widest mb-1",
        isSelected ? "text-purple-400" : "text-white/20"
      )}>
        {module.name}
      </span>
      
      <span className="text-lg font-black italic tracking-tighter">
        {module.price.toLocaleString()} <span className="text-[10px] not-italic opacity-40">Kz</span>
      </span>
    </button>
  );
};

export default ModuleCard;