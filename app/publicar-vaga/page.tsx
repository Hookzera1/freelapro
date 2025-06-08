'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { RouteGuard } from '@/app/components/RouteGuard';

export default function PublicarVagaPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    requisitos: '',
    beneficios: '',
    salario: '',
    tipo: 'remoto',
    nivel: 'junior'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de submissão
  };

  return (
    <RouteGuard
      allowedUserTypes={['company']}
      requireVerified={true}
      redirectTo="/empresa/dashboard"
      customDeniedMessage="Apenas empresas podem publicar vagas"
      customDeniedSuggestion="Se você é uma empresa e está vendo esta mensagem, verifique se sua conta está configurada corretamente."
    >
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Publicar Nova Vaga
        </h1>

        <div className="card-gradient p-6 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-2">
                Título da Vaga
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="input-gradient w-full"
                placeholder="Ex: Desenvolvedor Full Stack Senior"
                required
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-2">
                Descrição da Vaga
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="input-gradient w-full h-32"
                placeholder="Descreva detalhadamente a vaga, responsabilidades e expectativas..."
                required
              />
            </div>

            <div>
              <label htmlFor="requisitos" className="block text-sm font-medium text-slate-700 mb-2">
                Requisitos
              </label>
              <textarea
                id="requisitos"
                name="requisitos"
                value={formData.requisitos}
                onChange={(e) => setFormData(prev => ({ ...prev, requisitos: e.target.value }))}
                className="input-gradient w-full h-24"
                placeholder="Liste os requisitos técnicos e soft skills necessários..."
                required
              />
            </div>

            <div>
              <label htmlFor="beneficios" className="block text-sm font-medium text-slate-700 mb-2">
                Benefícios
              </label>
              <textarea
                id="beneficios"
                name="beneficios"
                value={formData.beneficios}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficios: e.target.value }))}
                className="input-gradient w-full h-24"
                placeholder="Liste os benefícios oferecidos..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="salario" className="block text-sm font-medium text-slate-700 mb-2">
                  Faixa Salarial
                </label>
                <input
                  type="text"
                  id="salario"
                  name="salario"
                  value={formData.salario}
                  onChange={(e) => setFormData(prev => ({ ...prev, salario: e.target.value }))}
                  className="input-gradient w-full"
                  placeholder="Ex: R$ 5.000 - R$ 7.000"
                  required
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Trabalho
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  className="input-gradient w-full"
                  required
                >
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div>
                <label htmlFor="nivel" className="block text-sm font-medium text-slate-700 mb-2">
                  Nível de Experiência
                </label>
                <select
                  id="nivel"
                  name="nivel"
                  value={formData.nivel}
                  onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value }))}
                  className="input-gradient w-full"
                  required
                >
                  <option value="estagio">Estágio</option>
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="button-gradient"
              >
                Publicar Vaga
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
} 