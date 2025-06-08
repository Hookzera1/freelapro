const admin = require('firebase-admin');
const { auth } = require('../lib/firebase-admin');

async function deleteAllUsers() {
  try {
    // Lista todos os usuários
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado para deletar.');
      return;
    }

    // Delete cada usuário
    const userIds = users.map(user => user.uid);
    await auth.deleteUsers(userIds);

    console.log(`${users.length} usuários foram deletados com sucesso.`);
  } catch (error) {
    console.error('Erro ao deletar usuários:', error);
  }
}

deleteAllUsers(); 