"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'processing' | 'finished';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ABERTA</Badge>;
    case 'closed':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">ENCERRADA</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">SORTEANDO</Badge>;
    case 'finished':
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">FINALIZADA</Badge>;
    default:
      return <Badge variant="outline" className="uppercase">{status}</Badge>;
  }
};

export default StatusBadge;