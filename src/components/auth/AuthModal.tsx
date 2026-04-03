"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Phone, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onClose();
    navigate('/auth?mode=login');
  };

  const handleGoToSignup = () => {
    onClose();
    navigate('/auth?mode=signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm p-8">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">BORA JOGAR?</DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Entre agora ou crie sua conta grátis
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoToLogin}
            className="w-full h-14 premium-gradient rounded-2xl font-black text-sm flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg shadow-purple-500/20"
          >
            <Phone size={18} /> ENTRAR COM TELEFONE
          </Button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
            <div className="relative flex justify-center text-[8px] font-black uppercase"><span className="bg-[#111827] px-4 text-white/20">OU</span></div>
          </div>

          <Button 
            variant="outline"
            onClick={handleGoToSignup}
            className="w-full h-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 font-black text-sm flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <UserPlus size={18} /> CRIAR CONTA GRÁTIS
          </Button>
        </div>

        <p className="text-[8px] text-white/20 font-bold uppercase text-center mt-8 leading-relaxed">
          Ao entrar, você concorda com nossos <br /> termos de uso e política de privacidade.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;