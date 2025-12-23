import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
