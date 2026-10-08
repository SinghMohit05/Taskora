import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('taskforge_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const backendRes = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const data = await backendRes.json();

    return NextResponse.json({
      authenticated: true,
      user: data.data.user,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
