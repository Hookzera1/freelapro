import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FreelancePro - Conectando Talentos e Oportunidades',
    template: '%s | FreelancePro'
  },
  description: 'Plataforma líder em conexão entre freelancers e empresas. Encontre os melhores talentos ou projetos para sua expertise.',
  keywords: 'freelancer, freelance, projetos, trabalho remoto, contratação, desenvolvimento, design, marketing',
  authors: [{ name: 'FreelancePro Team' }],
  creator: 'FreelancePro',
  publisher: 'FreelancePro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://freelancepro.com.br',
    siteName: 'FreelancePro',
    title: 'FreelancePro - Conectando Talentos e Oportunidades',
    description: 'Encontre os melhores freelancers e projetos. Conectamos profissionais talentosos com oportunidades incríveis.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreelancePro Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelancePro - Conectando Talentos e Oportunidades',
    description: 'Encontre os melhores freelancers e projetos. Conectamos profissionais talentosos com oportunidades incríveis.',
    images: ['/twitter-image.jpg'],
    creator: '@freelancepro',
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'facebook-domain-verification': ['facebook-domain-verification-code'],
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '10px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ADE80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
