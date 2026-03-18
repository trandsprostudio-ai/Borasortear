"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, User, LogOut, ChevronDown, Search, Settings, Plus } from 'lucide-react';
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

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sessão inicial
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    };
    checkSession();

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);

    // Real-time para o saldo
    const channel = supabase.channel(`nav-profile-${userId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${userId}` 
      }, (payload) => setProfile(payload.new))
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
          currentBalance={profile?.balance || 0} 
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-4">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo className="scale-[0.8] md:scale-100 origin-left" />
            </Link>
            
            {user && (
              <Link to="/consult-draw" className="hidden lg:flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                <Search size={14} className="text-purple-500" /> Consultar Bilhete
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center bg-[#1A1D29] rounded-xl p-1 border border-white/5">
                  <Link to="/wallet" className="px-2 md:px-4 py-1 flex flex-col items-end">
                    <span className="text-[7px] md:text-[9px] text-white/30 font-black uppercase tracking-tighter">Saldo</span>
                    <span className="text-[11px] md:text-sm font-black text-green-400">
                      {profile?.balance?.toLocaleString() || '0'} <span className="text-[8px] md:text-[10px]">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="icon" 
                    onClick={() => setIsDepositOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-7 w-7 md:h-9 md:w-9 rounded-lg shadow-lg"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="flex items-center gap-2 bg-[#1A1D29] px-2 py-1.5 rounded-xl border border-white/5 cursor-pointer">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                      <User size={14} />
                    </div>
                    <ChevronDown size={12} className="text-white/20" />
                  </div>
                  
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1D29] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                    <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <Settings size={14} /> Perfil
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-white/60 font-black text-[10px] uppercase tracking-widest h-8 px-3"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 rounded-xl text-[10px] uppercase tracking-widest h-8"
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