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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F3F4F6] h-20 flex items-center px-4 md:px-8 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <Logo className="text-2xl" />
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                
                <div className="flex items-center bg-[#F9FAFB] rounded-2xl p-1.5 border border-[#E5E7EB] shadow-sm">
                  <Link to="/wallet" className="px-4 py-1 flex flex-col items-end">
                    <span className="text-[7px] text-[#0A0B12]/40 font-black uppercase tracking-widest">Saldo</span>
                    <span className="text-sm font-black text-[#0A0B12]">
                      {totalDisplayBalance.toLocaleString()} <span className="text-[9px] text-[#FFA500]">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="premium-gradient h-10 w-10 rounded-xl shadow-lg text-white hover:scale-105 transition-transform"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A0B12] shadow-sm hover:border-[#0066FF] transition-colors">
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white border-[#E5E7EB] rounded-[2rem] p-3 mt-4 shadow-2xl">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-2xl text-[10px] font-black uppercase text-[#0A0B12] tracking-widest transition-colors">
                        <Settings size={14} className="text-[#0066FF]" /> Definições
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wallet" className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#F3F4F6] rounded-2xl text-[10px] font-black uppercase text-[#0A0B12] tracking-widest transition-colors">
                        <Wallet size={14} className="text-[#FFA500]" /> Carteira
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="w-full flex items-center gap-3 p-4 cursor-pointer hover:bg-red-50 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest transition-colors">
                          <LogOut size={14} /> Sair
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-[#E5E7EB] rounded-[2.5rem] max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic text-[#0A0B12]">ENCERRAR SESSÃO?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs font-bold text-[#0A0B12]/40 uppercase tracking-widest leading-relaxed">A tua conta será desconectada deste dispositivo.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                          <AlertDialogCancel className="rounded-xl font-black text-[10px] uppercase border-[#E5E7EB] h-12">VOLTAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl premium-gradient font-black text-[10px] uppercase text-white shadow-lg h-12">SAIR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-[#0A0B12] font-black rounded-xl text-[10px] uppercase h-12 px-8 hover:bg-[#F3F4F6] tracking-widest"
                >
                  ENTRAR
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="premium-gradient text-white font-black rounded-xl text-[10px] uppercase h-12 px-8 shadow-xl shadow-blue-600/20 tracking-widest"
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