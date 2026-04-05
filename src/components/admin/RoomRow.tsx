"use client";

import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, Ghost } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface RoomRowProps {
  room: any;
  injectingId: string | null;
  onInject: (roomId: string) => void;
}

const RoomRow = ({ room, injectingId, onInject }: RoomRowProps) => {
  const progress = Math.min(Math.round((room.current_participants / room.max_participants) * 100), 100);

  return (
    <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xs">
            {room.modules?.name || 'N/A'}
          </div>
          <span className="font-bold text-sm">{room.modules?.name || 'N/A'}</span>
        </div>
      </TableCell>
      <TableCell className="p-4">
        <code className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
          {room.id.slice(0, 8)}
        </code>
      </TableCell>
      <TableCell className="p-4">
        <StatusBadge status={room.status} />
      </TableCell>
      <TableCell className="p-4">
        <span className="font-black text-lg">{room.current_participants}</span>
        <span className="text-[10px] text-white/20 ml-1">/ {room.max_participants}</span>
      </TableCell>
      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                room.status === 'open' ? 'bg-green-500' :
                room.status === 'closed' ? 'bg-amber-500' :
                room.status === 'processing' ? 'bg-blue-500' : 'bg-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-white/40">{progress}%</span>
        </div>
      </TableCell>
      <TableCell className="p-4 text-right">
        {room.status === 'open' && (
          <Button
            disabled={injectingId === room.id}
            onClick={() => onInject(room.id)}
            className="h-9 px-4 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {injectingId === room.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <Ghost size={14} className="mr-2" />}
            Injectar Fantasmas
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default RoomRow;