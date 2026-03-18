"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/5 mt-20">
      <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1">
          <p className="text-white/20 text-xs font-bold">
            © 2024 BORA SORTEIAR. Todos os direitos reservados.
          </p>
          {/* Símbolo secreto para Admins */}
          <Link 
            to="/admin-login" 
            className="text-white/5 hover:text-white/20 transition-colors text-[10px] cursor-default select-none"
            title="System"
          >
            •
          </Link>
        </div>
        
        <div className="flex gap-6 text-white/40 text-xs font-bold">
          <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Suporte</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;