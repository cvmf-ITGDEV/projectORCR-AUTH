import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
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
