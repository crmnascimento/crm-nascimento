
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Shield, 
  Key, 
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/password-utils';

export default function PerfilPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

  useEffect(() => {
    if (session?.user) {
      fetchUserDetails();
    }
  }, [session]);

  useEffect(() => {
    setPasswordValidation(validatePassword(newPassword));
  }, [newPassword]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Erro",
        description: "A nova senha deve ser diferente da senha atual.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Senha alterada com sucesso!",
        });
        
        // Limpar campos
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Atualizar detalhes do usuário
        fetchUserDetails();
        
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao alterar senha.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao alterar senha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'VENDEDOR':
        return 'Vendedor';
      case 'DIRETORIA':
        return 'Diretoria';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'VENDEDOR':
        return 'bg-blue-100 text-blue-800';
      case 'DIRETORIA':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Usuário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">E-mail</Label>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{session.user.email}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Função</Label>
                  <div className="mt-1">
                    <Badge className={getRoleColor(session.user.role || '')}>
                      {getRoleText(session.user.role || '')}
                    </Badge>
                  </div>
                </div>

                {userDetails && (
                  <>
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Membro desde</Label>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">
                          {new Date(userDetails.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última alteração de senha</Label>
                      <div className="flex items-center mt-1">
                        <Key className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">
                          {userDetails.lastPasswordChange ? 
                            new Date(userDetails.lastPasswordChange).toLocaleDateString('pt-BR') : 
                            'Nunca alterada'
                          }
                        </p>
                      </div>
                    </div>

                    {userDetails.isTemporaryPassword && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Senha Temporária
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Você está usando uma senha temporária. Altere sua senha agora para maior segurança.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alteração de Senha */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <PasswordInput
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    showStrength={newPassword.length > 0}
                    strength={passwordValidation.strength}
                    disabled={loading}
                  />
                  {newPassword && !passwordValidation.isValid && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Requisitos de senha:</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-red-600 rounded-full mr-2" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {newPassword && passwordValidation.isValid && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <p className="text-sm font-medium text-green-800">
                          Senha válida! Força: {getPasswordStrengthText(passwordValidation.strength)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    disabled={loading}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword || !currentPassword}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Dicas de Segurança:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Use uma combinação de letras maiúsculas e minúsculas</li>
                    <li>• Inclua números e caracteres especiais</li>
                    <li>• Evite informações pessoais óbvias</li>
                    <li>• Use pelo menos 8 caracteres (recomendado: 12+)</li>
                    <li>• Não reutilize senhas de outras contas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
