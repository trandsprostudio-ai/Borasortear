"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
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

  // O Footer só aparece para usuários logados
  if (!isAuthenticated) return null;

  return (
    <footer className="py-10 border-t border-white/5 mt-20 bg-[#0A0B12] relative z-10 pb-28 sm:pb-10">
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              © 2024 BORA SORTEIAR • PLATAFORMA PREMIUM
            </p>
            <Link 
              to="/admin-login" 
              className="text-white/5 hover:text-purple-500/40 transition-colors text-[10px] cursor-default select-none"
              title="System Access"
            >
              •
            </Link>
          </div>
          <p className="text-[9px] text-white/10 font-bold uppercase tracking-tighter">
            Jogue com responsabilidade. Apenas para maiores de 18 anos.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-widest">
          <a href="#" className="hover:text-purple-400 transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Central de Ajuda</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Afiliados</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;