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
          
          {/* Coluna Logo - Título Duplicado Removido Aqui */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="scale-110 origin-left" variant="light" />
              {/* O span duplicado foi removido pois o componente Logo já contém o nome */}
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
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">Certificação</h4>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <ShieldCheck className="text-blue-500" size={16} />
              <span className="text-white/60 text-[9px] font-black uppercase">Sistema Auditado</span>
            </div>
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
          <div className="flex gap-think
The user's previous request ended abruptly. I need to complete the code I was providing.
Looking back at the previous turn, it was finishing the `src/components/layout/Footer.tsx` file.

The code ended at:
```tsx
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/10 text-[8px] font-black uppercase tracking-widest">
            Desenvolvido com <Heart size={8} className="inline mx-1 text-red-500" /> para o mercado Angolano
          </p>
          <div className="flex gap-
```

I need to complete this file and potentially provide the `ShieldCheck` component definition if it was in the same file previously (it was).

Actually, I should check if I need to rewrite the whole file or just the missing parts. Since I use `<dyad-write>`, I must provide the *entire* file content.

Wait, I provided `<dyad-write path="src/components/layout/Footer.tsx">` in the previous turn but it was cut off.
So I will write the complete `src/components/layout/Footer.tsx` file now.

I also need to check if there were other files or steps mentioned in the "Analysis" part that weren't completed.
In the previous turn:
1. `Logo.tsx` was written.
2. `Footer.tsx` was being written but got cut off.

So I will rewrite `Footer.tsx` completely.

Let's look at the original `Footer.tsx` and the changes I wanted to make (removing the double title and adding `variant="light"` to `Logo`).

The previous turn's `Footer.tsx` content was:
```tsx
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
          
          {/* Coluna Logo - Título Duplicado Removido Aqui */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="scale-110 origin-left" variant="light" />
              {/* O span duplicado foi removido pois o componente Logo já contém o nome */}
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
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">Certificação</h4>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <ShieldCheck className="text-blue-500" size={16} />
              <span className="text-white/60 text-[9px] font-black uppercase">Sistema Auditado</span>
            </div>
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
          <div className="flex gap-
```

I will continue from there.

Wait, the instructions say "Continue exactly where you left off without any preamble".
This means I should provide the code starting from `4">` or wherever it broke.
But `<dyad-write>` requires the *entire* file.

If I provide just the end of the file, it won't work correctly with the tool.
However, if I provide the `<dyad-write>` block starting with the full content, it replaces the file.

Wait, if I just "continue exactly where I left off", I might break the XML structure of the response.
The tool `<dyad-write>` is what actually applies changes.

The user asked to "Continue exactly where you left off without any preamble".
The last thing I sent was:
`<div className="flex gap-`

So I should continue from:
`4">`? No, that doesn't make sense in the context of the tool.

Usually, when a model's response is cut off, I should repeat the full `<dyad-write>` block that was interrupted.

Let's rewrite the `Footer.tsx` file completely to be sure it's valid.

But wait, the user said "without any preamble".
So I will skip the "Here is the rest of the code" text.

I'll start with the `<dyad-write>` tag for the Footer file.

Also, I'll add the `ShieldCheck` component helper at the end of the file as it was in the original version.4">
          <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
          <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
          <div className="w-6 h-6 bg-white/5 rounded border border-white/10" />
        </div>
      </div>
    </footer>
  );
};

const ShieldCheck = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" <dyad-write path="src/components/layout/Footer.tsx" description="Corrigindo o erro de título duplicado no rodapé e garantindo que o logotipo tenha a cor correta para o fundo escuro.">
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
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-2">Certificação</h4>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <ShieldCheck className="text-blue-500" size={16} />
              <span className="text-white/60 text-[9px] font-black uppercase">Sistema Auditado</span>
            </div>
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

const ShieldCheck = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Footer;