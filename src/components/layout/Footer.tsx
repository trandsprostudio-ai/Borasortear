"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/5 mt-20">
      <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/20 text-xs font-bold">
          © 2024 BORA SORTEIAR. Todos os direitos reservados.
          <Link to="/admin-login" className="ml-2 opacity-0 hover:opacity-100 transition-opacity text-[8px] uppercase tracking-tighter">
            admin
          </Link>
        </p>
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