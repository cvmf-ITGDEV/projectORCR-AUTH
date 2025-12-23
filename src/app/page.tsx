import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const cookieStore = cookies();
  const session = await getSession(cookieStore);

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
