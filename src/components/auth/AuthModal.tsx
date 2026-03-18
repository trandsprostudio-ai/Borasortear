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

  const handleGoToAuth = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-3xl max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black italic tracking-tighter">BORA JOGAR?</DialogTitle>
          <DialogDescription className="text-white/40 font-bold text-xs uppercase tracking-widest">
            Acesse sua conta com seu número de telefone
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <Button 
            onClick={handleGoToAuth}
            className="w-full h-14 premium-gradient rounded-2xl font-black text-lg flex items-center justify-center gap-3"
          >
            <Phone size={20} /> ENTRAR COM TELEFONE
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleGoToAuth}
            className="w-full h-12 rounded-2xl font-black text-xs text-white/40 hover:text-white hover:bg-white/5 uppercase tracking-widest"
          >
            <UserPlus size={16} className="mr-2" /> Criar nova conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;