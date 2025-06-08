require('dotenv').config();
const admin = require('firebase-admin');

// Inicializar Firebase Admin com as credenciais
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

console.log('Iniciando com projeto:', serviceAccount.projectId);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function deleteAllUsers() {
  try {
    console.log('Buscando usuários...');
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;

    console.log(`Encontrados ${users.length} usuários`);

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado para deletar.');
      return;
    }

    // Mostrar usuários que serão deletados
    users.forEach(user => {
      console.log(`- ${user.email} (${user.uid})`);
    });

    // Delete cada usuário
    const userIds = users.map(user => user.uid);
    await admin.auth().deleteUsers(userIds);

    console.log(`${users.length} usuários foram deletados com sucesso.`);
  } catch (error) {
    console.error('Erro ao deletar usuários:', error);
  } finally {
    process.exit();
  }
}

deleteAllUsers(); 