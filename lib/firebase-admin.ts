import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Função para formatar a private key corretamente
const formatPrivateKey = (key: string | undefined): string => {
  if (!key) throw new Error('FIREBASE_PRIVATE_KEY não está definida');
  
  console.log('Debug: Formatando chave privada...');
  console.log('Debug: Tamanho da chave:', key.length);
  console.log('Debug: Primeiros 50 caracteres:', key.substring(0, 50));
  
  // Remove aspas duplas se existirem no início e fim
  let formattedKey = key.trim();
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  }
  
  // Se a chave já contém quebras de linha reais, mantém
  if (formattedKey.includes('\n')) {
    console.log('Debug: Chave já tem quebras de linha reais');
    return formattedKey;
  }
  
  // Substitui \\n por quebras de linha reais
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  
  console.log('Debug: Chave formatada. Primeiras 3 linhas:', formattedKey.split('\n').slice(0, 3).join('\n'));
  
  return formattedKey;
};

// Função para validar e obter as credenciais
const getServiceAccount = () => {
  // Debug: Log das variáveis de ambiente
  console.log('Firebase Admin Debug - Variáveis disponíveis:', {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID,
    FIREBASE_CLIENT_CERT_URL: !!process.env.FIREBASE_CLIENT_CERT_URL
  });

  const requiredEnvVars = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL
  };

  // Verificar variáveis ausentes
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente do Firebase Admin ausentes: ${missingVars.join(', ')}`);
  }

  return {
    type: 'service_account',
    project_id: requiredEnvVars.projectId,
    private_key_id: requiredEnvVars.privateKeyId,
    private_key: formatPrivateKey(requiredEnvVars.privateKey),
    client_email: requiredEnvVars.clientEmail,
    client_id: requiredEnvVars.clientId,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: requiredEnvVars.clientCertUrl
  };
};

// Inicializar Firebase Admin
try {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    initializeApp({
      credential: cert(serviceAccount as any)
    });
    console.log('Firebase Admin: Inicializado com sucesso');
  } else {
    console.log('Firebase Admin: Usando instância existente');
  }
} catch (error) {
  console.error('Firebase Admin: Erro crítico na inicialização:', error);
  throw error;
}

// Exportar instâncias
export const db = getFirestore();
export const auth = getAuth();

// Exportar função para verificar a conexão
export const checkFirebaseConnection = async () => {
  try {
    await db.collection('_health').doc('_check').get();
    return true;
  } catch (error) {
    console.error('Firebase Admin: Erro na conexão:', error);
    return false;
  }
};