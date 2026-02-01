
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'VENDEDOR' | 'DIRETORIA';
}

export function AppLayout({ children, requiredRole }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      // Redirecionar para a página correta baseada no role
      if (session?.user?.role === 'DIRETORIA') {
        router.push('/dashboard');
      } else {
        router.push('/vendedor');
      }
      return;
    }
  }, [session, status, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#D4AF37]" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={session?.user?.role as 'VENDEDOR' | 'DIRETORIA'} />
      <Header />
      <main className="ml-64 pt-16 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
