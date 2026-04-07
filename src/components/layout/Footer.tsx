"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const location = useLocation();

  // Esconder rodapé em rotas de admin ou login puro
  const isAdminPath = location.pathname.toLowerCase().includes('admin');
  const isAuthPath = location.pathname === '/auth';
  
  if (isAdminPath || isAuthPath) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0A0B12] border-t border-white/5 py-12 md:py-16 mt-auto">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-8">
          
          {/* Coluna Logo */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="scale-110 origin-left" variant="light" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">
                © 2026 BORA SORTEAR • PLATAFORMA PREMIUM
              </p>
              <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest max-w-[280px] leading-relaxed">
                Intermediação segura de sorteios digitais. Jogue com responsabilidade. +18
              </p>
            </div>
          </div>

          {/* Coluna Links Rápidos */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">Plataforma</h4>
            <nav className="flex flex-col items-center md:items-start gap-3">
              <Link to="/termos-de-uso" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Termos de Uso</Link>
              <Link to="/privacidade" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Privacidade</Link>
              <Link to="/central-de-ajuda" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Central de Ajuda</Link>
            </nav>
          </div>

          {/* Coluna Segurança e Admin */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">Segurança</h4>
            <Link 
              to="/admin-login" 
              className="text-white/5 hover:text-white/20 transition-all flex items-center gap-1 group mt-4"
            >
              <Shield size={8} />
              <span className="text-[8px] uppercase font-black">Acesso Restrito</span>
            </Link>
          </div>
        </div>

        {/* Linha Final Mobile */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/10 text-[8px] font-black uppercase tracking-widest">
            Desenvolvido com <Heart size={8} className="inline mx-1 text-red-500" /> para o mercado Angolano
          </p>
          <div className="flex gap-4">
             <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
             <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
             <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;