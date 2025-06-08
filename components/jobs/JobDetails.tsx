'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false,
});

interface JobDetailsProps {
  job: {
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

export default function JobDetails({ job }: JobDetailsProps) {
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{job.title}</h1>
            <div className="flex items-center text-slate-600">
              <span>{job.user.companyName || job.user.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          {user && user.userType !== 'company' && (
            <Link
              href={`/vagas/${job.uid}/enviar-proposta`}
              className="btn-primary"
            >
              Enviar Proposta
            </Link>
          )}
        </div>

        <div className="prose prose-slate max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-4">Descrição do Projeto</h2>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Requisitos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-700">Habilidades Necessárias</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.map((skill) => (
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
                <p className="text-slate-600 mt-1">{job.experience}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Detalhes do Projeto</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-700">Orçamento</h3>
                <p className="text-slate-600 mt-1">
                  R$ {job.budget.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Prazo</h3>
                <p className="text-slate-600 mt-1">{job.deadline}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Duração Estimada</h3>
                <p className="text-slate-600 mt-1">{job.duration}</p>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Tipo de Contrato</h3>
                <p className="text-slate-600 mt-1">
                  {job.type === 'fixed-price' ? 'Preço Fixo' : 'Por Hora'}
                </p>
              </div>
              {job.location && (
                <div>
                  <h3 className="font-medium text-slate-700">Localização</h3>
                  <p className="text-slate-600 mt-1">{job.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-xl font-semibold mb-4">Sobre a Empresa</h2>
          <div className="flex items-center">
            {job.user.image ? (
              <Image
                src={job.user.image}
                alt={job.user.companyName || job.user.name}
                width={64}
                height={64}
                className="rounded-full mr-4"
                priority={false}
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-medium text-blue-600">
                  {(job.user.companyName || job.user.name).charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {job.user.companyName || job.user.name}
              </h3>
              <p className="text-slate-600">
                {job._count.proposals} proposta(s) recebida(s)
              </p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
} 