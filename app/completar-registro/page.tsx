'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Building2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CompletarRegistroPage() {
  const router = useRouter();
  const { user: authUser, updateProfile } = useAuth();
  const [userType, setUserType] = useState<'freelancer' | 'company'>('freelancer');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authUser) {
      router.push('/login');
    }
  }, [authUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile({
        userType,
        companyName: userType === 'company' ? companyName : undefined
      });

      toast.success('Perfil atualizado com sucesso!');
      
      // Usar setTimeout para evitar o erro de atualização durante renderização
      setTimeout(() => {
        router.push(userType === 'company' ? '/empresa/dashboard' : '/dashboard');
      }, 100);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            Complete seu Registro
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Selecione o tipo de conta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('freelancer')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    userType === 'freelancer'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Freelancer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    userType === 'company'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Empresa</span>
                </button>
              </div>
            </div>

            {userType === 'company' && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-gradient w-full"
                  placeholder="Digite o nome da sua empresa"
                  required={userType === 'company'}
                />
              </div>
            )}

            <Button
              type="submit"
              className="button-gradient w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 