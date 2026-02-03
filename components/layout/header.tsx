
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LogOut, 
  UserCheck,
  ChevronDown,
  User,
  Settings,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleGoToProfile = () => {
    router.push('/perfil');
  };

  const getUserDisplayName = () => {
    return session?.user?.name || 'Usuário';
  };

  const getUserRole = () => {
    if (session?.user?.role === 'VENDEDOR') return 'Vendedor';
    if (session?.user?.role === 'DIRETORIA') return 'Diretoria';
    return 'Usuário';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <div className="relative w-32 h-8">
          <Image
            src="/images/LOGO POSITIVA.png"
            alt="Nascimento & Advogados"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-3 h-10 px-3 hover:bg-gray-100">
            <div className="bg-[#D4AF37] rounded-full p-1.5">
              <UserCheck className="h-4 w-4 text-black" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{getUserRole()}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleGoToProfile}
            className="cursor-pointer"
          >
            <User className="h-4 w-4 mr-2" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsChangePasswordOpen(true)}
            className="cursor-pointer"
          >
            <Key className="h-4 w-4 mr-2" />
            Alterar Senha
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Alteração de Senha */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Alterar Senha
            </DialogTitle>
            <DialogDescription>
              Mantenha sua conta segura com uma senha forte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Alteração de Senha Disponível
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Você pode alterar sua senha na página do seu perfil, onde também encontra outras informações de segurança.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  handleGoToProfile();
                }}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black"
              >
                <User className="h-4 w-4 mr-2" />
                Ir para Perfil
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
