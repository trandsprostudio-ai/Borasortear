"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Award, Target, Crown, Gem, Star, Shield } from 'lucide-react';

interface ModuleCardProps {
  module: any;
  isSelected: boolean;
  onSelect: () => void;
}

const getIcon = (name: string) => {
  if (name === 'BOSS') return <Shield size={16} />;
  if (name.includes('100')) return <Zap size={16} />;
  if (name.includes('200')) return <Target size={16} />;
  if (name.includes('500')) return <Award size={16} />;
  if (name.includes('1000')) return <Trophy size={16} />;
  if (name.includes('2000')) return <Crown size={16} />;
  return <Gem size={16} />;
};

const ModuleCard = ({ module, isSelected, onSelect }: ModuleCardProps) => {
  const isBoss = module.name === 'BOSS';
  const displayName = isBoss ? 'Módulo' : module.name.replace('M', 'Módulo ');

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all duration-500 min-w-[130px] md:min-w-[160px] group active:scale-95 shadow-lg snap-center",
        isSelected 
          ? (isBoss 
              ? "bg-[#EBF5FF] border-[#0066FF] shadow-[0_20px_50px_rgba(0,102,255,0.15)] scale-105 z-10" 
              : "bg-white border-[#0066FF] shadow-[0_20px_50px_rgba(0,102,255,0.2)] scale-105 z-10")
          : "bg-[#D1D5DB] border-[#9CA3AF] hover:border-[#0066FF] shadow-black/5"
      )}
    >
      <div className={cn(
        "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] flex items-center justify-center mb-3 md:mb-4 transition-all shadow-md border",
        isSelected 
          ? (isBoss ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white border-transparent" : "premium-gradient text-white border-transparent")
          : "bg-white text-[#0A0B12]/60 border-[#D1D5DB] group-hover:border-[#0066FF]/20"
      )}>
        {getIcon(module.name)}
      </div>

      <span className={cn(
        "text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] mb-1 md:mb-1.5 transition-colors",
        isSelected ? "text-[#0066FF]" : "text-[#0A0B12]/60"
      )}>
        {displayName}
      </span>
      
      <span className={cn(
        "text-base md:text-xl font-black italic tracking-tighter text-[#0A0B12]",
        isSelected && isBoss && "text-[#0066FF]"
      )}>
        {isBoss ? (
          <span className="text-amber-600 text-[10px] md:text-sm uppercase tracking-widest not-italic">PREMIUM</span>
        ) : (
          <>
            {module.price.toLocaleString()} <span className="text-[8px] md:text-[10px] not-italic opacity-40 uppercase ml-0.5">Kz</span>
          </>
        )}
      </span>

      {isSelected && (
        <div className={cn(
          "absolute -top-1 -right-1 p-1.5 md:p-2 rounded-full border-2 border-white shadow-xl animate-bounce",
          isBoss ? "bg-blue-500" : "bg-[#FFA500]"
        )}>
           <Star size={10} fill="white" className="text-white md:w-3 md:h-3" />
        </div>
      )}
    </button>
  );
};

export default ModuleCard;