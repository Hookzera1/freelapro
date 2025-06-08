'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Briefcase, Shield, Users, Wrench, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  createdAt: Date;
  user: {
    name: string;
    image?: string;
  };
}

export default function Home() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/jobs?limit=3');
        if (response.ok) {
          const data = await response.json();
          setRecentJobs(data);
        }
      } catch (error) {
        console.error('Erro ao buscar vagas recentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: 'Pagamentos Seguros',
      description: 'Sistema de pagamento protegido e garantido para todas as transações na plataforma.'
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: 'Talentos Verificados',
      description: 'Processo rigoroso de verificação para garantir os melhores profissionais.'
    },
    {
      icon: <Star className="w-6 h-6 text-white" />,
      title: 'Suporte Premium',
      description: 'Equipe de suporte dedicada 24/7 para ajudar em qualquer necessidade.'
    }
  ];

  const getActionButton = () => {
    if (!isAuthenticated) {
      return (
        <Link href="/registro">
          <Button size="lg" className="button-gradient w-full sm:w-auto">
            Comece Agora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      );
    }

    return (
      <Link 
        href={user?.userType === 'freelancer' ? '/buscar-projetos' : '/empresa/publicar-projeto'}
      >
        <Button size="lg" className="button-gradient w-full sm:w-auto">
          {user?.userType === 'freelancer' ? 'Buscar Projetos' : 'Publicar Projeto'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-purple-100/50 to-pink-100/50" />
        <div className="absolute inset-0 hero-pattern opacity-5" />
        
        <div className="container-custom relative pt-20 pb-24 md:pt-32 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Conectando{' '}
              <span className="gradient-text">Talentos</span>{' '}
              a{' '}
              <span className="gradient-text">Oportunidades</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              A plataforma que une profissionais talentosos a projetos inovadores. 
              Encontre as melhores oportunidades ou contrate os melhores freelancers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {getActionButton()}
              <Link href="/como-funciona">
                <Button size="lg" variant="outline" className="glass-effect w-full sm:w-auto">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 section-gradient border-y border-white/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="stats-card"
            >
              <div className="feature-icon">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">50K+</h3>
              <p className="text-slate-600">Freelancers Ativos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="stats-card"
            >
              <div className="feature-icon">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">10K+</h3>
              <p className="text-slate-600">Projetos Concluídos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="stats-card"
            >
              <div className="feature-icon">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">4.8/5</h3>
              <p className="text-slate-600">Avaliação Média</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Por que escolher a{' '}
              <span className="gradient-text">FreelancePro</span>?
            </h2>
            <p className="text-slate-600">
              Nossa plataforma oferece as melhores ferramentas e recursos para impulsionar sua carreira freelancer
              ou encontrar os melhores talentos para seu projeto.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
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
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                  Pronto para começar sua{' '}
                  <span className="gradient-text">jornada</span>?
                </h2>
                <p className="text-slate-600 mb-8">
                  Junte-se a milhares de profissionais e empresas que já estão transformando
                  a maneira como trabalham. Cadastre-se gratuitamente hoje.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {getActionButton()}
                  <Link href="/contato">
                    <Button size="lg" variant="outline" className="glass-effect w-full sm:w-auto">
                      Fale Conosco
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}