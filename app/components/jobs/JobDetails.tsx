'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';
import ProposalForm from '@/components/proposals/ProposalForm';

interface Job {
  uid: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
  category: string;
  type: string;
  duration: string;
  experience: string;
  location?: string;
  skills: string[];
  companyUid: string;
  companyName: string;
  companyImage?: string;
  proposalsCount: number;
}

interface Props {
  job: Job;
}

export default function JobDetails({ job }: Props) {
  const { user } = useAuth();
  const [showProposalForm, setShowProposalForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detalhes do Projeto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center text-sm text-slate-600">
                    <span>{job.companyName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                {job.companyImage && (
                  <Image
                    src={job.companyImage}
                    alt={job.companyName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-slate-600">{job.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-500">Orçamento</span>
                  <p className="font-semibold text-slate-800">
                    R$ {job.budget.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-500">Tipo</span>
                  <p className="font-semibold text-slate-800">
                    {job.type === 'fixed-price' ? 'Preço Fixo' : 'Por Hora'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-500">Duração</span>
                  <p className="font-semibold text-slate-800">{job.duration}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-500">Experiência</span>
                  <p className="font-semibold text-slate-800">{job.experience}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Habilidades Necessárias
                </h3>
                <div className="flex flex-wrap gap-2">
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

              {job.location && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Localização
                  </h3>
                  <p className="text-slate-600">{job.location}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Prazo
                </h3>
                <p className="text-slate-600">
                  {new Date(job.deadline).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Sobre a Empresa
                </h3>
                <div className="flex items-center mb-4">
                  {job.companyImage ? (
                    <Image
                      src={job.companyImage}
                      alt={job.companyName}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-xl font-medium text-slate-600">
                        {job.companyName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <h4 className="font-medium text-slate-800">
                      {job.companyName}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {job.proposalsCount} proposta(s) recebida(s)
                    </p>
                  </div>
                </div>
              </div>

              {user && user.userType === 'freelancer' && (
                <div>
                  {!showProposalForm ? (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="btn-primary w-full"
                    >
                      Enviar Proposta
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* TODO: Corrigir tipos do ProposalForm */}
                      {/* <ProposalForm job={job} onCancel={() => setShowProposalForm(false)} /> */}
                      <div className="p-4 bg-gray-100 rounded">
                        <p>Formulário de proposta em desenvolvimento</p>
                        <button 
                          onClick={() => setShowProposalForm(false)}
                          className="btn-secondary mt-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 