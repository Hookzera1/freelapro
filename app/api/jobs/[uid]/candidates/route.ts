import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { uid } = await params;

    // Verificar se o projeto existe e pertence ao usuário
    const jobRef = db.collection('jobs').doc(uid);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    const jobData = jobSnap.data();
    if (jobData?.companyUid !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Buscar todas as propostas do projeto
    const proposalsSnap = await db.collection('proposals')
      .where('jobUid', '==', uid)
      .get();

    const proposals = proposalsSnap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    // Buscar informações dos freelancers
    const freelancerPromises = proposals.map(async (proposal: any) => {
      const userRef = db.collection('users').doc(proposal.freelancerUid);
      const userSnap = await userRef.get();
      return {
        uid: userSnap.id,
        ...userSnap.data()
      };
    });

    const freelancers = await Promise.all(freelancerPromises);

    // Combinar propostas com informações dos freelancers
    const candidates = proposals.map((proposal, index) => ({
      proposal,
      freelancer: freelancers[index]
    }));

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar candidatos' },
      { status: 500 }
    );
  }
} 