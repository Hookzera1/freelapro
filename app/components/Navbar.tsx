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
    console.log('Estado do usuário na Navbar:', {
      isAuthenticated: !!user,
      userType: user?.userType,
      email: user?.email
    });

    const token = localStorage.getItem('authToken');
    const isAuthenticated = !!user && !!token;
    setIsInitialized(true);

    console.log('Estado de autenticação:', {
      token: !!token,
      isAuthenticated,
      userType: user?.userType
    });

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
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logout();
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
      setIsProfileOpen(false);
    }
  };

  const getNavigationLinks = (): NavigationLink[] => {
    if (loading || !isInitialized) {
      console.log('Navbar: Loading ou não inicializado', { loading, isInitialized });
      return [];
    }

    if (!user) {
      console.log('Navbar: Usuário não autenticado');
      return [
        { href: '/vagas', label: 'Vagas Disponíveis', icon: Search },
        { href: '/talentos', label: 'Encontrar Talentos', icon: Users },
        { href: '/como-funciona', label: 'Como Funciona', icon: Briefcase }
      ];
    }

    const userType = user.userType || 'freelancer';
    console.log('Navbar: Tipo de usuário atual:', {
      userType,
      userEmail: user.email,
      userId: user.uid,
      rawUserType: user.userType
    });

    if (userType !== 'freelancer' && userType !== 'company') {
      console.warn('Navbar: Tipo de usuário inválido, usando freelancer como padrão');
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
        { href: '/buscar-projetos', label: 'Buscar Projetos', icon: Search, requiresAuth: true },
        { href: '/minhas-propostas', label: 'Minhas Propostas', icon: Briefcase, requiresAuth: true },
        { href: '/portfolio', label: 'Portfólio', icon: User, requiresAuth: true }
      ];
    }

    if (userType === 'freelancer') {
      console.log('Navbar: Retornando links de freelancer');
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
        { href: '/vagas', label: 'Vagas Disponíveis', icon: Search, requiresAuth: false },
        { href: '/minhas-propostas', label: 'Minhas Propostas', icon: Briefcase, requiresAuth: true },
        { href: '/contratos', label: 'Contratos', icon: FileText, requiresAuth: true },
        { href: '/portfolio', label: 'Portfolio', icon: User, requiresAuth: true }
      ];
    }

    if (userType === 'company') {
      console.log('Navbar: Retornando links de empresa');
      return [
        { href: '/empresa/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true },
        { href: '/empresa/publicar-projeto', label: 'Publicar Projeto', icon: PlusCircle, requiresAuth: true },
        { href: '/empresa/minhas-vagas', label: 'Minhas Vagas', icon: Briefcase, requiresAuth: true },
        { href: '/empresa/propostas', label: 'Propostas', icon: Users, requiresAuth: true },
        { href: '/buscar-talentos', label: 'Buscar Talentos', icon: Search, requiresAuth: true },
        { href: '/contratos', label: 'Contratos', icon: FileText, requiresAuth: true }
      ];
    }

    console.warn('Navbar: Caso não esperado, retornando links básicos');
    return [
      { href: '/dashboard', label: 'Dashboard', icon: Briefcase, requiresAuth: true }
    ];
  };

  const handleNavigation = async (href: string, requiresAuth?: boolean) => {
    console.log('Navegação iniciada:', {
      href,
      requiresAuth,
      userType: user?.userType,
      isAuthenticated: !!user,
      token: !!localStorage.getItem('authToken')
    });

    const token = localStorage.getItem('authToken');
    const isAuthenticated = !!user && !!token;

    if (requiresAuth && !isAuthenticated) {
      console.log('Redirecionando para login - usuário não autenticado');
      const searchParams = new URLSearchParams();
      searchParams.set('redirect', href);
      router.push(`/login?${searchParams.toString()}`);
      return;
    }

    if (href.startsWith('/empresa/')) {
      console.log('Verificando acesso à rota de empresa:', {
        isAuthenticated,
        userType: user?.userType,
        href
      });

      if (!isAuthenticated) {
        console.log('Redirecionando para login - rota de empresa, usuário não autenticado');
        const searchParams = new URLSearchParams();
        searchParams.set('redirect', href);
        router.push(`/login?${searchParams.toString()}`);
        return;
      }
      
      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log('Token inválido, redirecionando para login');
          localStorage.removeItem('authToken');
          const searchParams = new URLSearchParams();
          searchParams.set('redirect', href);
          router.push(`/login?${searchParams.toString()}`);
          return;
        }

        if (user?.userType !== 'company') {
          console.log('Acesso negado - usuário não é empresa');
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    }

    if (href.startsWith('/dashboard') || href.startsWith('/portfolio') || href.startsWith('/minhas-propostas')) {
      if (!isAuthenticated) {
        console.log('Redirecionando para login - rota de freelancer, usuário não autenticado');
        const searchParams = new URLSearchParams();
        searchParams.set('redirect', href);
        router.push(`/login?${searchParams.toString()}`);
        return;
      }

      if (user?.userType !== 'freelancer') {
        console.log('Acesso negado - usuário não é freelancer');
        router.push('/empresa/dashboard');
        return;
      }
    }

    console.log('Navegando para:', href);
    router.push(href);
    setUserDropdownOpen(false);
  };

  const navigationLinks = getNavigationLinks();

  if (!isInitialized) {
    return null;
  }

  if (loading) {
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
            {!user ? (
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
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold text-slate-800">Notificações</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                              setNotificationDropdownOpen(false);
                              if (notification.relatedType === 'contract' && notification.relatedId) {
                                router.push('/contratos');
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {notification.type === 'MESSAGE_RECEIVED' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                                {notification.type === 'MILESTONE_COMPLETED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {notification.type === 'PAYMENT_RECEIVED' && <DollarSign className="w-4 h-4 text-green-500" />}
                                {!['MESSAGE_RECEIVED', 'MILESTONE_COMPLETED', 'PAYMENT_RECEIVED'].includes(notification.type) && <Bell className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs mt-1 ${!notification.read ? 'text-slate-600' : 'text-slate-500'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 10 && (
                      <div className="p-3 border-t text-center">
                        <button
                          onClick={() => {
                            setNotificationDropdownOpen(false);
                            router.push('/notificacoes');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Ver todas as notificações
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:text-blue-600 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 animate-in slide-in-from-top-2">
            <div className="space-y-1 px-4">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link.href, link.requiresAuth)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200
                    ${pathname === link.href
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600'
                      : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:text-blue-600'
                    }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </button>
              ))}

              {!user ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href="/login" className="block">
                    <button className="w-full px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:text-blue-600 transition-all duration-200">
                      Entrar
                    </button>
                  </Link>
                  <Link href="/registro" className="block">
                    <button className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200">
                      Criar Conta
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 hover:text-blue-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 