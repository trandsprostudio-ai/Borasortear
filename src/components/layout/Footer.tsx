"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  // Não mostra o footer se:
  // 1. O usuário não estiver logado
  // 2. A rota atual for administrativa (começa com /admin)
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (!isAuthenticated || isAdminRoute) {
    return null;
  }

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