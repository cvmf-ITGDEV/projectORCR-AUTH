import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User, Role } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const value = await hashPassword(password);
  console.log('Password', value);
  console.log('Hashed Password', hashedPassword);

  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    // ⚠️ In Bolt AI builder / client, `cookies()` throws
    if (typeof window !== 'undefined') return null; // skip in client-side / builder

    const cookieStore = cookies(); // server-only
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch (err) {
    // If called outside request scope, just return null
    console.warn('[getSession] Could not access cookies:', (err as Error).message);
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export function canApproveApplications(role: Role): boolean {
  return role === 'ADMIN';
}

export function canCreateApplications(role: Role): boolean {
  return role === 'ADMIN' || role === 'PROCESSOR';
}

export function canViewAllApplications(role: Role): boolean {
  return role === 'ADMIN';
}

export function canGenerateReceipts(role: Role): boolean {
  return role === 'ADMIN' || role === 'PROCESSOR';
}

export function canManageUsers(role: Role): boolean {
  return role === 'ADMIN';
}
