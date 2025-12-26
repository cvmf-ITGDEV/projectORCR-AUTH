import { NextResponse } from 'next/server';
import { getServerSession, clearServerAuthCookie } from '@/lib/server-auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log( process.env.DATABASE_URL)
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      // User doesn't exist - clear invalid auth cookie
      await clearServerAuthCookie();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      // User is deactivated - clear auth cookie
      await clearServerAuthCookie();
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[GET /api/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}