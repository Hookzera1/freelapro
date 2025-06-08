import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged,
  connectAuthEmulator
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verificar se as variáveis de ambiente estão definidas
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Variáveis de ambiente do Firebase Client faltando:', missingVars);
  throw new Error(`Variáveis de ambiente do Firebase Client incompletas: ${missingVars.join(', ')}`);
}

console.log('Iniciando Firebase Client...');

// Inicializar Firebase apenas uma vez
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase App inicializado');
} else {
  app = getApps()[0];
  console.log('Usando instância existente do Firebase App');
}

// Inicializar Auth
const auth = getAuth(app);

// Verificar se o emulador está disponível antes de conectar
const checkEmulatorAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:9099', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Função para configurar emulador se disponível
const setupEmulatorIfAvailable = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const emulatorAvailable = await checkEmulatorAvailability();
      if (emulatorAvailable) {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Conectado ao emulador de autenticação Firebase');
      } else {
        console.log('Emulador Firebase não disponível, usando produção');
      }
    } catch (error) {
      console.warn('Erro ao verificar/conectar emulador Firebase:', error);
    }
  }
};

// Configurar persistência local
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase: Persistência local configurada com sucesso');
    
    // Adicionar listener para mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then(token => {
          localStorage.setItem('authToken', token);
          console.log('Token atualizado no localStorage');
        }).catch(error => {
          console.error('Erro ao obter token:', error);
        });
      } else {
        localStorage.removeItem('authToken');
      }
    });
  })
  .catch((error) => {
    console.error('Firebase: Erro ao configurar persistência:', error);
  });

// Configurar emulador se estiver em desenvolvimento
if (typeof window !== 'undefined') {
  setupEmulatorIfAvailable();
}

// Inicializar Storage
const storage = getStorage(app);

console.log('Firebase Client inicializado com sucesso!');

export { app, auth, storage }; 