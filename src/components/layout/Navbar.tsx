"use client";

import React, { useEffect, useState } from 'react';
import { User, LogOut, Settings, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/ui/SplashScreen';
import TransactionModal from '@/components/wallet/TransactionModal';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        subscribeToProfile(session.user.id);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        subscribeToProfile(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const subscribeToProfile = (userId: string) => {
    const channel = supabase.channel(`realtime-profile-${userId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  };

  const handleLogout = async () => {
    setShowExitSplash(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setShowExitSplash(false);
      navigate('/');
    }, 1500);
  };

  const currentBalance = Number(profile?.balance || 0);
  const bonusBalance = Number(profile?.bonus_balance || 0);
  const totalDisplayBalance = currentBalance + bonusBalance;

  return (
    <>
      <AnimatePresence>
        {showExitSplash && <SplashScreen message="Saindo..." />}
      </AnimatePresence>

      {user && (
        <TransactionModal 
          isOpen={isDepositOpen} 
          onClose={() => {
            setIsDepositOpen(false);
            fetchProfile(user.id);
          }} 
          type="deposit" 
          user={user} 
          currentBalance={currentBalance} 
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e0e0e0] h-16 flex items-center px-2 md:px-6">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0 scale-90 sm:scale-100 origin-left">
              <Logo className="text-xl md:text-2xl" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                
                <div className="flex items-center bg-[#f5f5f5] rounded-xl p-0.5 md:p-1 border border-[#e0e0e0]">
                  <Link to="/wallet" className="px-2 md:px-4 py-0.5 flex flex-col items-end">
                    <span className="text-[6px] md:text-[8px] text-blue-600 font-black uppercase">Saldo Total</span>
                    <span className="text-[10px] md:text-sm font-black text-[#111111]">
                      {totalDisplayBalance.toLocaleString()} <span className="text-[7px] md:text-[8px] opacity-30">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="premium-gradient h-6 w-6 md:h-9 md:w-9 rounded-lg shrink-0 text-white"
                  >
                    <Plus size={12} className="md:size-4" />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 md:w-10 md:h-10 rounded-xl premium-gradient flex items-center justify-center text-white cursor-pointer outline-none shrink-0">
                      <User size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border-[#e0e0e0] rounded-2xl p-2 z-50 shadow-xl">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#f5f5f5] rounded-xl text-[10px] font-black uppercase text-[#555555]">
                        <Settings size={14} /> Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#f5f5f5] rounded-xl text-[10px] font-black uppercase text-[#555555]">
                        <Wallet size={14} /> Carteira
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full flex items-center gap-3 p-3 cursor-pointer hover:bg-red-50 rounded-xl text-[10px] font-black text-red-500 uppercase">
                          <LogOut size={14} /> Sair
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-[#e0e0e0] rounded-3xl w-[90vw] max-w-sm z-[100] shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic text-[#111111]">SAIR AGORA?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs font-bold text-[#555555] uppercase tracking-widest">A sua sessão será encerrada com segurança.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="rounded-xl mt-0 font-black text-[10px] uppercase tracking-widest border-[#e0e0e0]">VOLTAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl bg-red-500 hover:bg-red-600 font-black text-[10px] uppercase tracking-widest text-white border-none">CONFIRMAR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-2">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-[#555555] hover:text-[#111111] hover:bg-[#f5f5f5] font-black px-2 md:px-4 rounded-xl text-[9px] md:text-[10px] uppercase h-9 md:h-10"
                >
                  ENTRAR
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="premium-gradient text-white font-black px-3 md:px-6 rounded-xl text-[9px] md:text-[10px] uppercase h-9 md:h-10 border-none"
                >
                  CRIAR CONTA
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;