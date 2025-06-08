'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, X, ChevronDown, User, Settings, LogOut, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Fechar dropdowns quando clicar fora
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
      setUserDropdownOpen(false);
    }
  };

  // Links principais baseados no tipo de usuário
  const mainLinks = user ? (
    user.userType === 'freelancer' ? [
      { name: 'Buscar Projetos', href: '/buscar-projetos', type: 'freelancer' },
      { name: 'Meu Portfolio', href: '/portfolio', type: 'freelancer' },
      { name: 'Minhas Propostas', href: '/minhas-propostas', type: 'freelancer' },
      { name: 'Contratos', href: '/contratos', type: 'freelancer' },
      { name: 'Dashboard', href: '/dashboard', type: 'freelancer' },
    ] : [
      { name: 'Dashboard', href: '/empresa/dashboard', type: 'company' },
      { name: 'Publicar Projeto', href: '/empresa/publicar-projeto', type: 'company' },
      { name: 'Minhas Vagas', href: '/empresa/minhas-vagas', type: 'company' },
      { name: 'Propostas', href: '/empresa/propostas', type: 'company' },
      { name: 'Contratos', href: '/contratos', type: 'company' },
    ]
  ) : [
    { name: 'Como Funciona', href: '/como-funciona', type: 'all' },
    { name: 'Para Empresas', href: '/para-empresas', type: 'all' },
    { name: 'Benefícios', href: '/beneficios', type: 'all' },
  ];

  const dropdownLinks = [
    { name: 'Para Empresas', href: '/para-empresas' },
    { name: 'Para Freelancers', href: '/como-funciona#freelancers' },
    { name: 'Projetos', href: '/projetos' },
    { name: 'Talentos', href: '/talentos' },
  ];

  // Links do dropdown do usuário
  const userDropdownLinks = user ? [
    {
      name: 'Meu Perfil',
      href: '/perfil',
      icon: User,
    },
    {
      name: 'Contratos',
      href: '/contratos',
      icon: FileText,
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
    },
  ] : [];

  const handleNavigation = (href: string, type?: string) => {
    if (!user && type && type !== 'all') {
      // Salva a rota pretendida para redirecionamento após o login
      sessionStorage.setItem('redirectAfterLogin', href);
      router.push('/login');
      return;
    }
    
    if (user && type && type !== 'all' && user.userType !== type) {
      // Redireciona para o dashboard apropriado
      const dashboardUrl = user.userType === 'company' ? '/empresa/dashboard' : '/dashboard';
      router.push(dashboardUrl);
      return;
    }
    
    router.push(href);
    setUserDropdownOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Freela Connect
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {mainLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href, link.type)}
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </button>
            ))}

            {!user && (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Mais <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    {dropdownLinks.map((link) => (
                      <button
                        key={link.name}
                        onClick={() => {
                          handleNavigation(link.href);
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      >
                        {link.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize">
                        {user.userType === 'company' ? 'Empresa' : 'Freelancer'}
                      </p>
                    </div>
                    
                    {userDropdownLinks.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <button
                          key={link.name}
                          onClick={() => handleNavigation(link.href)}
                          className="flex items-center w-full text-left px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          {link.name}
                        </button>
                      );
                    })}
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        {isLoading ? 'Saindo...' : 'Sair'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => handleNavigation('/login')}
                  variant="outline"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleNavigation('/registro')}
                >
                  Cadastre-se
                </Button>
              </>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-blue-600"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-4">
              {mainLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavigation(link.href, link.type);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-1"
                >
                  {link.name}
                </button>
              ))}

              {!user && dropdownLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavigation(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-1"
                >
                  {link.name}
                </button>
              ))}

              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-2 py-2 mb-4">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600 capitalize">
                      {user.userType === 'company' ? 'Empresa' : 'Freelancer'}
                    </p>
                  </div>
                  
                  {userDropdownLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <button
                        key={link.name}
                        onClick={() => {
                          handleNavigation(link.href);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-2"
                      >
                        <IconComponent className="w-4 h-4 mr-3" />
                        {link.name}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="flex items-center w-full text-left text-red-600 hover:text-red-700 transition-colors px-2 py-2 mt-2 disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {isLoading ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Button 
                    onClick={() => {
                      handleNavigation('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      handleNavigation('/registro');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Cadastre-se
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}