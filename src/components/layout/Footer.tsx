"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';

const Footer = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

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

  // Ocultar Footer se estiver em páginas administrativas ou se houver um Splash Screen ativo (via atributo no body ou rota)
  const isAdminPath = location.pathname.toLowerCase().includes('admin');
  const isAuthPath = location.pathname === '/auth';
  
  if (isAdminPath || isAuthPath) {
    return null;
  }

  return (
    <footer className="py-12 border-t border-white/5 mt-20 bg-[#0A0B12] relative z-10 pb-28 sm:pb-12">
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Logo className="scale-90 origin-left" />
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                © 2026 BORA SORTEAR • PLATAFORMA PREMIUM
              </p>
              <Link 
                to="/admin-login" 
                className="text-white/5 hover:text-purple-500/40 transition-colors flex items-center gap-1 group"
                title="Acesso Administrativo"
              >
                <Shield size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px]">•</span>
              </Link>
            </div>
            <p className="text-[9px] text-white/10 font-bold uppercase tracking-tighter">
              Jogue com responsabilidade. Apenas para maiores de 18 anos.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-widest">
          <Link to="/termos-de-uso" className="hover:text-purple-400 transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link>
          <Link to="/central-de-ajuda" className="hover:text-purple-400 transition-colors">Central de Ajuda</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;