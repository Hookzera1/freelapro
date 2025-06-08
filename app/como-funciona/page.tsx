'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle, Shield, Users, Briefcase, Star } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: 'Crie sua conta',
      description: 'Registre-se gratuitamente como freelancer ou cliente em apenas alguns minutos.'
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      title: 'Encontre oportunidades',
      description: 'Explore projetos ou talentos que combinam com suas necessidades.'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Trabalhe com segurança',
      description: 'Utilize nosso sistema de pagamento seguro e proteção contra fraudes.'
    },
    {
      icon: <Star className="w-6 h-6 text-blue-500" />,
      title: 'Construa sua reputação',
      description: 'Receba avaliações positivas e destaque-se na plataforma.'
    }
  ];

  const benefits = [
    {
      title: 'Para Freelancers',
      items: [
        'Encontre projetos de qualidade',
        'Receba pagamentos garantidos',
        'Desenvolva sua carreira',
        'Trabalhe com flexibilidade',
        'Construa seu portfólio',
        'Networking profissional'
      ]
    },
    {
      title: 'Para Clientes',
      items: [
        'Acesse talentos verificados',
        'Gerencie projetos facilmente',
        'Pagamentos seguros',
        'Suporte dedicado',
        'Resultados garantidos',
        'Processo transparente'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-purple-100/50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Como funciona a{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                FreelancePro
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Conectamos talentos excepcionais a oportunidades extraordinárias através de um
              processo simples, seguro e eficiente.
            </p>
            <Link href="/registro">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                Comece Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Processo Simplificado
            </h2>
            <p className="text-slate-600">
              Siga estes passos simples para começar sua jornada na FreelancePro.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white shadow-sm border border-blue-100"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Benefícios da Plataforma
            </h2>
            <p className="text-slate-600">
              Oferecemos vantagens exclusivas tanto para freelancers quanto para clientes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-white shadow-sm border border-blue-100"
              >
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                  {benefit.title}
                </h3>
                <div className="space-y-4">
                  {benefit.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="relative p-12 md:p-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                  Pronto para começar?
                </h2>
                <p className="text-slate-600 mb-8">
                  Junte-se a milhares de profissionais e empresas que já estão transformando
                  a maneira como trabalham. Cadastre-se gratuitamente hoje.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/registro">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full sm:w-auto">
                      Criar Conta Grátis
                    </Button>
                  </Link>
                  <Link href="/contato">
                    <Button size="lg" variant="outline" className="border-blue-200 text-slate-700 hover:bg-blue-50 w-full sm:w-auto">
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