import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verificar se estamos no lado cliente
const isClient = typeof window !== 'undefined';

// Verificar se as variáveis de ambiente estão definidas (apenas no cliente)
if (isClient) {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Variáveis de ambiente do Firebase Client faltando:', missingVars);
    throw new Error(`Variáveis de ambiente do Firebase Client incompletas: ${missingVars.join(', ')}`);
  }

  console.log('Iniciando Firebase Client...');
}

// Inicializar Firebase apenas uma vez e apenas no cliente
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

if (isClient) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase App inicializado');
  } else {
    app = getApps()[0];
    console.log('Usando instância existente do Firebase App');
  }

  // Inicializar Auth
  auth = getAuth(app);

  // Configurar persistência local apenas no cliente
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase: Persistência local configurada com sucesso');
      
      // Adicionar listener para mudanças no estado de autenticação
      if (auth) {
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
      }
    })
    .catch((error) => {
      console.error('Firebase: Erro ao configurar persistência:', error);
    });

  // Inicializar Storage
  storage = getStorage(app);

  console.log('Firebase Client inicializado com sucesso!');
}

export { app, auth, storage }; 