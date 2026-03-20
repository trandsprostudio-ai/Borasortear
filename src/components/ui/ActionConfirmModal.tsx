"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'info' | 'warning';
  loading?: boolean;
}

const ActionConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "CONFIRMAR", 
  cancelText = "CANCELAR",
  variant = 'info',
  loading = false
}: ActionConfirmModalProps) => {
  
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <XCircle size={48} className="text-red-500" />;
      case 'success': return <CheckCircle2 size={48} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={48} className="text-amber-500" />;
      default: return <Info size={48} className="text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'success': return 'bg-green-600 hover:bg-green-700';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700';
      default: return 'premium-gradient';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-[2.5rem] max-w-sm p-8 text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="mb-6 bg-white/5 p-4 rounded-3xl border border-white/5">
            {getIcon()}
          </div>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase mb-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col gap-3 mt-8 sm:flex-col">
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className={`w-full h-14 rounded-2xl font-black text-lg uppercase tracking-tighter ${getButtonClass()}`}
          >
            {loading ? 'PROCESSANDO...' : confirmText}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/20 hover:text-white"
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmModal;