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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-[#F3F4F6] shadow-[0_2px_15px_rgba(0,0,0,0.03)] h-16 flex items-center px-4 md:px-8">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <Logo className="text-2xl" />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                
                <div className="flex items-center bg-[#F9FAFB] rounded-2xl p-1 border border-[#D1D5DB] shadow-sm">
                  <Link to="/wallet" className="px-4 py-1 flex flex-col items-end">
                    <span className="text-[7px] text-[#555555] font-black uppercase tracking-widest">Saldo Atual</span>
                    <span className="text-sm font-black text-[#111111]">
                      {totalDisplayBalance.toLocaleString()} <span className="text-[9px] opacity-40">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="premium-gradient h-8 w-8 rounded-xl shadow-md text-white"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-[#D1D5DB] rounded-[1.5rem] p-2 mt-2 shadow-2xl">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-xl text-[10px] font-black uppercase text-[#111111]">
                        <Settings size={14} /> Definições
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-xl text-[10px] font-black uppercase text-[#111111]">
                        <Wallet size={14} /> Carteira
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full flex items-center gap-3 p-4 cursor-pointer hover:bg-red-50 rounded-xl text-[10px] font-black text-red-500 uppercase">
                          <LogOut size={14} /> Sair com Segurança
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-[#D1D5DB] rounded-[2rem] max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic text-[#111111]">ENCERRAR SESSÃO?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs font-bold text-[#555555] uppercase tracking-widest">A tua conta será desconectada do dispositivo.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel className="rounded-xl font-black text-[10px] uppercase border-[#D1D5DB]">VOLTAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl premium-gradient font-black text-[10px] uppercase text-white shadow-lg">SAIR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-[#111111] font-black rounded-xl text-[10px] uppercase h-10 px-6 hover:bg-[#F3F4F6]"
                >
                  ENTRAR
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="premium-gradient text-white font-black rounded-xl text-[10px] uppercase h-10 px-6 shadow-md"
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