// Configuração centralizada do Firebase
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Função para validar configuração
export const validateFirebaseConfig = (): boolean => {
  const requiredVars = Object.entries(FIREBASE_CONFIG);
  const missingVars = requiredVars
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(`Firebase: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
};

// Função para verificar se estamos no ambiente do navegador
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Configurações do emulador
export const EMULATOR_CONFIG = {
  auth: {
    host: 'localhost',
    port: 9099,
    url: 'http://localhost:9099'
  },
  firestore: {
    host: 'localhost',
    port: 8080,
    url: 'http://localhost:8080'
  },
  storage: {
    host: 'localhost',
    port: 9199,
    url: 'http://localhost:9199'
  }
};

// Função para verificar se o emulador está disponível
export const checkEmulatorAvailability = async (service: 'auth' | 'firestore' | 'storage'): Promise<boolean> => {
  if (!isDevelopment() || !isBrowser()) {
    return false;
  }

  try {
    const config = EMULATOR_CONFIG[service];
    const response = await fetch(config.url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(2000) // Timeout de 2 segundos
    });
    return response.ok;
  } catch {
    return false;
  }
}; 