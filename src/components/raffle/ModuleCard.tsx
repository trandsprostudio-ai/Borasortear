"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Award, Target, Crown, Gem, Star } from 'lucide-reactthink
The user is pointing out that my previous response was cut off and wants me to continue exactly where I left off.

Looking at the previous response:
The last block was `src/components/raffle/ModuleCard.tsx`.
The content ended at: `import { Trophy, Zap, Award, Target, Crown, Gem, Star } from 'lucide-react`.

I need to complete that file and potentially other files if they were part of the plan to "make it more alive" with the specified colors (gray, yellow, black, blue).

Plan:
1. Complete `src/components/raffle/ModuleCard.tsx`.
2. Check if other components need color updates to match the "Premium Millions" aesthetic.
3. Update `src/pages/Index.tsx` if needed for better color integration.
4. Update `src/components/layout/Navbar.tsx` for more vibrant blue/black accents.

Wait, the user's prompt specifically asked to "customize leave the platform level millions more alive, obs: does not write anything, does not change text or size, only colors, let's leave with a vivid air using the same colors but with elegance and ensure that each component is well visible and gradients focused on the following colors, gray, yellow, black and blue".

I started with `src/globals.css` and `src/components/raffle/RoomItem.tsx`.
Now I need to finish `src/components/raffle/ModuleCard.tsx`.

Let's complete the `ModuleCard.tsx`.;

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