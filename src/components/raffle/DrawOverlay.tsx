"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Loader2, CheckCircle2, Share2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DrawOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  winners: { name: string; prize: string; position: number; userId?: string; amount?: number }[];
  roomInfo?: string;
}

const DrawOverlay = ({ isOpen, onClose, winners, roomInfo }: DrawOverlayProps) => {
  const [stage, setStage] = useState<'suspense' | 'reveal'>('suspense');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStage('suspense');
      setShared(false);
      const timer = setTimeout(() => setStage('reveal'), 3000);
      
      const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);
      };
      checkUser();
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = async (winner: any) => {
    if (shared || !currentUser) return;
    setSharing(true);
    
    try {
      const shareText = `ACABEI DE GANHAR ${winner.prize} NO BORA SORTEIAR! 🚀🔥 Venha ganhar também: ${window.location.origin}`;
      
      if (navigator.share) {
        await navigator.share({ title: 'BORA SORTEIAR', text: shareText, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copiado! Partilhe para ganhar bônus.");
      }

      const bonusAmount = Math.floor((winner.amount || 0) * 0.02);
      if (bonusAmount > 0) {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', currentUser.id).single();
        await supabase.from('profiles').update({ balance: (profile?.balance || 0) + bonusAmount }).eq('id', currentUser.id);
        
        await supabase.from('transactions').insert({
          user_id: currentUser.id,
          type: 'deposit',
          amount: bonusAmount,
          status: 'completed',
          payment_method: 'Bônus de Partilha (2%)'
        });
        
        setShared(true);
        toast.success(`Bônus de ${bonusAmount} Kz creditado!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const displayWinners = [...winners].sort((a, b) => a.position - b.position);
  const userWinner = currentUser ? displayWinners.find(w => w.userId === currentUser.id) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/98 backdrop-blur-2xl p-4"
        >
          <div className="max-w-lg w-full text-center relative">
            <button onClick={onClose} className="absolute -top-12 right-0 text-white/40 hover:text-white">
              <X size={24} />
            </button>

            {stage === 'suspense' ? (
              <div className="space-y-8">
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-8 border-t-purple-500 border-r-amber-500 border-b-cyan-400 border-l-transparent rounded-full shadow-[0_0_50px_rgba(124,58,237,0.3)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy size={64} className="text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-5xl font-black italic tracking-tighter text-white">SORTEANDO...</h2>
              </div>
            ) : (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Resultado</h2>
                
                <div className="space-y-3">
                  {displayWinners.map((winner, idx) => {
                    const isPlatform = !winner.userId || winner.position === 3;
                    return (
                      <div key={idx} className={`glass-card p-4 rounded-xl border-l-4 flex items-center justify-between ${
                        isPlatform ? 'border-l-blue-500 bg-blue-500/5' : 
                        idx === 0 ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-slate-400 bg-slate-400/5'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${
                            isPlatform ? 'bg-blue-500' : idx === 0 ? 'bg-amber-500' : 'bg-slate-400 text-black'
                          }`}>
                            {winner.position}º
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-black text-white">
                              {isPlatform ? 'PLATAFORMA' : `@${winner.name}`}
                            </p>
                            {isPlatform && <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Taxa de Manutenção</span>}
                          </div>
                        </div>
                        <p className={`text-xl font-black ${isPlatform ? 'text-blue-400' : 'text-green-400'}`}>
                          {winner.prize}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {userWinner && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-3xl mt-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-2">VOCÊ GANHOU! 🎉</h4>
                    <Button onClick={() => handleShare(userWinner)} disabled={sharing || shared} className="w-full h-12 rounded-xl font-black premium-gradient">
                      {shared ? 'BÔNUS RECEBIDO' : 'PARTILHAR VITÓRIA (+2%)'}
                    </Button>
                  </motion.div>
                )}

                <Button onClick={onClose} className="w-full h-14 rounded-xl bg-white/5 text-white/40 font-black">CONTINUAR</Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrawOverlay;