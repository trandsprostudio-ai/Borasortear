"use client";

import React, { useEffect, useState } from 'react';
import { User, LogOut, Settings, Plus, Wallet, Search, UserPlus } from 'lucide-react';
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
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/ui/SplashScreen';
import TransactionModal from '@/components/wallet/TransactionModal';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPendingAmount(session.user.id);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchPendingAmount(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const fetchPendingAmount = async (userId: string) => {
    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('status', 'pending');
    
    if (data) {
      const total = data.reduce((acc, t) => acc + Number(t.amount), 0);
      setPendingAmount(total);
    }
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

  return (
    <>
      <AnimatePresence>
        {showExitSplash && <SplashScreen message="Saindo..." />}
      </AnimatePresence>

      {user && (
        <TransactionModal 
          isOpen={isDepositOpen} 
          onClose={() => setIsDepositOpen(false)} 
          type="deposit" 
          user={user} 
          currentBalance={currentBalance} 
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A]/95 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-2 md:px-6">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0 scale-90 sm:scale-100 origin-left">
              <Logo className="text-xl md:text-2xl" />
            </Link>
            <Link to="/consult-draw" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Search size={14} /> Consultar Bilhete
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                
                <div className="flex items-center bg-[#1A1D29] rounded-xl p-0.5 md:p-1 border border-white/5">
                  <Link to="/wallet" className="px-2 md:px-4 py-0.5 flex flex-col items-end overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] md:text-[8px] text-green-400 font-black uppercase">Disponível</span>
                      <span className="text-[10px] md:text-sm font-black text-white">
                        {currentBalance.toLocaleString()} <span className="text-[7px] md:text-[8px] opacity-30">Kz</span>
                      </span>
                    </div>
                    {pendingAmount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[6px] md:text-[7px] text-amber-500 font-black uppercase">Pendente</span>
                        <span className="text-[8px] md:text-[10px] font-black text-white/40">
                          +{pendingAmount.toLocaleString()} Kz
                        </span>
                      </div>
                    )}
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 h-6 w-6 md:h-9 md:w-9 rounded-lg shrink-0"
                  >
                    <Plus size={12} className="md:size-4" />
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white cursor-pointer shrink-0">
                    <User size={16} />
                  </div>
                  <div className="absolute top-full right-0 mt-2 w-44 bg-[#1A1D29] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                    <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase">
                      <Settings size={14} /> Perfil
                    </Link>
                    <Link to="/wallet" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase">
                      <Wallet size={14} /> Carteira
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-[10px] font-black text-red-400 uppercase">
                          <LogOut size={14} /> Sair
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/10 rounded-3xl w-[90vw] max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic">SAIR AGORA?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="rounded-xl mt-0">VOLTAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl bg-red-500">CONFIRMAR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-white/40 hover:text-white font-black px-4 rounded-xl text-[10px] uppercase h-10 hidden sm:flex"
                >
                  ENTRAR
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="premium-gradient font-black px-4 md:px-6 rounded-xl text-[10px] uppercase h-10"
                >
                  <UserPlus size={14} className="mr-2 hidden sm:inline" />
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