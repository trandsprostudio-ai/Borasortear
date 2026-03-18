"use client";

import React from 'react';
import { Wallet, User, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="font-bold text-white text-xl">B</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            BORA <span className="text-purple-500">SORTEIAR</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Wallet size={18} className="text-purple-400" />
            <span className="font-semibold">12.500 Kz</span>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <Bell size={20} />
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <User size={20} />
          </Button>
          
          <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-white/10">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;