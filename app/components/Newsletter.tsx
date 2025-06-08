'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simular envio do email
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      
      // Resetar após 3 segundos
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1000);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Fique por dentro das novidades
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Receba as últimas atualizações sobre projetos incríveis e dicas de desenvolvimento diretamente no seu email.
        </p>

        <div className="gradient-border p-[1px] rounded-full max-w-md mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative glass-effect rounded-full p-1"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor email"
              className="w-full bg-transparent px-6 py-3 text-white placeholder-gray-400 outline-none"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="absolute right-1 top-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : status === 'success' ? (
                'Enviado! ✨'
              ) : (
                'Inscrever-se'
              )}
            </button>
          </form>
        </div>

        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 mt-4"
          >
            Obrigado por se inscrever! 🎉
          </motion.p>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Prometemos não enviar spam. Você pode cancelar a qualquer momento.
        </p>
      </motion.div>
    </section>
  );
} 