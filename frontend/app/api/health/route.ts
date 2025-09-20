import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const backendHealth = await response.json();
    
    return NextResponse.json({
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'LCA Platform Frontend',
        version: '1.0.0'
      },
      backend: backendHealth,
      connection: 'healthy'
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'LCA Platform Frontend',
        version: '1.0.0'
      },
      backend: {
        status: 'unreachable',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      connection: 'failed'
    }, { status: 503 });
  }
}