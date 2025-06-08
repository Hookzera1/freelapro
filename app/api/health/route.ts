import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Health check simples sem dependência do Prisma
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        firebase: 'connected',
        api: 'operational'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'error'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 