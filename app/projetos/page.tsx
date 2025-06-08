'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, Briefcase, Clock, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Project {
  uid: string;
  title: string;
  description: string;
  budget: number;
  duration: string;
  skills: string[];
  postedAt: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'Todos',
    'Desenvolvimento',
    'Design',
    'Marketing',
    'Escrita',
    'Consultoria'
  ];

  const projects: Project[] = [
    {
      uid: '1',
      title: 'Desenvolvimento de E-commerce',
      description: 'Precisamos de um desenvolvedor full-stack para criar uma loja online completa usando Next.js e Stripe.',
      budget: 5000,
      duration: '2-3 meses',
      skills: ['Next.js', 'React', 'Node.js', 'Stripe'],
      postedAt: '2 dias atrás'
    },
    {
      uid: '2',
      title: 'Design de Interface de Usuário',
      description: 'Procurando designer UI/UX para redesenhar a interface do nosso aplicativo móvel.',
      budget: 3000,
      duration: '1-2 meses',
      skills: ['Figma', 'UI/UX', 'Mobile Design'],
      postedAt: '5 dias atrás'
    },
    {
      uid: '3',
      title: 'Campanha de Marketing Digital',
      description: 'Necessitamos de um especialista em marketing digital para criar e gerenciar campanhas nas redes sociais.',
      budget: 2500,
      duration: '3 meses',
      skills: ['Social Media', 'SEO', 'Content Marketing'],
      postedAt: '1 semana atrás'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-purple-100/50 to-pink-100/50" />
        <div className="absolute inset-0 hero-pattern opacity-5" />
        
        <div className="container-custom relative py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Encontre os Melhores{' '}
              <span className="gradient-text">Projetos Freelance</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Explore oportunidades em diversas áreas e encontre o projeto perfeito para suas habilidades.
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-gradient w-full px-6 py-4 rounded-xl text-slate-800 placeholder-slate-400"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 button-gradient"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 section-gradient border-y border-white/30">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`tag-gradient px-6 py-2 rounded-full transition-all duration-300 
                  ${selectedCategory === category.toLowerCase()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'hover:shadow-md hover:scale-105'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.uid}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="feature-card group"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 mt-2 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="tag-gradient px-3 py-1 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span>R$ {project.budget}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{project.duration}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <Button className="button-gradient w-full">
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 section-gradient border-y border-white/30">
        <div className="container-custom">
          <div className="cta-section">
            <div className="relative p-12 md:p-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                  Não encontrou o projeto{' '}
                  <span className="gradient-text">ideal</span>?
                </h2>
                <p className="text-slate-600 mb-8">
                  Publique suas necessidades e deixe que os melhores freelancers entrem em contato com você.
                </p>
                <Button size="lg" className="button-gradient">
                  Publicar Projeto
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 