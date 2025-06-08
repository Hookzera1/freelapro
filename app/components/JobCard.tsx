'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    skills: string[];
    status: string;
    createdAt: string;
    company: {
      name: string;
      image: string;
    };
    proposals: {
      id: string;
    }[];
  };
}

export default function JobCard({ job }: JobCardProps) {
  const formattedBudget = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(job.budget);

  const formattedDeadline = formatDistanceToNow(new Date(job.deadline), {
    locale: ptBR,
    addSuffix: true,
  });

  const formattedCreatedAt = formatDistanceToNow(new Date(job.createdAt), {
    locale: ptBR,
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-border p-[1px] rounded-xl hover-scale"
    >
      <div className="bg-[#1a1a1a] p-6 rounded-xl h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={job.company.image}
              alt={job.company.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold gradient-text">{job.title}</h3>
            <p className="text-sm text-gray-400">{job.company.name}</p>
          </div>
        </div>

        <p className="text-gray-300 mb-4 flex-grow">{job.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-sm glass-effect rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-400">Orçamento</p>
            <p className="text-lg font-semibold gradient-text">
              {formattedBudget}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Prazo</p>
            <p className="text-lg font-semibold">{formattedDeadline}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {job.proposals.length} proposta(s)
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-400">{formattedCreatedAt}</span>
          </div>

          <Link
            href={`/vagas/${job.id}`}
            className="px-4 py-2 glass-effect rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 