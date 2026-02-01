
'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Shield,
  Mail,
  Key,
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateCorporateEmail, validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/password-utils';
import { PasswordInput } from '@/components/ui/password-input';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'VENDEDOR' | 'DIRETORIA';
  createdAt: string;
  isTemporaryPassword?: boolean;
  lastPasswordChange?: string;
  _count?: {
    leads: number;
  };
}

export default function GerenciamentoUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string>('');
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VENDEDOR' as 'VENDEDOR' | 'DIRETORIA'
  });
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const [emailValidation, setEmailValidation] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Validação em tempo real da senha
  useEffect(() => {
    setPasswordValidation(validatePassword(newUser.password));
  }, [newUser.password]);

  // Validação em tempo real do e-mail
  useEffect(() => {
    if (newUser.email) {
      setEmailValidation(validateCorporateEmail(newUser.email));
    } else {
      setEmailValidation(true); // Email vazio é válido (será validado como obrigatório)
    }
  }, [newUser.email]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar e-mail corporativo
    if (!emailValidation) {
      toast({
        title: "E-mail inválido",
        description: "Use apenas e-mails corporativos @nascimentoeadvogados.com.br",
        variant: "destructive",
      });
      return;
    }

    // Validar complexidade da senha
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário adicionado com sucesso!",
        });
        setIsAddDialogOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'VENDEDOR'
        });
        setPasswordValidation(validatePassword(''));
        setEmailValidation(true);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Erro ao adicionar usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao adicionar usuário.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !editingUser.name || !editingUser.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Erro ao atualizar usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao atualizar usuário.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (user: User) => {
    setResetPasswordUser(user);
    setTemporaryPassword('');
    setShowTemporaryPassword(false);
    setIsResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordUser) return;

    try {
      const response = await fetch(`/api/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setTemporaryPassword(data.temporaryPassword);
        toast({
          title: "Sucesso",
          description: "Senha resetada com sucesso! A nova senha temporária foi gerada.",
        });
        fetchUsers(); // Atualizar lista de usuários
      } else {
        toast({
          title: "Erro",
          description: data.message || "Erro ao resetar senha.",
          variant: "destructive",
        });
        setIsResetPasswordDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao resetar senha.",
        variant: "destructive",
      });
      setIsResetPasswordDialogOpen(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Senha copiada para a área de transferência!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a senha.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso!",
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.message || "Erro ao excluir usuário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao excluir usuário.",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <AppLayout requiredRole="DIRETORIA">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="DIRETORIA">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">
            Gerencie usuários do sistema e suas permissões de acesso
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Vendedores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'VENDEDOR').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Diretoria</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'DIRETORIA').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Ações do Sistema</h3>
                <p className="text-sm text-gray-600">Gerencie usuários e suas permissões</p>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do novo usuário do sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="email@nascimentoeadvogados.com.br"
                        className={newUser.email && !emailValidation ? 'border-red-500' : ''}
                      />
                      {newUser.email && !emailValidation && (
                        <div className="flex items-center mt-1 text-sm text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          E-mail deve ser do domínio @nascimentoeadvogados.com.br
                        </div>
                      )}
                      {newUser.email && emailValidation && (
                        <div className="flex items-center mt-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          E-mail válido
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Senha *</Label>
                      <PasswordInput
                        id="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="Digite a senha"
                        showStrength={newUser.password.length > 0}
                        strength={passwordValidation.strength}
                      />
                      {newUser.password && !passwordValidation.isValid && (
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
                      {newUser.password && passwordValidation.isValid && (
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
                      <Label htmlFor="role">Função *</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(value: 'VENDEDOR' | 'DIRETORIA') => setNewUser({...newUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                          <SelectItem value="DIRETORIA">Diretoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddUser} 
                      className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                      disabled={!newUser.name || !newUser.email || !newUser.password || !passwordValidation.isValid || !emailValidation}
                    >
                      Adicionar Usuário
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários ({users.length})</CardTitle>
            <CardDescription>
              Todos os usuários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status Senha</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.isTemporaryPassword ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Temporária
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Normal
                            </Badge>
                          )}
                          {user.lastPasswordChange && (
                            <p className="text-xs text-gray-500">
                              Alterada: {new Date(user.lastPasswordChange).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user._count?.leads || 0} leads
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleResetPassword(user)}
                            title="Resetar senha"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-600">
                  Adicione o primeiro usuário ao sistema.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editName">Nome Completo *</Label>
                  <Input
                    id="editName"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">E-mail *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    placeholder="email@Nascimentoeadvogados.com"
                  />
                </div>
                <div>
                  <Label htmlFor="editRole">Função *</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value: 'VENDEDOR' | 'DIRETORIA') => setEditingUser({...editingUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                      <SelectItem value="DIRETORIA">Diretoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleEditUser} 
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                    disabled={!editingUser.name || !editingUser.email}
                  >
                    Salvar Alterações
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingUser(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Resetar Senha</DialogTitle>
              <DialogDescription>
                {temporaryPassword ? 
                  'Nova senha temporária gerada com sucesso!' : 
                  'Tem certeza que deseja resetar a senha deste usuário?'
                }
              </DialogDescription>
            </DialogHeader>
            
            {resetPasswordUser && !temporaryPassword && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Esta ação irá gerar uma nova senha temporária para <strong>{resetPasswordUser.name}</strong> e forçar a alteração no próximo login.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Usuário:</strong> {resetPasswordUser.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>E-mail:</strong> {resetPasswordUser.email}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={confirmResetPassword}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Confirmar Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsResetPasswordDialogOpen(false);
                      setResetPasswordUser(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {temporaryPassword && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Senha resetada!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        A nova senha temporária foi gerada. O usuário será obrigado a alterá-la no próximo login.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Nova Senha Temporária</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 relative">
                      <Input
                        value={temporaryPassword}
                        type={showTemporaryPassword ? 'text' : 'password'}
                        readOnly
                        className="pr-10 font-mono bg-gray-50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowTemporaryPassword(!showTemporaryPassword)}
                      >
                        {showTemporaryPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(temporaryPassword)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Copie esta senha e forneça ao usuário. Ela não será exibida novamente.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Próximos passos:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Forneça a senha temporária ao usuário</li>
                    <li>• O usuário será obrigado a alterar a senha no primeiro login</li>
                    <li>• A nova senha deve atender aos critérios de segurança</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => {
                    setIsResetPasswordDialogOpen(false);
                    setResetPasswordUser(null);
                    setTemporaryPassword('');
                    setShowTemporaryPassword(false);
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                >
                  Fechar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
