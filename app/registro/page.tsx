'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, Mail, Lock, Building2, UserCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const { signUp, user, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'freelancer' as 'freelancer' | 'company',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (user) {
      if (user.userType === 'company') {
        router.push('/empresa/dashboard');
      } else if (user.userType === 'freelancer') {
        router.push('/dashboard');
      } else {
        router.push('/completar-registro');
      }
    }
  }, [user, router]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return false;
    }

    if (!formData.email.includes('@')) {
      toast.error('Email inválido');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Validar companyName para empresas
      if (formData.userType === 'company' && !formData.companyName.trim()) {
        toast.error('Nome da empresa é obrigatório');
        setLoading(false);
        return;
      }

      const user = await signUp(
        formData.email, 
        formData.password, 
        formData.name,
        formData.userType,
        formData.userType === 'company' ? formData.companyName : undefined
      );
      
      if (user) {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
        if (formData.userType === 'company') {
          router.push('/empresa/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      
      // Tratamento específico para mensagens de erro
      if (err.message.includes('email já está sendo usado')) {
        toast.error('Este email já está cadastrado. Tente fazer login ou use outro email.');
        setError('email-exists');
      } else if (err.message.includes('senha é muito fraca')) {
        toast.error('A senha deve ter pelo menos 6 caracteres e incluir números e letras.');
        setError('weak-password');
      } else if (err.message.includes('Email inválido')) {
        toast.error('Por favor, insira um email válido.');
        setError('invalid-email');
      } else {
        toast.error('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro quando o usuário começa a digitar
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      {/* Logo */}
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
        <span className="text-2xl font-bold text-white">FP</span>
      </div>

      <div className="w-full max-w-xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Criar Conta
          </h1>
          <p className="mt-2 text-slate-600">
            Junte-se à nossa comunidade de freelancers e empresas
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Conta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'freelancer' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.userType === 'freelancer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <UserCircle2 className="w-6 h-6" />
                  <span className="font-medium">Freelancer</span>
                  <span className="text-xs text-slate-500">Quero oferecer serviços</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'company' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.userType === 'company'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="font-medium">Empresa</span>
                  <span className="text-xs text-slate-500">Quero contratar freelancers</span>
                </button>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full h-12 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  required
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full h-12 bg-white/50 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out ${
                    error === 'email-exists' || error === 'invalid-email'
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200'
                  }`}
                  required
                  placeholder="seu@email.com"
                />
                {error === 'email-exists' && (
                  <p className="mt-1 text-sm text-red-600">
                    Este email já está cadastrado. <Link href="/login" className="underline hover:text-red-700">Faça login</Link> ou use outro email.
                  </p>
                )}
                {error === 'invalid-email' && (
                  <p className="mt-1 text-sm text-red-600">
                    Por favor, insira um email válido.
                  </p>
                )}
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full h-12 bg-white/50 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out ${
                    error === 'weak-password'
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-200'
                  }`}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                {error === 'weak-password' && (
                  <p className="mt-1 text-sm text-red-600">
                    A senha deve ter pelo menos 6 caracteres e incluir números e letras.
                  </p>
                )}
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 w-full h-12 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Nome da Empresa (apenas para empresas) */}
            {formData.userType === 'company' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="pl-10 w-full h-12 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    required
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:scale-[0.98] flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Criando conta...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Criar Conta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>© 2024 FreelancePro. Todos os direitos reservados.</p>
      </div>
    </div>
  );
} 