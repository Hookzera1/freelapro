'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Menu, X, User, LogOut, ChevronDown, Search, Briefcase, Users, Bell, PlusCircle, Building2, Settings, FileText, MessageCircle, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/app/hooks/useNotifications';

interface NavigationLink {
  href: string;
  label: string;
  icon?: LucideIcon;
  requiresAuth?: boolean;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔍 Navbar: Estado inicial do usuário:', {
      user: !!user,
      loading,
      isAuthenticated,
      userType: user?.userType,
      email: user?.email,
      uid: user?.uid
    });

    if (!loading) {
      setIsInitialized(true);
      console.log('✅ Navbar: Inicialização completa', {
        hasUser: !!user,
        userType: user?.userType,
        isAuthenticated
      });
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationDropdownOpen(false);
      }
      
      if (userRef.current && !userRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Navbar: Iniciando logout...');
      await logout();
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('❌ Navbar: Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
      setIsProfileOpen(false);
    }
  };

  const getNavigationLinks = (): NavigationLink[] => {
    if (loading || !isInitialized) {
      console.log('⏳ Navbar: Aguardando inicialização...', { loading, isInitialized });
      return [];
    }

    if (!user || !isAuthenticated) {
      console.log('👤 Navbar: Usuário não autenticado, mostrando links públicos');
      return [
        { href: '/vagas', label: 'Vagas Disponíveis', icon: Search },
        { href: '/talentos', label: 'Encontrar Talentos', icon: Users },
        { href: '/como-funciona', label: 'Como Funciona', icon: Briefcase }
      ];
    }

    const userType = user.userType || 'freelancer';
    console.log('🎯 Navbar: Gerando links para tipo de usuário:', {
      userType,
      userEmail: user.email,
      userId: user.uid,
      rawUserType: user.userType
    });

    if (userType === 'freelancer') {
      console.log('👨‍💻 Navbar: Retornando links de freelancer');
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
        { href: '/vagas', label: 'Vagas Disponíveis', icon: Search, requiresAuth: false },
        { href: '/minhas-propostas', label: 'Minhas Propostas', icon: Briefcase, requiresAuth: true },
        { href: '/contratos', label: 'Contratos', icon: FileText, requiresAuth: true },
        { href: '/portfolio', label: 'Portfolio', icon: User, requiresAuth: true }
      ];
    }

    if (userType === 'company') {
      console.log('🏢 Navbar: Retornando links de empresa');
      return [
        { href: '/empresa/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
        { href: '/empresa/publicar-projeto', label: 'Publicar Projeto', icon: PlusCircle, requiresAuth: true },
        { href: '/empresa/minhas-vagas', label: 'Minhas Vagas', icon: Briefcase, requiresAuth: true },
        { href: '/empresa/propostas', label: 'Propostas', icon: Users, requiresAuth: true },
        { href: '/buscar-talentos', label: 'Buscar Talentos', icon: Search, requiresAuth: true },
        { href: '/contratos', label: 'Contratos', icon: FileText, requiresAuth: true }
      ];
    }

    console.warn('⚠️ Navbar: Tipo de usuário inválido, usando freelancer como padrão', { userType });
    return [
      { href: '/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
      { href: '/vagas', label: 'Vagas Disponíveis', icon: Search, requiresAuth: false },
      { href: '/minhas-propostas', label: 'Minhas Propostas', icon: Briefcase, requiresAuth: true },
      { href: '/portfolio', label: 'Portfólio', icon: User, requiresAuth: true }
    ];
  };

  const handleNavigation = async (href: string, requiresAuth?: boolean) => {
    console.log('🧭 Navbar: Navegação iniciada:', {
      href,
      requiresAuth,
      userType: user?.userType,
      isAuthenticated,
      hasUser: !!user
    });

    if (requiresAuth && (!user || !isAuthenticated)) {
      console.log('🔐 Navbar: Redirecionando para login - usuário não autenticado');
      const searchParams = new URLSearchParams();
      searchParams.set('redirect', href);
      router.push(`/login?${searchParams.toString()}`);
      return;
    }

    if (href.startsWith('/empresa/')) {
      console.log('🏢 Navbar: Verificando acesso à rota de empresa');

      if (!user || !isAuthenticated) {
        console.log('🔐 Navbar: Redirecionando para login - rota de empresa sem auth');
        const searchParams = new URLSearchParams();
        searchParams.set('redirect', href);
        router.push(`/login?${searchParams.toString()}`);
        return;
      }

      if (user.userType !== 'company') {
        console.log('❌ Navbar: Acesso negado - usuário não é empresa');
        router.push('/dashboard');
        return;
      }
    }

    if (href.startsWith('/dashboard') || href.startsWith('/portfolio') || href.startsWith('/minhas-propostas') || href.startsWith('/contratos')) {
      console.log('👨‍💻 Navbar: Verificando acesso à rota de freelancer');

      if (!user || !isAuthenticated) {
        console.log('🔐 Navbar: Redirecionando para login - rota de freelancer sem auth');
        const searchParams = new URLSearchParams();
        searchParams.set('redirect', href);
        router.push(`/login?${searchParams.toString()}`);
        return;
      }

      if (user.userType !== 'freelancer') {
        console.log('❌ Navbar: Acesso negado - usuário não é freelancer');
        router.push('/empresa/dashboard');
        return;
      }
    }

    console.log('✅ Navbar: Navegando para:', href);
    router.push(href);
    setUserDropdownOpen(false);
  };

  const navigationLinks = getNavigationLinks();

  if (!isInitialized || loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">FP</span>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FreelancePro</span>
            </Link>
            <div className="animate-pulse flex gap-4">
              <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-200">
              <span className="text-lg font-bold text-white">FP</span>
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FreelancePro</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href, link.requiresAuth)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200
                  ${pathname === link.href
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:text-blue-600'
                  }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!user || !isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200">
                    Entrar
                  </button>
                </Link>
                <Link href="/registro">
                  <button className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200">
                    Criar Conta
                  </button>
                </Link>
              </div>
            ) : (
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
                    
                    <button
                      onClick={() => handleNavigation('/perfil')}
                      className="flex items-center w-full text-left px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Meu Perfil
                    </button>
                    
                    <button
                      onClick={() => handleNavigation('/configuracoes')}
                      className="flex items-center w-full text-left px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configurações
                    </button>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
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
            )}

            {/* Notificações */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma notificação</p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                                {notification.type === 'proposal' && <Briefcase className="w-5 h-5 text-green-500" />}
                                {notification.type === 'contract' && <FileText className="w-5 h-5 text-purple-500" />}
                                {notification.type === 'payment' && <DollarSign className="w-5 h-5 text-green-500" />}
                                {notification.type === 'milestone' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => {
                      handleNavigation(link.href, link.requiresAuth);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-3"
                  >
                    {link.icon && <link.icon className="w-5 h-5 mr-3" />}
                    {link.label}
                  </button>
                ))}

                {user && isAuthenticated ? (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="px-2 py-2 mb-4">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize">
                        {user.userType === 'company' ? 'Empresa' : 'Freelancer'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleNavigation('/perfil');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-2"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Meu Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        handleNavigation('/configuracoes');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-2"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configurações
                    </button>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
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
                    <Link href="/login">
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-left text-slate-600 hover:text-blue-600 transition-colors px-2 py-3"
                      >
                        Entrar
                      </button>
                    </Link>
                    <Link href="/registro">
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-left px-2 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        Criar Conta
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 