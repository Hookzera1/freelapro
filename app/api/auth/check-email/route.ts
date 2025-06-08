import { NextResponse } from 'next/server';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    if (!auth) {
      return NextResponse.json({ error: 'Firebase Auth não disponível' }, { status: 500 });
    }

    const methods = await fetchSignInMethodsForEmail(auth, email);
    const exists = methods.length > 0;

    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
} 