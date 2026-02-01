
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Phone,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'VENDEDOR' | 'DIRETORIA';
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const vendedorNavItems = [
    {
      title: 'Meus Leads',
      href: '/vendedor',
      icon: Phone,
    },
  ];

  const diretoriaNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Gestão de Leads',
      href: '/dashboard/leads',
      icon: Users,
    },
    {
      title: 'Usuários',
      href: '/dashboard/usuarios',
      icon: UserCheck,
    },
    {
      title: 'Relatórios',
      href: '/dashboard/relatorios',
      icon: BarChart3,
    },
  ];

  const navItems = userRole === 'VENDEDOR' ? vendedorNavItems : diretoriaNavItems;

  return (
    <div className="bg-black text-white w-64 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="relative w-40 h-16 mx-auto">
          <Image
            src="/images/LOGO NEGATIVA.png"
            alt="Nascimento & Advogados"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="bg-[#D4AF37] rounded-full p-2">
            <UserCheck className="h-4 w-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">
              {userRole === 'VENDEDOR' ? 'Vendedor' : 'Diretoria'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[#D4AF37] text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>


    </div>
  );
}
