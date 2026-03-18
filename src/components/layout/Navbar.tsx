"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, User, Bell, Menu, Ticket, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onAuthClick?: () => void;
  user?: any;
}

const Navbar = ({ onAuthClick, user }: NavbarProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();

      const channel = supabase
        .channel(`profile-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => setProfile(payload.new)
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <Ticket size={24} className="text-white fill-white/20" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0A0A0F] animate-pulse" />
          </div>
          
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl tracking-tighter text-gradient-purple">
              BORA
            </span>
            <span className="font-black text-sm tracking-[0.2em] text-gradient-cyan">
              SORTEIAR
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link to="/wallet" className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all group">
              <Wallet size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">{profile?.balance?.toLocaleString() || '0'} Kz</span>
            </Link>
          )}
          
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 relative">
            <Bell size={20} />
            {user && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <User size={20} />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-white/10 text-red-400">
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <Button onClick={onAuthClick} className="premium-gradient rounded-full px-6 font-bold h-10">
              Entrar
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-white/10">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;