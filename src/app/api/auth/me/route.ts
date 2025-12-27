import { NextResponse } from 'next/server';
import { getServerSession, clearServerAuthCookie } from '@/lib/server-auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
 
  try {
    const session = await getServerSession();
   console.log('sdasd')
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
   console.log('session',session)
    const user = await prisma.user.findFirst({
      where: { email: session.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
 console.log('user',user)
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