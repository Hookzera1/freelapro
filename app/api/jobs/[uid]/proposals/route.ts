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

    // Buscar propostas do projeto
    const proposalsSnap = await db.collection('proposals')
      .where('jobUid', '==', uid)
      .get();

    const proposalsData = proposalsSnap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));

    // Buscar informações dos freelancers que fizeram propostas
    const freelancerPromises = proposalsData.map(async (proposal: any) => {
      const userRef = db.collection('users').doc(proposal.freelancerUid);
      const userSnap = await userRef.get();
      return {
        uid: userSnap.id,
        ...userSnap.data()
      };
    });

    const freelancers = await Promise.all(freelancerPromises);

    // Combinar propostas com dados dos freelancers
    const proposals = proposalsData.map((proposal, index) => ({
      ...proposal,
      freelancer: freelancers[index]
    }));

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar propostas' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const body = await request.json();
    const { uid } = await params;

    const { message, budget } = body;

    if (!message || !budget) {
      return NextResponse.json(
        { error: 'Message e budget são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe
    const jobRef = db.collection('jobs').doc(uid);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já enviou uma proposta para este projeto
    const existingProposalSnap = await db.collection('proposals')
      .where('jobUid', '==', uid)
      .where('freelancerUid', '==', decodedToken.uid)
      .get();

    if (!existingProposalSnap.empty) {
      return NextResponse.json(
        { error: 'Você já enviou uma proposta para este projeto' },
        { status: 409 }
      );
    }

    // Criar nova proposta
    const proposalData = {
      jobUid: uid,
      freelancerUid: decodedToken.uid,
      message,
      budget: parseFloat(budget),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const proposalRef = await db.collection('proposals').add(proposalData);

    return NextResponse.json({
      uid: proposalRef.id,
      ...proposalData
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar proposta' },
      { status: 500 }
    );
  }
} 