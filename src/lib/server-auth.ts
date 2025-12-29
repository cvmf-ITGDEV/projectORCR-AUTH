import 'server-only';
import { JWTPayload } from './auth';

const isWebContainer = process.env.WEB_CONTAINER === 'true' || process.env.STACKBLITZ === 'true';

const DUMMY_USER: JWTPayload = {
  userId: 'dummy-user-id',
  email: 'admin@bolt.new',
  role: 'ADMIN',
  firstName: 'Demo',
  lastName: 'User',
};

export async function getServerSession(): Promise<JWTPayload | null> {
  if (isWebContainer) {
    return DUMMY_USER;
  }

  try {
    const { cookies } = await import('next/headers');
    const { verifyToken } = await import('./auth');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch (err) {
    console.warn('[getServerSession] Error accessing cookies:', (err as Error).message);
    return null;
  }
}

export async function setServerAuthCookie(token: string): Promise<void> {
  if (isWebContainer) {
    console.log('[setServerAuthCookie] Running in WebContainer, skipping cookie set');
    return;
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });
  } catch (err) {
    console.error('[setServerAuthCookie] Error setting cookie:', (err as Error).message);
  }
}

export async function clearServerAuthCookie(): Promise<void> {
  if (isWebContainer) {
    console.log('[clearServerAuthCookie] Running in WebContainer, skipping cookie clear');
    return;
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
  } catch (err) {
    console.error('[clearServerAuthCookie] Error clearing cookie:', (err as Error).message);
  }
}

export function isRunningInBolt(): boolean {
  return isWebContainer;
}
