"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, User, Bell, LogOut, ChevronDown, ShieldCheck, Search, Settings } from 'lucide-react';
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

interface NavbarProps {
  user?: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      fetchProfile();
      
      const channel = supabase.channel(`nav-profile-${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${user.id}` 
        }, (payload) => setProfile(payload.new))
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const handleLogout = async () => {
    setShowExitSplash(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setShowExitSplash(false);
      navigate('/');
    }, 2000);
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-4">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo className="scale-90 md:scale-100" />
            </Link>
            
            <Link to="/consult-draw" className="hidden md:flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
              <Search size={14} className="text-purple-500" /> Consultar Bilhete
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                <div className="flex items-center bg-[#1A1D29] rounded-xl p-1 border border-white/5 hover:border-purple-500/30 transition-all group">
                  <Link to="/wallet" className="px-2 md:px-4 py-1 flex flex-col items-end">
                    <span className="text-[8px] md:text-[9px] text-white/30 font-black leading-none uppercase tracking-tighter">Saldo</span>
                    <span className="text-xs md:text-sm font-black text-green-400 leading-tight">
                      {profile?.balance?.toLocaleString() || '0'} <span className="text-[9px] md:text-[10px]">Kz</span>
                    </span>
                  </Link>
                  <Button 
                    size="sm" 
                    onClick={() => setIsDepositOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black h-8 md:h-9 px-2 md:px-4 rounded-lg shadow-lg shadow-purple-900/20 text-[10px] md:text-xs"
                  >
                    +
                  </Button>
                </div>
                
                <div className="hidden sm:block h-8 w-px bg-white/5 mx-1" />
                
                <div className="flex items-center gap-2 md:gap-3 bg-[#1A1D29] px-2 md:px-3 py-1.5 rounded-xl border border-white/5 group relative cursor-pointer">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <User size={16} />
                  </div>
                  
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-black text-white leading-none">
                      {profile?.first_name || 'Jogador'}
                    </span>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                      ID: {user.id.slice(0, 8)}
                    </span>
                  </div>

                  <ChevronDown size={14} className="text-white/20 group-hover:text-white transition-colors" />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1D29] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                    <div className="p-3 border-b border-white/5 mb-2">
                      <p className="text-[10px] font-black text-white/20 uppercase mb-1">Sua Conta</p>
                      <p className="text-xs font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                    </div>
                    
                    <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-xs font-black transition-colors">
                      <Settings size={16} className="text-white/40" /> Meu Perfil
                    </Link>

                    <Link to="/wallet" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-xs font-black transition-colors">
                      <Wallet size={16} className="text-purple-500" /> Minha Carteira
                    </Link>
                    
                    <Link to="/consult-draw" className="flex md:hidden items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-xs font-black transition-colors">
                      <Search size={16} className="text-blue-500" /> Consultar Bilhete
                    </Link>
                    
                    <Link to="/ranking" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-xs font-black transition-colors">
                      <ShieldCheck size={16} className="text-amber-500" /> Hall da Fama
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-xs font-black text-red-400 transition-colors mt-1">
                          <LogOut size={16} /> Sair da Conta
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/10 rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black italic tracking-tighter">CONFIRMAR SAÍDA?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/40 font-bold">
                            Você precisará entrar novamente com seu telefone e senha para jogar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-white/10 bg-transparent hover:bg-white/5 font-bold">CANCELAR</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout} className="rounded-xl bg-red-500 hover:bg-red-600 font-black">SAIR AGORA</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/consult-draw" className="hidden xs:block mr-2 md:mr-4 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                  Consultar
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth?mode=login')} 
                  className="text-white/60 font-black text-[10px] md:text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 h-9 px-2 md:px-4"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black px-3 md:px-6 rounded-xl shadow-lg shadow-purple-900/20 text-[10px] md:text-xs uppercase tracking-widest h-9 md:h-10"
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