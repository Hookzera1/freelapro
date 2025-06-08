const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
require('dotenv').config();

const prisma = new PrismaClient();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
  });
}

const db = admin.firestore();

// Função para converter timestamp do Firebase para Date
function convertFirebaseTimestamp(timestamp) {
  if (!timestamp) return new Date();
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date();
}

async function migrateUsers() {
  console.log('🔄 Migrando usuários do Firebase...');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado no Firebase');
      return;
    }

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      console.log(`📝 Migrando usuário: ${userData.email || doc.id}`);
      
      try {
        await prisma.user.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            email: userData.email || `user_${doc.id}@temp.com`,
            name: userData.name || userData.displayName,
            image: userData.image || userData.photoURL,
            userType: userData.userType || 'freelancer',
            companyName: userData.companyName,
            createdAt: convertFirebaseTimestamp(userData.createdAt),
            updatedAt: convertFirebaseTimestamp(userData.updatedAt),
          },
          update: {
            email: userData.email || `user_${doc.id}@temp.com`,
            name: userData.name || userData.displayName,
            image: userData.image || userData.photoURL,
            userType: userData.userType || 'freelancer',
            companyName: userData.companyName,
            updatedAt: new Date(),
          }
        });
        console.log(`✅ Usuário migrado: ${userData.email || doc.id}`);
      } catch (error) {
        console.log(`❌ Erro ao migrar usuário ${doc.id}:`, error.message);
      }
    }
    
    console.log('✅ Migração de usuários concluída!');
  } catch (error) {
    console.error('❌ Erro na migração de usuários:', error);
  }
}

async function migrateProjects() {
  console.log('🔄 Migrando projetos do Firebase...');
  
  try {
    const projectsSnapshot = await db.collection('projects').get();
    
    if (projectsSnapshot.empty) {
      console.log('❌ Nenhum projeto encontrado no Firebase');
      return;
    }

    for (const doc of projectsSnapshot.docs) {
      const projectData = doc.data();
      
      console.log(`📝 Migrando projeto: ${projectData.title || doc.id}`);
      
      try {
        await prisma.project.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            title: projectData.title || 'Projeto sem título',
            description: projectData.description || '',
            budget: projectData.budget || 0,
            deadline: convertFirebaseTimestamp(projectData.deadline),
            status: projectData.status || 'OPEN',
            type: projectData.type || 'fixed',
            level: projectData.level || 'intermediate',
            technologies: projectData.technologies,
            companyId: projectData.companyId || projectData.userId,
            freelancerId: projectData.freelancerId,
            createdAt: convertFirebaseTimestamp(projectData.createdAt),
            updatedAt: convertFirebaseTimestamp(projectData.updatedAt),
          },
          update: {
            title: projectData.title || 'Projeto sem título',
            description: projectData.description || '',
            budget: projectData.budget || 0,
            deadline: convertFirebaseTimestamp(projectData.deadline),
            status: projectData.status || 'OPEN',
            type: projectData.type || 'fixed',
            level: projectData.level || 'intermediate',
            technologies: projectData.technologies,
            freelancerId: projectData.freelancerId,
            updatedAt: new Date(),
          }
        });
        console.log(`✅ Projeto migrado: ${projectData.title || doc.id}`);
      } catch (error) {
        console.log(`❌ Erro ao migrar projeto ${doc.id}:`, error.message);
      }
    }
    
    console.log('✅ Migração de projetos concluída!');
  } catch (error) {
    console.error('❌ Erro na migração de projetos:', error);
  }
}

async function migrateProposals() {
  console.log('🔄 Migrando propostas do Firebase...');
  
  try {
    const proposalsSnapshot = await db.collection('proposals').get();
    
    if (proposalsSnapshot.empty) {
      console.log('❌ Nenhuma proposta encontrada no Firebase');
      return;
    }

    for (const doc of proposalsSnapshot.docs) {
      const proposalData = doc.data();
      
      console.log(`📝 Migrando proposta: ${doc.id}`);
      
      try {
        await prisma.proposal.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            message: proposalData.message || proposalData.description || '',
            budget: proposalData.budget || proposalData.value || 0,
            status: proposalData.status || 'PENDING',
            userId: proposalData.userId || proposalData.freelancerId,
            projectId: proposalData.projectId || proposalData.jobId,
            createdAt: convertFirebaseTimestamp(proposalData.createdAt),
            updatedAt: convertFirebaseTimestamp(proposalData.updatedAt),
          },
          update: {
            message: proposalData.message || proposalData.description || '',
            budget: proposalData.budget || proposalData.value || 0,
            status: proposalData.status || 'PENDING',
            updatedAt: new Date(),
          }
        });
        console.log(`✅ Proposta migrada: ${doc.id}`);
      } catch (error) {
        console.log(`❌ Erro ao migrar proposta ${doc.id}:`, error.message);
      }
    }
    
    console.log('✅ Migração de propostas concluída!');
  } catch (error) {
    console.error('❌ Erro na migração de propostas:', error);
  }
}

async function migrateJobs() {
  console.log('🔄 Migrando vagas/jobs do Firebase...');
  
  try {
    const jobsSnapshot = await db.collection('jobs').get();
    
    if (jobsSnapshot.empty) {
      console.log('❌ Nenhuma vaga encontrada no Firebase');
      return;
    }

    for (const doc of jobsSnapshot.docs) {
      const jobData = doc.data();
      
      console.log(`📝 Migrando vaga: ${jobData.title || doc.id}`);
      
      try {
        await prisma.project.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            title: jobData.title || 'Vaga sem título',
            description: jobData.description || '',
            budget: jobData.budget || jobData.salary || 0,
            deadline: convertFirebaseTimestamp(jobData.deadline),
            status: jobData.status || 'OPEN',
            type: jobData.type || 'fixed',
            level: jobData.level || 'intermediate',
            technologies: jobData.technologies || jobData.skills,
            companyId: jobData.companyId || jobData.userId,
            freelancerId: jobData.freelancerId,
            createdAt: convertFirebaseTimestamp(jobData.createdAt),
            updatedAt: convertFirebaseTimestamp(jobData.updatedAt),
          },
          update: {
            title: jobData.title || 'Vaga sem título',
            description: jobData.description || '',
            budget: jobData.budget || jobData.salary || 0,
            deadline: convertFirebaseTimestamp(jobData.deadline),
            status: jobData.status || 'OPEN',
            type: jobData.type || 'fixed',
            level: jobData.level || 'intermediate',
            technologies: jobData.technologies || jobData.skills,
            freelancerId: jobData.freelancerId,
            updatedAt: new Date(),
          }
        });
        console.log(`✅ Vaga migrada: ${jobData.title || doc.id}`);
      } catch (error) {
        console.log(`❌ Erro ao migrar vaga ${doc.id}:`, error.message);
      }
    }
    
    console.log('✅ Migração de vagas concluída!');
  } catch (error) {
    console.error('❌ Erro na migração de vagas:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando migração Firebase → PostgreSQL...\n');
  
  try {
    await migrateUsers();
    console.log('');
    await migrateProjects();
    console.log('');
    await migrateJobs();
    console.log('');
    await migrateProposals();
    
    console.log('\n🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main(); 