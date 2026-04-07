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
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F3F4F6] h-16 md:h-20 flex items-center px-4 md:px-8 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-2">
          <Link to="/" className="shrink-0 scale-90 md:scale-100">
            <Logo />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <div className="hidden sm:block">
                  <NotificationBell userId={user.id} />
                </div>
                
                <div className="flex items-center bg-[#F9FAFB] rounded-xl md:rounded-2xl p-1 border border-[#E5E7EB] shadow-sm">
                  <Link to="/wallet" className="px-2 md:px-4 py-0.5 md:py-1 flex flex-col items-end">
                    <span className="text-[6px] md:text-[7px] text-[#0A0B12]/40 font-black uppercase tracking-widest">Saldo</span>
                    <span className="text-xs md:text-sm font-black text-[#0A0B12] whitespace-nowrap">
                      {totalDisplayBalance.toLocaleString()} <span className="text-[8px] md:text-[9px] text-[#FFA500]">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="premium-gradient h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl shadow-lg text-white"
                  >
                    <Plus size={14} className="md:size-[18px]" />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A0B12] shadow-sm">
                      <User size={18} className="md:size-[20px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 md:w-64 bg-white border-[#E5E7EB] rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-3 mt-4 shadow-2xl z-[100]">
                    <div className="sm:hidden border-b border-[#F3F4F6] mb-1">
                       <DropdownMenuItem asChild>
                          <Link to="/notifications" className="flex items-center gap-3 p-3 text-[10px] font-black uppercase text-[#0A0B12] tracking-widest">
                            Notificações
                          </Link>
                       </DropdownMenuItem>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 p-3 md:p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-xl md:rounded-2xl text-[10px] font-black uppercase text-[#0A0B12] tracking-widest transition-colors">
                        <Settings size={14} className="text-[#0066FF]" /> Definições
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center gap-3 p-3 md:p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-xl md:rounded-2xl text-[10px] font-black uppercase text-[#0A0B12] tracking-widest transition-colors">
                        <Wallet size={14} className="text-[#FFA500]" /> Carteira
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full flex items-center gap-3 p-3 md:p-4 cursor-pointer hover:bg-red-50 rounded-xl md:rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-colors">
                          <LogOut size={14} /> Sair
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-[#E5E7EB] rounded-[2rem] md:rounded-[2.5rem] max-w-[90vw] md:max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg md:text-xl font-black italic text-[#0A0B12]">ENCERRAR SESSÃO?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[10px] md:text-xs font-bold text-[#0A0B12]/40 uppercase tracking-widest leading-relaxed">A tua conta será desconectada.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 md:gap-3 flex-row justify-end mt-4">
                          <AlertDialogCancel className="rounded-xl font-black text-[9px] md:text-[10px] uppercase border-[#E5E7EB] h-10 md:h-12 px-4 md:px-6">VOLTAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl premium-gradient font-black text-[9px] md:text-[10px] uppercase text-white shadow-lg h-10 md:h-12 px-4 md:px-6">SAIR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-[#0A0B12] font-black rounded-lg md:rounded-xl text-[9px] md:text-[10px] uppercase h-10 md:h-12 px-4 md:px-8 tracking-widest"
                >
                  ENTRAR
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="premium-gradient text-white font-black rounded-lg md:rounded-xl text-[9px] md:text-[10px] uppercase h-10 md:h-12 px-4 md:px-8 shadow-xl tracking-widest"
                >
                  REGISTAR-ME
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