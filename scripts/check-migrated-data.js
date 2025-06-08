const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Verificando dados migrados...\n');
  
  try {
    // Contar usuários
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários: ${userCount}`);
    
    if (userCount > 0) {
      // Listar usuários
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          userType: true,
          companyName: true
        },
        take: 10
      });
      
      console.log('\n👥 Usuários migrados:');
      users.forEach((user, index) => {
        const company = user.companyName ? ` (${user.companyName})` : '';
        console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.userType}${company}`);
      });
    }
    
    // Contar outros dados
    const projectCount = await prisma.project.count();
    const proposalCount = await prisma.proposal.count();
    
    console.log(`\n📊 Estatísticas:`);
    console.log(`- Usuários: ${userCount}`);
    console.log(`- Projetos: ${projectCount}`);
    console.log(`- Propostas: ${proposalCount}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData(); 