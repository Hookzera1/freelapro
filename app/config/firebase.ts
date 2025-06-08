import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug: verificar se as variáveis estão sendo carregadas
console.log('Firebase Config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Verificar se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

// Inicializar Firebase apenas no navegador e se não estiver inicializado
let app;
let auth = null;
let storage = null;
let db = null;

if (isBrowser) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase App inicializado com sucesso');
    } else {
      app = getApps()[0];
      console.log('Usando instância existente do Firebase App');
    }

    // Exportar serviços apenas se app foi inicializado
    if (app) {
      auth = getAuth(app);
      storage = getStorage(app);
      db = getFirestore(app);
      console.log('Serviços Firebase inicializados com sucesso');
    }
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
  }
}

export { auth, storage, db }; 