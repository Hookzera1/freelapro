import * as admin from 'firebase-admin';

// Verifica se o Firebase Admin já foi inicializado
const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // Verificar se as variáveis de ambiente estão definidas
      const requiredEnvVars = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
      };

      const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        throw new Error(`Variáveis de ambiente do Firebase Admin faltando: ${missingVars.join(', ')}`);
      }

      console.log('Inicializando Firebase Admin com:', {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmailPresent: !!process.env.FIREBASE_CLIENT_EMAIL,
        privateKeyPresent: !!process.env.FIREBASE_PRIVATE_KEY
      });

      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });

      console.log('Firebase Admin inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar Firebase Admin:', error);
      throw error; // Re-throw para garantir que o erro seja tratado
    }
  } else {
    console.log('Usando instância existente do Firebase Admin');
  }
  return admin;
};

export { getFirebaseAdmin }; 