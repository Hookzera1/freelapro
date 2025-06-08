import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Verificar se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

// Função segura para manipular localStorage
const safeStorage = {
  setItem: (key: string, value: string) => {
    if (isBrowser) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
      }
    }
  },
  removeItem: (key: string) => {
    if (isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
      }
    }
  }
};

// Validar configuração do Firebase
const validateConfig = () => {
  const requiredVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Log das variáveis para debug (não logar a apiKey por segurança)
  console.log('Firebase Config:', {
    authDomain: requiredVars.authDomain,
    projectId: requiredVars.projectId,
    storageBucket: requiredVars.storageBucket,
    hasApiKey: !!requiredVars.apiKey
  });

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(`Variáveis de ambiente do Firebase Client ausentes: ${missingVars.join(', ')}`);
    return null;
  }

  return requiredVars;
};

// Inicializar Firebase apenas no navegador
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isBrowser) {
  try {
    const config = validateConfig();
    if (config) {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
        console.log('Firebase Client: App inicializado com sucesso');
      } else {
        firebaseApp = getApps()[0];
        console.log('Firebase Client: Usando instância existente');
      }

      if (firebaseApp) {
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);

        // Configurar persistência local de forma assíncrona
        setPersistence(auth, browserLocalPersistence)
          .then(() => {
            console.log('Firebase Client: Persistência local configurada');
            
            // Configurar listener de autenticação
            onAuthStateChanged(auth!, (user) => {
              if (user) {
                user.getIdToken(true)
                  .then(token => {
                    safeStorage.setItem('authToken', token);
                    console.log('Firebase Client: Token atualizado');
                  })
                  .catch(error => {
                    console.error('Firebase Client: Erro ao obter token:', error);
                  });
              } else {
                safeStorage.removeItem('authToken');
                console.log('Firebase Client: Token removido');
              }
            });

            console.log('Firebase Client: Configuração concluída');
          })
          .catch((error) => {
            console.error('Firebase Client: Erro ao configurar persistência:', error);
          });
      }
    }
  } catch (error) {
    console.error('Firebase Client: Erro na inicialização:', error);
  }
}

export { firebaseApp as app, auth, db };