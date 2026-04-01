"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ticket, Copy, CheckCircle2, LayoutGrid, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TicketConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCode: string;
  moduleName: string;
  price: number;
}

const TicketConfirmationModal = ({ isOpen, onClose, ticketCode, moduleName, price }: TicketConfirmationModalProps) => {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketCode);
    toast.success("Código copiado!");
  };

  const handleGoToParticipations = () => {
    onClose();
    navigate('/my-participations');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-purple-500/30 rounded-[2.5rem] max-w-sm p-8">
        <DialogHeader className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
            <CheckCircle2 size={32} />
          </div>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">ENTRADA CONFIRMADA!</DialogTitle>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Estás dentro do sorteio {moduleName}</p>
        </DialogHeader>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Ticket size={40} />
          </div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">CÓDIGO DO BILHETE</p>
          <h3 className="text-3xl font-black tracking-[0.3em] text-purple-400 mb-4">{ticketCode}</h3>
          
          <Button 
            variant="ghost" 
            onClick={handleCopy}
            className="h-10 rounded-xl bg-purple-500/10 text-purple-400 font-black text-[10px] uppercase tracking-widest w-full hover:bg-purple-500/20"
          >
            <Copy size={14} className="mr-2" /> COPIAR CÓDIGO
          </Button>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleGoToParticipations}
            className="w-full h-14 premium-gradient rounded-xl font-black text-xs uppercase tracking-widest"
          >
            <LayoutGrid size={16} className="mr-2" /> Acompanhar em Minhas Mesas
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-[9px] font-black text-white/20 uppercase tracking-widest"
          >
            Fechar Janela
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketConfirmationModal;