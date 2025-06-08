'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/hooks/useAuth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', protected: true },
    { href: '/projetos', label: 'Projetos', protected: false },
    { href: '/talentos', label: 'Talentos', protected: false },
    { href: '/como-funciona', label: 'Como Funciona', protected: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-slate-800">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-slate-800">FreelancePro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                if (item.protected && !user) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                      pathname === item.href ? 'text-blue-500' : 'text-slate-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <button className="relative p-2 rounded-full hover:bg-blue-50 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || ''}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl border border-blue-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        href="/perfil"
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                      >
                        Configurações
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-800 hover:bg-blue-50">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/registro">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                      Criar Conta
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-blue-100">
                <span className="text-lg font-semibold text-slate-800">Menu</span>
                <button
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {navItems.map((item) => {
                  if (item.protected && !user) return null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block py-2 text-lg font-medium transition-colors hover:text-blue-500 ${
                        pathname === item.href ? 'text-blue-500' : 'text-slate-600'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {!user && (
                  <div className="pt-4 space-y-4">
                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-800 hover:bg-blue-50">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/registro" className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100">
        <div className="container-custom py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Plataforma</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sobre" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/carreiras" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Carreiras
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/guias" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Guias
                  </Link>
                </li>
                <li>
                  <Link href="/tutoriais" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Tutoriais
                  </Link>
                </li>
                <li>
                  <Link href="/documentacao" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Documentação
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacidade" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/termos" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Contato</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/suporte" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Suporte
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="text-slate-600 hover:text-blue-500 transition-colors">
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <a href="mailto:contato@freelancepro.com" className="text-slate-600 hover:text-blue-500 transition-colors">
                    contato@freelancepro.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-blue-100">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-slate-500 text-sm">
                © 2024 FreelancePro. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="sr-only">Facebook</span>
                  {/* Facebook Icon */}
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="sr-only">Twitter</span>
                  {/* Twitter Icon */}
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  {/* LinkedIn Icon */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 