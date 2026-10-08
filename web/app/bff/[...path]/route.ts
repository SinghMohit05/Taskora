import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5000';

/**
 * BFF Proxy: Forwards all /bff/* requests to the Express backend.
 * Reads the taskforge_session cookie and forwards it as a Bearer token.
 */
async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const pathSegments = params.path;
  const backendPath = `/${pathSegments.join('/')}`;
  const url = new URL(backendPath, API_URL);

  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const sessionToken = request.cookies.get('taskforge_session')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : undefined;

    const backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[BFF Proxy Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to connect to the backend service',
        },
      },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
