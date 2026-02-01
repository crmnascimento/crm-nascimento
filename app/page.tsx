
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Ainda carregando

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role === 'DIRETORIA') {
      router.push('/dashboard');
    } else if (session?.user?.role === 'VENDEDOR') {
      router.push('/vendedor');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#D4AF37]" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
