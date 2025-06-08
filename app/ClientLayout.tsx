'use client';

import { Providers } from './providers';
import { Navbar } from './components/Navbar';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container-custom py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-secondary-200">
          <div className="container-custom py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Logo className="mb-4" />
                <p className="text-secondary-600">
                  Conectando os melhores talentos às melhores oportunidades.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 mb-4">
                  Para Freelancers
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/vagas" className="text-secondary-600 hover:text-primary-600">
                      Encontrar Vagas
                    </Link>
                  </li>
                  <li>
                    <Link href="/como-funciona" className="text-secondary-600 hover:text-primary-600">
                      Como Funciona
                    </Link>
                  </li>
                  <li>
                    <Link href="/perfil" className="text-secondary-600 hover:text-primary-600">
                      Meu Perfil
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 mb-4">
                  Para Empresas
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/buscar-talentos" className="text-secondary-600 hover:text-primary-600">
                      Buscar Talentos
                    </Link>
                  </li>
                  <li>
                    <Link href="/publicar-vaga" className="text-secondary-600 hover:text-primary-600">
                      Publicar Vaga
                    </Link>
                  </li>
                  <li>
                    <Link href="/empresa/dashboard" className="text-secondary-600 hover:text-primary-600">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 mb-4">
                  Suporte
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/ajuda" className="text-secondary-600 hover:text-primary-600">
                      Central de Ajuda
                    </Link>
                  </li>
                  <li>
                    <Link href="/contato" className="text-secondary-600 hover:text-primary-600">
                      Contato
                    </Link>
                  </li>
                  <li>
                    <Link href="/termos" className="text-secondary-600 hover:text-primary-600">
                      Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidade" className="text-secondary-600 hover:text-primary-600">
                      Política de Privacidade
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-secondary-200">
              <p className="text-center text-secondary-600">
                © {new Date().getFullYear()} Freela Conect. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Providers>
  );
}