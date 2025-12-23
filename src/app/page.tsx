// import { redirect } from 'next/navigation';
// import { cookies } from 'next/headers';
// import { getSession } from '@/lib/auth';

// export async function getSession(): Promise<JWTPayload | null> {
//   try {
//     // In Next.js 14+, cookies() might need to be awaited in some contexts
//     const cookieStore = await cookies();
//     const token = cookieStore.get('auth-token')?.value;
    
//     if (!token) return null;
    
//     return verifyToken(token);
//   } catch (err) {
//     console.warn('[getSession] Could not access cookies:', (err as Error).message);
//     return null;
//   }
// }

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );
}