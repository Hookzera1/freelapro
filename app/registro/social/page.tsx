'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Importação dinâmica para evitar problemas de SSR
const SocialRegistrationForm = dynamic(() => import('./SocialRegistrationForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="w-20 h-20 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p className="mt-4 text-slate-600">Carregando...</p>
    </div>
  )
});

export default function SocialRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
        <div className="w-20 h-20 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-600">Carregando...</p>
      </div>
    }>
      <SocialRegistrationForm />
    </Suspense>
  );
}