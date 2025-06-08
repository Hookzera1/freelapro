'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false,
});

interface ProjectDetailsProps {
  project: {
    uid: string;
    title: string;
    description: string;
    budget: number;
    skills: string[];
    deadline: string;
    createdAt: string;
    category: string;
    type: string;
    duration: string;
    experience: string;
    location?: string;
    user: {
      name: string;
      image?: string;
      companyName?: string;
    };
    _count: {
      proposals: number;
    };
  };
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="container-custom py-12">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.title}</h1>
            <div className="flex items-center text-slate-600">
              <span>{project.user.companyName || project.user.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          {user && user.userType !== 'company' && (
            <Link
              href={`/projetos/${project.uid}/enviar-proposta`}
              className="btn-primary"
            >
              Enviar Proposta
            </Link>
          )}
        </div>

        <div className="prose prose-slate max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-4">Descrição do Projeto</h2>
          <p className="whitespace-pre-wrap">{project.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Requisitos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-700">Habilidades Necessárias</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Nível de Experiência</h3>
                <p className="text-slate-600 mt-1">{project.experience}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Detalhes do Projeto</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-700">Orçamento</h3>
                <p className="text-slate-600 mt-1">
                  R$ {project.budget.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Prazo</h3>
                <p className="text-slate-600 mt-1">{project.deadline}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Duração Estimada</h3>
                <p className="text-slate-600 mt-1">{project.duration}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Tipo de Contrato</h3>
                <p className="text-slate-600 mt-1">
                  {project.type === 'fixed-price' ? 'Preço Fixo' : 'Por Hora'}
                </p>
              </div>
              {project.location && (
                <div>
                  <h3 className="font-medium text-slate-700">Localização</h3>
                  <p className="text-slate-600 mt-1">{project.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold mb-4">Sobre a Empresa</h2>
          <div className="flex items-center">
            {project.user.image ? (
              <Image
                src={project.user.image}
                alt={project.user.companyName || project.user.name}
                width={64}
                height={64}
                className="rounded-full mr-4"
                priority={false}
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-medium text-blue-600">
                  {(project.user.companyName || project.user.name).charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {project.user.companyName || project.user.name}
              </h3>
              <p className="text-slate-600">
                {project._count.proposals} proposta(s) recebida(s)
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
} 