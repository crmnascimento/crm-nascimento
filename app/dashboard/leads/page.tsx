
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefonePrincipal?: string;
  email?: string;
  valorEstimadoRecuperacao?: number;
  status: string;
  prioridade: string;
  municipio?: string;
  uf?: string;
  responsavel?: {
    name: string;
  };
  createdAt: string;
}

export default function GestaoLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    telefonePrincipal: '',
    email: '',
    valorEstimadoRecuperacao: '',
    municipio: '',
    uf: '',
    prioridade: 'MEDIA',
    observacoes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads/all');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          valorEstimadoRecuperacao: newLead.valorEstimadoRecuperacao 
            ? parseFloat(newLead.valorEstimadoRecuperacao) 
            : null
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Lead adicionado com sucesso!",
        });
        setIsAddDialogOpen(false);
        setNewLead({
          razaoSocial: '',
          nomeFantasia: '',
          telefonePrincipal: '',
          email: '',
          valorEstimadoRecuperacao: '',
          municipio: '',
          uf: '',
          prioridade: 'MEDIA',
          observacoes: ''
        });
        fetchLeads();
      } else {
        throw new Error('Erro ao adicionar lead');
      }
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o lead.",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'Não Contatado';
      case 'POTENCIAL':
        return 'Potencial';
      case 'EM_ANALISE':
        return 'Em Análise';
      case 'CONTRATO_ASSINADO':
        return 'Contrato Assinado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NAO_CONTATADO':
        return 'bg-red-100 text-red-800';
      case 'POTENCIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANALISE':
        return 'bg-blue-100 text-blue-800';
      case 'CONTRATO_ASSINADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'Alta';
      case 'MEDIA':
        return 'Média';
      case 'BAIXA':
        return 'Baixa';
      default:
        return priority;
    }
  };

  // Função para busca melhorada
  const searchLeads = (leads: Lead[], term: string) => {
    if (!term.trim()) return leads;
    
    const searchLower = term.toLowerCase();
    return leads.filter(lead => 
      lead.razaoSocial?.toLowerCase().includes(searchLower) ||
      lead.nomeFantasia?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.telefonePrincipal?.toLowerCase().includes(searchLower) ||
      lead.municipio?.toLowerCase().includes(searchLower) ||
      lead.responsavel?.name?.toLowerCase().includes(searchLower)
    );
  };

  // Função para ordenação
  const sortLeads = (leads: Lead[], sortBy: string, order: 'asc' | 'desc') => {
    return [...leads].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'razaoSocial':
          valueA = a.razaoSocial?.toLowerCase() || '';
          valueB = b.razaoSocial?.toLowerCase() || '';
          break;
        case 'valorEstimadoRecuperacao':
          valueA = a.valorEstimadoRecuperacao || 0;
          valueB = b.valorEstimadoRecuperacao || 0;
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        case 'responsavel':
          valueA = a.responsavel?.name?.toLowerCase() || '';
          valueB = b.responsavel?.name?.toLowerCase() || '';
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Aplicar filtros, busca e ordenação
  const filteredAndSortedLeads = (() => {
    let result = leads;
    
    // Filtrar por status
    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Filtrar por prioridade
    if (priorityFilter !== 'all') {
      result = result.filter(lead => lead.prioridade === priorityFilter);
    }
    
    // Aplicar busca
    result = searchLeads(result, searchTerm);
    
    // Aplicar ordenação
    result = sortLeads(result, sortBy, sortOrder);
    
    return result;
  })();

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Leads</h1>
          <p className="text-gray-600">
            Gerencie todos os leads do sistema de recuperação de seguro prestamista
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Não Contatados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(l => l.status === 'NAO_CONTATADO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Contratos Assinados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(l => l.status === 'CONTRATO_ASSINADO').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                      maximumFractionDigits: 0
                    }).format(
                      leads.reduce((sum, lead) => sum + (lead.valorEstimadoRecuperacao || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="NAO_CONTATADO">Não Contatado</SelectItem>
                    <SelectItem value="POTENCIAL">Potencial</SelectItem>
                    <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                    <SelectItem value="CONTRATO_ASSINADO">Contrato Assinado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de Criação</SelectItem>
                    <SelectItem value="razaoSocial">Nome (A-Z)</SelectItem>
                    <SelectItem value="valorEstimadoRecuperacao">Valor</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="responsavel">Responsável</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <div className="text-sm text-gray-600">
                  {filteredAndSortedLeads.length} de {leads.length} leads
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Lead</DialogTitle>
                      <DialogDescription>
                        Preencha as informações básicas do novo lead.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="razaoSocial">Razão Social *</Label>
                        <Input
                          id="razaoSocial"
                          value={newLead.razaoSocial}
                          onChange={(e) => setNewLead({...newLead, razaoSocial: e.target.value})}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                        <Input
                          id="nomeFantasia"
                          value={newLead.nomeFantasia}
                          onChange={(e) => setNewLead({...newLead, nomeFantasia: e.target.value})}
                          placeholder="Nome fantasia"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={newLead.telefonePrincipal}
                            onChange={(e) => setNewLead({...newLead, telefonePrincipal: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prioridade">Prioridade</Label>
                          <Select 
                            value={newLead.prioridade} 
                            onValueChange={(value) => setNewLead({...newLead, prioridade: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALTA">Alta</SelectItem>
                              <SelectItem value="MEDIA">Média</SelectItem>
                              <SelectItem value="BAIXA">Baixa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newLead.email}
                          onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                          placeholder="email@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor">Valor Estimado (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          value={newLead.valorEstimadoRecuperacao}
                          onChange={(e) => setNewLead({...newLead, valorEstimadoRecuperacao: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="municipio">Município</Label>
                          <Input
                            id="municipio"
                            value={newLead.municipio}
                            onChange={(e) => setNewLead({...newLead, municipio: e.target.value})}
                            placeholder="São Paulo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="uf">UF</Label>
                          <Input
                            id="uf"
                            value={newLead.uf}
                            onChange={(e) => setNewLead({...newLead, uf: e.target.value})}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={newLead.observacoes}
                          onChange={(e) => setNewLead({...newLead, observacoes: e.target.value})}
                          placeholder="Informações adicionais..."
                        />
                      </div>
                      <Button 
                        onClick={handleAddLead} 
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black"
                        disabled={!newLead.razaoSocial}
                      >
                        Adicionar Lead
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Funcionalidade em desenvolvimento",
                      description: "A importação de planilhas será implementada em breve.",
                    });
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Planilha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Leads ({filteredAndSortedLeads.length})</CardTitle>
            <CardDescription>
              Todos os leads cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.razaoSocial}</p>
                          {lead.nomeFantasia && (
                            <p className="text-sm text-gray-500">{lead.nomeFantasia}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.telefonePrincipal && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {lead.telefonePrincipal}
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(lead.municipio || lead.uf) && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {lead.municipio}, {lead.uf}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.valorEstimadoRecuperacao && (
                          <span className="font-medium text-green-600">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(lead.valorEstimadoRecuperacao)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusText(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lead.prioridade === 'ALTA' ? 'bg-red-100 text-red-800' :
                          lead.prioridade === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getPriorityText(lead.prioridade)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lead.responsavel?.name || 'Não atribuído'}
                      </TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Editar Lead",
                                description: "Funcionalidade de edição será implementada em breve.",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              toast({
                                title: "Excluir Lead",
                                description: "Funcionalidade de exclusão será implementada em breve.",
                                variant: "destructive"
                              });
                            }}
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

            {filteredAndSortedLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum lead encontrado
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Adicione o primeiro lead ao sistema.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
