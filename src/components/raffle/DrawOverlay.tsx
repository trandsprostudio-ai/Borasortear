"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, PartyPopper, TrendingUp, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DrawOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  winners: any[];
  roomInfo: string;
}

const DrawOverlay = ({ isOpen, onClose, winners, roomInfo }: DrawOverlayProps) => {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/consult-draw?room=${roomInfo.split('#')[1]}`;
    navigator.clipboard.writeText(link);
    toast.success("Link do sorteio copiado!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-[3rem] p-8 border-purple-500/30 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-shimmer" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/40 rotate-12">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">RESULTADO FINAL</h2>
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">{roomInfo}</p>
        </div>

        <div className="space-y-3 mb-6">
          {winners.map((w, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-4 rounded-2xl border ${
                w.position === 1 ? 'bg-green-500/10 border-green-500/20' : 
                w.position === 2 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                  w.position === 1 ? 'bg-green-600' : w.position === 2 ? 'bg-blue-600' : 'bg-white/10 text-white/40'
                }`}>
                  {w.position}º
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-white/40">Ganhador</p>
                  <p className="font-bold text-sm">@{w.name || 'Anónimo'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-white/40">Prémio</p>
                <p className={`font-black text-lg ${w.position === 3 ? 'text-white/10' : 'text-green-400'}`}>
                  {w.prize}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-purple-600/10 p-4 rounded-2xl border border-purple-600/20 mb-8 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Bónus de Afiliado</p>
            <p className="text-xs font-bold text-white/60 leading-tight">Ganha 5% sobre os ganhos dos teus indicados!</p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleCopyLink} className="text-purple-400 hover:bg-purple-600/20">
            <Share2 size={16} />
          </Button>
        </div>

        <Button onClick={onClose} className="w-full h-14 rounded-2xl premium-gradient font-black text-sm uppercase tracking-widest">
          FECHAR RESULTADO
        </Button>
      </motion.div>
    </div>
  );
};

export default DrawOverlay;