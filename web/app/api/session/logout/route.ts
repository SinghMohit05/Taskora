import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('taskforge_session')?.value;

    if (sessionToken) {
      // Try to invalidate on the backend
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
      }).catch(() => {
        // If backend call fails, still clear the cookie
      });
    }

    const response = NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });

    // Clear the session cookie
    response.cookies.set('taskforge_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[Logout Error]', error);
    const response = NextResponse.json(
      { success: true, data: { message: 'Logged out' } },
    );
    response.cookies.set('taskforge_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}
