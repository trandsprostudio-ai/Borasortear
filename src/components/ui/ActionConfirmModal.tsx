"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: 'danger' | 'success' | 'info' | 'warning';
  loading?: boolean;
}

const ActionConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  variant = 'info',
  loading = false 
}: ActionConfirmModalProps) => {
  
  const getColors = () => {
    switch (variant) {
      case 'danger': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', icon: AlertTriangle, btn: 'bg-red-600 hover:bg-red-700' };
      case 'success': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', icon: CheckCircle2, btn: 'bg-green-600 hover:bg-green-700' };
      case 'warning': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: AlertTriangle, btn: 'bg-amber-600 hover:bg-amber-700' };
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: Info, btn: 'bg-blue-600 hover:bg-blue-700' };
    }
  };

  const colors = getColors();
  const Icon = colors.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm p-8">
        <DialogHeader className="text-center">
          <div className={`w-16 h-16 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${colors.border}`}>
            <Icon size={32} />
          </div>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">{title}</DialogTitle>
          <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col gap-2 mt-6">
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-white ${colors.btn}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR AÇÃO'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/20 hover:text-white"
          >
            CANCELAR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmModal;