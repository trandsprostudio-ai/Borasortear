"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, X, Megaphone, Share2, Loader2, CheckCircle2 } from 'lucide-react';
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
      const timer = setTimeout(() => setStage('reveal'), 4000);
      
      const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user || null);
      };
      checkUser();
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = async (winner: any) => {
    if (shared) return;
    setSharing(true);
    
    try {
      const shareText = `ACABEI DE GANHAR ${winner.prize} NO BORA SORTEIAR! 🚀🔥 Venha ganhar também: ${window.location.origin}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'BORA SORTEIAR',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Texto de vitória copiado! Partilhe para ganhar o bônus.");
      }

      // Aplicar Bônus de 2%
      const bonusAmount = Math.floor(winner.amount * 0.02);
      
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', currentUser.id).single();
      await supabase.from('profiles').update({ balance: (profile?.balance || 0) + bonusAmount }).eq('id', currentUser.id);
            await supabase.from('transactions').insert({
        user_id: currentUser.id,
        type: 'deposit',
        amount: bonusAmount,
        status: 'completed',
        payment_method: 'Bônus de Partilha (2%)'
      });

      await supabase.from('notifications').insert({
        user_id: currentUser.id,
        title: 'Bônus de Partilha! 🎁',
        message: `Você recebeu ${bonusAmount.toLocaleString()} Kz por partilhar sua vitória!`,
        type: 'success'
      });

      setShared(true);
      toast.success(`Bônus de ${bonusAmount} Kz creditado!`);
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
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-8 border-t-purple-500 border-r-amber-500 border-b-cyan-400 border-l-transparent rounded-full shadow-[0_0_50px_rgba(124,58,237,0.3)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={64} className="text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic tracking-tighter text-white">
                    SORTEANDO...
                  </h2>
                  <p className="text-purple-400 font-black uppercase tracking-[0.3em] text-xs animate-bounce">
                    {roomInfo || "MESA FINALIZADA"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="relative">
                  <motion.div                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-28 h-28 gold-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40 mb-4"
                  >
                    <Trophy size={56} className="text-white" />
                  </motion.div>
                </div>

                <h2 className="text-4xl font-black text-white tracking-tighter italic">
                  RESULTADO DA MESA                </h2>
                
                <div className="space-y-3 mt-6">
                  {displayWinners.map((winner, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.4 }}
                      className={`glass-card p-4 rounded-xl border-l-4 flex items-center justify-between ${
                        idx === 0 ? 'border-l-amber-500 bg-amber-500/5' : 
                        idx === 1 ? 'border-l-slate-400 bg-slate-400/5' : 'border-l-blue-500 bg-blue-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                          idx === 0 ? 'bg-amber-500 text-black' : 
                          idx === 1 ? 'bg-slate-400 text-black' : 'bg-blue-500 text-white'
                        }`}>
                          {idx + 1}º
                        </div>
                        <div className="text-left">
                          <p className="text-xl font-black text-white">
                            {winner.position === 3 ? 'PUBLICIDADE' : `@${winner.name}`}
                          </p>
                          {winner.position === 3 && (
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Taxa de Manutenção</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${winner.position === 3 ? 'text-blue-400' : 'text-green-400'}`}>
                          {winner.prize}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {userWinner && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-3xl mt-4"
                  >
                    <h4 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-2">VOCÊ GANHOU! 🎉</h4>
                    <p className="text-[10px] font-bold text-white/40 mb-4 uppercase tracking-widest">Partilhe sua vitória e ganhe +2% de bônus extra!</p>
                    <Button 
                      onClick={() => handleShare(userWinner)}
                      disabled={sharing || shared}
                      className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                        shared ? 'bg-green-600' : 'premium-gradient'
                      }`}
                    >
                      {sharing ? <Loader2 className="animate-spin" /> : shared ? (
                        <>
                          <CheckCircle2 size={16} className="mr-2" />
                          BÔNUS RECEBIDO
                        </>
                      ) : (
                        <>
                          <Share2 size={16} className="mr-2" />
                          PARTILHAR VITÓRIA (+2%)
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                <Button 
                  onClick={onClose}
                  className="mt-4 w-full h-14 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 font-black text-lg"
                >
                  CONTINUAR JOGANDO
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrawOverlay;