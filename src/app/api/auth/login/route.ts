import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken } from '@/lib/auth';
import { setServerAuthCookie } from '@/lib/server-auth';
import { prisma } from '@/lib/db';
import { Role } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    
    const body = await request.json();
    console.log('Body received:', { email: body.email, hasPassword: !!body.password });
    
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('Querying database...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    console.log('User found:', !!user);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log('Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);
    console.log('Password valid:', isValidPassword);


    const token = await createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as Role,
      isActive: user.isActive,
    });

    await setServerAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
  console.error("LOGIN API ERROR:", error);
  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
}
