"use client";

import React, { useEffect, useState } from 'react';
import { Home, Trophy, HelpCircle, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const FloatingNav = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) return null;
  
  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Consultar', path: '/consult-draw' },
    { icon: Trophy, label: 'Ranking', path: '/ranking' },
    { icon: HelpCircle, label: 'Suporte', path: '/support' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 flex justify-center pointer-events-none">
      <div className="bg-[#1A1D29]/90 backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-around shadow-2xl w-full max-w-lg pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full relative group"
            >
              <item.icon 
                size={20} 
                className={cn(
                  "transition-all duration-300",
                  isActive ? "text-purple-500 -translate-y-1" : "text-white/40 group-hover:text-white/70"
                )} 
              />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter mt-1 transition-all",
                isActive ? "text-white opacity-100" : "text-white/20 opacity-0 group-hover:opacity-50"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_#7C3AED]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingNav;