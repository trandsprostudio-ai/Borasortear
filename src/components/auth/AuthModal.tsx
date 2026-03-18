"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 rounded-3xl max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Bem-vindo ao BORA SORTEIAR</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Faça login ou crie sua conta para participar dos sorteios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7C3AED',
                    brandAccent: '#06B6D4',
                    inputBackground: 'rgba(255, 255, 255, 0.05)',
                    inputText: 'white',
                    inputBorder: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              },
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;