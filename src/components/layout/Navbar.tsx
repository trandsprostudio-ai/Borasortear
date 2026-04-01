"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, User, LogOut, ChevronDown, Search, Settings, Plus, Clock, Trophy } from 'lucide-react';
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
        
        const profileChannel = supabase.channel(`navbar-profile-${session.user.id}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles', 
            filter: `id=eq.${session.user.id}` 
          }, (payload) => {
            setProfile(payload.new);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(profileChannel);
        };
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchPendingAmount(currentUser.id);
      } else {
        setProfile(null);
        setPendingAmount(0);
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
    }, 2000);
  };

  const currentBalance = Number(profile?.balance || 0);
  const totalDisplayBalance = currentBalance + pendingAmount;

  return (
    <>
      <AnimatePresence>
        {showExitSplash && <SplashScreen message="Saindo da conta..." />}
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-2 md:px-4">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 md:gap-8 shrink-0">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo className="scale-[0.7] md:scale-100 origin-left" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                
                <div className="flex items-center bg-[#1A1D29] rounded-xl p-0.5 md:p-1 border border-white/5">
                  <Link to="/wallet" className="px-1.5 md:px-4 py-1 flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] md:text-[9px] text-white/30 font-black uppercase tracking-tighter">Saldo Total</span>
                      {pendingAmount > 0 && <Clock size={8} className="text-amber-500 animate-pulse" />}
                    </div>
                    <span className="text-[10px] md:text-sm font-black text-green-400 whitespace-nowrap">
                      {totalDisplayBalance.toLocaleString()} <span className="text-[7px] md:text-[10px]">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    disabled={profile?.is_banned}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-6 w-6 md:h-9 md:w-9 rounded-lg shadow-lg shrink-0"
                  >
                    <Plus size={12} className="md:size-14" />
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="flex items-center gap-1 md:gap-2 bg-[#1A1D29] px-1.5 py-1 rounded-xl border border-white/5 cursor-pointer">
                    <div className="w-6 h-6 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shrink-0 relative">
                      <User size={12} className="md:size-14" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-[#1A1D29] flex items-center justify-center">
                        <Trophy size={6} className="text-black" />
                      </div>
                    </div>
                    <ChevronDown size={10} className="text-white/20" />
                  </div>
                  
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1D29] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                    <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <Settings size={14} /> Perfil
                    </Link>
                    <Link to="/affiliates" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <Trophy size={14} className="text-amber-500" /> Afiliados
                    </Link>
                    <Link to="/wallet" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <Wallet size={14} className="text-purple-500" /> Carteira
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest">
                          <LogOut size={14} /> Sair
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/10 rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic tracking-tighter">SAIR AGORA?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/40 font-bold">Você precisará logar novamente para jogar.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-white/10 bg-transparent font-bold">CANCELAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl bg-red-500 font-black">SAIR</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" onClick={() => navigate('/auth?mode=login')} className="text-white/60 font-black text-[9px] md:text-[10px] uppercase tracking-widest h-7 md:h-8 px-2 md:px-3">Entrar</Button>
                <Button onClick={() => navigate('/auth?mode=signup')} className="bg-purple-600 hover:bg-purple-700 text-white font-black px-2.5 md:px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] uppercase tracking-widest h-7 md:h-8 whitespace-nowrap">CRIAR CONTA</Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;