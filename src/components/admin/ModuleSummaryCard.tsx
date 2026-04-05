"use client";

import React from 'react';
import { LayoutGrid, Loader2, Ghost } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

interface ModuleSummaryCardProps {
  module: any;
  rooms: any[];
  injectingId: string | null;
  onInject: (roomId: string) => void;
}

const ModuleSummaryCard = ({ module, rooms, injectingId, onInject }: ModuleSummaryCardProps) => {
  const totalParticipants = rooms.reduce((sum, r) => sum + r.current_participants, 0);
  const maxPossible = module.max_participants * 3;
  const progress = Math.min(Math.round((totalParticipants / maxPossible) * 100), 100);

  return (
    <div className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <LayoutGrid size={60} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 font-black">
              {module.name}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">{module.name}</p>
              <p className="text-[10px] text-white/20">{module.price.toLocaleString()} Kz</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {rooms.length}/3 Salas
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Participantes</span>
            <span className="text-lg font-black text-green-400">{totalParticipants} / {maxPossible}</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {rooms.map((room, idx) => (
            <div key={room.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  room.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  room.status === 'closed' ? 'bg-amber-500/20 text-amber-400' :
                  room.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white/60">Mesa {idx + 1}</span>
                  <span className="text-[9px] text-white/20">{room.current_participants}/{room.max_participants}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {room.status === 'open' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={injectingId === room.id}
                    onClick={() => onInject(room.id)}
                    className="h-8 w-8 text-white/20 hover:text-purple-400 hover:bg-purple-500/10"
                  >
                    {injectingId === room.id ? <Loader2 size={14} className="animate-spin" /> : <Ghost size={14} />}
                  </Button>
                )}
                <StatusBadge status={room.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSummaryCard;