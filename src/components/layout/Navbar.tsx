"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface NavbarProps {
  onAuthClick?: () => void;
  user?: any;
}

const Navbar = ({ onAuthClick, user }: NavbarProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      fetchProfile();
      const channel = supabase.channel(`nav-profile-${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
        (payload) => setProfile(payload.new)).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F111A] border-b border-white/5 h-14 flex items-center px-4">
      <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center bg-[#1A1D29] rounded-lg p-1 border border-white/5">
                <div className="px-3 py-1 flex flex-col items-end">
                  <span className="text-[10px] text-white/40 font-bold leading-none uppercase">Saldo</span>
                  <span className="text-sm font-black text-green-400 leading-tight">
                    {profile?.balance?.toLocaleString() || '0'} <span className="text-[10px]">Kz</span>
                  </span>
                </div>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-black h-8 px-3 rounded-md">
                  DEPOSITAR
                </Button>
              </div>
              
              <div className="h-8 w-px bg-white/10 mx-1" />
              
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <Bell size={18} />
              </Button>
              
              <div className="flex items-center gap-2 bg-[#1A1D29] hover:bg-[#232736] transition-colors px-2 py-1 rounded-lg cursor-pointer border border-white/5">
                <div className="w-7 h-7 rounded-md bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <User size={16} />
                </div>
                <ChevronDown size={14} className="text-white/40" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onAuthClick} className="text-white font-bold hover:bg-white/5">
                Entrar
              </Button>
              <Button onClick={onAuthClick} className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 rounded-lg">
                CADASTRE-SE
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;