import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    return verifyToken(token);
  } catch (err) {
    console.warn('[getSession] Could not access cookies:', (err as Error).message);
    return null;
  }
}